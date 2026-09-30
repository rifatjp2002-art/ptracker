/**
 * Security & App Privacy Lock Utilities
 * Supports:
 * 1. 4-Digit PIN with SHA-256 Hashing
 * 2. Device Biometric Authentication (WebAuthn / Fingerprint / Face ID / Screen Lock)
 * 3. Auto-Lock on Visibility Change / App Backgrounding
 */

const PIN_STORAGE_KEY = 'period_tracker_pin_hash';
const BIOMETRIC_STORAGE_KEY = 'period_tracker_bio_enabled';
const BIOMETRIC_CRED_ID_KEY = 'period_tracker_bio_cred_id';
const LOCK_STATE_SESSION_KEY = 'period_tracker_is_unlocked';

// Helper: Uint8Array <-> Base64
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

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
  localStorage.removeItem(BIOMETRIC_CRED_ID_KEY);
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
    if (
      window.PublicKeyCredential &&
      typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
    ) {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
  } catch (e) {
    console.debug('Biometric support check notice:', e);
  }
  return false;
}

/**
 * Check if user has enabled biometric unlock
 */
export function isBiometricsEnabled(): boolean {
  return localStorage.getItem(BIOMETRIC_STORAGE_KEY) === 'true';
}

/**
 * Check if a registered biometric credential exists
 */
export function hasBiometricCredential(): boolean {
  return !!localStorage.getItem(BIOMETRIC_CRED_ID_KEY);
}

/**
 * Check if biometrics is fully configured and ready for 1-touch unlock
 */
export function isBiometricsConfigured(): boolean {
  return isBiometricsEnabled() && hasBiometricCredential();
}

/**
 * Toggle Biometrics preference
 */
export function setBiometricsEnabled(enabled: boolean): void {
  if (enabled) {
    localStorage.setItem(BIOMETRIC_STORAGE_KEY, 'true');
  } else {
    localStorage.removeItem(BIOMETRIC_STORAGE_KEY);
    localStorage.removeItem(BIOMETRIC_CRED_ID_KEY);
  }
}

/**
 * Register biometric credential on device (Fingerprint / Face ID / PIN)
 */
export async function registerBiometrics(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!window.PublicKeyCredential) {
      return { success: false, error: 'WebAuthn is not supported in this browser' };
    }

    const challenge = new Uint8Array(32);
    const userId = new Uint8Array(16);
    crypto.getRandomValues(challenge);
    crypto.getRandomValues(userId);

    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'Period Tracker',
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
          userVerification: 'required',
          residentKey: 'preferred',
          requireResidentKey: false,
        },
        timeout: 60000,
        attestation: 'none',
      },
    })) as PublicKeyCredential | null;

    if (credential && credential.rawId) {
      const credIdBase64 = bufferToBase64(credential.rawId);
      localStorage.setItem(BIOMETRIC_CRED_ID_KEY, credIdBase64);
      localStorage.setItem(BIOMETRIC_STORAGE_KEY, 'true');
      return { success: true };
    }
  } catch (err: any) {
    console.warn('Biometric registration notice:', err);
    return { 
      success: false, 
      error: err?.message || 'Biometric registration cancelled or not available' 
    };
  }
  return { success: false, error: 'Registration failed' };
}

/**
 * Trigger Biometric Authentication prompt (Fingerprint / Face ID)
 */
export async function authenticateWithBiometrics(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!window.PublicKeyCredential) {
      return { success: false, error: 'Not supported' };
    }

    const savedCredId = localStorage.getItem(BIOMETRIC_CRED_ID_KEY);
    if (!savedCredId) {
      return { success: false, error: 'NO_CREDENTIAL' };
    }

    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const allowCredentials: PublicKeyCredentialDescriptor[] = [
      {
        id: base64ToBuffer(savedCredId),
        type: 'public-key',
        transports: ['internal'],
      },
    ];

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        timeout: 60000,
        userVerification: 'required',
        rpId: window.location.hostname || undefined,
        allowCredentials,
      },
    });

    if (assertion) {
      setAppUnlocked(true);
      return { success: true };
    }
  } catch (err: any) {
    console.debug('Biometric authentication error/cancelled:', err);
    return { success: false, error: err?.name || err?.message || 'FAILED' };
  }
  return { success: false, error: 'FAILED' };
}
