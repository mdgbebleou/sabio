import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountantLayout } from '../components/AccountantLayout';
import {
  getFeeStats,
  getPaymentStats,
  getAllFeeRecords,
  getPaymentsDetailed,
  getMyProfile,
  getActiveTerm,
} from '../services/teacherService';
import type {
  FeeStats,
  PaymentStats,
  FeeRecord,
  PaymentDetailedRow,
  MyProfile,
  AcademicTerm,
} from '../services/teacherService';

const fmtMoney = (n: number): string =>
  `GHS ${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const fmtDate = (iso: string): string => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const greeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

interface MonthlyBar {
  month: string;
  expectedPct: number;
  collectedPct: number;
  outstandingPct: number;
  expectedAmount: number;
  collectedAmount: number;
  outstandingAmount: number;
}

const buildMonthlyBars = (
  payments: PaymentDetailedRow[],
  totalExpected: number
): MonthlyBar[] => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const buckets: { month: string; key: string; collected: number; order: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      month: monthNames[d.getMonth()],
      key: `${d.getFullYear()}-${d.getMonth()}`,
      collected: 0,
      order: i,
    });
  }
  for (const p of payments) {
    if (p.status !== 'Completed') continue;
    const d = new Date(p.paidAt);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const b = buckets.find((x) => x.key === key);
    if (b) b.collected += p.amount;
  }
  const expectedPerMonth = totalExpected / 7;
  const raw = buckets.map((b) => {
    const expectedAmount = Math.max(expectedPerMonth, b.collected);
    const outstandingAmount = Math.max(0, expectedAmount - b.collected);
    return {
      month: b.month,
      expectedAmount,
      collectedAmount: b.collected,
      outstandingAmount,
    };
  });
  const maxVal = Math.max(
    1,
    ...raw.map((r) => Math.max(r.expectedAmount, r.collectedAmount, r.outstandingAmount))
  );
  return raw.map((r) => ({
    ...r,
    expectedPct: Math.round((r.expectedAmount / maxVal) * 100),
    collectedPct: Math.round((r.collectedAmount / maxVal) * 100),
    outstandingPct: Math.round((r.outstandingAmount / maxVal) * 100),
  }));
};

export const FinanceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [collectionTab, setCollectionTab] = useState<'Monthly' | 'Termly' | 'Yearly'>('Monthly');

  const [me, setMe] = useState<MyProfile | null>(null);
  const [term, setTerm] = useState<AcademicTerm | null>(null);
  const [feeStats, setFeeStats] = useState<FeeStats | null>(null);
  const [payStats, setPayStats] = useState<PaymentStats | null>(null);
  const [records, setRecords] = useState<FeeRecord[]>([]);
  const [payments, setPayments] = useState<PaymentDetailedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    boxSizing: 'border-box',
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profile, t, fs, ps, recs, pays] = await Promise.all([
        getMyProfile().catch(() => null),
        getActiveTerm().catch(() => null),
        getFeeStats(),
        getPaymentStats(),
        getAllFeeRecords(),
        getPaymentsDetailed(),
      ]);
      setMe(profile);
      setTerm(t);
      setFeeStats(fs);
      setPayStats(ps);
      setRecords(recs);
      setPayments(pays);
    } catch (err: any) {
      setError(err?.message || 'Could not load dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const monthlyBars = useMemo(
    () => buildMonthlyBars(payments, feeStats?.totalExpected ?? 0),
    [payments, feeStats]
  );

  const collectionPct =
    feeStats && feeStats.totalExpected > 0
      ? Math.round((feeStats.totalCollected / feeStats.totalExpected) * 100)
      : 0;

  const overdueCount = feeStats?.byStatus.Overdue ?? 0;
  const overdueAmount = records.filter((r) => r.status === 'Overdue').reduce((a, r) => a + r.balance, 0);

  const pendingVerificationCount = payments.filter(
    (p) => p.status === 'Pending' || p.status === 'Verification Required'
  ).length;

  const recentPayments = useMemo(() => payments.slice(0, 4), [payments]);

  const criticalOutstanding = useMemo(() => {
    return [...records]
      .filter((r) => r.balance > 0)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 3);
  }, [records]);

  const firstName = me?.firstName || me?.fullName?.split(' ')[0] || 'there';
  const termLabel = term ? `${term.academicYear} Academic Year` : 'Academic Year';
  const termName = term?.termName || 'Term';

  return (
    <AccountantLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
              {greeting()}, {firstName}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select disabled style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>
              <option>{termLabel}</option>
            </select>
            <select disabled style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>
              <option>{termName}</option>
            </select>
          </div>
        </div>

        {/* 4 TOP METRIC CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Total Fees Collected</span>
              <span style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '4px', borderRadius: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
              {loading || !feeStats ? '-' : fmtMoney(feeStats.totalCollected)}
            </div>
            <span style={{ fontSize: '11px', color: '#166534', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>
              {collectionPct}% of total expected
            </span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Outstanding Fees</span>
              <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '4px', borderRadius: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
              {loading || !feeStats ? '-' : fmtMoney(feeStats.totalOutstanding)}
            </div>
            <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', display: 'inline-block', marginTop: '6px' }}>
              {feeStats?.studentsWithBalance ?? 0} students
            </span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Payments This Month</span>
              <span style={{ backgroundColor: '#f0f9ff', color: '#0284c7', padding: '4px', borderRadius: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
              {loading || !payStats ? '-' : fmtMoney(payStats.thisMonth)}
            </div>
            <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', display: 'inline-block', marginTop: '6px' }}>
              {payments.filter((p) => {
                const d = new Date(p.paidAt);
                const now = new Date();
                return !Number.isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length} transactions
            </span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Overdue Payments</span>
              <span style={{ backgroundColor: '#fefce8', color: '#ca8a04', padding: '4px', borderRadius: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
              {loading ? '-' : fmtMoney(overdueAmount)}
            </div>
            <span style={{ backgroundColor: '#fef9c3', color: '#854d0e', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', display: 'inline-block', marginTop: '6px' }}>
              {overdueCount} students
            </span>
          </div>

        </div>

        {/* MIDDLE SECTION */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '20px', alignItems: 'start', marginBottom: '24px' }}>

          <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', height: '100%', minHeight: '430px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Fee Collection Overview</h3>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Detailed collection metrics and trends over time</span>
              </div>

              <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '2px' }}>
                {(['Monthly', 'Termly', 'Yearly'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setCollectionTab(tab)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: collectionTab === tab ? '#ffffff' : 'transparent',
                      color: collectionTab === tab ? '#0f172a' : '#64748b',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: collectionTab === tab ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', lineHeight: '1' }}>{collectionPct}%</div>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>Total Progress</span>
              </div>
              <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '20px', display: 'flex', gap: '20px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 'bold' }}>EXPECTED</span>
                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>
                    {loading || !feeStats ? '-' : fmtMoney(feeStats.totalExpected)}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 'bold' }}>COLLECTED</span>
                  <strong style={{ fontSize: '13px', color: '#166534' }}>
                    {loading || !feeStats ? '-' : fmtMoney(feeStats.totalCollected)}
                  </strong>
                </div>
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', gap: '16px', fontSize: '10px', color: '#64748b', marginBottom: '16px', fontWeight: 'bold' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '2px' }} /> Expected</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', backgroundColor: '#002b49', borderRadius: '2px' }} /> Collected</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', backgroundColor: '#fca5a5', borderRadius: '2px' }} /> Outstanding</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '200px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', gap: '12px' }}>
                {loading ? (
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Loading...</div>
                ) : (
                  monthlyBars.map((bar, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '170px', width: '100%', justifyContent: 'center' }}>
                        <div title={`Expected: ${fmtMoney(bar.expectedAmount)}`} style={{ width: '22%', height: `${bar.expectedPct}%`, backgroundColor: '#e2e8f0', borderRadius: '3px 3px 0 0' }} />
                        <div title={`Collected: ${fmtMoney(bar.collectedAmount)}`} style={{ width: '22%', height: `${bar.collectedPct}%`, backgroundColor: '#002b49', borderRadius: '3px 3px 0 0' }} />
                        <div title={`Outstanding: ${fmtMoney(bar.outstandingAmount)}`} style={{ width: '22%', height: `${bar.outstandingPct}%`, backgroundColor: '#fca5a5', borderRadius: '3px 3px 0 0' }} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>{bar.month}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  onClick={() => navigate('/accountant/payments')}
                  style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 10px', color: '#0f172a', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                  <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Record Payment</span>
                </button>
                <button
                  onClick={() => navigate('/accountant/invoices')}
                  style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 10px', color: '#0f172a', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Create Invoice</span>
                </button>
                <button
                  onClick={() => navigate('/accountant/fees')}
                  style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 10px', color: '#0f172a', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Fee Records</span>
                </button>
                <button
                  onClick={() => navigate('/accountant/reports')}
                  style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 10px', color: '#0f172a', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                  <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Financial Reports</span>
                </button>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Financial Alerts</h3>
                <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px' }}>
                  {overdueCount + pendingVerificationCount} New
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
                {overdueCount > 0 && (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#dc2626', marginTop: '2px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </span>
                    <div>
                      <strong style={{ color: '#0f172a', display: 'block' }}>Overdue Payments</strong>
                      <span style={{ color: '#64748b', fontSize: '11px' }}>{overdueCount} students have overdue balances.</span>
                    </div>
                  </div>
                )}

                {pendingVerificationCount > 0 && (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ color: '#ca8a04', marginTop: '2px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </span>
                    <div>
                      <strong style={{ color: '#0f172a', display: 'block' }}>Verification Required</strong>
                      <span style={{ color: '#64748b', fontSize: '11px' }}>{pendingVerificationCount} payments require approval.</span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#0284c7', marginTop: '2px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  </span>
                  <div>
                    <strong style={{ color: '#0f172a', display: 'block' }}>Term Collection Status</strong>
                    <span style={{ color: '#64748b', fontSize: '11px' }}>
                      You are {100 - collectionPct}% away from the {termName} collection target.
                    </span>
                  </div>
                </div>

                {overdueCount === 0 && pendingVerificationCount === 0 && (
                  <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', padding: '12px 0' }}>
                    No alerts at the moment.
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM TABLES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', alignItems: 'start' }}>

          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Recent Transactions</h3>
              <button
                onClick={() => navigate('/accountant/payments')}
                style={{ border: 'none', background: 'none', color: '#0284c7', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                View All
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '400px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                    <th style={{ padding: '12px 20px' }}>STUDENT</th>
                    <th style={{ padding: '12px 20px' }}>TYPE / ID</th>
                    <th style={{ padding: '12px 20px' }}>AMOUNT</th>
                    <th style={{ padding: '12px 20px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Loading...</td></tr>
                  )}
                  {!loading && recentPayments.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No transactions yet.</td></tr>
                  )}
                  {!loading && recentPayments.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 20px' }}>
                        <strong style={{ color: '#0f172a', display: 'block' }}>{tx.studentName}</strong>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>{tx.category || 'Fee payment'}</span>
                      </td>
                      <td style={{ padding: '12px 20px', color: '#334155' }}>
                        {tx.reference || `TRX-${tx.id.slice(0, 4).toUpperCase()}`}
                      </td>
                      <td style={{ padding: '12px 20px', fontWeight: 'bold', color: '#0f172a' }}>{fmtMoney(tx.amount)}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{
                          backgroundColor: tx.status === 'Completed' ? '#dcfce7' : tx.status === 'Pending' ? '#fef3c7' : '#fee2e2',
                          color: tx.status === 'Completed' ? '#166534' : tx.status === 'Pending' ? '#b45309' : '#991b1b',
                          padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold'
                        }}>
                          {tx.status === 'Completed' ? 'Paid' : tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Critical Outstanding</h3>
              <button
                onClick={() => navigate('/accountant/balances')}
                style={{ border: 'none', background: 'none', color: '#0284c7', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                View All
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '400px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                    <th style={{ padding: '12px 20px' }}>STUDENT</th>
                    <th style={{ padding: '12px 20px' }}>BALANCE</th>
                    <th style={{ padding: '12px 20px' }}>STATUS</th>
                    <th style={{ padding: '12px 20px', textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Loading...</td></tr>
                  )}
                  {!loading && criticalOutstanding.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No outstanding balances.</td></tr>
                  )}
                  {!loading && criticalOutstanding.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 20px' }}>
                        <strong style={{ color: '#0f172a', display: 'block' }}>{item.studentName}</strong>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>{item.className}</span>
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <strong style={{ color: '#dc2626', display: 'block' }}>{fmtMoney(item.balance)}</strong>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>Total: {fmtMoney(item.totalFees)}</span>
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{
                          backgroundColor: item.status === 'Overdue' ? '#fee2e2' : item.status === 'Partially Paid' ? '#e0f2fe' : '#f1f5f9',
                          color: item.status === 'Overdue' ? '#991b1b' : item.status === 'Partially Paid' ? '#0369a1' : '#475569',
                          padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold'
                        }}>
                          {item.status}{item.dueDate ? ` (${fmtDate(item.dueDate)})` : ''}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                        <button
                          onClick={() => navigate('/accountant/fees')}
                          style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155' }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </AccountantLayout>
  );
};