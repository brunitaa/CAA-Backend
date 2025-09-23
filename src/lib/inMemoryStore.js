// src/lib/inMemoryStore.js
// Simple in-memory store for OTP attempts and other short-lived counters.
// NOT for production: single-process, lost on restart, not shared between instances.

const otpAttempts = new Map(); // email -> { count: number, expiresAt: number, timeoutId }

const DEFAULT_WINDOW_SECONDS = 60 * 60; // 1 hour

export function incrementOtpAttempts(
  email,
  windowSeconds = DEFAULT_WINDOW_SECONDS
) {
  const now = Date.now();
  const entry = otpAttempts.get(email);

  if (!entry) {
    const timeoutId = setTimeout(() => {
      otpAttempts.delete(email);
    }, windowSeconds * 1000);
    otpAttempts.set(email, {
      count: 1,
      expiresAt: now + windowSeconds * 1000,
      timeoutId,
    });
    return { attempts: 1, ttl: windowSeconds };
  }

  // increase
  clearTimeout(entry.timeoutId);
  const newCount = entry.count + 1;
  const expiresAt = now + windowSeconds * 1000;
  const timeoutId = setTimeout(() => {
    otpAttempts.delete(email);
  }, windowSeconds * 1000);

  otpAttempts.set(email, { count: newCount, expiresAt, timeoutId });
  const ttl = Math.ceil((expiresAt - now) / 1000);
  return { attempts: newCount, ttl };
}

export function resetOtpAttempts(email) {
  const entry = otpAttempts.get(email);
  if (!entry) return false;
  clearTimeout(entry.timeoutId);
  otpAttempts.delete(email);
  return true;
}

export function checkOtpAllowed(email, maxAttempts = 5) {
  const entry = otpAttempts.get(email);
  if (!entry) return { allowed: true, attempts: 0, ttl: 0 };
  const allowed = entry.count < maxAttempts;
  const ttl = Math.ceil((entry.expiresAt - Date.now()) / 1000);
  return { allowed, attempts: entry.count, ttl: ttl > 0 ? ttl : 0 };
}
