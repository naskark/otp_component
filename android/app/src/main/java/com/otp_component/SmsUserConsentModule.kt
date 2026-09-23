package com.otp_component

import android.Manifest
import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.provider.Telephony
import android.telephony.SmsMessage
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.auth.api.phone.SmsRetriever
import com.google.android.gms.common.api.CommonStatusCodes
import com.google.android.gms.common.api.Status

/**
 * SMS OTP auto-read for Android.
 *
 * 1) Telephony SMS_RECEIVED — when RECEIVE_SMS is granted (no per-SMS consent UI)
 * 2) Inbox read from JS — when READ_SMS is granted
 * 3) SMS User Consent — only if SMS runtime permission was not granted (fallback)
 */
class SmsUserConsentModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext), LifecycleEventListener {

  private var listening = false
  private var telephonyRegistered = false
  private var consentRegistered = false

  private val activityEventListener =
    object : ActivityEventListener {
      override fun onActivityResult(
        activity: Activity,
        requestCode: Int,
        resultCode: Int,
        data: Intent?,
      ) {
        if (requestCode != SMS_CONSENT_REQUEST) {
          return
        }
        if (resultCode != Activity.RESULT_OK || data == null) {
          return
        }
        val message = data.getStringExtra(SmsRetriever.EXTRA_SMS_MESSAGE)
        if (!message.isNullOrBlank()) {
          emitSms(message, "consent-ui")
          startUserConsentClient()
        }
      }

      override fun onNewIntent(intent: Intent) = Unit
    }

