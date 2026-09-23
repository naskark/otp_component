import React, {useEffect} from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {useOtpVerification} from '../useOtpVerification';
import type {UseOtpVerificationResult} from '../useOtpVerification';

jest.mock('../../services/otpService', () => {
  const actual = jest.requireActual('../../services/otpService');
  return {
    ...actual,
    createOtpService: (config: Record<string, unknown> = {}) =>
      actual.createOtpService({...config, networkDelayMs: 20}),
  };
});

function HookHost({
  options,
  onUpdate,
}: {
  options: Parameters<typeof useOtpVerification>[0];
  onUpdate: (api: UseOtpVerificationResult) => void;
}) {
  const api = useOtpVerification(options);
  useEffect(() => {
    onUpdate(api);
  });
  return null;
}

async function mountHook(
  options: Parameters<typeof useOtpVerification>[0],
): Promise<{
  get: () => UseOtpVerificationResult;
  act: (fn: (api: UseOtpVerificationResult) => void | Promise<void>) => Promise<void>;
  unmount: () => void;
}> {
  let latest!: UseOtpVerificationResult;
  let renderer!: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <HookHost options={options} onUpdate={api => {
        latest = api;
      }} />,
    );
  });

  return {
    get: () => latest,
    act: async fn => {
      await ReactTestRenderer.act(async () => {
        await fn(latest);
      });
    },
    unmount: () => {
      ReactTestRenderer.act(() => {
        renderer.unmount();
      });
    },
  };
}

describe('useOtpVerification', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('moves to ready when four digits are entered', async () => {
    const hook = await mountHook({transactionId: 'H1'});

    await hook.act(api => {
      api.setOtp('1357');
    });

    expect(hook.get().otp).toBe('1357');
    expect(hook.get().status).toBe('ready');
    expect(hook.get().canVerify).toBe(true);
    hook.unmount();
  });

  it('rejects non-numeric characters', async () => {
    const hook = await mountHook({transactionId: 'H2'});

    await hook.act(api => {
      api.setOtp('12ab');
    });

    expect(hook.get().otp).toBe('12');
    hook.unmount();
  });

  it('keeps resend disabled until the cooldown elapses', async () => {
    const hook = await mountHook({
      transactionId: 'H3',
      resendCooldownMs: 60_000,
    });

    expect(hook.get().canResend).toBe(false);

    await ReactTestRenderer.act(async () => {
      jest.advanceTimersByTime(60_250);
    });

    expect(hook.get().canResend).toBe(true);
    hook.unmount();
  });

  it('verifies a correct OTP and enters verified state', async () => {
    const hook = await mountHook({
      transactionId: 'H4',
      correctOtp: '1357',
      autoSubmit: false,
    });

    await hook.act(api => {
      api.setOtp('1357');
    });

    await hook.act(async api => {
      const pending = api.verify();
      await jest.advanceTimersByTimeAsync(50);
      await pending;
    });

    expect(hook.get().isVerified).toBe(true);
    expect(hook.get().status).toBe('verified');
    expect(hook.get().otp).toBe('1357');
    hook.unmount();
  });

  it('shows invalid state and clears OTP on wrong code', async () => {
    const hook = await mountHook({
      transactionId: 'H5',
      correctOtp: '1357',
      autoSubmit: false,
      maxAttempts: 3,
    });

    await hook.act(api => {
      api.setOtp('0000');
    });

    await hook.act(async api => {
      const pending = api.verify();
      await jest.advanceTimersByTimeAsync(50);
      await pending;
    });

    expect(hook.get().status).toBe('invalid');
    expect(hook.get().otp).toBe('');
    expect(hook.get().remainingAttempts).toBe(2);
    expect(hook.get().error).toMatch(/Incorrect OTP/i);
    hook.unmount();
  });
});
