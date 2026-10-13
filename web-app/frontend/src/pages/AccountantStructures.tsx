import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AccountantLayout } from '../components/AccountantLayout';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  getFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  archiveFeeStructure,
  deleteFeeStructure,
  getClassesForAssign,
  getActiveTerm,
  getMyStudents,
} from '../services/teacherService';
import type { FeeStructure, AcademicTerm } from '../services/teacherService';

const fmtMoney = (n: number): string =>
  `GHS ${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

type OverviewTab = 'Current Term' | 'Previous Term' | 'Academic Year';

interface GroupedStructure {
  key: string;
  year: string;
  term: string;
  classId: string | null;
  className: string;
  numberOfFeeItems: number;
  totalAmount: number;
  studentsAssigned: number;
  status: 'Draft' | 'Active' | 'Archived';
  rows: FeeStructure[];
}

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

export const AccountantStructures: React.FC = () => {
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [studentCounts, setStudentCounts] = useState<Map<string, number>>(new Map());
  const [term, setTerm] = useState<AcademicTerm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [overviewTab, setOverviewTab] = useState<OverviewTab>('Current Term');
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('All');
  const [termFilter, setTermFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);

  // Create / Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formYear, setFormYear] = useState('');
  const [formTerm, setFormTerm] = useState('');
  const [formClassId, setFormClassId] = useState('');
  const [formCategory, setFormCategory] = useState('School Fees');
  const [formAmount, setFormAmount] = useState('');
  const [formStatus, setFormStatus] = useState<'Draft' | 'Active' | 'Archived'>('Draft');
  const [formNotes, setFormNotes] = useState('');
  const [saving, setSaving] = useState(false);

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
      const [list, cls, t] = await Promise.all([
        getFeeStructures(),
        getClassesForAssign(),
        getActiveTerm().catch(() => null),
      ]);
      setStructures(list);
      setClasses(cls);
      setTerm(t);

      // Preload student counts per class
      const counts = new Map<string, number>();
      await Promise.all(
        cls.map(async (c) => {
          try {
            const students = await getMyStudents(c.id);
            counts.set(c.id, students.length);
          } catch {
            counts.set(c.id, 0);
          }
        })
      );
      setStudentCounts(counts);

      if (t && !formYear) {
        setFormYear(t.academicYear);
        setFormTerm(t.termName);
      }
    } catch (err: any) {
      setError(err?.message || 'Could not load fee structures.');
    } finally {
      setLoading(false);
    }
  }, [formYear]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Group rows by (year, term, class_id)
  const grouped: GroupedStructure[] = useMemo(() => {
    const map = new Map<string, GroupedStructure>();
    for (const s of structures) {
      const key = `${s.academicYear}|${s.term}|${s.classId ?? 'none'}`;
      const existing = map.get(key);
      if (existing) {
        existing.numberOfFeeItems += 1;
        existing.totalAmount += s.amount;
        existing.rows.push(s);
        // status priority: Active > Draft > Archived
        if (s.status === 'Active') {
          existing.status = 'Active';
        } else if (s.status === 'Draft' && existing.status === 'Archived') {
          existing.status = 'Draft';
        }
      } else {
        map.set(key, {
          key,
          year: s.academicYear,
          term: s.term,
          classId: s.classId,
          className: s.className,
          numberOfFeeItems: 1,
          totalAmount: s.amount,
          studentsAssigned: s.classId ? studentCounts.get(s.classId) || 0 : 0,
          status: s.status,
          rows: [s],
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => {
      if (a.year !== b.year) return b.year.localeCompare(a.year);
      if (a.term !== b.term) return a.term.localeCompare(b.term);
      return a.className.localeCompare(b.className);
    });
  }, [structures, studentCounts]);

  // KPIs
  const activeCount = grouped.filter((g) => g.status === 'Active').length;
  const classesWithFees = new Set(grouped.map((g) => g.classId).filter(Boolean)).size;
  const totalCategories = new Set(structures.map((s) => s.category)).size;
  const averageTermFee =
    grouped.length > 0 ? Math.round(grouped.reduce((a, g) => a + g.totalAmount, 0) / grouped.length) : 0;

  // Available filter values
  const yearOptions = Array.from(new Set(structures.map((s) => s.academicYear))).sort();
  const termOptions = Array.from(new Set(structures.map((s) => s.term))).sort();

  // Filtered for the table
  const filtered = useMemo(() => {
    return grouped
      .filter((g) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          g.className.toLowerCase().includes(q) ||
          g.year.toLowerCase().includes(q) ||
          g.term.toLowerCase().includes(q)
        );
      })
      .filter((g) => yearFilter === 'All' || g.year === yearFilter)
      .filter((g) => termFilter === 'All' || g.term === termFilter)
      .filter((g) => classFilter === 'All' || g.classId === classFilter)
      .filter((g) => statusFilter === 'All' || g.status === statusFilter);
  }, [grouped, searchTerm, yearFilter, termFilter, classFilter, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, yearFilter, termFilter, classFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageNumbers = getPageNumbers(page, totalPages);

  // Overview chart data (from active filter)
  const chartData = useMemo(() => {
    let rows = grouped;
    if (overviewTab === 'Current Term' && term) {
      rows = grouped.filter((g) => g.term === term.termName && g.year === term.academicYear);
    } else if (overviewTab === 'Previous Term' && term) {
      rows = grouped.filter((g) => g.year !== term.academicYear || g.term !== term.termName);
    }
    // Academic Year: all rows
    return rows.map((g) => ({ class: g.className, amount: g.totalAmount }));
  }, [grouped, overviewTab, term]);

  const openCreate = () => {
    setEditingId(null);
    setFormYear(term?.academicYear || new Date().getFullYear().toString());
    setFormTerm(term?.termName || 'Second Term');
    setFormClassId(classes[0]?.id || '');
    setFormCategory('School Fees');
    setFormAmount('');
    setFormStatus('Draft');
    setFormNotes('');
    setModalOpen(true);
  };

  const openEdit = (g: GroupedStructure) => {
    // Edit uses the first row's values as defaults; saving updates just that one row
    const first = g.rows[0];
    setEditingId(first.id);
    setFormYear(first.academicYear);
    setFormTerm(first.term);
    setFormClassId(first.classId || '');
    setFormCategory(first.category);
    setFormAmount(String(first.amount));
    setFormStatus(first.status);
    setFormNotes(first.notes || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formYear.trim() || !formTerm.trim() || !formCategory.trim() || !formAmount) {
      alert('Year, term, category, and amount are required.');
      return;
    }
    const amount = Number(formAmount);
    if (!Number.isFinite(amount) || amount < 0) {
      alert('Amount must be a valid non-negative number.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateFeeStructure(editingId, {
          academicYear: formYear,
          term: formTerm,
          classId: formClassId || null,
          category: formCategory,
          amount,
          notes: formNotes || null,
          status: formStatus,
        });
      } else {
        await createFeeStructure({
          academicYear: formYear,
          term: formTerm,
          classId: formClassId || null,
          category: formCategory,
          amount,
          notes: formNotes || null,
        });
        // Note: createFeeStructure sets status='Active'; we want Draft here.
        // To respect the form's status, we need to update after create.
        // Simplification: for now new structures are always Draft â€” the
        // service sets 'Active', so we flip it back if the form says Draft.
        if (formStatus !== 'Active') {
          // Reload and flip the most recent entry (small hack until the service
          // accepts status as a param)
          const refreshed = await getFeeStructures();
          const match = refreshed.find(
            (s) =>
              s.academicYear === formYear &&
              s.term === formTerm &&
              s.classId === (formClassId || null) &&
              s.category === formCategory
          );
          if (match) await updateFeeStructure(match.id, { status: formStatus });
        }
      }
      setModalOpen(false);
      await load();
    } catch (err: any) {
      alert(err?.message || 'Could not save fee structure.');
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveGroup = async (g: GroupedStructure) => {
    if (!confirm(`Archive all ${g.numberOfFeeItems} item(s) for ${g.className} â€” ${g.term}?`)) return;
    try {
      await Promise.all(g.rows.map((r) => archiveFeeStructure(r.id)));
      await load();
    } catch (err: any) {
      alert(err?.message || 'Could not archive.');
    }
  };

  const handleDeleteGroup = async (g: GroupedStructure) => {
    if (!confirm(`Delete all ${g.numberOfFeeItems} item(s) for ${g.className} â€” ${g.term}? This cannot be undone.`)) return;
    try {
      await Promise.all(g.rows.map((r) => deleteFeeStructure(r.id)));
      await load();
    } catch (err: any) {
      alert(err?.message || 'Could not delete.');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setYearFilter('All');
    setTermFilter('All');
    setClassFilter('All');
    setStatusFilter('All');
  };

  const statusStyle = (s: 'Draft' | 'Active' | 'Archived') => {
    switch (s) {
      case 'Active': return { bg: '#dcfce7', color: '#166534' };
      case 'Draft': return { bg: '#f1f5f9', color: '#475569' };
      case 'Archived': return { bg: '#fef3c7', color: '#92400e' };
    }
  };

  return (
    <AccountantLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
              Fee Structures
            </h1>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Define and manage the fees students are expected to pay by class and term.</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select
              value={yearFilter === 'All' ? (term?.academicYear || '') : yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}
            >
              <option value="All">All Years</option>
              {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
              {term && !yearOptions.includes(term.academicYear) && <option value={term.academicYear}>{term.academicYear}</option>}
            </select>
            <select
              value={termFilter === 'All' ? (term?.termName || '') : termFilter}
              onChange={(e) => setTermFilter(e.target.value)}
              style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}
            >
              <option value="All">All Terms</option>
              {termOptions.map((t) => <option key={t} value={t}>{t}</option>)}
              {term && !termOptions.includes(term.termName) && <option value={term.termName}>{term.termName}</option>}
            </select>
            <button
              onClick={openCreate}
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', color: '#ffffff', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create Fee Structure
            </button>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>

          <div style={cardStyle}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Active Fee Structures</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>{loading ? '-' : activeCount}</div>
            <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', display: 'inline-block', marginTop: '8px' }}>
              Across all classes
            </span>
          </div>

          <div style={cardStyle}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Classes With Fees Assigned</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>{loading ? '-' : classesWithFees}</div>
            <span style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', display: 'inline-block', marginTop: '8px' }}>
              Currently configured
            </span>
          </div>

          <div style={cardStyle}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Total Fee Categories</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>{loading ? '-' : totalCategories}</div>
            <span style={{ backgroundColor: '#fdf4ff', color: '#86198f', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', display: 'inline-block', marginTop: '8px' }}>
              Active categories
            </span>
          </div>

          <div style={cardStyle}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Average Term Fee</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>{loading ? '-' : fmtMoney(averageTermFee)}</div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>Across configured classes</span>
          </div>

        </div>

        {/* OVERVIEW + CHART */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(0, 2fr)', gap: '20px', alignItems: 'stretch', marginBottom: '24px' }}>

          <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Fee Structure Overview</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                View the expected total fees assigned to each class for the selected period.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(['Current Term', 'Previous Term', 'Academic Year'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setOverviewTab(tab)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    textAlign: 'left',
                    backgroundColor: overviewTab === tab ? '#eff6ff' : '#f8fafc',
                    color: overviewTab === tab ? '#1d4ed8' : '#334155',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    borderLeft: overviewTab === tab ? '4px solid #1d4ed8' : '4px solid transparent'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', minHeight: '320px' }}>
            <div style={{ width: '100%', height: '260px', flex: 1 }}>
              {loading ? (
                <div style={{ fontSize: '12px', color: '#64748b' }}>Loading...</div>
              ) : chartData.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#64748b', paddingTop: '60px', textAlign: 'center' }}>
                  No fee structures for this period.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="class" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px', border: 'none' }}
                      formatter={(v: any) => fmtMoney(Number(v ?? 0))}
                    />
                    <Bar dataKey="amount" fill="#002b49" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>

        {/* FILTER BAR */}
        <div style={{ ...cardStyle, marginBottom: '20px', padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', width: '280px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                placeholder="Search fee structures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', background: 'none', outline: 'none', fontSize: '12px', width: '100%', color: '#0f172a' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>
                <option value="All">Academic Year (All)</option>
                {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <select value={termFilter} onChange={(e) => setTermFilter(e.target.value)} style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>
                <option value="All">Term (All)</option>
                {termOptions.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>
                <option value="All">Class (All)</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>
                <option value="All">Status (All)</option>
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>
              <button onClick={clearFilters} style={{ border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#64748b', cursor: 'pointer' }}>
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Fee Structures</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '850px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: '800' }}>
                  <th style={{ padding: '12px 20px' }}>FEE STRUCTURE</th>
                  <th style={{ padding: '12px 20px' }}>ACADEMIC YEAR</th>
                  <th style={{ padding: '12px 20px' }}>TERM</th>
                  <th style={{ padding: '12px 20px' }}>CLASS</th>
                  <th style={{ padding: '12px 20px' }}>NUMBER OF FEE ITEMS</th>
                  <th style={{ padding: '12px 20px' }}>TOTAL AMOUNT</th>
                  <th style={{ padding: '12px 20px' }}>STUDENTS ASSIGNED</th>
                  <th style={{ padding: '12px 20px' }}>STATUS</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Loading...</td></tr>
                )}
                {!loading && paginated.length === 0 && (
                  <tr><td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    {structures.length === 0
                      ? 'No fee structures yet. Click Create Fee Structure to add one.'
                      : 'No fee structures match your filters.'}
                  </td></tr>
                )}
                {!loading && paginated.map((g) => {
                  const st = statusStyle(g.status);
                  return (
                    <tr key={g.key} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 20px', fontWeight: 'bold', color: '#002b49' }}>
                        {g.className} - {g.term}
                      </td>
                      <td style={{ padding: '12px 20px', color: '#334155' }}>{g.year}</td>
                      <td style={{ padding: '12px 20px', color: '#334155' }}>{g.term}</td>
                      <td style={{ padding: '12px 20px', color: '#334155', fontWeight: 'bold' }}>{g.className}</td>
                      <td style={{ padding: '12px 20px', color: '#334155', textAlign: 'center' }}>{g.numberOfFeeItems}</td>
                      <td style={{ padding: '12px 20px', fontWeight: 'bold', color: '#0f172a' }}>{fmtMoney(g.totalAmount)}</td>
                      <td style={{ padding: '12px 20px', color: '#334155', textAlign: 'center' }}>{g.studentsAssigned}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ backgroundColor: st.bg, color: st.color, padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>
                          {g.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                          <button
                            title="Edit first item"
                            onClick={() => openEdit(g)}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#002b49', padding: '4px' }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button
                            title="Archive all"
                            onClick={() => void handleArchiveGroup(g)}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#b45309', padding: '4px' }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                          </button>
                          <button
                            title="Delete all"
                            onClick={() => void handleDeleteGroup(g)}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626', padding: '4px' }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
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

        {/* CREATE/EDIT MODAL */}
        {modalOpen && (
          <div style={overlayStyle} onClick={() => !saving && setModalOpen(false)}>
            <div
              style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '520px', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                  {editingId ? 'Edit Fee Item' : 'Create Fee Structure'}
                </h3>
                <button onClick={() => !saving && setModalOpen(false)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>X</button>
              </div>

              <form onSubmit={handleSave}>
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Academic Year *</label>
                      <input
                        type="text"
                        required
                        value={formYear}
                        onChange={(e) => setFormYear(e.target.value)}
                        placeholder="2025/2026"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Term *</label>
                      <input
                        type="text"
                        required
                        value={formTerm}
                        onChange={(e) => setFormTerm(e.target.value)}
                        placeholder="Second Term"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Class</label>
                    <select
                      value={formClassId}
                      onChange={(e) => setFormClassId(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                    >
                      <option value="">All Classes (global)</option>
                      {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Category *</label>
                      <input
                        type="text"
                        required
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        placeholder="School Fees"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Amount (GHS) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formAmount}
                        onChange={(e) => setFormAmount(e.target.value)}
                        placeholder="1500"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  {editingId && (
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Status</label>
                      <select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as any)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Active">Active</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', display: 'block', marginBottom: '4px' }}>Notes</label>
                    <textarea
                      rows={2}
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ marginTop: '10px', fontSize: '11px', color: '#64748b' }}>
                    Note: create one entry per fee category (e.g. Tuition, PTA, Bus). The table groups all categories for the same class, term, and year.
                  </div>
                </div>

                <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => !saving && setModalOpen(false)}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1 }}
                  >
                    {saving ? 'Saving...' : (editingId ? 'Save Changes' : 'Create')}
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
