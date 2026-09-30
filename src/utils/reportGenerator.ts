import { CycleRecord, PredictionResult, Language } from '../types';
import { formatDisplayDate } from './cycleCalculator';

export function exportToCSV(records: CycleRecord[], language: Language) {
  const isBn = language === 'bn';
  const headers = isBn
    ? ['শুরুর তারিখ', 'স্থায়িত্ব (দিন)', 'প্রবাহ (Flow)', 'লক্ষণসমূহ (Symptoms)', 'নোট']
    : ['Start Date', 'Duration (Days)', 'Flow', 'Symptoms', 'Notes'];

  const rows = records.map(r => [
    r.startDate,
    r.durationDays,
    r.flow || 'medium',
    `"${(r.symptoms || []).join(', ')}"`,
    `"${(r.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `period_report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printDoctorReport(
  records: CycleRecord[],
  prediction: PredictionResult,
  userName: string,
  language: Language
) {
  const isBn = language === 'bn';
  const sorted = [...records].sort((a, b) => b.startDate.localeCompare(a.startDate));

  const regularityLabel =
    prediction.cycleRegularity === 'regular'
      ? (isBn ? `নিয়মিত (Regular - ±${prediction.standardDeviation} দিন)` : `Regular (±${prediction.standardDeviation}d)`)
      : prediction.cycleRegularity === 'irregular'
      ? (isBn ? 'অনিয়মিত (Irregular)' : 'Irregular')
      : (isBn
          ? `পর্যাপ্ত ডাটা নেই (${records.length}/৪টি এন্ট্রি, আরও ${Math.max(1, 4 - records.length)}টি প্রয়োজন)`
          : `Insufficient Data (${records.length}/4 logged, need ${Math.max(1, 4 - records.length)} more)`);

  const reportTitle = isBn
    ? 'পিরিয়ড ও মেনস্ট্রুয়াল সাইকেল রিপোর্ট'
    : 'Menstrual Cycle Health Summary';
  const patientLabel = isBn ? 'ব্যবহারকারী / পেশেন্ট' : 'Patient / User';
  const dateLabel = isBn ? 'রিপোর্টের তারিখ' : 'Report Date';
  const avgCycleLabel = isBn ? 'গড় সাইকেল দৈর্ঘ্য' : 'Average Cycle Length';
  const regularityHeader = isBn ? 'সাইকেলের ধরণ' : 'Cycle Regularity';
  const totalLogsLabel = isBn ? 'মোট সংরক্ষিত সাইকেল' : 'Total Cycles Logged';
  const pastCyclesTitle = isBn ? 'বিগত সাইকেলসমূহের বিবরণ' : 'Cycle History Details';

  const rowsHtml = sorted
    .map(
      r => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">
          ${formatDisplayDate(r.startDate, language)}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
          ${r.durationDays} ${isBn ? 'দিন' : 'Days'}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center; text-transform: capitalize;">
          ${r.flow || 'medium'}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; color: #555;">
          ${(r.symptoms || []).length > 0 ? r.symptoms?.join(', ') : '-'}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666; font-style: italic;">
          ${r.notes || '-'}
        </td>
      </tr>`
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${reportTitle}</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            color: #2d3748;
            padding: 36px;
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
          }
          .header {
            border-bottom: 3px solid #e91e63;
            padding-bottom: 18px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          h1 { margin: 0; color: #e91e63; font-size: 24px; }
          .subtitle { color: #718096; font-size: 13px; margin-top: 4px; }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 28px;
          }
          .stat-card {
            background: #fff0f3;
            border: 1px solid #ffd1dc;
            padding: 14px;
            border-radius: 12px;
          }
          .stat-title { font-size: 11px; text-transform: uppercase; color: #e91e63; font-weight: bold; }
          .stat-value { font-size: 20px; font-weight: 800; margin-top: 4px; color: #1a202c; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
          th {
            background: #f8fafc;
            color: #4a5568;
            font-weight: 700;
            padding: 10px;
            text-align: left;
            border-bottom: 2px solid #e2e8f0;
          }
          .footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #edf2f7;
            font-size: 11px;
            color: #a0aec0;
            text-align: center;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>🌸 ${reportTitle}</h1>
            <div class="subtitle">${patientLabel}: <strong>${userName || 'User'}</strong> | ${dateLabel}: ${new Date().toLocaleDateString()}</div>
          </div>
          <button class="no-print" onclick="window.print()" style="background: #e91e63; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer;">
            🖨️ ${isBn ? 'প্রিন্ট / সেভ করুন' : 'Print / Save PDF'}
          </button>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-title">${avgCycleLabel}</div>
            <div class="stat-value">${prediction.averageCycleLength} ${isBn ? 'দিন' : 'Days'}</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">${regularityHeader}</div>
            <div class="stat-value" style="font-size: 16px;">${regularityLabel}</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">${totalLogsLabel}</div>
            <div class="stat-value">${sorted.length}</div>
          </div>
        </div>

        <h3 style="margin-bottom: 8px; font-size: 16px; color: #2d3748;">📋 ${pastCyclesTitle}</h3>
        <table>
          <thead>
            <tr>
              <th>${isBn ? 'শুরুর তারিখ' : 'Start Date'}</th>
              <th style="text-align: center;">${isBn ? 'স্থায়িত্ব' : 'Duration'}</th>
              <th style="text-align: center;">${isBn ? 'ফ্লো' : 'Flow'}</th>
              <th>${isBn ? 'উপসর্গসমূহ' : 'Symptoms'}</th>
              <th>${isBn ? 'নোট' : 'Notes'}</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || `<tr><td colspan="5" style="text-align:center; padding: 20px;">No records</td></tr>`}
          </tbody>
        </table>

        <div class="footer">
          Generated via Period Tracker PWA • Designed for gynecological health discussions
        </div>
        <script>
          window.onload = function() {
            setTimeout(() => { window.print(); }, 400);
          }
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
