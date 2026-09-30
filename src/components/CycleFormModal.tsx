import React, { useState, useEffect } from 'react';
import { CycleRecord, Language, FlowIntensity } from '../types';
import { getTranslation } from '../translations';
import { formatDateISO, toBengaliDigits } from '../utils/cycleCalculator';
import { X, Calendar, Droplet, Smile, FileText, Trash2, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CycleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<CycleRecord, 'userId'>, id?: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  initialRecord?: CycleRecord | null;
  language: Language;
}

export const CycleFormModal: React.FC<CycleFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialRecord,
  language,
}) => {
  const t = getTranslation(language);

  const [startDate, setStartDate] = useState(formatDateISO(new Date()));
  const [durationDays, setDurationDays] = useState(3);
  const [flow, setFlow] = useState<FlowIntensity>('medium');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    setConfirmingDelete(false);
    if (initialRecord) {
      setStartDate(initialRecord.startDate || formatDateISO(new Date()));
      setDurationDays(initialRecord.durationDays || 3);
      setFlow(initialRecord.flow || 'medium');
      setSelectedSymptoms(initialRecord.symptoms || []);
      setNotes(initialRecord.notes || '');
    } else {
      setStartDate(formatDateISO(new Date()));
      setDurationDays(3);
      setFlow('medium');
      setSelectedSymptoms([]);
      setNotes('');
    }
  }, [initialRecord, isOpen]);

  if (!isOpen) return null;

  const availableSymptoms = [
    { id: 'cramps', label: t.symptomsList.cramps, emoji: '⚡' },
    { id: 'headache', label: t.symptomsList.headache, emoji: '🤕' },
    { id: 'bloating', label: t.symptomsList.bloating, emoji: '🫄' },
    { id: 'moodSwings', label: t.symptomsList.moodSwings, emoji: '🎭' },
    { id: 'fatigue', label: t.symptomsList.fatigue, emoji: '😴' },
    { id: 'acne', label: t.symptomsList.acne, emoji: '✨' },
    { id: 'backache', label: t.symptomsList.backache, emoji: '🧘' },
    { id: 'cravings', label: t.symptomsList.cravings, emoji: '🍫' },
    { id: 'nausea', label: t.symptomsList.nausea, emoji: '🤢' },
  ];

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) return;

    try {
      setIsSubmitting(true);
      await onSave(
        {
          startDate,
          durationDays: Number(durationDays),
          flow,
          symptoms: selectedSymptoms,
          notes: notes.trim(),
          createdAt: new Date().toISOString(),
        },
        initialRecord?.id
      );
      onClose();
    } catch (err) {
      console.error('Failed to save cycle:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialRecord?.id || !onDelete) return;
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    try {
      setIsDeleting(true);
      await onDelete(initialRecord.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete cycle:', err);
    } finally {
      setIsDeleting(false);
      setConfirmingDelete(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-lg bg-white dark:bg-[#1a1924] rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-pink-100 dark:border-pink-950/40 text-gray-800 dark:text-gray-100"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-[#201d2d] dark:to-[#251e2f] border-b border-pink-100 dark:border-pink-950/40 flex items-center justify-between shrink-0">
            <h3 className="font-extrabold text-gray-900 dark:text-gray-100 text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              <span>{initialRecord ? t.editPeriodTitle : t.logPeriodTitle}</span>
            </h3>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] p-2 rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-pink-100/60 dark:hover:bg-pink-950/50 transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
            {/* Helpful Guidance Banner */}
            <div className="p-3 bg-pink-50 dark:bg-pink-950/40 border border-pink-200/80 dark:border-pink-900/40 rounded-2xl text-xs font-medium text-pink-900 dark:text-pink-200 leading-relaxed">
              {t.formInstructionTip}
            </div>

            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                <span>{t.startDateLabel}</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl border border-pink-200 dark:border-pink-900/40 focus:outline-none focus:ring-2 focus:ring-pink-500 text-base font-medium text-gray-900 dark:text-gray-100 bg-pink-50/30 dark:bg-[#22202e]"
              />
            </div>

            {/* Duration (Days) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  {t.durationLabel}
                </label>
                <span className="text-sm font-extrabold text-pink-600 dark:text-pink-400">
                  {t.daysCount(durationDays)}
                </span>
              </div>

              {/* Quick Select Buttons */}
              <div className="grid grid-cols-6 gap-1.5">
                {[1, 2, 3, 4, 5, 7].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationDays(d)}
                    className={`py-1.5 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      durationDays === d
                        ? 'bg-pink-600 text-white border-pink-600 shadow-xs scale-102'
                        : 'bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-pink-300'
                    }`}
                  >
                    {language === 'bn' ? `${toBengaliDigits(d)} দিন` : `${d}d`}
                  </button>
                ))}
              </div>

              <input
                type="range"
                min={1}
                max={12}
                value={durationDays}
                onChange={e => setDurationDays(Number(e.target.value))}
                className="w-full h-2 bg-pink-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-pink-600"
              />
              <div className="flex justify-between text-[11px] text-gray-600 dark:text-gray-400 font-medium px-1">
                <span>{language === 'bn' ? '১ দিন' : '1 day'}</span>
                <span className="text-pink-600 dark:text-pink-400 font-bold">{language === 'bn' ? '৩ দিন (ডিফল্ট)' : '3 days (default)'}</span>
                <span>{language === 'bn' ? '১২ দিন' : '12 days'}</span>
              </div>
            </div>

            {/* Flow Intensity */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-rose-500" />
                <span>{t.flowLabel}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['light', 'medium', 'heavy'] as FlowIntensity[]).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFlow(type)}
                    className={`min-h-[44px] px-3 py-2 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      flow === type
                        ? 'bg-pink-600 text-white border-pink-600 shadow-sm shadow-pink-200 dark:shadow-none'
                        : 'bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-pink-50 dark:hover:bg-pink-950/40'
                    }`}
                  >
                    <span>{t.flowTypes[type]}</span>
                    {flow === type && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-amber-500" />
                <span>{t.symptomsLabel}</span>
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {availableSymptoms.map(sym => {
                  const isSelected = selectedSymptoms.includes(sym.id);
                  return (
                    <button
                      key={sym.id}
                      type="button"
                      onClick={() => toggleSymptom(sym.id)}
                      className={`min-h-[40px] px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'bg-pink-100 dark:bg-pink-900/60 text-pink-800 dark:text-pink-200 border-pink-300 dark:border-pink-700 font-bold shadow-xs'
                          : 'bg-white dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span>{sym.emoji}</span>
                      <span>{sym.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-500" />
                <span>{t.notesLabel}</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={t.notesPlaceholder}
                className="w-full p-3 rounded-2xl border border-pink-200 dark:border-pink-900/40 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm text-gray-900 dark:text-gray-100 bg-pink-50/20 dark:bg-[#22202e]"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 flex items-center gap-3">
              {initialRecord?.id && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting || isSubmitting}
                  className={`min-h-[48px] px-3 py-2 rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs font-bold ${
                    confirmingDelete
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-300 dark:shadow-none'
                      : 'bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60'
                  }`}
                  title={confirmingDelete ? (language === 'bn' ? 'মুছে ফেলতে নিশ্চিত করুন' : 'Confirm Delete') : t.deleteBtn}
                >
                  {isDeleting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : confirmingDelete ? (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>{language === 'bn' ? 'মুছবেন?' : 'Confirm?'}</span>
                    </>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm transition-colors cursor-pointer"
              >
                {t.cancelBtn}
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 min-h-[48px] px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold text-sm shadow-md shadow-pink-200 dark:shadow-none flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-70 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span>{initialRecord ? t.updateBtn : t.saveBtn}</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