  private val telephonyReceiver =
    object : BroadcastReceiver() {
      override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
          return
        }
        val body = extractSmsBody(intent) ?: return
        emitSms(body, "telephony")
      }
    }

  private val consentReceiver =
    object : BroadcastReceiver() {
      override fun onReceive(context: Context, intent: Intent) {
        if (SmsRetriever.SMS_RETRIEVED_ACTION != intent.action) {
          return
        }

        val extras = intent.extras ?: return
        val status =
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            extras.getParcelable(SmsRetriever.EXTRA_STATUS, Status::class.java)
          } else {
            @Suppress("DEPRECATION")
            extras.get(SmsRetriever.EXTRA_STATUS) as? Status
          } ?: return

        when (status.statusCode) {
          CommonStatusCodes.SUCCESS -> {
            // Prefer reading message directly when Play Services provides it.
            val message = extras.getString(SmsRetriever.EXTRA_SMS_MESSAGE)
            if (!message.isNullOrBlank()) {
              emitSms(message, "consent")
              return
            }

            // Fallback: launch consent UI (common on physical devices).
            val consentIntent =
              if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                extras.getParcelable(
                  SmsRetriever.EXTRA_CONSENT_INTENT,
                  Intent::class.java,
                )
              } else {
                @Suppress("DEPRECATION")
                extras.getParcelable(SmsRetriever.EXTRA_CONSENT_INTENT)
              }

            val activity = reactContext.currentActivity
            if (activity != null && consentIntent != null) {
              try {
                @Suppress("DEPRECATION")
                activity.startActivityForResult(consentIntent, SMS_CONSENT_REQUEST)
              } catch (_: Exception) {
                emitError("Unable to show SMS consent prompt")
              }
            }
          }
          CommonStatusCodes.TIMEOUT -> emitError("SMS consent timed out")
          else -> Unit
        }
      }
    }

  init {
    reactContext.addLifecycleEventListener(this)
    reactContext.addActivityEventListener(activityEventListener)
  }

  override fun getName(): String = "SmsUserConsent"

  @ReactMethod
  fun startListening(promise: Promise) {
    try {
      syncListeningStrategy()
      listening = true
      val map = Arguments.createMap()
      map.putBoolean("telephony", telephonyRegistered)
      map.putBoolean("consent", consentRegistered)
      promise.resolve(map)
    } catch (error: Exception) {
      listening = false
      promise.reject("SMS_START_FAILED", error.message, error)
    }
  }

  @ReactMethod
  fun stopListening() {
    listening = false
    unregisterTelephonyReceiver()
    unregisterConsentReceiver()
  }

  @ReactMethod
  fun hasReceiveSmsPermission(promise: Promise) {
    promise.resolve(hasSmsPermissions())
  }

  @ReactMethod
  fun getStatus(promise: Promise) {
    val map = Arguments.createMap()
    map.putBoolean("hasPermission", hasSmsPermissions())
    map.putBoolean("telephonyRegistered", telephonyRegistered)
    map.putBoolean("consentRegistered", consentRegistered)
    map.putBoolean("listening", listening)
    promise.resolve(map)
  }

  /** Call after the user grants SMS permission from JS. */
  @ReactMethod
  fun refreshListening(promise: Promise) {
    try {
      if (!listening) {
        listening = true
      }
      syncListeningStrategy()
      val map = Arguments.createMap()
      map.putBoolean("hasPermission", hasSmsPermissions())
      map.putBoolean("telephony", telephonyRegistered)
      map.putBoolean("consent", consentRegistered)
      promise.resolve(map)
    } catch (error: Exception) {
      promise.reject("SMS_REFRESH_FAILED", error.message, error)
    }
  }

  /** Legacy 0-arg inbox read (pre–session filter builds). Prefer [readInboxMessageSince]. */
  @ReactMethod
  fun readLatestInboxMessage(promise: Promise) {
    readInboxMessageSince(0.0, promise)
  }

  /**
   * Emulator fallback: newest inbox SMS at or after [sinceMs] (needs READ_SMS).
   */
  @ReactMethod
  fun readInboxMessageSince(sinceMs: Double, promise: Promise) {
    if (!hasReadSmsPermission()) {
      promise.resolve(null)
      return
    }

    try {
      val since = sinceMs.toLong().coerceAtLeast(0L)
      val projection = arrayOf(Telephony.Sms.BODY, Telephony.Sms.DATE)
      val sortOrder = "${Telephony.Sms.DATE} DESC"
      val selection =
        if (since > 0L) {
          "${Telephony.Sms.DATE} >= ?"
        } else {
          null
        }
      val selectionArgs =
        if (since > 0L) {
          arrayOf(since.toString())
        } else {
          null
        }
      reactContext.contentResolver.query(
        Telephony.Sms.Inbox.CONTENT_URI,
        projection,
        selection,
        selectionArgs,
        sortOrder,
      )?.use { cursor ->
        if (!cursor.moveToFirst()) {
          promise.resolve(null)
          return
        }
        val bodyIndex = cursor.getColumnIndex(Telephony.Sms.BODY)
        val dateIndex = cursor.getColumnIndex(Telephony.Sms.DATE)
        if (bodyIndex < 0) {
          promise.resolve(null)
          return
        }
        val body = cursor.getString(bodyIndex) ?: ""
        val dateMs =
          if (dateIndex >= 0) cursor.getLong(dateIndex) else System.currentTimeMillis()
        if (since <= 0L) {
          val ageMs = System.currentTimeMillis() - dateMs
          // Legacy fallback: ignore stale messages (older than 10 minutes).
          if (ageMs > 10 * 60_000) {
            promise.resolve(null)
            return
          }
        }
        val map = Arguments.createMap()
        map.putString("message", body)
        map.putDouble("dateMs", dateMs.toDouble())
        promise.resolve(map)
        return
      }
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("SMS_INBOX_READ_FAILED", error.message, error)
    }
  }

  @ReactMethod
  fun addListener(eventName: String?) {
    // Required for NativeEventEmitter
  }

  @ReactMethod
  fun removeListeners(count: Int) {
    // Required for NativeEventEmitter
  }

  override fun onHostResume() {
    if (listening) {
      syncListeningStrategy()
    }
  }

  override fun onHostPause() = Unit

  override fun onHostDestroy() {
    reactContext.removeActivityEventListener(activityEventListener)
    stopListening()
  }

  /**
   * With SMS permission: telephony (+ JS inbox poll). Without: Google User Consent only.
   * User Consent shows "Allow app to read this message" on every SMS — avoid when permitted.
   */
  private fun syncListeningStrategy() {
    if (hasSmsPermissions()) {
      unregisterConsentReceiver()
      registerTelephonyReceiverIfAllowed()
      return
    }
    unregisterTelephonyReceiver()
    registerConsentReceiver()
    startUserConsentClient()
  }

  private fun startUserConsentClient() {
    val activity: Activity? = reactContext.currentActivity
    val clientContext: Context = activity ?: reactContext
    SmsRetriever.getClient(clientContext)
      .startSmsUserConsent(null)
      .addOnFailureListener { error ->
        emitError(error.message ?: "Failed to start SMS User Consent")
      }
  }

  private fun hasSmsPermissions(): Boolean =
    hasReceiveSmsPermission() || hasReadSmsPermission()

  private fun hasReceiveSmsPermission(): Boolean =
    ContextCompat.checkSelfPermission(
      reactContext,
      Manifest.permission.RECEIVE_SMS,
    ) == PackageManager.PERMISSION_GRANTED

  private fun hasReadSmsPermission(): Boolean =
    ContextCompat.checkSelfPermission(
      reactContext,
      Manifest.permission.READ_SMS,
    ) == PackageManager.PERMISSION_GRANTED

  private fun registerTelephonyReceiverIfAllowed() {
    if (!hasReceiveSmsPermission() || telephonyRegistered) {
      return
    }

    val filter = IntentFilter(Telephony.Sms.Intents.SMS_RECEIVED_ACTION)
    filter.priority = IntentFilter.SYSTEM_HIGH_PRIORITY
    ContextCompat.registerReceiver(
      reactContext,
      telephonyReceiver,
      filter,
      ContextCompat.RECEIVER_EXPORTED,
    )
    telephonyRegistered = true
  }

  private fun unregisterTelephonyReceiver() {
    if (!telephonyRegistered) {
      return
    }
    try {
      reactContext.unregisterReceiver(telephonyReceiver)
    } catch (_: IllegalArgumentException) {
      // already unregistered
    }
    telephonyRegistered = false
  }

  private fun registerConsentReceiver() {
    if (consentRegistered) {
      return
    }
    val filter = IntentFilter(SmsRetriever.SMS_RETRIEVED_ACTION)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      reactContext.registerReceiver(
        consentReceiver,
        filter,
        SmsRetriever.SEND_PERMISSION,
        null,
        Context.RECEIVER_EXPORTED,
      )
    } else {
      @Suppress("UnspecifiedRegisterReceiverFlag")
      reactContext.registerReceiver(
        consentReceiver,
        filter,
        SmsRetriever.SEND_PERMISSION,
        null,
      )
    }
    consentRegistered = true
  }

  private fun unregisterConsentReceiver() {
    if (!consentRegistered) {
      return
    }
    try {
      reactContext.unregisterReceiver(consentReceiver)
    } catch (_: IllegalArgumentException) {
      // already unregistered
    }
    consentRegistered = false
  }

  private fun extractSmsBody(intent: Intent): String? {
    val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
    if (messages != null && messages.isNotEmpty()) {
      return messages.joinToString(separator = "") { it.messageBody.orEmpty() }
    }

    // Fallback for older emulator images
    val bundle: Bundle = intent.extras ?: return null
    val pdus = bundle.get("pdus") as? Array<*> ?: return null
    val format = bundle.getString("format")
    val builder = StringBuilder()
    for (pdu in pdus) {
      val bytes = pdu as? ByteArray ?: continue
      val message =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && format != null) {
          SmsMessage.createFromPdu(bytes, format)
        } else {
          @Suppress("DEPRECATION")
          SmsMessage.createFromPdu(bytes)
        }
      builder.append(message.messageBody.orEmpty())
    }
    return builder.toString().ifBlank { null }
  }

  private fun emitSms(message: String, source: String) {
    val payload = Arguments.createMap()
    payload.putString("message", message)
    payload.putString("source", source)
    sendEvent(EVENT_SMS_RECEIVED, payload)
  }

  private fun emitError(message: String) {
    val payload = Arguments.createMap()
    payload.putString("message", message)
    sendEvent(EVENT_SMS_ERROR, payload)
  }

  private fun sendEvent(name: String, params: com.facebook.react.bridge.WritableMap) {
    if (!reactContext.hasActiveReactInstance()) {
      return
    }
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(name, params)
  }

  companion object {
    const val EVENT_SMS_RECEIVED = "SmsUserConsent_SmsReceived"
    const val EVENT_SMS_ERROR = "SmsUserConsent_SmsError"
    private const val SMS_CONSENT_REQUEST = 7392
  }
}
