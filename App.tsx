import React, {useCallback, useState} from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import type {AppRoute} from './src/navigation/types';
import {
  saveLastVerified,
  type VerifiableFlow,
} from './src/services/verificationHistory';
import {BeneficiaryVerificationScreen} from './src/screens/BeneficiaryVerification';
import {HomeScreen} from './src/screens/Home';
import {LoginVerificationScreen} from './src/screens/LoginVerification';
import {MpinChangeScreen} from './src/screens/MpinChange';
import {ESignatureScreen} from './src/screens/ESignature';
import {PasscodeChangeScreen} from './src/screens/PasscodeChange';
import {PaymentVerificationScreen} from './src/screens/PaymentVerification';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [route, setRoute] = useState<AppRoute>('login');
  const [homeRefresh, setHomeRefresh] = useState(0);

  const goHome = useCallback(() => setRoute('home'), []);

  const completeFlow = useCallback((flow: VerifiableFlow) => {
    void saveLastVerified(flow)
      .finally(() => {
        setHomeRefresh(n => n + 1);
        goHome();
      });
  }, [goHome]);

  const screen = (() => {
    switch (route) {
      case 'login':
        return (
          <LoginVerificationScreen
            onVerified={() => completeFlow('login')}
          />
        );
      case 'payment':
        return (
          <PaymentVerificationScreen
            onBack={goHome}
            onVerified={() => completeFlow('payment')}
          />
        );
      case 'mpin':
        return (
          <MpinChangeScreen
            onBack={goHome}
            onComplete={() => completeFlow('mpin')}
          />
        );
      case 'passcode':
        return (
          <PasscodeChangeScreen
            onBack={goHome}
            onComplete={() => completeFlow('passcode')}
          />
        );
      case 'esignature':
        return (
          <ESignatureScreen
            onBack={goHome}
            onVerified={() => completeFlow('esignature')}
          />
        );
      case 'beneficiary':
        return (
          <BeneficiaryVerificationScreen
            onBack={goHome}
            onVerified={() => completeFlow('beneficiary')}
          />
        );
      case 'home':
      default:
        return (
          <HomeScreen onSelectFlow={setRoute} refreshToken={homeRefresh} />
        );
    }
  })();

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {screen}
    </SafeAreaProvider>
  );
}

export default App;
