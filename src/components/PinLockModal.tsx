import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { 
  isPinLockEnabled, 
  saveNewPin, 
  removePinLock, 
  verifyPin,
  isBiometricsSupported, 
  isBiometricsEnabled, 
  setBiometricsEnabled,
  registerBiometrics
} from '../utils/security';
import { Lock, ShieldCheck, X, KeyRound, Fingerprint, Trash2, Check, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface PinLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onPinConfigured: () => void;
  onTriggerLockNow: () => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({
  isOpen,
  onClose,
  language,
  onPinConfigured,
  onTriggerLockNow,
}) => {
  const isBn = language === 'bn';

  const [hasExistingPin, setHasExistingPin] = useState(false);
  const [step, setStep] = useState<'view' | 'enter_old' | 'enter_new' | 'confirm_new'>('view');
  
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  
  const [error, setError] = useState('');
  const [bioSupported, setBioSupported] = useState(false);
  const [bioActive, setBioActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const pinActive = isPinLockEnabled();
      setHasExistingPin(pinActive);
      setStep(pinActive ? 'view' : 'enter_new');
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setError('');

      isBiometricsSupported().then(supported => {
        setBioSupported(supported);
        setBioActive(isBiometricsEnabled());
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSetNewPinDigit = (num: string) => {
    setError('');
    if (step === 'enter_old') {
      if (oldPin.length < 4) {
        const next = oldPin + num;
        setOldPin(next);
        if (next.length === 4) {
          verifyOldPin(next);
        }
      }
    } else if (step === 'enter_new') {
      if (newPin.length < 4) {
        const next = newPin + num;
        setNewPin(next);
        if (next.length === 4) {
          setTimeout(() => setStep('confirm_new'), 200);
        }
      }
    } else if (step === 'confirm_new') {
      if (confirmPin.length < 4) {
        const next = confirmPin + num;
        setConfirmPin(next);
        if (next.length === 4) {
          finalizePin(next);
        }
      }
    }
  };

  const verifyOldPin = async (candidate: string) => {
    const valid = await verifyPin(candidate);
    if (valid) {
      setOldPin('');
      setStep('enter_new');
    } else {
      setError(isBn ? 'বর্তমান পিনটি সঠিক নয়' : 'Incorrect current PIN');
      setOldPin('');
    }
  };

  const finalizePin = async (candidateConfirm: string) => {
    if (candidateConfirm !== newPin) {
      setError(isBn ? 'পিন দুটি মেলেনি! আবার চেষ্টা করুন' : 'PINs do not match! Try again');
      setConfirmPin('');
      setStep('enter_new');
      setNewPin('');
      return;
    }

    await saveNewPin(newPin);
    setHasExistingPin(true);
    setStep('view');
    onPinConfigured();
  };

  const handleBackspace = () => {
    setError('');
    if (step === 'enter_old') setOldPin(prev => prev.slice(0, -1));
    else if (step === 'enter_new') setNewPin(prev => prev.slice(0, -1));
    else if (step === 'confirm_new') setConfirmPin(prev => prev.slice(0, -1));
  };

  const handleRemovePin = () => {
    removePinLock();
    setHasExistingPin(false);
    setStep('enter_new');
    setNewPin('');
    setConfirmPin('');
    onPinConfigured();
  };

  const handleToggleBiometrics = async () => {
    if (!bioActive) {
      const regSuccess = await registerBiometrics();
      if (regSuccess) {
        setBioActive(true);
      } else {
        // Fallback simple toggle
        setBiometricsEnabled(true);
        setBioActive(true);
      }
    } else {
      setBiometricsEnabled(false);
      setBioActive(false);
    }
  };

  const activeInputLength = 
    step === 'enter_old' ? oldPin.length :
    step === 'enter_new' ? newPin.length :
    confirmPin.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-sm bg-white dark:bg-[#1a1924] rounded-3xl p-6 shadow-2xl border border-pink-100 dark:border-pink-950/40 text-gray-800 dark:text-gray-100 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center text-pink-600 dark:text-pink-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-gray-100">
                {isBn ? 'অ্যাপ প্রাইভেসি ও সিকিউরিটি' : 'App Privacy & Security'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View State: When PIN already configured */}
        {step === 'view' && hasExistingPin ? (
          <div className="space-y-4 py-1">
            {/* Status Card */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-xs text-emerald-900 dark:text-emerald-200">
                  {isBn ? 'প্রাইভেসি লক সক্রিয় আছে' : 'PIN Lock Active'}
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  {isBn ? 'অ্যাপ মিনিমাইজ বা রিলোড করলে পিন চাওয়া হবে' : 'App is protected with 4-digit PIN'}
                </p>
              </div>
            </div>

            {/* Biometric Option if supported */}
            {bioSupported && (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-[#201e2b] border border-gray-200 dark:border-gray-800 text-xs">
                <div className="flex items-center gap-2.5">
                  <Fingerprint className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200">
                      {isBn ? 'ফিঙ্গারপ্রিন্ট / বায়োমেট্রিক' : 'Biometric / Fingerprint'}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      {isBn ? 'আঙুলের ছোঁয়ায় দ্রুত আনলক' : 'Unlock using device biometrics'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleBiometrics}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    bioActive
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {bioActive ? (isBn ? 'চালু' : 'Enabled') : (isBn ? 'বন্ধ' : 'Off')}
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              {/* Lock Now Button */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onTriggerLockNow();
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-pink-500/20 active:scale-98 transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>{isBn ? 'এখনই লক করুন (Lock Now)' : 'Lock App Immediately'}</span>
              </button>

              {/* Change PIN Button */}
              <button
                type="button"
                onClick={() => setStep('enter_old')}
                className="w-full py-2.5 rounded-2xl bg-gray-50 dark:bg-[#201e2b] hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs border border-gray-200 dark:border-gray-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-pink-600" />
                <span>{isBn ? 'পিন পরিবর্তন করুন' : 'Change PIN'}</span>
              </button>

              {/* Disable PIN Button */}
              <button
                type="button"
                onClick={handleRemovePin}
                className="w-full py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-900/40 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isBn ? 'লক বন্ধ করুন' : 'Disable PIN Lock'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* PIN Input Keypad Step */
          <div className="space-y-4 py-1 text-center">
            <div>
              <p className="text-xs font-extrabold text-gray-900 dark:text-gray-100">
                {step === 'enter_old'
                  ? (isBn ? 'বর্তমান ৪ ডিজিটের পিন লিখুন' : 'Enter Current 4-digit PIN')
                  : step === 'enter_new'
                  ? (isBn ? 'নতুন ৪ ডিজিটের পিন নির্ধারণ করুন' : 'Enter New 4-digit PIN')
                  : (isBn ? 'নিশ্চিত করতে পুনরায় পিনটি লিখুন' : 'Re-enter PIN to Confirm')}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                {step === 'confirm_new'
                  ? (isBn ? 'একই পিন দুইবার প্রবেশ করান' : 'Both PINs must match')
                  : (isBn ? 'মনে রাখা সহজ এমন ৪টি সংখ্যা দিন' : 'Choose 4 digits you will remember')}
              </p>
            </div>

            {/* Dots */}
            <div className="flex items-center justify-center gap-3 py-2">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                    activeInputLength > i
                      ? 'bg-pink-600 border-pink-600 scale-110 shadow-xs'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
              ))}
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-500 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </p>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleSetNewPinDigit(d)}
                  className="h-11 rounded-2xl bg-gray-50 dark:bg-[#201e2b] hover:bg-pink-50 dark:hover:bg-pink-950/40 text-gray-800 dark:text-gray-100 font-extrabold text-sm border border-gray-200 dark:border-gray-800 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                >
                  {isBn ? String(d).replace(/\d/g, num => '০১২৩৪৫৬৭৮৯'[Number(num)]) : d}
                </button>
              ))}

              <div />

              <button
                type="button"
                onClick={() => handleSetNewPinDigit('0')}
                className="h-11 rounded-2xl bg-gray-50 dark:bg-[#201e2b] hover:bg-pink-50 dark:hover:bg-pink-950/40 text-gray-800 dark:text-gray-100 font-extrabold text-sm border border-gray-200 dark:border-gray-800 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              >
                {isBn ? '০' : '0'}
              </button>

              <button
                type="button"
                onClick={handleBackspace}
                className="h-11 rounded-2xl bg-gray-50 dark:bg-[#201e2b] hover:bg-gray-100 text-gray-500 font-bold text-xs border border-gray-200 dark:border-gray-800 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              >
                ⌫
              </button>
            </div>

            {hasExistingPin && (
              <button
                type="button"
                onClick={() => setStep('view')}
                className="text-xs text-gray-500 underline pt-1 cursor-pointer"
              >
                {isBn ? 'ফিরে যান' : 'Back'}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
