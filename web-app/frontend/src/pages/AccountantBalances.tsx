import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountantLayout } from '../components/AccountantLayout';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  getAllFeeRecords,
  getFeeStats,
  getClassOutstanding,
  getPaymentsForFee,
} from '../services/teacherService';
import type {
  FeeRecord,
  FeeStats,
  ClassOutstanding,
  PaymentRow,
} from '../services/teacherService';

const fmtMoney = (n: number): string =>
  `GHS ${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const fmtDate = (ymd: string | null): string => {
  if (!ymd) return '-';
  const d = new Date(`${ymd}T00:00:00`);
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const fmtDateTime = (iso: string | null): string => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

type AgingStatus = 'Due Soon' | 'Overdue' | 'Severely Overdue' | 'Not Yet Due' | 'No Due Date';

const computeAging = (dueDate: string | null): { status: AgingStatus; subtext: string; daysOverdue: number | null } => {
  if (!dueDate) return { status: 'No Due Date', subtext: '', daysOverdue: null };
  const d = new Date(`${dueDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return { status: 'No Due Date', subtext: '', daysOverdue: null };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = today.getTime() - d.getTime();
  const days = Math.floor(diffMs / 86400000);

  if (days < 0) {
    const daysUntil = -days;
    if (daysUntil <= 7) return { status: 'Due Soon', subtext: `Due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`, daysOverdue: null };
    return { status: 'Not Yet Due', subtext: `Due in ${daysUntil} days`, daysOverdue: null };
  }
  if (days === 0) return { status: 'Overdue', subtext: 'Due today', daysOverdue: 0 };
  if (days <= 30) return { status: 'Overdue', subtext: `${days} days overdue`, daysOverdue: days };
  return { status: 'Severely Overdue', subtext: `${days} days overdue`, daysOverdue: days };
};

const agingBucket = (daysOverdue: number | null): 'Not Yet Due' | '1-30 Days' | '31-60 Days' | '61-90 Days' | '90+ Days' => {
  if (daysOverdue === null) return 'Not Yet Due';
  if (daysOverdue <= 30) return '1-30 Days';
  if (daysOverdue <= 60) return '31-60 Days';
  if (daysOverdue <= 90) return '61-90 Days';
  return '90+ Days';
};

const PAGE_SIZE = 10;

const getPageNumbers = (current: number, total: number): (number | '...')[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
};

const buildCsv = (rows: FeeRecord[]): string => {
  const header = ['Student', 'Student ID', 'Class', 'Total Fees', 'Paid', 'Outstanding', 'Due Date', 'Status'];
  const lines = rows.map((r) => {
    const aging = computeAging(r.dueDate);
    return [
      r.studentName,
      r.studentCustomId,
      r.className,
      String(r.totalFees),
      String(r.amountPaid),
      String(r.balance),
      r.dueDate || '',
      aging.status,
    ];
  });
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  return [header.map(esc).join(','), ...lines.map((r) => r.map(esc).join(','))].join('\n');
};

