import React, { useState } from 'react';
import { CycleRecord, PredictionResult, Language } from '../types';
import { getTranslation } from '../translations';
import { formatDisplayDate } from '../utils/cycleCalculator';
import { printDoctorReport, exportToCSV } from '../utils/reportGenerator';
import { 
  Calendar, 
  Edit3, 
  Trash2, 
  Droplet, 
  Smile, 
  FileText, 
  Plus, 
  Heart, 
  FileDown, 
  Printer, 
  FileSpreadsheet, 
  ChevronDown 
} from 'lucide-react';
import { motion } from 'motion/react';

interface HistoryListProps {
  records: CycleRecord[];
  prediction: PredictionResult;
  userName: string;
  language: Language;
  onEditRecord: (record: CycleRecord) => void;
  onDeleteRecord: (id: string) => void;
  onOpenLogModal: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  records,
  prediction,
  userName,
  language,
  onEditRecord,
  onDeleteRecord,
  onOpenLogModal,
}) => {
  const t = getTranslation(language);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Sort descending
  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  const handlePrintPDF = () => {
    printDoctorReport(records, prediction, userName, language);
    setShowExportMenu(false);
  };

  const handleExportCSV = () => {
    exportToCSV(records, language);
    setShowExportMenu(false);
  };

  if (sortedRecords.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border border-pink-100 shadow-md shadow-pink-100/50 space-y-4">
        <div className="w-16 h-16 rounded-full bg-pink-100 mx-auto flex items-center justify-center text-pink-600">
          <Heart className="w-8 h-8 fill-pink-200" />
        </div>
        <div className="space-y-1">
          <h3 className="font-extrabold text-gray-900 text-lg">{t.historyTitle}</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">{t.noHistory}</p>
        </div>
        <button
          onClick={onOpenLogModal}
          className="min-h-[48px] px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold text-sm shadow-md flex items-center gap-2 mx-auto cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>{t.logPeriodTitle}</span>
        </button>
      </div>
    );
  }

  const flowBadgeStyles = {
    light: 'bg-rose-50 text-rose-700 border-rose-200',
    medium: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
    heavy: 'bg-rose-600 text-white border-rose-600 font-bold',
  };

  return (
    <div className="space-y-3">
      {/* Top Header & Export Doctor Report Button */}
      <div className="flex items-center justify-between px-1 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-600" />
            <span>{t.historyTitle}</span>
          </h3>
          <span className="text-xs font-semibold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200">
            {records.length} {language === 'bn' ? 'টি এন্ট্রি' : 'Entries'}
          </span>
        </div>

        {/* Doctor Report Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-3.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold border border-pink-200 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-pink-600" />
            <span>{t.exportDoctorReport}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-pink-100 py-1.5 z-30 animate-fade-in text-xs font-medium">
              <button
                onClick={handlePrintPDF}
                className="w-full px-3.5 py-2 text-left hover:bg-pink-50 text-gray-800 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-pink-600" />
                <span>{t.printPdfReport}</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="w-full px-3.5 py-2 text-left hover:bg-pink-50 text-gray-800 flex items-center gap-2 transition-colors cursor-pointer border-t border-gray-50"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>{t.downloadCsv}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {sortedRecords.map((record, index) => (
          <motion.div
            key={record.id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-pink-100/90 shadow-sm hover:shadow-md transition-shadow space-y-3"
          >
            {/* Entry Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="text-base font-extrabold text-gray-900">
                  {formatDisplayDate(record.startDate, language)}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200">
                    {t.durationDaysText(record.durationDays)}
                  </span>
                  {record.flow && (
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                        flowBadgeStyles[record.flow] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Droplet className="w-3 h-3" />
                      <span>{t.flowTypes[record.flow]}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEditRecord(record)}
                  className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer flex items-center justify-center"
                  title={t.editPeriodTitle}
                  aria-label="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                {record.id && (
                  <button
                    onClick={() => onDeleteRecord(record.id!)}
                    className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex items-center justify-center"
                    title={t.deleteBtn}
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Symptoms Chips */}
            {record.symptoms && record.symptoms.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-gray-50">
                <Smile className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                {record.symptoms.map(symId => {
                  const symLabel = t.symptomsList[symId as keyof typeof t.symptomsList] || symId;
                  return (
                    <span
                      key={symId}
                      className="text-[11px] font-medium bg-gray-50 text-gray-700 px-2 py-0.5 rounded-md border border-gray-100"
                    >
                      {symLabel}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Notes */}
            {record.notes && (
              <div className="flex items-start gap-1.5 text-xs text-gray-600 bg-pink-50/30 p-2 rounded-xl border border-pink-100/50 italic">
                <FileText className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                <p>{record.notes}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
