import React, { useState, useEffect } from 'react';
import { CycleRecord, Language, FlowIntensity } from '../types';
import { getTranslation } from '../translations';
import { formatDateISO } from '../utils/cycleCalculator';
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
  const [durationDays, setDurationDays] = useState(5);
  const [flow, setFlow] = useState<FlowIntensity>('medium');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (initialRecord) {
      setStartDate(initialRecord.startDate || formatDateISO(new Date()));
      setDurationDays(initialRecord.durationDays || 5);
      setFlow(initialRecord.flow || 'medium');
      setSelectedSymptoms(initialRecord.symptoms || []);
      setNotes(initialRecord.notes || '');
    } else {
      setStartDate(formatDateISO(new Date()));
      setDurationDays(5);
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
    if (window.confirm(t.confirmDelete)) {
      try {
        setIsDeleting(true);
        await onDelete(initialRecord.id);
        onClose();
      } catch (err) {
        console.error('Failed to delete cycle:', err);
      } finally {
        setIsDeleting(false);
      }
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
          className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-pink-100"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100 flex items-center justify-between shrink-0">
            <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-600" />
              <span>{initialRecord ? t.editPeriodTitle : t.logPeriodTitle}</span>
            </h3>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-pink-100/60 transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
            {/* Helpful Guidance Banner */}
            <div className="p-3 bg-pink-50 border border-pink-200/80 rounded-2xl text-xs font-medium text-pink-900 leading-relaxed">
              {t.formInstructionTip}
            </div>

            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-pink-600" />
                <span>{t.startDateLabel}</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-base font-medium text-gray-900 bg-pink-50/30"
              />
            </div>

            {/* Duration (Days) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  {t.durationLabel}
                </label>
                <span className="text-sm font-extrabold text-pink-600">
                  {t.daysCount(durationDays)}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={12}
                value={durationDays}
                onChange={e => setDurationDays(Number(e.target.value))}
                className="w-full h-2 bg-pink-100 rounded-lg appearance-none cursor-pointer accent-pink-600"
              />
              <div className="flex justify-between text-[11px] text-gray-600 font-medium px-1">
                <span>1 day</span>
                <span>5 days</span>
                <span>12 days</span>
              </div>
            </div>

            {/* Flow Intensity */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
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
                        ? 'bg-pink-600 text-white border-pink-600 shadow-sm shadow-pink-200'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-pink-50'
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
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
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
                          ? 'bg-pink-100 text-pink-800 border-pink-300 font-bold shadow-xs'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
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
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-500" />
                <span>{t.notesLabel}</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={t.notesPlaceholder}
                className="w-full p-3 rounded-2xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm text-gray-900 bg-pink-50/20"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 flex items-center gap-3">
              {initialRecord?.id && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting || isSubmitting}
                  className="min-h-[48px] min-w-[48px] p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center transition-colors cursor-pointer"
                  title={t.deleteBtn}
                >
                  {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-colors cursor-pointer"
              >
                {t.cancelBtn}
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 min-h-[48px] px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold text-sm shadow-md shadow-pink-200 flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-70 cursor-pointer"
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
