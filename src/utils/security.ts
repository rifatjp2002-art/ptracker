/**
 * Security & App Privacy Lock Utilities
 * Supports:
 * 1. 4-Digit PIN with SHA-256 Hashing
 * 2. Biometric Authentication (WebAuthn / Fingerprint / Face ID)
 * 3. Auto-Lock on Visibility Change / App Backgrounding
 */

const PIN_STORAGE_KEY = 'period_tracker_pin_hash';
const BIOMETRIC_STORAGE_KEY = 'period_tracker_bio_enabled';
const LOCK_STATE_SESSION_KEY = 'period_tracker_is_unlocked';

/**
 * SHA-256 Hash a PIN string so plain PIN is never stored
 */
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`salt_pt_${pin}_security`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify if entered PIN matches the stored hash
 */
export async function verifyPin(enteredPin: string): Promise<boolean> {
  const storedHash = localStorage.getItem(PIN_STORAGE_KEY);
  if (!storedHash) return true; // No PIN set
  const enteredHash = await hashPin(enteredPin);
  return enteredHash === storedHash;
}

/**
 * Save new PIN
 */
export async function saveNewPin(pin: string): Promise<void> {
  const hash = await hashPin(pin);
  localStorage.setItem(PIN_STORAGE_KEY, hash);
  sessionStorage.setItem(LOCK_STATE_SESSION_KEY, 'true');
}

/**
 * Remove/Disable PIN Lock
 */
export function removePinLock(): void {
  localStorage.removeItem(PIN_STORAGE_KEY);
  localStorage.removeItem(BIOMETRIC_STORAGE_KEY);
  sessionStorage.removeItem(LOCK_STATE_SESSION_KEY);
}

/**
 * Check if PIN Lock is enabled
 */
export function isPinLockEnabled(): boolean {
  return !!localStorage.getItem(PIN_STORAGE_KEY);
}

/**
 * Check if app is currently unlocked for this session
 */
export function isAppUnlocked(): boolean {
  if (!isPinLockEnabled()) return true;
  return sessionStorage.getItem(LOCK_STATE_SESSION_KEY) === 'true';
}

/**
 * Set unlock state
 */
export function setAppUnlocked(unlocked: boolean): void {
  if (unlocked) {
    sessionStorage.setItem(LOCK_STATE_SESSION_KEY, 'true');
  } else {
    sessionStorage.removeItem(LOCK_STATE_SESSION_KEY);
  }
}

/**
 * Check if device supports Biometric Authentication (WebAuthn Platform Authenticator)
 */
export async function isBiometricsSupported(): Promise<boolean> {
  try {
    if (window.PublicKeyCredential && 
        typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
  } catch (e) {
    console.debug('Biometric check notice:', e);
  }
  return false;
}

/**
 * Check if user enabled biometric unlock
 */
export function isBiometricsEnabled(): boolean {
  return localStorage.getItem(BIOMETRIC_STORAGE_KEY) === 'true';
}

/**
 * Toggle Biometrics preference
 */
export function setBiometricsEnabled(enabled: boolean): void {
  if (enabled) {
    localStorage.setItem(BIOMETRIC_STORAGE_KEY, 'true');
  } else {
    localStorage.removeItem(BIOMETRIC_STORAGE_KEY);
  }
}

/**
 * Trigger Biometric Authentication prompt (Fingerprint / Face ID)
 */
export async function authenticateWithBiometrics(): Promise<boolean> {
  try {
    if (!window.PublicKeyCredential) return false;
    
    // Generate a random challenge
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    // Request assertion from device authenticator
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        timeout: 60000,
        userVerification: 'preferred',
        rpId: window.location.hostname || undefined,
      }
    });

    if (assertion) {
      setAppUnlocked(true);
      return true;
    }
  } catch (err: any) {
    // If not registered yet or cancelled by user, catch silently
    console.debug('Biometric authentication notice:', err);
  }
  return false;
}

/**
 * Register biometric credential on device
 */
export async function registerBiometrics(): Promise<boolean> {
  try {
    if (!window.PublicKeyCredential) return false;
    
    const challenge = new Uint8Array(32);
    const userId = new Uint8Array(16);
    crypto.getRandomValues(challenge);
    crypto.getRandomValues(userId);

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'Period Tracker Privacy',
          id: window.location.hostname || undefined,
        },
        user: {
          id: userId,
          name: 'period_user',
          displayName: 'App User',
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },  // ES256
          { alg: -257, type: 'public-key' } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'preferred',
          requireResidentKey: false,
        },
        timeout: 60000,
      }
    });

    if (credential) {
      setBiometricsEnabled(true);
      return true;
    }
  } catch (err: any) {
    console.debug('Biometric registration error/cancel:', err);
  }
  return false;
}