export const AccountantBalances: React.FC = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState<FeeRecord[]>([]);
  const [stats, setStats] = useState<FeeStats | null>(null);
  const [classOut, setClassOut] = useState<ClassOutstanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('Class');
  const [selectedStatus, setSelectedStatus] = useState('Status');
  const [page, setPage] = useState(1);

  // More Filters
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [agingFilter, setAgingFilter] = useState('All');

  // selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // details modal
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsRecord, setDetailsRecord] = useState<FeeRecord | null>(null);
  const [detailsPayments, setDetailsPayments] = useState<PaymentRow[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

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
      const [recs, s, co] = await Promise.all([
        getAllFeeRecords(),
        getFeeStats(),
        getClassOutstanding(),
      ]);
      setRecords(recs);
      setStats(s);
      setClassOut(co);
    } catch (err: any) {
      setError(err?.message || 'Could not load balances.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // only records with balance > 0
  const outstandingRecords = useMemo(
    () => records.filter((r) => r.balance > 0),
    [records]
  );

  // KPI computations
  const totalOutstanding = stats?.totalOutstanding ?? 0;
  const studentsWithBalance = stats?.studentsWithBalance ?? 0;

  const overdueRecords = outstandingRecords.filter((r) => {
    const a = computeAging(r.dueDate);
    return a.status === 'Overdue' || a.status === 'Severely Overdue';
  });
  const overdueAmount = overdueRecords.reduce((sum, r) => sum + r.balance, 0);

  const dueSoonRecords = outstandingRecords.filter(
    (r) => computeAging(r.dueDate).status === 'Due Soon'
  );
  const dueSoonAmount = dueSoonRecords.reduce((sum, r) => sum + r.balance, 0);

  const longTermRecords = outstandingRecords.filter((r) => {
    const a = computeAging(r.dueDate);
    return a.daysOverdue !== null && a.daysOverdue > 60;
  });
  const longTermAmount = longTermRecords.reduce((sum, r) => sum + r.balance, 0);

  // Aging chart
  const agingBuckets = useMemo(() => {
    const buckets = {
      'Not Yet Due': 0,
      '1-30 Days': 0,
      '31-60 Days': 0,
      '61-90 Days': 0,
      '90+ Days': 0,
    } as Record<string, number>;
    for (const r of outstandingRecords) {
      const a = computeAging(r.dueDate);
      const key = agingBucket(a.daysOverdue);
      buckets[key] = (buckets[key] || 0) + r.balance;
    }
    return [
      { range: 'Not Yet Due', amount: buckets['Not Yet Due'], color: '#0f172a' },
      { range: '1-30 Days', amount: buckets['1-30 Days'], color: '#cbd5e1' },
      { range: '31-60 Days', amount: buckets['31-60 Days'], color: '#94a3b8' },
      { range: '61-90 Days', amount: buckets['61-90 Days'], color: '#fca5a5' },
      { range: '90+ Days', amount: buckets['90+ Days'], color: '#dc2626' },
    ];
  }, [outstandingRecords]);

  // Class level balances
  const classBalances = classOut;

  // Filters
  const classOptions = useMemo(
    () => Array.from(new Set(outstandingRecords.map((r) => r.className).filter((c) => c && c !== '-'))).sort(),
    [outstandingRecords]
  );

  const filtered = useMemo(() => {
    return outstandingRecords
      .filter((r) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          r.studentName.toLowerCase().includes(q) ||
          r.studentCustomId.toLowerCase().includes(q)
        );
      })
      .filter((r) => selectedClass === 'Class' || r.className === selectedClass)
      .filter((r) => {
        if (selectedStatus === 'Status') return true;
        return computeAging(r.dueDate).status === selectedStatus;
      })
      .filter((r) => {
        if (agingFilter === 'All') return true;
        const a = computeAging(r.dueDate);
        return agingBucket(a.daysOverdue) === agingFilter;
      });
  }, [outstandingRecords, searchTerm, selectedClass, selectedStatus, agingFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedClass, selectedStatus, agingFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageNumbers = getPageNumbers(page, totalPages);

  const allOnPageSelected = paginated.length > 0 && paginated.every((r) => selectedIds.has(r.id));
  const toggleAllOnPage = () => {
    const next = new Set(selectedIds);
    if (allOnPageSelected) {
      for (const r of paginated) next.delete(r.id);
    } else {
      for (const r of paginated) next.add(r.id);
    }
    setSelectedIds(next);
  };
  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const handleExport = () => {
    const csv = buildCsv(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `balances-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkReminders = () => {
    if (selectedIds.size === 0) {
      alert('Select at least one student.');
      return;
    }
    const selected = outstandingRecords.filter((r) => selectedIds.has(r.id));
    const total = selected.reduce((sum, r) => sum + r.balance, 0);
    const names = selected.map((r) => r.studentName).slice(0, 5).join(', ');
    const more = selected.length > 5 ? ` and ${selected.length - 5} more` : '';
    if (!confirm(`Send payment reminders to ${selected.length} student${selected.length === 1 ? '' : 's'}?\n\n${names}${more}\n\nTotal outstanding: ${fmtMoney(total)}`)) return;
    alert(`Reminder queued for ${selected.length} student${selected.length === 1 ? '' : 's'}.\n\nNote: email delivery is not configured yet.`);
    setSelectedIds(new Set());
  };

  const openDetails = async (record: FeeRecord) => {
    setDetailsRecord(record);
    setDetailsOpen(true);
    setDetailsLoading(true);
    try {
      const list = await getPaymentsForFee(record.id);
      setDetailsPayments(list);
    } catch {
      setDetailsPayments([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedClass('Class');
    setSelectedStatus('Status');
    setAgingFilter('All');
  };

  return (
    <AccountantLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
              Student Account Balances
            </h1>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Monitor individual ledger balances, advance credits, and outstanding debts.</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleExport}
              style={{ backgroundColor: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export Balances
            </button>
            <button
              onClick={handleBulkReminders}
              style={{ backgroundColor: '#002b49', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Send Bulk Reminders {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* 4 KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Total Outstanding</span>
              <span style={{ backgroundColor: '#f1f5f9', color: '#0f172a', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
              {loading ? '-' : fmtMoney(totalOutstanding)}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>{studentsWithBalance} students</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Overdue Amount</span>
              <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
              {loading ? '-' : fmtMoney(overdueAmount)}
            </div>
            <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>{overdueRecords.length} students</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Due Soon</span>
              <span style={{ backgroundColor: '#fefce8', color: '#ca8a04', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
              {loading ? '-' : fmtMoney(dueSoonAmount)}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>{dueSoonRecords.length} students</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Long-Term Outstanding</span>
              <span style={{ backgroundColor: '#f8fafc', color: '#475569', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
              {loading ? '-' : fmtMoney(longTermAmount)}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>{longTermRecords.length} students over 60 days</span>
          </div>

        </div>

        {/* CHARTS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '20px', alignItems: 'start', marginBottom: '24px' }}>

          <div style={{ ...cardStyle, height: '100%', minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Outstanding Balance Analysis</h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </div>

            <div style={{ width: '100%', height: '260px', flex: 1 }}>
              {loading ? (
                <div style={{ fontSize: '12px', color: '#64748b' }}>Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agingBuckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="range" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px', border: 'none' }}
                      formatter={(v: any) => fmtMoney(Number(v ?? 0))}
                    />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      {agingBuckets.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', height: '100%', minHeight: '380px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>By Class Level</h3>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </div>

            {loading ? (
              <div style={{ fontSize: '12px', color: '#64748b' }}>Loading...</div>
            ) : classBalances.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#64748b' }}>No outstanding balances.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'space-around', flex: 1 }}>
                {classBalances.map((cls) => (
                  <div key={cls.className}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>
                      <span>{cls.className}</span>
                      <span style={{ color: '#0f172a' }}>{fmtMoney(cls.amount)}</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${cls.percentOfMax}%`, height: '100%', backgroundColor: '#002b49' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* TABLE */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>

          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Students With Outstanding Balances</h3>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', width: '240px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="text"
                  placeholder="Search student name, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ border: 'none', background: 'none', outline: 'none', fontSize: '12px', width: '100%', color: '#0f172a' }}
                />
              </div>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}
              >
                <option value="Class">Class</option>
                {classOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}
              >
                <option value="Status">Status</option>
                <option value="Overdue">Overdue</option>
                <option value="Severely Overdue">Severely Overdue</option>
                <option value="Due Soon">Due Soon</option>
              </select>

              <button
                onClick={() => setMoreFiltersOpen((v) => !v)}
                style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: moreFiltersOpen ? '#f0f9ff' : '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                More Filters
              </button>

              <button
                onClick={clearFilters}
                style={{ border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#64748b', cursor: 'pointer' }}
              >
                Clear
              </button>
            </div>
          </div>

          {moreFiltersOpen && (
            <div style={{ padding: '12px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                value={agingFilter}
                onChange={(e) => setAgingFilter(e.target.value)}
                style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}
              >
                <option value="All">Aging (All)</option>
                <option value="Not Yet Due">Not Yet Due</option>
                <option value="1-30 Days">1-30 Days</option>
                <option value="31-60 Days">31-60 Days</option>
                <option value="61-90 Days">61-90 Days</option>
                <option value="90+ Days">90+ Days</option>
              </select>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '750px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                  <th style={{ padding: '12px 20px', width: '40px' }}>
                    <input type="checkbox" checked={allOnPageSelected} onChange={toggleAllOnPage} />
                  </th>
                  <th style={{ padding: '12px 20px' }}>Student</th>
                  <th style={{ padding: '12px 20px' }}>Class</th>
                  <th style={{ padding: '12px 20px' }}>Total Fees</th>
                  <th style={{ padding: '12px 20px' }}>Paid</th>
                  <th style={{ padding: '12px 20px' }}>Outstanding</th>
                  <th style={{ padding: '12px 20px' }}>Due Date</th>
                  <th style={{ padding: '12px 20px' }}>Status</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Loading...</td></tr>
                )}
                {!loading && paginated.length === 0 && (
                  <tr><td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No balances match your filters.</td></tr>
                )}
                {!loading && paginated.map((item) => {
                  const aging = computeAging(item.dueDate);
                  const badgeBg = aging.status === 'Severely Overdue' ? '#fee2e2'
                    : aging.status === 'Overdue' ? '#fee2e2'
                    : aging.status === 'Due Soon' ? '#fef3c7'
                    : '#f1f5f9';
                  const badgeColor = aging.status === 'Severely Overdue' ? '#991b1b'
                    : aging.status === 'Overdue' ? '#991b1b'
                    : aging.status === 'Due Soon' ? '#b45309'
                    : '#475569';
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 20px' }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleOne(item.id)}
                        />
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <strong style={{ color: '#0f172a', display: 'block' }}>{item.studentName}</strong>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>{item.studentCustomId}</span>
                      </td>
                      <td style={{ padding: '12px 20px', color: '#334155', fontWeight: 'bold' }}>{item.className}</td>
                      <td style={{ padding: '12px 20px', color: '#334155' }}>{fmtMoney(item.totalFees)}</td>
                      <td style={{ padding: '12px 20px', color: '#334155' }}>{fmtMoney(item.amountPaid)}</td>
                      <td style={{ padding: '12px 20px', fontWeight: '900', color: '#dc2626' }}>{fmtMoney(item.balance)}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ color: '#0f172a', fontWeight: 'bold', display: 'block' }}>{fmtDate(item.dueDate)}</span>
                        {aging.subtext && (
                          <span style={{ fontSize: '10px', color: aging.status === 'Due Soon' ? '#ca8a04' : '#dc2626', fontWeight: 'bold' }}>
                            {aging.subtext}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ backgroundColor: badgeBg, color: badgeColor, padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>
                          {aging.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                          <button
                            title="View Details"
                            onClick={() => void openDetails(item)}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                          <button
                            title="Record Payment"
                            onClick={() => navigate('/accountant/fees')}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#002b49', padding: '4px' }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              Showing <strong>{filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)}</strong> of <strong>{filtered.length}</strong> entries
            </div>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: page <= 1 ? 'not-allowed' : 'pointer', color: '#334155', opacity: page <= 1 ? 0.5 : 1 }}
              >
                Prev
              </button>
              {pageNumbers.map((n, idx) =>
                n === '...' ? (
                  <span key={`gap-${idx}`} style={{ padding: '0 4px', color: '#94a3b8' }}>...</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: page === n ? 'none' : '1px solid #cbd5e1',
                      backgroundColor: page === n ? '#0f172a' : '#ffffff',
                      color: page === n ? '#ffffff' : '#334155',
                      fontWeight: page === n ? 'bold' : 'normal',
                      cursor: 'pointer'
                    }}
                  >
                    {n}
                  </button>
                )
              )}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: page >= totalPages ? 'not-allowed' : 'pointer', color: '#334155', opacity: page >= totalPages ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          </div>

        </div>

        {/* DETAILS MODAL */}
        {detailsOpen && detailsRecord && (
          <div style={overlayStyle} onClick={() => setDetailsOpen(false)}>
            <div
              style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '720px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{detailsRecord.studentName}</h3>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    {detailsRecord.studentCustomId} | {detailsRecord.className} | {detailsRecord.category}
                  </span>
                </div>
                <button onClick={() => setDetailsOpen(false)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>X</button>
              </div>

              <div style={{ padding: '20px 24px', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Fees</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{fmtMoney(detailsRecord.totalFees)}</div>
                  </div>
                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontSize: '10px', color: '#166534', fontWeight: 'bold', textTransform: 'uppercase' }}>Paid</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#166534', marginTop: '4px' }}>{fmtMoney(detailsRecord.amountPaid)}</div>
                  </div>
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontSize: '10px', color: '#991b1b', fontWeight: 'bold', textTransform: 'uppercase' }}>Outstanding</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#991b1b', marginTop: '4px' }}>{fmtMoney(detailsRecord.balance)}</div>
                  </div>
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Payment History
                </div>

                {detailsLoading ? (
                  <div style={{ fontSize: '12px', color: '#64748b', padding: '20px', textAlign: 'center' }}>Loading...</div>
                ) : detailsPayments.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#64748b', padding: '20px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                    No payments recorded yet for this student.
                  </div>
                ) : (
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                          <th style={{ padding: '10px 14px' }}>DATE</th>
                          <th style={{ padding: '10px 14px' }}>AMOUNT</th>
                          <th style={{ padding: '10px 14px' }}>METHOD</th>
                          <th style={{ padding: '10px 14px' }}>REFERENCE</th>
                          <th style={{ padding: '10px 14px' }}>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailsPayments.map((p) => (
                          <tr key={p.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px 14px', color: '#64748b' }}>{fmtDateTime(p.paidAt)}</td>
                            <td style={{ padding: '10px 14px', fontWeight: 'bold', color: '#166534' }}>{fmtMoney(p.amount)}</td>
                            <td style={{ padding: '10px 14px', color: '#334155' }}>{p.method}</td>
                            <td style={{ padding: '10px 14px', color: '#64748b' }}>{p.reference || '-'}</td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{
                                backgroundColor: p.status === 'Completed' ? '#dcfce7' : p.status === 'Pending' ? '#fef3c7' : '#fee2e2',
                                color: p.status === 'Completed' ? '#166534' : p.status === 'Pending' ? '#92400e' : '#991b1b',
                                padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold'
                              }}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  onClick={() => setDetailsOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}
                >
                  Close
                </button>
                <button
                  onClick={() => { setDetailsOpen(false); navigate('/accountant/fees'); }}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}
                >
                  Go to Fees
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AccountantLayout>
  );
};
