import {createOtpService} from '../otpService';

describe('otpService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('succeeds for the correct code', async () => {
    const service = createOtpService({correctOtp: '1357', networkDelayMs: 100});
    service.resetAttempts();

    const pending = service.verifyOtp({
      otp: '1357',
      transactionId: 'TXN1',
    });
    await jest.advanceTimersByTimeAsync(100);
    const result = await pending;

    expect(result.success).toBe(true);
  });

  it('decrements attempts and locks after max failures', async () => {
    const service = createOtpService({
      correctOtp: '1357',
      maxAttempts: 2,
      networkDelayMs: 50,
    });
    service.resetAttempts('TXN2');

    const first = service.verifyOtp({otp: '0000', transactionId: 'TXN2'});
    await jest.advanceTimersByTimeAsync(50);
    expect((await first).remainingAttempts).toBe(1);

    const second = service.verifyOtp({otp: '1111', transactionId: 'TXN2'});
    await jest.advanceTimersByTimeAsync(50);
    const locked = await second;

    expect(locked.success).toBe(false);
    expect(locked.code).toBe('MAX_ATTEMPTS');
    expect(locked.remainingAttempts).toBe(0);
  });

  it('returns resend timestamps after delay', async () => {
    const service = createOtpService({networkDelayMs: 50});
    const pending = service.resendOtp({
      transactionId: 'TXN3',
      channel: 'email',
    });
    await jest.advanceTimersByTimeAsync(50);
    const result = await pending;

    expect(result.success).toBe(true);
    expect(result.resendAvailableAt).toBeGreaterThan(Date.now());
    expect(result.otpExpiresAt).toBeGreaterThan(result.resendAvailableAt);
  });
});
