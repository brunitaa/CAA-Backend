// src/middlewares/otpBruteForce.js
import {
  incrementOtpAttempts,
  resetOtpAttempts,
  checkOtpAllowed,
} from "../lib/inMemoryStore.js";

/**
 * Thin wrappers so services/controllers import the same API as before.
 * - incrementOtpAttempts(email) => { attempts, ttl }
 * - resetOtpAttempts(email)
 * - checkOtpAllowed(email) => { allowed, attempts, ttl }
 */

export { incrementOtpAttempts, resetOtpAttempts, checkOtpAllowed };
