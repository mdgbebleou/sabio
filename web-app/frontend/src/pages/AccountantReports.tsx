import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AccountantLayout } from '../components/AccountantLayout';
import {
  getAllFeeRecords,
  getFeeStats,
  getPaymentsDetailed,
  getMyProfile,
  getActiveTerm,
  getMyGeneratedReports,
  recordGeneratedReport,
} from '../services/teacherService';
import type {
  FeeRecord,
  FeeStats,
  PaymentDetailedRow,
  MyProfile,
  AcademicTerm,
  GeneratedReportRow,
} from '../services/teacherService';

const fmtMoney = (n: number): string =>
  `GHS ${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const fmtDate = (d: Date | string | null): string => {
  if (!d) return '-';
  const dt = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return '-';
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// ---------- time ranges ----------
type TimeTab = 'Today' | 'This Week' | 'This Month' | 'This Term' | 'Academic Year';

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const startOfWeek = (d: Date) => {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return startOfDay(monday);
};
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);

interface Range {
  start: Date | null;
  end: Date | null;
  label: string;
}

const computeRange = (tab: TimeTab, term: AcademicTerm | null): Range => {
  const now = new Date();
  if (tab === 'Today') {
    const s = startOfDay(now);
    const e = new Date(s);
    e.setDate(s.getDate() + 1);
    return { start: s, end: e, label: `${fmtDate(s)} (Today)` };
  }
  if (tab === 'This Week') {
    const s = startOfWeek(now);
    const e = new Date(s);
    e.setDate(s.getDate() + 7);
    return { start: s, end: e, label: `${fmtDate(s)} - ${fmtDate(new Date(e.getTime() - 86400000))}` };
  }
  if (tab === 'This Month') {
    const s = startOfMonth(now);
    const e = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { start: s, end: e, label: `${fmtDate(s)} - ${fmtDate(new Date(e.getTime() - 86400000))}` };
  }
  if (tab === 'This Term' && term) {
    const s = new Date(`${term.startDate}T00:00:00`);
    const e = new Date(`${term.endDate}T23:59:59`);
    if (!Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime())) {
      return { start: s, end: e, label: `${fmtDate(s)} - ${fmtDate(e)}` };
    }
  }
  const academicStart = new Date(now.getFullYear(), 7, 1);
  if (now.getMonth() < 7) academicStart.setFullYear(now.getFullYear() - 1);
  const academicEnd = new Date(academicStart);
  academicEnd.setFullYear(academicStart.getFullYear() + 1);
  return { start: academicStart, end: academicEnd, label: `${fmtDate(academicStart)} - ${fmtDate(new Date(academicEnd.getTime() - 86400000))}` };
};

// ---------- CSV helpers ----------
const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
const csvRow = (cells: (string | number)[]) => cells.map((c) => esc(String(c))).join(',');

const downloadCsv = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ---------- report builders ----------
type ReportType = 'Fee Collection Report' | 'Payment Report' | 'Outstanding Fees Report' | 'Income Summary Report';

const buildFeeCollectionCsv = (records: FeeRecord[]): string => {
  const header = ['Student', 'Student ID', 'Class', 'Category', 'Total Fees', 'Paid', 'Balance', 'Status', 'Due Date', 'Term'];
  const lines = records.map((r) =>
    csvRow([r.studentName, r.studentCustomId, r.className, r.category, r.totalFees, r.amountPaid, r.balance, r.status, r.dueDate || '', r.term])
  );
  return [csvRow(header), ...lines].join('\n');
};

const buildPaymentCsv = (payments: PaymentDetailedRow[]): string => {
  const header = ['Date', 'Student', 'Amount', 'Method', 'Reference', 'Category', 'Status'];
  const lines = payments.map((p) =>
    csvRow([p.paidAt, p.studentName, p.amount, p.method, p.reference || '', p.category || '', p.status])
  );
  return [csvRow(header), ...lines].join('\n');
};

const buildOutstandingCsv = (records: FeeRecord[]): string => {
  const header = ['Student', 'Student ID', 'Class', 'Total Fees', 'Paid', 'Outstanding', 'Status', 'Due Date'];
  const lines = records
    .filter((r) => r.balance > 0)
    .map((r) => csvRow([r.studentName, r.studentCustomId, r.className, r.totalFees, r.amountPaid, r.balance, r.status, r.dueDate || '']));
  return [csvRow(header), ...lines].join('\n');
};

const buildIncomeSummaryCsv = (records: FeeRecord[]): string => {
  const byClass = new Map<string, { total: number; paid: number; balance: number; count: number }>();
  for (const r of records) {
    const key = r.className || 'Unassigned';
    const cur = byClass.get(key) || { total: 0, paid: 0, balance: 0, count: 0 };
    cur.total += r.totalFees;
    cur.paid += r.amountPaid;
    cur.balance += r.balance;
    cur.count += 1;
    byClass.set(key, cur);
  }
  const header = ['Class', 'Students', 'Total Invoiced', 'Total Collected', 'Outstanding', 'Collection %'];
  const rows = Array.from(byClass.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([cls, v]) => {
      const pct = v.total > 0 ? Math.round((v.paid / v.total) * 100) : 0;
      return csvRow([cls, v.count, v.total, v.paid, v.balance, `${pct}%`]);
    });
  return [csvRow(header), ...rows].join('\n');
};

// ---------- component ----------
export const AccountantReports: React.FC = () => {
  const [activeTimeTab, setActiveTimeTab] = useState<TimeTab>('This Term');

  const [records, setRecords] = useState<FeeRecord[]>([]);
  const [payments, setPayments] = useState<PaymentDetailedRow[]>([]);
  const [stats, setStats] = useState<FeeStats | null>(null);
  const [me, setMe] = useState<MyProfile | null>(null);
  const [term, setTerm] = useState<AcademicTerm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [recent, setRecent] = useState<GeneratedReportRow[]>([]);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateType, setGenerateType] = useState<ReportType>('Fee Collection Report');
  const [generating, setGenerating] = useState(false);

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    boxSizing: 'border-box',
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '16px',
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [recs, ps, st, profile, t] = await Promise.all([
        getAllFeeRecords(),
        getPaymentsDetailed(),
        getFeeStats(),
        getMyProfile().catch(() => null),
        getActiveTerm().catch(() => null),
      ]);
      setRecords(recs);
      setPayments(ps);
      setStats(st);
      setMe(profile);
      setTerm(t);
    } catch (err: any) {
      setError(err?.message || 'Could not load report data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    getMyGeneratedReports().then(setRecent).catch(() => setRecent([]));
  }, [load]);

  const range = useMemo(() => computeRange(activeTimeTab, term), [activeTimeTab, term]);

  const filteredPayments = useMemo(() => {
    if (!range.start || !range.end) return payments;
    return payments.filter((p) => {
      const t = new Date(p.paidAt).getTime();
      return !Number.isNaN(t) && t >= range.start!.getTime() && t < range.end!.getTime();
    });
  }, [payments, range]);

  const totalCollected = filteredPayments
    .filter((p) => p.status === 'Completed')
    .reduce((a, p) => a + p.amount, 0);

  const totalCollectedCount = filteredPayments.filter((p) => p.status === 'Completed').length;

  const totalOutstanding = stats?.totalOutstanding ?? 0;
  const totalInvoiced = stats?.totalExpected ?? 0;

  const collectionRate =
    totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0;

  const pushRecent = async (report: { reportType: string; periodLabel: string; format: 'CSV' | 'PDF'; fileName: string }) => {
    try {
      await recordGeneratedReport(report);
      const refreshed = await getMyGeneratedReports();
      setRecent(refreshed);
    } catch {
      /* non-fatal */
    }
  };

  const handleGenerate = async (type: ReportType) => {
    setGenerating(true);
    try {
      let csv = '';
      let filename = '';
      const stamp = ymd(new Date());

      if (type === 'Fee Collection Report') {
        csv = buildFeeCollectionCsv(records);
        filename = `fee-collection-${stamp}.csv`;
      } else if (type === 'Payment Report') {
        csv = buildPaymentCsv(filteredPayments);
        filename = `payments-${stamp}.csv`;
      } else if (type === 'Outstanding Fees Report') {
        csv = buildOutstandingCsv(records);
        filename = `outstanding-fees-${stamp}.csv`;
      } else {
        csv = buildIncomeSummaryCsv(records);
        filename = `income-summary-${stamp}.csv`;
      }

      downloadCsv(filename, csv);

      await pushRecent({
        reportType: type,
        periodLabel: range.label,
        format: 'CSV',
        fileName: filename,
      });
    } finally {
      setGenerating(false);
      setGenerateOpen(false);
    }
  };

  const handleRegenerate = (report: GeneratedReportRow) => {
    const type = report.reportType as ReportType;
    if (
      type === 'Fee Collection Report' ||
      type === 'Payment Report' ||
      type === 'Outstanding Fees Report' ||
      type === 'Income Summary Report'
    ) {
      void handleGenerate(type);
    } else {
      alert('This report type is no longer available.');
    }
  };

  const clearRecent = () => {
    alert('Report history is now stored on the server. Individual rows cannot be cleared from here.');
  };

  const timeTabs: TimeTab[] = ['Today', 'This Week', 'This Month', 'This Term', 'Academic Year'];

  return (
    <AccountantLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
              Financial Reports
            </h1>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Generate, review, and export financial reports for your school.</span>
          </div>

          <button
            onClick={() => setGenerateOpen(true)}
            style={{ backgroundColor: '#000000', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Generate Report
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* TIME FILTER */}
        <div style={{ ...cardStyle, padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {timeTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTimeTab(tab)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: activeTimeTab === tab ? '1px solid #0f172a' : '1px solid #cbd5e1',
                  backgroundColor: activeTimeTab === tab ? '#0f172a' : '#ffffff',
                  color: activeTimeTab === tab ? '#ffffff' : '#334155',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: '#334155', fontWeight: 'bold' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>{range.label}</span>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Total Collected</span>
              <span style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', marginTop: '8px' }}>
              {loading ? '-' : fmtMoney(totalCollected)}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>
              from {totalCollectedCount} payments
            </span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Total Outstanding</span>
              <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', marginTop: '8px' }}>
              {loading ? '-' : fmtMoney(totalOutstanding)}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>
              across {stats?.studentsWithBalance ?? 0} students
            </span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Total Invoiced</span>
              <span style={{ backgroundColor: '#f0f9ff', color: '#0369a1', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', marginTop: '8px' }}>
              {loading ? '-' : fmtMoney(totalInvoiced)}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>
              from {records.length} invoices
            </span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Collection Rate</span>
              <span style={{ backgroundColor: '#f8fafc', color: '#0f172a', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', marginTop: '8px' }}>
              {loading ? '-' : `${collectionRate}%`}
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(collectionRate, 100)}%`, height: '100%', backgroundColor: '#0f172a' }} />
            </div>
          </div>

        </div>

        {/* AVAILABLE REPORTS */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Available Reports</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>

            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ backgroundColor: '#f1f5f9', color: '#0f172a', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Fee Collection Report</h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                  Detailed breakdown of all fees collected during the selected term or period.
                </p>
              </div>
              <button
                onClick={() => void handleGenerate('Fee Collection Report')}
                disabled={generating}
                style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '12px', fontWeight: 'bold', cursor: generating ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                Generate <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>

            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ backgroundColor: '#f1f5f9', color: '#0f172a', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Payment Report</h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                  Log of individual payment transactions, methods, and reconciliation statuses.
                </p>
              </div>
              <button
                onClick={() => void handleGenerate('Payment Report')}
                disabled={generating}
                style={{ background: 'none', border: 'none', color: '#1d4ed8', fontSize: '12px', fontWeight: 'bold', cursor: generating ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
              >
                View Report <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>

            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Outstanding Fees</h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                  List of students with overdue balances, aged by collection risk categories.
                </p>
              </div>
              <button
                onClick={() => void handleGenerate('Outstanding Fees Report')}
                disabled={generating}
                style={{ background: 'none', border: 'none', color: '#1d4ed8', fontSize: '12px', fontWeight: 'bold', cursor: generating ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
              >
                View Report <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>

            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ backgroundColor: '#f0fdf4', color: '#166534', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Income Summary</h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                  High-level summary of total income versus expected financial targets.
                </p>
              </div>
              <button
                onClick={() => void handleGenerate('Income Summary Report')}
                disabled={generating}
                style={{ background: 'none', border: 'none', color: '#1d4ed8', fontSize: '12px', fontWeight: 'bold', cursor: generating ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
              >
                View Report <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>

          </div>
        </div>

        {/* RECENTLY GENERATED */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>

          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Recently Generated</h3>
            {recent.length > 0 && (
              <button
                onClick={clearRecent}
                style={{ background: 'none', border: 'none', fontSize: '12px', fontWeight: 'bold', color: '#64748b', cursor: 'pointer' }}
              >
                Clear History
              </button>
            )}
          </div>

          <div style={{ padding: '10px 20px', backgroundColor: '#f0fdf4', borderBottom: '1px solid #bbf7d0', fontSize: '11px', color: '#166534' }}>
            Report history is stored on the server and syncs across your devices.
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: 800 }}>
                  <th style={{ padding: '12px 20px' }}>REPORT NAME</th>
                  <th style={{ padding: '12px 20px' }}>PERIOD</th>
                  <th style={{ padding: '12px 20px' }}>GENERATED BY</th>
                  <th style={{ padding: '12px 20px' }}>DATE</th>
                  <th style={{ padding: '12px 20px' }}>FORMAT</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                      No reports generated yet. Click Generate Report above.
                    </td>
                  </tr>
                )}
                {recent.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 20px', fontWeight: 'bold', color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        {item.reportType}
                      </div>
                    </td>
                    <td style={{ padding: '12px 20px', color: '#334155' }}>{item.periodLabel || '-'}</td>
                    <td style={{ padding: '12px 20px', color: '#334155' }}>{me?.fullName || 'You'}</td>
                    <td style={{ padding: '12px 20px', color: '#64748b' }}>
                      {item.generatedAt ? new Date(item.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{
                        backgroundColor: item.format === 'PDF' ? '#fee2e2' : '#dcfce7',
                        color: item.format === 'PDF' ? '#991b1b' : '#166534',
                        padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold'
                      }}>
                        {item.format}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleRegenerate(item)}
                        title="Generate again"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#002b49', padding: '4px', fontSize: '11px', fontWeight: 'bold' }}
                      >
                        Regenerate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* GENERATE MODAL */}
        {generateOpen && (
          <div style={overlayStyle} onClick={() => !generating && setGenerateOpen(false)}>
            <div
              style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '480px', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Generate Report</h3>
                <button onClick={() => !generating && setGenerateOpen(false)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>X</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Report Type</label>
                  <select
                    value={generateType}
                    onChange={(e) => setGenerateType(e.target.value as ReportType)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    <option>Fee Collection Report</option>
                    <option>Payment Report</option>
                    <option>Outstanding Fees Report</option>
                    <option>Income Summary Report</option>
                  </select>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', fontSize: '12px', color: '#334155' }}>
                  <div><strong>Period:</strong> {range.label}</div>
                  <div style={{ marginTop: '4px' }}><strong>Format:</strong> CSV (opens in Excel)</div>
                </div>

                <div style={{ marginTop: '14px', fontSize: '11px', color: '#64748b' }}>
                  The file will download to your browser's default downloads folder.
                </div>
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  onClick={() => !generating && setGenerateOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => void handleGenerate(generateType)}
                  disabled={generating}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: generating ? 'wait' : 'pointer', opacity: generating ? 0.7 : 1 }}
                >
                  {generating ? 'Generating...' : 'Generate & Download'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AccountantLayout>
  );
};
