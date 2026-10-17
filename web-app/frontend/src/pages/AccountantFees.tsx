import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AccountantLayout } from '../components/AccountantLayout';
import { supabase } from '../services/supabase';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  getAllFeeRecords,
  getFeeStats,
  getFeeTrend,
  getClassOutstanding,
  recordPayment,
  getPaymentsForFee,
} from '../services/teacherService';
import type {
  FeeRecord,
  FeeStats,
  FeeTrendPoint,
  ClassOutstanding,
  PaymentRow,
} from '../services/teacherService';

interface FeeStructureRecord {
  id: string;
  academic_year: string;
  term: string;
  category: string;
  amount: number;
  notes?: string;
  status: string;
  created_at: string;
}

const fmtMoney = (n: number): string => {
  return `GHS ${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

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

export const AccountantFees: React.FC = () => {
  const [records, setRecords] = useState<FeeRecord[]>([]);
  const [stats, setStats] = useState<FeeStats | null>(null);
  const [trend, setTrend] = useState<FeeTrendPoint[]>([]);
  const [classOut, setClassOut] = useState<ClassOutstanding[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructureRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab view: 'records' | 'structures'
  const [activeTab, setActiveTab] = useState<'records' | 'structures'>('records');

  // filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('Class');
  const [selectedStatus, setSelectedStatus] = useState('Status');
  const [page, setPage] = useState(1);

  // More Filters panel
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Category');
  const [overdueOnly, setOverdueOnly] = useState(false);

  // Record Payment modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payRecord, setPayRecord] = useState<FeeRecord | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'Mobile Money' | 'Bank Transfer' | 'Cash' | 'Card'>('Cash');
  const [payReference, setPayReference] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [paying, setPaying] = useState(false);

  // View Details modal
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsRecord, setDetailsRecord] = useState<FeeRecord | null>(null);
  const [detailsPayments, setDetailsPayments] = useState<PaymentRow[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Create Master Structure Modal
  const [structureModalOpen, setStructureModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newTerm, setNewTerm] = useState('Term 1');
  const [newYear, setNewYear] = useState('2026/2027');
  const [newNotes, setNewNotes] = useState('');
  const [savingStructure, setSavingStructure] = useState(false);

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
      const [r, s, t, c, structRes] = await Promise.all([
        getAllFeeRecords(),
        getFeeStats(),
        getFeeTrend(),
        getClassOutstanding(),
        supabase.from('fee_structures').select('*').order('created_at', { ascending: false }),
      ]);
      setRecords(r);
      setStats(s);
      setTrend(t);
      setClassOut(c);
      if (structRes.data) {
        setFeeStructures(structRes.data as FeeStructureRecord[]);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage || 'Could not load fee data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const categoryOptions = useMemo(
    () => Array.from(new Set(records.map((r) => r.category).filter(Boolean))).sort(),
    [records]
  );

  const classOptions = useMemo(
    () => Array.from(new Set(records.map((r) => r.className).filter((c) => c && c !== '-'))).sort(),
    [records]
  );

  const filtered = useMemo(() => {
    return records
      .filter((r) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          r.studentName.toLowerCase().includes(q) ||
          r.studentCustomId.toLowerCase().includes(q)
        );
      })
      .filter((r) => selectedClass === 'Class' || r.className === selectedClass)
      .filter((r) => selectedStatus === 'Status' || r.status === selectedStatus)
      .filter((r) => selectedCategory === 'Category' || r.category === selectedCategory)
      .filter((r) => !overdueOnly || r.status === 'Overdue');
  }, [records, searchTerm, selectedClass, selectedStatus, selectedCategory, overdueOnly]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedClass, selectedStatus, selectedCategory, overdueOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageNumbers = getPageNumbers(page, totalPages);

  const donutData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Paid', value: stats.byStatus.Paid, color: '#10b981' },
      { name: 'Partial', value: stats.byStatus['Partially Paid'], color: '#3b82f6' },
      { name: 'Outstanding', value: stats.byStatus.Outstanding, color: '#f59e0b' },
      { name: 'Overdue', value: stats.byStatus.Overdue, color: '#ef4444' },
    ].filter((d) => d.value > 0);
  }, [stats]);

  const donutTotal = donutData.reduce((a, d) => a + d.value, 0);

  const collectionPct =
    stats && stats.totalExpected > 0
      ? Math.round((stats.totalCollected / stats.totalExpected) * 100)
      : 0;

  const openPayment = (record: FeeRecord) => {
    setPayRecord(record);
    setPayAmount('');
    setPayMethod('Cash');
    setPayReference('');
    setPayNotes('');
    setPayModalOpen(true);
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

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payRecord) return;
    const amount = Number(payAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Enter a valid amount.');
      return;
    }
    setPaying(true);
    try {
      await recordPayment({
        feeId: payRecord.id,
        studentId: payRecord.studentId,
        amount,
        method: payMethod,
        reference: payReference || null,
        notes: payNotes || null,
      });
      setPayModalOpen(false);
      await load();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert(errorMessage || 'Could not record payment.');
    } finally {
      setPaying(false);
    }
  };

  const handleCreateStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim() || !newAmount) {
      alert('Please fill in category and amount.');
      return;
    }
    const amt = parseFloat(newAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Enter a valid amount.');
      return;
    }

    setSavingStructure(true);
    try {
      // 1. Insert master fee structure
      const { error: insErr } = await supabase.from('fee_structures').insert([
        {
          category: newCategory.trim(),
          amount: amt,
          term: newTerm,
          academic_year: newYear,
          notes: newNotes.trim() || null,
          status: 'Active',
        },
      ]);
      if (insErr) throw insErr;

      // 2. Automatically populate fee ledgers for all existing students in the `fees` table
      const { data: studentsList, error: studErr } = await supabase.from('students').select('id');
      if (studErr) throw studErr;

      if (studentsList && studentsList.length > 0) {
       const feeRowsToInsert = studentsList.map((student) => ({
  student_id: student.id,
  total_fees: amt,
  amount_paid: 0,
  balance: amt,
  status: 'Outstanding',
  term: newTerm,
  category: newCategory.trim(), // e.g., 'ICT Levy' keeps it separate from 'Tuition'
  invoice_number: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
  invoice_status: 'Generated',
}));

await supabase.from('fees').insert(feeRowsToInsert);

        const { error: batchErr } = await supabase.from('fees').insert(feeRowsToInsert);
        if (batchErr) {
          console.error('Error auto-allocating student fees:', batchErr);
        }
      }

      alert('Master fee structure created and assigned to student ledgers successfully!');
      setStructureModalOpen(false);
      setNewCategory('');
      setNewAmount('');
      setNewNotes('');
      await load();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert(`Failed to save fee structure: ${errorMessage}`);
    } finally {
      setSavingStructure(false);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedClass('Class');
    setSelectedStatus('Status');
    setSelectedCategory('Category');
    setOverdueOnly(false);
  };

  return (
    <AccountantLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* HEADER & TABS BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>Fee Management & Structures</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Manage master fee structures and monitor individual student ledgers.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', backgroundColor: '#e2e8f0', padding: '3px', borderRadius: '10px' }}>
              <button
                onClick={() => setActiveTab('records')}
                style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'records' ? '#ffffff' : 'transparent', color: activeTab === 'records' ? '#0f172a' : '#64748b', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: activeTab === 'records' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
              >
                Student Ledger Records
              </button>
              <button
                onClick={() => setActiveTab('structures')}
                style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === 'structures' ? '#ffffff' : 'transparent', color: activeTab === 'structures' ? '#0f172a' : '#64748b', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', boxShadow: activeTab === 'structures' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
              >
                Master Fee Structures ({feeStructures.length})
              </button>
            </div>
            {activeTab === 'structures' && (
              <button
                onClick={() => setStructureModalOpen(true)}
                style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', color: '#ffffff', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                + Add Fee Structure
              </button>
            )}
          </div>
        </div>

        {/* 4 TOP SUMMARY METRIC CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Total Expected</span>
              <span style={{ backgroundColor: '#f1f5f9', color: '#0f172a', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
              {loading || !stats ? '-' : fmtMoney(stats.totalExpected)}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>All assigned fees</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Total Collected</span>
              <span style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
              {loading || !stats ? '-' : fmtMoney(stats.totalCollected)}
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
              <div style={{ width: `${collectionPct}%`, height: '100%', backgroundColor: '#10b981' }} />
            </div>
            <span style={{ fontSize: '11px', color: '#166534', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>{collectionPct}% Collection Rate</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Total Outstanding</span>
              <span style={{ backgroundColor: '#fefce8', color: '#ca8a04', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
              {loading || !stats ? '-' : fmtMoney(stats.totalOutstanding)}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>Remaining balance</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Students W/ Balance</span>
              <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
              {loading || !stats ? '-' : <>{stats.studentsWithBalance} <span style={{ fontSize: '13px', fontWeight: 'normal', color: '#64748b' }}>Students</span></>}
            </div>
            <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>Require payment action</span>
          </div>

        </div>

        {/* TAB 1: MASTER FEE STRUCTURES VIEW */}
        {activeTab === 'structures' && (
          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Configured Master Fee Structures</h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Showing all database fee categories</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                    <th style={{ padding: '12px 20px' }}>CATEGORY / NAME</th>
                    <th style={{ padding: '12px 20px' }}>ACADEMIC YEAR & TERM</th>
                    <th style={{ padding: '12px 20px' }}>AMOUNT</th>
                    <th style={{ padding: '12px 20px' }}>NOTES / DESCRIPTION</th>
                    <th style={{ padding: '12px 20px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {feeStructures.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                        No fee structures defined yet. Click "+ Add Fee Structure" to create one.
                      </td>
                    </tr>
                  ) : (
                    feeStructures.map((struct) => (
                      <tr key={struct.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 20px', fontWeight: 'bold', color: '#0f172a' }}>{struct.category}</td>
                        <td style={{ padding: '12px 20px', color: '#334155' }}>{struct.academic_year} • {struct.term}</td>
                        <td style={{ padding: '12px 20px', fontWeight: '900', color: '#1e40af' }}>{fmtMoney(Number(struct.amount))}</td>
                        <td style={{ padding: '12px 20px', color: '#64748b' }}>{struct.notes || '—'}</td>
                        <td style={{ padding: '12px 20px' }}>
                          <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>
                            {struct.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENT RECORDS & ANALYTICS VIEW */}
        {activeTab === 'records' && (
          <>
            {/* TREND & DONUT CHARTS SECTION */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '20px', alignItems: 'start', marginBottom: '24px' }}>

              <div style={{ ...cardStyle, height: '100%', minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Fee Collection Trend</h3>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Compare expected fees with actual collections over the selected period.</span>
                  </div>
                </div>

                <div style={{ width: '100%', height: '230px', flex: 1 }}>
                  {loading ? (
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Loading...</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px', border: 'none' }}
                          formatter={(v: unknown) => fmtMoney(Number(v ?? 0))}
                        />
                        <Bar dataKey="expected" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="collected" fill="#0f172a" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '20px', fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginTop: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '2px' }} /> Expected Fees</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', backgroundColor: '#0f172a', borderRadius: '2px' }} /> Collected Fees</span>
                </div>
              </div>

              <div style={{ ...cardStyle, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', minHeight: '380px' }}>
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Payment Status Breakdown</h3>
                </div>

                <div style={{ width: '100%', height: '180px', position: 'relative' }}>
                  {loading || donutTotal === 0 ? (
                    <div style={{ paddingTop: '60px', fontSize: '12px', color: '#64748b' }}>No fee records yet.</div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px', border: 'none' }} />
                          <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                            {donutData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>{donutTotal}</div>
                        <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Total</span>
                      </div>
                    </>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px', fontWeight: 'bold', color: '#334155', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }} /> Paid ({stats?.byStatus.Paid ?? 0})</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%' }} /> Partial ({stats?.byStatus['Partially Paid'] ?? 0})</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', backgroundColor: '#f59e0b', borderRadius: '50%' }} /> Outstanding ({stats?.byStatus.Outstanding ?? 0})</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }} /> Overdue ({stats?.byStatus.Overdue ?? 0})</div>
                </div>
              </div>

            </div>

            {/* OUTSTANDING FEES BY CLASS */}
            <div style={{ ...cardStyle, marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Outstanding Fees by Class</h3>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '20px' }}>See which classes have the highest outstanding balances.</span>

              {loading ? (
                <div style={{ fontSize: '12px', color: '#64748b' }}>Loading...</div>
              ) : classOut.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#64748b' }}>No outstanding balances.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  {classOut.map((cls) => (
                    <div key={cls.className} style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>
                        <span>{cls.className}</span>
                        <span style={{ color: '#d97706' }}>{fmtMoney(cls.amount)}</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${cls.percentOfMax}%`, height: '100%', backgroundColor: '#f59e0b' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* STUDENT FEE RECORDS TABLE */}
            <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>

              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Student Fee Records</h3>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', width: '240px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input
                      type="text"
                      placeholder="Search student..."
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
                    <option value="Paid">Paid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Outstanding">Outstanding</option>
                  </select>

                  <button
                    onClick={() => setMoreFiltersOpen((v) => !v)}
                    style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: moreFiltersOpen ? '#f0f9ff' : '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                    More Filters
                  </button>

                  <button
                    onClick={clearAllFilters}
                    style={{ border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#64748b', cursor: 'pointer' }}
                  >
                    Clear
                  </button>
                </div>
              </div>

              {moreFiltersOpen && (
                <div style={{ padding: '12px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}
                  >
                    <option value="Category">Category</option>
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={overdueOnly}
                      onChange={(e) => setOverdueOnly(e.target.checked)}
                    />
                    Overdue only
                  </label>
                </div>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                      <th style={{ padding: '12px 20px' }}>STUDENT</th>
                      <th style={{ padding: '12px 20px' }}>CLASS</th>
                      <th style={{ padding: '12px 20px' }}>TOTAL FEES</th>
                      <th style={{ padding: '12px 20px' }}>AMOUNT PAID</th>
                      <th style={{ padding: '12px 20px' }}>BALANCE</th>
                      <th style={{ padding: '12px 20px' }}>STATUS</th>
                      <th style={{ padding: '12px 20px' }}>DUE DATE</th>
                      <th style={{ padding: '12px 20px', textAlign: 'right' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Loading...</td>
                      </tr>
                    )}
                    {!loading && paginated.length === 0 && (
                      <tr>
                        <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                          No fee records match your filters.
                        </td>
                      </tr>
                    )}
                    {!loading && paginated.map((record) => (
                      <tr key={record.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#002b49', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', flexShrink: 0 }}>
                              {record.studentInitials}
                            </div>
                            <div>
                              <strong style={{ color: '#0f172a', display: 'block' }}>{record.studentName}</strong>
                              <span style={{ fontSize: '10px', color: '#64748b' }}>{record.studentCustomId}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 20px', color: '#334155', fontWeight: 'bold' }}>{record.className}</td>
                        <td style={{ padding: '12px 20px', color: '#334155' }}>{fmtMoney(record.totalFees)}</td>
                        <td style={{ padding: '12px 20px', color: '#166534', fontWeight: 'bold' }}>{fmtMoney(record.amountPaid)}</td>
                        <td style={{ padding: '12px 20px', color: record.balance === 0 ? '#166534' : '#dc2626', fontWeight: 'bold' }}>{fmtMoney(record.balance)}</td>
                        <td style={{ padding: '12px 20px' }}>
                          <span style={{
                            backgroundColor: record.status === 'Paid' ? '#dcfce7' : record.status === 'Partially Paid' ? '#e0f2fe' : record.status === 'Overdue' ? '#fee2e2' : '#fef3c7',
                            color: record.status === 'Paid' ? '#166534' : record.status === 'Partially Paid' ? '#0369a1' : record.status === 'Overdue' ? '#991b1b' : '#b45309',
                            padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold'
                          }}>
                            {record.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 20px', color: record.status === 'Overdue' ? '#dc2626' : '#64748b', fontWeight: record.status === 'Overdue' ? 'bold' : 'normal' }}>{fmtDate(record.dueDate)}</td>
                        <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                            <button
                              title="View Details"
                              onClick={() => void openDetails(record)}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </button>
                            <button
                              title="Record Payment"
                              onClick={() => openPayment(record)}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#002b49', padding: '4px' }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  Showing <strong>{filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)}</strong> of <strong>{filtered.length}</strong> records
                </div>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: page <= 1 ? 'not-allowed' : 'pointer', color: '#334155', opacity: page <= 1 ? 0.5 : 1 }}
                  >
                    Previous
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
          </>
        )}

        {/* CREATE MASTER FEE STRUCTURE MODAL */}
        {structureModalOpen && (
          <div style={overlayStyle} onClick={() => !savingStructure && setStructureModalOpen(false)}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '480px', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Add Master Fee Structure</h3>
                <button onClick={() => !savingStructure && setStructureModalOpen(false)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <form onSubmit={handleCreateStructure}>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Fee Category Name *</label>
                    <input
                      type="text"
                      required
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="e.g. Tuition Fee, ICT Levy"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Amount (GHS) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        placeholder="0.00"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Term *</label>
                      <select
                        value={newTerm}
                        onChange={(e) => setNewTerm(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff' }}
                      >
                        <option value="Term 1">Term 1</option>
                        <option value="Term 2">Term 2</option>
                        <option value="Term 3">Term 3</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Academic Year *</label>
                    <input
                      type="text"
                      required
                      value={newYear}
                      onChange={(e) => setNewYear(e.target.value)}
                      placeholder="2026/2027"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Description / Notes</label>
                    <textarea
                      rows={2}
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      placeholder="Optional details..."
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => !savingStructure && setStructureModalOpen(false)}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingStructure}
                    style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: savingStructure ? 'wait' : 'pointer', opacity: savingStructure ? 0.7 : 1 }}
                  >
                    {savingStructure ? 'Saving...' : 'Save Structure'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* RECORD PAYMENT MODAL */}
        {payModalOpen && payRecord && (
          <div style={overlayStyle} onClick={() => !paying && setPayModalOpen(false)}>
            <div
              style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '520px', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Record Payment</h3>
                <button onClick={() => !paying && setPayModalOpen(false)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <form onSubmit={handleRecordPayment}>
                <div style={{ padding: '24px' }}>
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                    <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '14px' }}>{payRecord.studentName}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      {payRecord.studentCustomId} | {payRecord.className} | {payRecord.category}
                    </div>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '10px', fontSize: '12px' }}>
                      <div><span style={{ color: '#64748b' }}>Total:</span> <strong>{fmtMoney(payRecord.totalFees)}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Paid:</span> <strong style={{ color: '#166534' }}>{fmtMoney(payRecord.amountPaid)}</strong></div>
                      <div><span style={{ color: '#64748b' }}>Balance:</span> <strong style={{ color: '#dc2626' }}>{fmtMoney(payRecord.balance)}</strong></div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      placeholder={`Max ${fmtMoney(payRecord.balance)}`}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Method *</label>
                    <select
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value as 'Mobile Money' | 'Bank Transfer' | 'Cash' | 'Card')}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Mobile Money">Mobile Money</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
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
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }}
                    />
                  </div>
                </div>

                <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => !paying && setPayModalOpen(false)}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={paying}
                    style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: paying ? 'wait' : 'pointer', opacity: paying ? 0.7 : 1 }}
                  >
                    {paying ? 'Recording...' : 'Record Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW DETAILS MODAL */}
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
                <button onClick={() => setDetailsOpen(false)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '20px 24px', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Fees</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{fmtMoney(detailsRecord.totalFees)}</div>
                  </div>
                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontSize: '10px', color: '#166534', fontWeight: 'bold', textTransform: 'uppercase' }}>Amount Paid</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#166534', marginTop: '4px' }}>{fmtMoney(detailsRecord.amountPaid)}</div>
                  </div>
                  <div style={{ backgroundColor: detailsRecord.balance === 0 ? '#f0fdf4' : '#fef2f2', border: `1px solid ${detailsRecord.balance === 0 ? '#bbf7d0' : '#fecaca'}`, borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontSize: '10px', color: detailsRecord.balance === 0 ? '#166534' : '#991b1b', fontWeight: 'bold', textTransform: 'uppercase' }}>Balance</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: detailsRecord.balance === 0 ? '#166534' : '#991b1b', marginTop: '4px' }}>{fmtMoney(detailsRecord.balance)}</div>
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
                  onClick={() => {
                    setDetailsOpen(false);
                    openPayment(detailsRecord);
                  }}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}
                >
                  Record Payment
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AccountantLayout>
  );
};
