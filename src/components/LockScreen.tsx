import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { 
  verifyPin, 
  isBiometricsSupported, 
  isBiometricsConfigured, 
  authenticateWithBiometrics, 
  setAppUnlocked,
  removePinLock
} from '../utils/security';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { Heart, Lock, Delete, Fingerprint, AlertCircle, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LockScreenProps {
  language: Language;
  onUnlocked: () => void;
  userEmail?: string | null;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  language,
  onUnlocked,
  userEmail,
}) => {
  const isBn = language === 'bn';
  const [pin, setPin] = useState('');
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [isAuthenticatingBio, setIsAuthenticatingBio] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [isVerifyingGoogle, setIsVerifyingGoogle] = useState(false);
  const [googleVerifyError, setGoogleVerifyError] = useState<string | null>(null);
  const [isVerifySuccess, setIsVerifySuccess] = useState(false);

  useEffect(() => {
    // Check if device supports biometrics and has registered credentials
    isBiometricsSupported().then(supported => {
      setHasBiometrics(supported && isBiometricsConfigured());
    });
  }, []);

  // Try biometric unlock automatically on mount only if properly configured
  useEffect(() => {
    let mounted = true;
    const tryAutoBio = async () => {
      if (isBiometricsConfigured()) {
        const res = await authenticateWithBiometrics();
        if (res.success && mounted) {
          onUnlocked();
        }
      }
    };
    const timer = setTimeout(() => {
      tryAutoBio();
    }, 300);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [onUnlocked]);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setIsError(false);
      setErrorMessage('');

      if (nextPin.length === 4) {
        verify(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setIsError(false);
    setErrorMessage('');
  };

  const verify = async (candidatePin: string) => {
    const isValid = await verifyPin(candidatePin);
    if (isValid) {
      setAppUnlocked(true);
      onUnlocked();
    } else {
      setIsError(true);
      setErrorMessage(isBn ? 'ভুল পিন! আবার চেষ্টা করুন' : 'Incorrect PIN! Try again');
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      setTimeout(() => {
        setPin('');
      }, 500);
    }
  };

  const handleBiometricClick = async () => {
    if (!isBiometricsConfigured()) {
      setErrorMessage(
        isBn 
          ? 'ফিঙ্গারপ্রিন্ট এখনও সেটআপ হয়নি। ৪ ডিজিটের পিন দিয়ে আনলক করে সেটিং থেকে সেট করুন।' 
          : 'Biometrics not configured. Enter PIN to unlock and set up in Settings.'
      );
      return;
    }
    try {
      setIsAuthenticatingBio(true);
      const res = await authenticateWithBiometrics();
      if (res.success) {
        onUnlocked();
      } else if (res.error && res.error !== 'AbortError' && res.error !== 'NotAllowedError') {
        setErrorMessage(
          isBn
            ? 'বায়োমেট্রিক মেলেনি! ৪ ডিজিটের পিন ব্যবহার করুন।'
            : 'Biometric verification failed. Please enter PIN.'
        );
      }
    } finally {
      setIsAuthenticatingBio(false);
    }
  };

  const handleGoogleVerifyReset = async () => {
    setIsVerifyingGoogle(true);
    setGoogleVerifyError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // If user had a registered account before, make sure it matches
      if (userEmail && result.user.email && result.user.email.toLowerCase() !== userEmail.toLowerCase()) {
        setGoogleVerifyError(
          isBn 
            ? `লগইনকৃত অ্যাকাউন্ট (${result.user.email}) এই অ্যাপের নিবন্ধিত অ্যাকাউন্টের (${userEmail}) সাথে মেলেনি! অনুগ্রহ করে সঠিক অ্যাকাউন্টে সাইন ইন করুন।` 
            : `Logged in account (${result.user.email}) does not match the app registered account (${userEmail})!`
        );
        setIsVerifyingGoogle(false);
        return;
      }

      // Verification successful!
      setIsVerifySuccess(true);
      setTimeout(() => {
        removePinLock();
        setAppUnlocked(true);
        onUnlocked();
      }, 1000);
    } catch (err: any) {
      console.error('Google verification error:', err);
      setGoogleVerifyError(
        isBn
          ? 'গুগল ভেরিফিকেশন ব্যর্থ হয়েছে বা পপআপ উইন্ডো বন্ধ করা হয়েছে। আবার চেষ্টা করুন।'
          : 'Google verification failed or window was closed. Please try again.'
      );
    } finally {
      setIsVerifyingGoogle(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#121118]/95 dark:bg-[#0d0c13]/98 backdrop-blur-xl flex flex-col items-center justify-between p-6 select-none overflow-hidden text-gray-100">
      {/* Top Header info */}
      <div className="pt-8 text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-500 via-rose-500 to-pink-400 p-0.5 shadow-xl shadow-pink-500/25 mx-auto flex items-center justify-center">
          <div className="w-full h-full bg-[#1a1924] rounded-[22px] flex items-center justify-center">
            <Heart className="w-8 h-8 text-pink-500 fill-pink-500/20" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center justify-center gap-1.5">
            <Lock className="w-4 h-4 text-pink-400" />
            <span>{isBn ? 'প্রাইভেসি লক' : 'App Privacy Lock'}</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {isBn 
              ? 'আপনার গোপনীয়তা রক্ষায় ৪ ডিজিটের পিন লিখুন' 
              : 'Enter your 4-digit PIN to access your cycle records'}
          </p>
        </div>
      </div>

      {/* PIN Dots Indicator */}
      <div className="my-auto space-y-4">
        <motion.div 
          animate={isError ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-center gap-4"
        >
          {[0, 1, 2, 3].map(idx => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 border-2 ${
                  isError
                    ? 'border-rose-500 bg-rose-500 scale-110 shadow-lg shadow-rose-500/50'
                    : isFilled
                    ? 'border-pink-500 bg-pink-500 scale-115 shadow-lg shadow-pink-500/50'
                    : 'border-gray-600 bg-transparent'
                }`}
              />
            );
          })}
        </motion.div>

        {errorMessage && (
          <p className="text-center text-xs font-bold text-rose-400 flex items-center justify-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errorMessage}</span>
          </p>
        )}
      </div>

      {/* Keypad */}
      <div className="w-full max-w-[290px] space-y-3 pb-4">
        <div className="grid grid-cols-3 gap-3.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="h-16 rounded-3xl bg-white/5 hover:bg-white/15 active:bg-pink-500 active:text-white border border-white/10 text-xl font-extrabold text-white transition-all transform active:scale-92 cursor-pointer flex items-center justify-center"
            >
              {isBn ? String(num).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[Number(d)]) : num}
            </button>
          ))}

          {/* Biometric Button or Placeholder */}
          {hasBiometrics ? (
            <button
              type="button"
              onClick={handleBiometricClick}
              disabled={isAuthenticatingBio}
              className="h-16 rounded-3xl bg-pink-950/40 hover:bg-pink-900/50 border border-pink-700/50 text-pink-400 transition-all transform active:scale-92 cursor-pointer flex items-center justify-center"
              title={isBn ? 'ফিঙ্গারপ্রিন্ট বা ফেস আনলক' : 'Fingerprint or Face ID'}
            >
              {isAuthenticatingBio ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <Fingerprint className="w-7 h-7 animate-pulse" />
              )}
            </button>
          ) : (
            <div />
          )}

          {/* 0 */}
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-16 rounded-3xl bg-white/5 hover:bg-white/15 active:bg-pink-500 active:text-white border border-white/10 text-xl font-extrabold text-white transition-all transform active:scale-92 cursor-pointer flex items-center justify-center"
          >
            {isBn ? '০' : '0'}
          </button>

          {/* Delete Key */}
          <button
            type="button"
            onClick={handleDelete}
            className="h-16 rounded-3xl bg-white/5 hover:bg-white/15 active:bg-white/20 border border-white/10 text-gray-300 transition-all transform active:scale-92 cursor-pointer flex items-center justify-center"
            aria-label="Delete"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* Forgot PIN / Reset Link */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => {
              setGoogleVerifyError(null);
              setIsVerifySuccess(false);
              setShowForgotModal(true);
            }}
            className="text-xs text-gray-400 hover:text-pink-400 underline decoration-dotted transition-colors cursor-pointer"
          >
            {isBn ? 'পিন ভুলে গেছেন?' : 'Forgot PIN?'}
          </button>
        </div>
      </div>

      {/* Google Verification Modal for Forgot PIN */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-[#1a1924] border border-pink-900/50 rounded-3xl p-6 text-center space-y-4 shadow-2xl text-gray-100"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-rose-500/20 text-pink-400 border border-pink-500/30 mx-auto flex items-center justify-center shadow-lg shadow-pink-500/10">
                <ShieldCheck className="w-7 h-7 text-pink-400" />
              </div>

              <div className="space-y-1.5">
                <h4 className="font-extrabold text-base text-white">
                  {isBn ? 'Google দিয়ে ভেরিফাই করুন' : 'Verify with Google'}
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {isBn
                    ? 'আপনার ব্যক্তিগত স্বাস্থ্য তথ্যের শতভাগ নিরাপত্তা নিশ্চিত করতে গুগল অ্যাকাউন্টে সাইন ইন করে পরিচয় নিশ্চিত করুন।'
                    : 'To protect your private health data, verify your identity with Google to reset your PIN.'}
                </p>
              </div>

              {/* Registered Account info banner */}
              {userEmail ? (
                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-left space-y-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {isBn ? 'নিবন্ধিত গুগল অ্যাকাউন্ট' : 'Registered Google Account'}
                  </p>
                  <p className="text-xs text-pink-400 font-semibold truncate">
                    {userEmail}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {isBn 
                      ? 'পিন রিসেট করতে এই অ্যাকাউন্টে সাইন-ইন নিশ্চিত করতে হবে।' 
                      : 'You must verify with this account to unlock.'}
                  </p>
                </div>
              ) : (
                <div className="p-2.5 bg-pink-950/30 border border-pink-900/40 rounded-2xl text-xs text-pink-300 text-left">
                  {isBn 
                    ? '🔒 গুগল দিয়ে ভেরিফাই করলে আপনার পরিচয় নিশ্চিত হবে এবং ডাটা সুরক্ষিত থাকবে।' 
                    : '🔒 Verifying with Google ensures secure ownership.'}
                </div>
              )}

              {/* Success Notification */}
              {isVerifySuccess && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-600/60 rounded-2xl text-xs text-emerald-300 font-bold flex items-center justify-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{isBn ? 'ভেরিফিকেশন সফল! পিন রিসেট হচ্ছে...' : 'Verified! Resetting PIN...'}</span>
                </div>
              )}

              {/* Error Message */}
              {googleVerifyError && (
                <div className="p-3 bg-rose-950/60 border border-rose-600/60 rounded-2xl text-xs text-rose-300 text-left flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                  <span className="leading-tight">{googleVerifyError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleGoogleVerifyReset}
                  disabled={isVerifyingGoogle || isVerifySuccess}
                  className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-gray-100 text-gray-900 font-extrabold text-xs shadow-lg flex items-center justify-center gap-2.5 transition-all transform active:scale-98 disabled:opacity-60 cursor-pointer"
                >
                  {isVerifyingGoogle ? (
                    <>
                      <RefreshCw className="w-4 h-4 text-gray-900 animate-spin" />
                      <span>{isBn ? 'গুগল ভেরিফাই হচ্ছে...' : 'Verifying with Google...'}</span>
                    </>
                  ) : (
                    <>
                      {/* Authentic Google G SVG Icon */}
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>{isBn ? 'Google দিয়ে ভেরিফাই ও রিসেট' : 'Verify with Google & Reset'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  disabled={isVerifyingGoogle}
                  className="w-full py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-gray-400 hover:text-gray-200 text-xs font-semibold cursor-pointer transition-colors"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

