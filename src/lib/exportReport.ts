import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { DailyMetrics } from '@/types';

/** Aggregated KPI summary for the selected time range. */
export interface ReportSummary {
  totalRevenue: number;
  jobsScheduled: number;
  jobsCompleted: number;
  avgUtilization: number; // 0-100, already rounded by caller
  avgSatisfaction: number; // 0-5, e.g. 4.6
}

/** Options for the PDF export. */
export interface ReportExportOpts {
  rangeLabel: string; // e.g. "Last 30 days" or "Jun 1, 2026 – Jun 15, 2026"
  summary: ReportSummary;
  rows: DailyMetrics[]; // already filtered to the selected range
}

const INDIGO: [number, number, number] = [99, 102, 241]; // #6366F1, matches charts

/** Build the key/value summary rows for the PDF KPI block. */
function buildSummaryBody(summary: ReportSummary): string[][] {
  return [
    ['Total Revenue', formatCurrency(summary.totalRevenue)],
    ['Jobs Scheduled', String(summary.jobsScheduled)],
    ['Jobs Completed', String(summary.jobsCompleted)],
    ['Avg Crew Utilization', `${summary.avgUtilization}%`],
    ['Avg Satisfaction', `${summary.avgSatisfaction.toFixed(1)} / 5.0`],
  ];
}

/** Build the daily-metrics table rows for the PDF. */
function buildMetricsBody(rows: DailyMetrics[]): string[][] {
  return rows.map((m) => [
    formatDate(m.date),
    formatCurrency(m.revenue),
    String(m.jobsCompleted),
    String(m.jobsScheduled),
    `${m.crewUtilization}%`,
    m.customerSatisfaction.toFixed(1),
  ]);
}

/** Generate and download a PDF report with title, range, KPI summary, and a daily table. */
export function exportReportPdf(opts: ReportExportOpts): void {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Orange Blossom Special Lawncare — Report', 14, 18);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Range: ${opts.rangeLabel}`, 14, 26);
  doc.text(`Generated: ${formatDate(new Date().toISOString())}`, 14, 32);

  autoTable(doc, {
    startY: 38,
    head: [['Summary', '']],
    body: buildSummaryBody(opts.summary),
    theme: 'striped',
    headStyles: { fillColor: INDIGO },
  });

  const summaryEnd = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  autoTable(doc, {
    startY: summaryEnd + 8,
    head: [['Date', 'Revenue', 'Completed', 'Scheduled', 'Utilization', 'Satisfaction']],
    body: buildMetricsBody(opts.rows),
    theme: 'grid',
    headStyles: { fillColor: INDIGO },
    styles: { fontSize: 8 },
  });

  doc.save(`obs-report-${Date.now()}.pdf`);
}

/** Escape a CSV cell, quoting it if it contains commas, quotes, or newlines. */
function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Build a CSV string from daily metrics and trigger a browser download. */
export function exportReportCsv(rows: DailyMetrics[], filename: string): void {
  const header = [
    'Date',
    'Revenue',
    'Jobs Completed',
    'Jobs Scheduled',
    'Crew Utilization %',
    'Customer Satisfaction',
  ];
  const lines = [header.map(csvCell).join(',')];
  for (const m of rows) {
    lines.push(
      [m.date, m.revenue, m.jobsCompleted, m.jobsScheduled, m.crewUtilization, m.customerSatisfaction]
        .map(csvCell)
        .join(','),
    );
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
