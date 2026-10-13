import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountantLayout } from '../components/AccountantLayout';
import {
  getAllFeeRecords,
  getFeeStats,
  getPaymentsForFee,
  markInvoiceSent,
} from '../services/teacherService';
import type { FeeRecord, FeeStats, PaymentRow } from '../services/teacherService';

const fmtMoney = (n: number): string =>
  `GHS ${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const fmtDate = (ymd: string | null): string => {
  if (!ymd) return '-';
  const d = new Date(`${ymd}T00:00:00`);
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

type DisplayStatus = 'Draft' | 'Sent' | 'Paid' | 'Partially Paid' | 'Overdue';

const invoiceNumberFor = (fee: FeeRecord): string => {
  if (fee.invoiceNumber) return fee.invoiceNumber;
  const year = fee.term.match(/\d{4}/)?.[0] || new Date().getFullYear().toString();
  const suffix = fee.id.replace(/-/g, '').slice(0, 6).toUpperCase();
  return `INV-${year}-${suffix}`;
};

const displayStatusFor = (fee: FeeRecord): DisplayStatus => {
  if (fee.invoiceStatus) return fee.invoiceStatus;
  switch (fee.status) {
    case 'Paid': return 'Paid';
    case 'Partially Paid': return 'Partially Paid';
    case 'Overdue': return 'Overdue';
    case 'Outstanding': return 'Sent';
    default: return 'Draft';
  }
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
  const header = ['Invoice #', 'Student', 'Student ID', 'Class', 'Fee Type', 'Amount', 'Paid', 'Balance', 'Due Date', 'Status'];
  const lines = rows.map((r) => [
    invoiceNumberFor(r),
    r.studentName,
    r.studentCustomId,
    r.className,
    r.category,
    String(r.totalFees),
    String(r.amountPaid),
    String(r.balance),
    r.dueDate || '',
    displayStatusFor(r),
  ]);
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  return [header.map(esc).join(','), ...lines.map((r) => r.map(esc).join(','))].join('\n');
};

export const AccountantInvoices: React.FC = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState<FeeRecord[]>([]);
  const [stats, setStats] = useState<FeeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [page, setPage] = useState(1);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsRecord, setDetailsRecord] = useState<FeeRecord | null>(null);
  const [detailsPayments, setDetailsPayments] = useState<PaymentRow[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [sending, setSending] = useState(false);

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
      const [recs, s] = await Promise.all([getAllFeeRecords(), getFeeStats()]);
      setRecords(recs);
      setStats(s);
    } catch (err: any) {
      setError(err?.message || 'Could not load invoices.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const totalInvoiced = stats?.totalExpected ?? 0;
  const totalInvoicedCount = records.length;

  const paidRecords = records.filter((r) => displayStatusFor(r) === 'Paid');
  const paidAmount = paidRecords.reduce((a, r) => a + r.amountPaid, 0);

  const pendingRecords = records.filter((r) => {
    const s = displayStatusFor(r);
    return s === 'Sent' || s === 'Partially Paid' || s === 'Draft';
  });
  const pendingAmount = pendingRecords.reduce((a, r) => a + r.balance, 0);

  const overdueRecords = records.filter((r) => displayStatusFor(r) === 'Overdue');
  const overdueAmount = overdueRecords.reduce((a, r) => a + r.balance, 0);

  const classOptions = useMemo(
    () => Array.from(new Set(records.map((r) => r.className).filter((c) => c && c !== '-'))).sort(),
    [records]
  );

  const filtered = useMemo(() => {
    return records
      .filter((r) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        const inv = invoiceNumberFor(r).toLowerCase();
        return (
          r.studentName.toLowerCase().includes(q) ||
          r.studentCustomId.toLowerCase().includes(q) ||
          inv.includes(q)
        );
      })
      .filter((r) => selectedClass === 'All Classes' || r.className === selectedClass)
      .filter((r) => selectedStatus === 'All Statuses' || displayStatusFor(r) === selectedStatus);
  }, [records, searchTerm, selectedClass, selectedStatus]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedClass, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageNumbers = getPageNumbers(page, totalPages);

  const handleExport = () => {
    const csv = buildCsv(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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

  const handleDownloadPdf = () => {
    alert('PDF download is not yet available. Use the browser Print dialog to save a copy.');
  };

  const handleSendReminder = async (record: FeeRecord) => {
    const current = displayStatusFor(record);
    if (current !== 'Draft' && current !== 'Sent') {
      alert(`Cannot send a reminder for an invoice that is already ${current}.`);
      return;
    }
    if (!confirm(`Send payment reminder for ${record.studentName}?\n\nInvoice: ${invoiceNumberFor(record)}\nOutstanding: ${fmtMoney(record.balance)}`)) return;
    setSending(true);
    try {
      await markInvoiceSent(record.id);
      await load();
      alert(`Reminder queued for ${record.studentName}.\n\nNote: email delivery is not configured yet. Invoice marked as Sent.`);
    } catch (err: any) {
      alert(err?.message || 'Could not mark invoice as sent.');
    } finally {
      setSending(false);
    }
  };

  const statusStyle = (status: DisplayStatus) => {
    switch (status) {
      case 'Paid': return { bg: '#dcfce7', color: '#166534' };
      case 'Partially Paid': return { bg: '#e0f2fe', color: '#0369a1' };
      case 'Overdue': return { bg: '#fee2e2', color: '#991b1b' };
      case 'Sent': return { bg: '#fef3c7', color: '#b45309' };
      case 'Draft':
      default: return { bg: '#f1f5f9', color: '#475569' };
    }
  };

  return (
    <AccountantLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
              Invoice Management
            </h1>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Generate, track, and manage student fee invoices across all terms.</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleExport}
              style={{ backgroundColor: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export Invoices
            </button>
            <button
              onClick={() => navigate('/accountant/fees')}
              style={{ backgroundColor: '#002b49', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create New Invoice
            </button>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Total Invoiced</span>
              <span style={{ backgroundColor: '#f1f5f9', color: '#0f172a', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '8px' }}>
              {loading ? '-' : fmtMoney(totalInvoiced)}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>{totalInvoicedCount} total invoices generated</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Paid Invoices</span>
              <span style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '8px' }}>
              {loading ? '-' : fmtMoney(paidAmount)}
            </div>
            <span style={{ fontSize: '11px', color: '#166534', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>{paidRecords.length} invoices fully settled</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Pending / Sent</span>
              <span style={{ backgroundColor: '#f0f9ff', color: '#0369a1', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '8px' }}>
              {loading ? '-' : fmtMoney(pendingAmount)}
            </div>
            <span style={{ fontSize: '11px', color: '#0369a1', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>{pendingRecords.length} invoices awaiting payment</span>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Overdue Invoices</span>
              <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '6px', borderRadius: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '8px' }}>
              {loading ? '-' : fmtMoney(overdueAmount)}
            </div>
            <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 'bold', display: 'block', marginTop: '4px' }}>{overdueRecords.length} invoices past due date</span>
          </div>

        </div>

        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>

          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>All Invoices</h3>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px', width: '240px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="text"
                  placeholder="Search invoice or student..."
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
                <option value="All Classes">All Classes</option>
                {classOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '750px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '10px', fontWeight: 800 }}>
                  <th style={{ padding: '12px 20px' }}>INVOICE ID</th>
                  <th style={{ padding: '12px 20px' }}>STUDENT</th>
                  <th style={{ padding: '12px 20px' }}>CLASS</th>
                  <th style={{ padding: '12px 20px' }}>FEE TYPE</th>
                  <th style={{ padding: '12px 20px' }}>AMOUNT</th>
                  <th style={{ padding: '12px 20px' }}>DUE DATE</th>
                  <th style={{ padding: '12px 20px' }}>STATUS</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Loading...</td></tr>
                )}
                {!loading && paginated.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No invoices match your filters.</td></tr>
                )}
                {!loading && paginated.map((inv) => {
                  const st = displayStatusFor(inv);
                  const stStyle = statusStyle(st);
                  return (
                    <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 20px', fontWeight: 'bold', color: '#002b49' }}>{invoiceNumberFor(inv)}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <strong style={{ color: '#0f172a', display: 'block' }}>{inv.studentName}</strong>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>{inv.studentCustomId}</span>
                      </td>
                      <td style={{ padding: '12px 20px', color: '#334155', fontWeight: 'bold' }}>{inv.className}</td>
                      <td style={{ padding: '12px 20px', color: '#334155' }}>{inv.category}</td>
                      <td style={{ padding: '12px 20px', fontWeight: 'bold', color: '#0f172a' }}>{fmtMoney(inv.totalFees)}</td>
                      <td style={{ padding: '12px 20px', color: st === 'Overdue' ? '#dc2626' : '#64748b', fontWeight: st === 'Overdue' ? 'bold' : 'normal' }}>{fmtDate(inv.dueDate)}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ backgroundColor: stStyle.bg, color: stStyle.color, padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>
                          {st}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                          <button
                            title="View Invoice"
                            onClick={() => void openDetails(inv)}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                          <button
                            title="Download PDF"
                            onClick={handleDownloadPdf}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          </button>
                          <button
                            title="Send Reminder"
                            onClick={() => void handleSendReminder(inv)}
                            disabled={sending}
                            style={{ border: 'none', background: 'none', cursor: sending ? 'wait' : 'pointer', color: '#002b49', padding: '4px', opacity: sending ? 0.5 : 1 }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
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
              Showing <strong>{filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)}</strong> of <strong>{filtered.length}</strong> invoices
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

        {detailsOpen && detailsRecord && (
          <div style={overlayStyle} onClick={() => setDetailsOpen(false)}>
            <div
              style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '720px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                    {invoiceNumberFor(detailsRecord)}
                  </h3>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    {detailsRecord.studentName} | {detailsRecord.studentCustomId} | {detailsRecord.className}
                  </span>
                </div>
                <button onClick={() => setDetailsOpen(false)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>X</button>
              </div>

              <div style={{ padding: '20px 24px', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Invoice Amount</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{fmtMoney(detailsRecord.totalFees)}</div>
                  </div>
                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontSize: '10px', color: '#166534', fontWeight: 'bold', textTransform: 'uppercase' }}>Paid</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#166534', marginTop: '4px' }}>{fmtMoney(detailsRecord.amountPaid)}</div>
                  </div>
                  <div style={{ backgroundColor: detailsRecord.balance === 0 ? '#f0fdf4' : '#fef2f2', border: `1px solid ${detailsRecord.balance === 0 ? '#bbf7d0' : '#fecaca'}`, borderRadius: '10px', padding: '12px' }}>
                    <div style={{ fontSize: '10px', color: detailsRecord.balance === 0 ? '#166534' : '#991b1b', fontWeight: 'bold', textTransform: 'uppercase' }}>Balance</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: detailsRecord.balance === 0 ? '#166534' : '#991b1b', marginTop: '4px' }}>{fmtMoney(detailsRecord.balance)}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', fontSize: '12px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', display: 'block' }}>Fee Category</span>
                    <strong style={{ color: '#0f172a' }}>{detailsRecord.category}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', display: 'block' }}>Term</span>
                    <strong style={{ color: '#0f172a' }}>{detailsRecord.term || '-'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', display: 'block' }}>Due Date</span>
                    <strong style={{ color: '#0f172a' }}>{fmtDate(detailsRecord.dueDate)}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', display: 'block' }}>Sent At</span>
                    <strong style={{ color: '#0f172a' }}>{fmtDateTime(detailsRecord.sentAt)}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', display: 'block' }}>Status</span>
                    <strong style={{ color: '#0f172a' }}>{displayStatusFor(detailsRecord)}</strong>
                  </div>
                </div>

                <div style={{ fontSize: '11px', fontWeight: 800, color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Payment History
                </div>

                {detailsLoading ? (
                  <div style={{ fontSize: '12px', color: '#64748b', padding: '20px', textAlign: 'center' }}>Loading...</div>
                ) : detailsPayments.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#64748b', padding: '20px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                    No payments recorded yet for this invoice.
                  </div>
                ) : (
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '10px', fontWeight: 800 }}>
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
                  onClick={() => window.print()}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}
                >
                  Print
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AccountantLayout>
  );
};