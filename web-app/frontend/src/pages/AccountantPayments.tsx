import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AccountantLayout } from '../components/AccountantLayout';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { getPaymentsDetailed, getPaymentStats } from '../services/teacherService';
import { recordPaymentTransaction } from '../services/accountService';
import { supabase } from '../services/supabase';
import type { PaymentDetailedRow, PaymentStats } from '../services/teacherService';

const fmtMoney = (n: number): string =>
  `GHS ${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const fmtDate = (iso: string): string => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

interface Bucket {
  time: string;
  amount: number;
}

const bucketPayments = (
  payments: PaymentDetailedRow[],
  timeframe: 'Daily' | 'Weekly' | 'Monthly'
): Bucket[] => {
  const now = new Date();
  const completed = payments.filter((p) => p.status === 'Completed');

  if (timeframe === 'Daily') {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const buckets: { time: string; amount: number; key: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);
      buckets.push({ time: dayNames[d.getDay()], amount: 0, key: d.toDateString() });
    }
    for (const p of completed) {
      const d = new Date(p.paidAt);
      if (Number.isNaN(d.getTime())) continue;
      d.setHours(0, 0, 0, 0);
      const b = buckets.find((x) => x.key === d.toDateString());
      if (b) b.amount += p.amount;
    }
    return buckets.map((b) => ({ time: b.time, amount: b.amount }));
  }

  if (timeframe === 'Weekly') {
    const buckets: { time: string; amount: number; start: number; end: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const end = new Date(now);
      end.setDate(now.getDate() - i * 7);
      end.setHours(23, 59, 59, 999);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      buckets.push({
        time: `Week ${4 - i}`,
        amount: 0,
        start: start.getTime(),
        end: end.getTime(),
      });
    }
    for (const p of completed) {
      const t = new Date(p.paidAt).getTime();
      if (Number.isNaN(t)) continue;
      const b = buckets.find((x) => t >= x.start && t <= x.end);
      if (b) b.amount += p.amount;
    }
    return buckets.map((b) => ({ time: b.time, amount: b.amount }));
  }

  // Monthly
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const buckets: { time: string; amount: number; key: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ time: monthNames[d.getMonth()], amount: 0, key: `${d.getFullYear()}-${d.getMonth()}` });
  }
  for (const p of completed) {
    const d = new Date(p.paidAt);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const b = buckets.find((x) => x.key === key);
    if (b) b.amount += p.amount;
  }
  return buckets.map((b) => ({ time: b.time, amount: b.amount }));
};

const buildCsv = (rows: PaymentDetailedRow[]): string => {
  const header = ['Student', 'Transaction ID', 'Category', 'Amount', 'Method', 'Date', 'Status'];
  const lines = rows.map((p) => [
    p.studentName,
    p.reference || `PAY-${p.id.slice(0, 8).toUpperCase()}`,
    p.category || '',
    String(p.amount),
    p.method,
    fmtDate(p.paidAt),
    p.status,
  ]);
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
  return [header.map(escape).join(','), ...lines.map((r) => r.map(escape).join(','))].join('\n');
};

interface FeeItemOption {
  feeId: string;
  studentId: string;
  studentName: string;
  category: string;
  balance: number;
}

export const AccountantPayments: React.FC = () => {
  const [payments, setPayments] = useState<PaymentDetailedRow[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [timeframe, setTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [page, setPage] = useState(1);

  // filters panel
  const [filterOpen, setFilterOpen] = useState(false);
  const [methodFilter, setMethodFilter] = useState('Method');
  const [statusFilter, setStatusFilter] = useState('Status');

  // Record payment modal states
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [feeOptions, setFeeOptions] = useState<FeeItemOption[]>([]);
  const [selectedFeeId, setSelectedFeeId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'Cash' | 'Mobile Money' | 'Bank Transfer' | 'Card'>('Mobile Money');
  const [payReference, setPayReference] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [recording, setRecording] = useState(false);

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
      const [p, s] = await Promise.all([getPaymentsDetailed(), getPaymentStats()]);
      setPayments(p);
      setStats(s);
    } catch (err: any) {
      setError(err?.message || 'Could not load payments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openPaymentModal = async () => {
    try {
      // Fetch unpaid or partially paid student fee ledgers for selection
      const { data, error: err } = await supabase
        .from('fees')
        .select(`
          id,
          student_id,
          category,
          balance,
          students (
            first_name,
            last_name,
            custom_id
          )
        `)
        .gt('balance', 0);

      if (err) throw err;

      const options: FeeItemOption[] = (data || []).map((f: any) => ({
        feeId: f.id,
        studentId: f.student_id,
        studentName: f.students ? `${f.students.first_name} ${f.students.last_name} (${f.students.custom_id})` : 'Unknown',
        category: f.category || 'General Fee',
        balance: Number(f.balance || 0),
      }));

      setFeeOptions(options);
      if (options.length > 0) setSelectedFeeId(options[0].feeId);
      setPayAmount('');
      setPayReference('');
      setPayNotes('');
      setPayModalOpen(true);
    } catch (e: any) {
      alert(`Could not load fee accounts for payment: ${e.message}`);
    }
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeeId || !payAmount) {
      alert('Please select a student fee and enter an amount.');
      return;
    }
    const amt = parseFloat(payAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    const currentFee = feeOptions.find((f) => f.feeId === selectedFeeId);
    if (currentFee && amt > currentFee.balance) {
      alert(`Amount exceeds remaining balance (${fmtMoney(currentFee.balance)}).`);
      return;
    }

    setRecording(true);
    try {
      await recordPaymentTransaction({
        feeId: selectedFeeId,
        studentId: currentFee?.studentId || '',
        amount: amt,
        method: payMethod,
        reference: payReference || null,
        notes: payNotes || null,
      });

      setPayModalOpen(false);
      alert('Payment recorded successfully!');
      await load();
    } catch (err: any) {
      alert(`Failed to record payment: ${err.message}`);
    } finally {
      setRecording(false);
    }
  };

  // Trend data
  const trendData = useMemo(() => bucketPayments(payments, timeframe), [payments, timeframe]);

  // Payment methods count
  const methodCounts = useMemo(() => {
    const c = { 'Mobile Money': 0, 'Bank Transfer': 0, Cash: 0, Card: 0 } as Record<string, number>;
    for (const p of payments) {
      if (p.status !== 'Completed') continue;
      if (p.method in c) c[p.method] += 1;
    }
    return c;
  }, [payments]);

  const methodDonut = useMemo(
    () => [
      { name: 'Mobile Money', value: methodCounts['Mobile Money'], color: '#0f172a' },
      { name: 'Bank Transfer', value: methodCounts['Bank Transfer'], color: '#3b82f6' },
      { name: 'Cash', value: methodCounts.Cash, color: '#64748b' },
      { name: 'Card', value: methodCounts.Card, color: '#cbd5e1' },
    ].filter((d) => d.value > 0),
    [methodCounts]
  );

  const donutTotal = methodDonut.reduce((a, d) => a + d.value, 0);

  // KPI values
  const totalAmount = useMemo(
    () => payments.filter((p) => p.status === 'Completed').reduce((a, p) => a + p.amount, 0),
    [payments]
  );
  const totalTransactions = payments.filter((p) => p.status === 'Completed').length;

  const todayCollections = stats?.today ?? 0;
  const todayCount = useMemo(() => {
    const today = new Date().toDateString();
    return payments.filter((p) => {
      if (p.status !== 'Completed') return false;
      const d = new Date(p.paidAt);
      return !Number.isNaN(d.getTime()) && d.toDateString() === today;
    }).length;
  }, [payments]);

  const pendingCount = payments.filter(
    (p) => p.status === 'Pending' || p.status === 'Verification Required'
  ).length;

  const refundedAmount = 0;
  const refundedCount = 0;

  // Filtered table data
  const filtered = useMemo(() => {
    return payments
      .filter((p) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          p.studentName.toLowerCase().includes(q) ||
          (p.reference || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          p.method.toLowerCase().includes(q)
        );
      })
      .filter((p) => methodFilter === 'Method' || p.method === methodFilter)
      .filter((p) => statusFilter === 'Status' || p.status === statusFilter);
  }, [payments, searchTerm, methodFilter, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, methodFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageNumbers = getPageNumbers(page, totalPages);

  const handleExport = () => {
    const csv = buildCsv(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => window.print();

  const clearFilters = () => {
    setSearchTerm('');
    setMethodFilter('Method');
    setStatusFilter('Status');
  };

  return (
    <AccountantLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

        {/* PAGE TITLE & RECORD PAYMENT BUTTON */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
              Payments
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              View and manage all fee payments received by the school
            </p>
          </div>
          <button
            onClick={openPaymentModal}
            style={{ padding: '10px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#002b49', color: '#ffffff', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
          >
            + Record Payment
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* 4 TOP SUMMARY METRIC CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Total Payments</span>
              <span style={{ backgroundColor: '#f1f5f9', color: '#0f172a', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
              {loading ? '-' : fmtMoney(totalAmount)}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>{totalTransactions} transactions</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Today's Collections</span>
              <span style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
              {loading ? '-' : fmtMoney(todayCollections)}
            </div>
            <span style={{ fontSize: '11px', color: '#166534', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>{todayCount} payments</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Pending Verification</span>
              <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
              {loading ? '-' : `${pendingCount} Payments`}
            </div>
            <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>Require review</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Refunded</span>
              <span style={{ backgroundColor: '#f0f9ff', color: '#0284c7', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
              {loading ? '-' : fmtMoney(refundedAmount)}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>{refundedCount} transactions</span>
          </div>

        </div>

        {/* CHARTS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '20px', alignItems: 'start', marginBottom: '24px' }}>

          <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', height: '100%', minHeight: '380px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Payment Collection Overview</h3>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Track incoming collections over time</span>
              </div>

              <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '2px' }}>
                {(['Daily', 'Weekly', 'Monthly'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTimeframe(tab)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: timeframe === tab ? '#ffffff' : 'transparent',
                      color: timeframe === tab ? '#0f172a' : '#64748b',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: timeframe === tab ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ width: '100%', height: '260px', flex: 1 }}>
              {loading ? (
                <div style={{ fontSize: '12px', color: '#64748b' }}>Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f172a" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px', border: 'none' }}
                      formatter={(v: any) => fmtMoney(Number(v ?? 0))}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#0f172a" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div style={{ ...cardStyle, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', minHeight: '380px' }}>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Payment Methods</h3>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Distribution by channel</span>
            </div>

            <div style={{ width: '100%', height: '190px', position: 'relative' }}>
              {loading || donutTotal === 0 ? (
                <div style={{ paddingTop: '70px', fontSize: '12px', color: '#64748b' }}>No payments yet.</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px', border: 'none' }} />
                      <Pie
                        data={methodDonut}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {methodDonut.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>{donutTotal}</div>
                    <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Total</span>
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px', fontWeight: 'bold', color: '#334155', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', backgroundColor: '#0f172a', borderRadius: '50%' }} /> Mobile Money ({methodCounts['Mobile Money']})</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%' }} /> Bank Transfer ({methodCounts['Bank Transfer']})</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', backgroundColor: '#64748b', borderRadius: '50%' }} /> Cash ({methodCounts.Cash})</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', backgroundColor: '#cbd5e1', borderRadius: '50%' }} /> Card ({methodCounts.Card})</div>
            </div>
          </div>

        </div>

        {/* TRANSACTIONS TABLE */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>

          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', width: '280px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', background: 'none', outline: 'none', fontSize: '12px', width: '100%', color: '#0f172a' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => setFilterOpen((v) => !v)}
                style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: filterOpen ? '#f0f9ff' : '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Filter
              </button>

              <button
                onClick={handleExport}
                style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export
              </button>

              <button
                onClick={handlePrint}
                style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155', display: 'flex', alignItems: 'center' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              </button>
            </div>
          </div>

          {filterOpen && (
            <div style={{ padding: '12px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}
              >
                <option value="Method">Method</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}
              >
                <option value="Status">Status</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Verification Required">Verification Required</option>
              </select>

              <button
                onClick={clearFilters}
                style={{ border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#64748b', cursor: 'pointer' }}
              >
                Clear
              </button>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                  <th style={{ padding: '12px 20px' }}>STUDENT</th>
                  <th style={{ padding: '12px 20px' }}>TRANSACTION ID</th>
                  <th style={{ padding: '12px 20px' }}>FEE CATEGORY</th>
                  <th style={{ padding: '12px 20px' }}>AMOUNT</th>
                  <th style={{ padding: '12px 20px' }}>METHOD</th>
                  <th style={{ padding: '12px 20px' }}>DATE</th>
                  <th style={{ padding: '12px 20px' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Loading...</td>
                  </tr>
                )}
                {!loading && paginated.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                      No payments match your filters.
                    </td>
                  </tr>
                )}
                {!loading && paginated.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#002b49', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', flexShrink: 0 }}>
                          {item.studentInitials}
                        </div>
                        <strong style={{ color: '#0f172a' }}>{item.studentName}</strong>
                      </div>
                    </td>
                    <td style={{ padding: '12px 20px', color: '#334155', fontWeight: 'bold' }}>
                      {item.reference || `PAY-${item.id.slice(0, 8).toUpperCase()}`}
                    </td>
                    <td style={{ padding: '12px 20px', color: '#334155' }}>{item.category || '-'}</td>
                    <td style={{ padding: '12px 20px', color: '#0f172a', fontWeight: 'bold' }}>{fmtMoney(item.amount)}</td>
                    <td style={{ padding: '12px 20px', color: '#334155' }}>{item.method}</td>
                    <td style={{ padding: '12px 20px', color: '#64748b' }}>{fmtDate(item.paidAt)}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{
                        backgroundColor: item.status === 'Completed' ? '#dcfce7' : item.status === 'Pending' ? '#fef3c7' : '#fee2e2',
                        color: item.status === 'Completed' ? '#166534' : item.status === 'Pending' ? '#b45309' : '#991b1b',
                        padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold'
                      }}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              Showing <strong>{filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)}</strong> of <strong>{filtered.length}</strong> results
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

        {/* RECORD PAYMENT MODAL */}
        {payModalOpen && (
          <div style={overlayStyle} onClick={() => !recording && setPayModalOpen(false)}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '480px', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Record Payment</h3>
                <button onClick={() => !recording && setPayModalOpen(false)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <form onSubmit={handleRecordPaymentSubmit}>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Select Student Fee *</label>
                    <select
                      required
                      value={selectedFeeId}
                      onChange={(e) => setSelectedFeeId(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                    >
                      {feeOptions.length === 0 ? (
                        <option value="">No outstanding student fees found</option>
                      ) : (
                        feeOptions.map((opt) => (
                          <option key={opt.feeId} value={opt.feeId}>
                            {opt.studentName} — {opt.category} (Bal: {fmtMoney(opt.balance)})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Amount (GHS) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        placeholder="0.00"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Method *</label>
                      <select
                        value={payMethod}
                        onChange={(e) => setPayMethod(e.target.value as any)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                      >
                        <option value="Mobile Money">Mobile Money</option>
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Card">Card</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Reference (optional)</label>
                    <input
                      type="text"
                      value={payReference}
                      onChange={(e) => setPayReference(e.target.value)}
                      placeholder="e.g. MoMo transaction ID"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Notes</label>
                    <textarea
                      rows={2}
                      value={payNotes}
                      onChange={(e) => setPayNotes(e.target.value)}
                      placeholder="Optional notes..."
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }}
                    />
                  </div>
                </div>

                <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => !recording && setPayModalOpen(false)}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={recording || feeOptions.length === 0}
                    style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: recording ? 'wait' : 'pointer', opacity: recording ? 0.7 : 1 }}
                  >
                    {recording ? 'Recording...' : 'Record Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AccountantLayout>
  );
};
