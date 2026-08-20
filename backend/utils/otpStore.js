// backend/utils/otpStore.js
//
// NOTE: this uses an in-process Map, which is fine for a single server
// instance / local dev. If you run more than one backend instance behind
// a load balancer, move this to Redis (same interface, swap the Map for
// redis GET/SET/DEL with EX) so all instances share OTP state.

const crypto = require('crypto');

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute between requests per email
const MAX_ATTEMPTS = 5; // wrong-code guesses allowed before the code is invalidated

const store = new Map(); // email -> { codeHash, expiresAt, attempts, lastSentAt }

function hashCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function generateCode() {
  // 6-digit numeric code, cryptographically random
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

/**
 * Creates (or replaces) an OTP for the given email.
 * Throws if called again before RESEND_COOLDOWN_MS has passed.
 * Returns the plaintext code (caller is responsible for emailing it —
 * it is never stored or logged in plaintext).
 */
function issueCode(email) {
  const existing = store.get(email);
  if (existing && Date.now() - existing.lastSentAt < RESEND_COOLDOWN_MS) {
    const waitMs = RESEND_COOLDOWN_MS - (Date.now() - existing.lastSentAt);
    const error = new Error(`Please wait ${Math.ceil(waitMs / 1000)}s before requesting a new code.`);
    error.status = 429;
    throw error;
  }

  const code = generateCode();
  store.set(email, {
    codeHash: hashCode(code),
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
    lastSentAt: Date.now(),
  });
  return code;
}

/**
 * Verifies a submitted code for the given email.
 * Returns true/false. Invalidates the code after MAX_ATTEMPTS wrong guesses
 * or once it is used successfully (single use).
 */
function verifyCode(email, submittedCode) {
  const entry = store.get(email);
  if (!entry) return { ok: false, reason: 'No code was requested for this email.' };

  if (Date.now() > entry.expiresAt) {
    store.delete(email);
    return { ok: false, reason: 'Code expired. Request a new one.' };
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    store.delete(email);
    return { ok: false, reason: 'Too many incorrect attempts. Request a new code.' };
  }

  const isMatch = hashCode(String(submittedCode).trim()) === entry.codeHash;
  if (!isMatch) {
    entry.attempts += 1;
    return { ok: false, reason: 'Incorrect code.' };
  }

  store.delete(email); // single use
  return { ok: true };
}

module.exports = { issueCode, verifyCode };