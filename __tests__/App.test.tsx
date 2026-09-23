import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import {HomeScreen} from '../src/screens/Home';
import {PaymentVerificationScreen} from '../src/screens/PaymentVerification';

jest.mock('react-native-biometrics', () => ({
  __esModule: true,
  default: class MockBiometrics {
    isSensorAvailable = jest.fn(() =>
      Promise.resolve({available: false, biometryType: undefined}),
    );
    simplePrompt = jest.fn(() => Promise.resolve({success: false}));
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  getMany: jest.fn(() => Promise.resolve({})),
}));

jest.mock('react-native-safe-area-context', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  return {
    SafeAreaProvider: ({children}: {children: unknown}) => children,
    SafeAreaView: ({
      children,
      style,
    }: {
      children: unknown;
      style?: object;
    }) => MockReact.createElement(ReactNative.View, {style}, children),
    useSafeAreaInsets: () => ({top: 0, right: 0, bottom: 0, left: 0}),
  };
});

test('app launches with login OTP verification', async () => {
  let tree!: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<App />);
  });

  const json = JSON.stringify(tree.toJSON());
  expect(json).toContain('OTP Verification');
  expect(json).toContain('you@company.com');
  expect(json).not.toContain('Payment Verification');

  await ReactTestRenderer.act(() => {
    tree.unmount();
  });
});

test('renders home flow cards', async () => {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  const onSelectFlow = jest.fn();

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <HomeScreen onSelectFlow={onSelectFlow} />,
    );
  });

  const json = JSON.stringify(tree.toJSON());
  expect(json).not.toContain('Login Verification');
  expect(json).toContain('Payment Verification');
  expect(json).toContain('Change MPIN');
  expect(json).toContain('Change Passcode');
  expect(json).toContain('E-Signature');
  expect(json).toContain('Add Beneficiary');

  await ReactTestRenderer.act(() => {
    tree.unmount();
  });
});

test('payment screen renders OTP verification', async () => {
  let tree!: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <PaymentVerificationScreen onBack={() => {}} />,
    );
  });

  const json = JSON.stringify(tree.toJSON());
  expect(json).toContain('OTP Verification');
  expect(json).toContain('Verify Payment');
  expect(json).toContain('pay-8842');

  await ReactTestRenderer.act(() => {
    tree.unmount();
  });
});
