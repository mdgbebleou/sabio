import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { supabase } from '../services/supabase';

interface ClassFinance {
  id: string;
  className: string;
  expected: string;
  collected: string;
  outstanding: string;
  rate: number;
  hasWarning?: boolean;
}

interface FeePaymentRecord {
  id: string;
  amount?: number;
  student_name?: string;
  class_name?: string;
  payment_method?: string;
  reference_no?: string;
  created_at?: string;
  [key: string]: unknown;
}

interface RecentPayment {
  id: string;
  studentName: string;
  className: string;
  method: string;
  amount: string;
}

interface AcademicTermRecord {
  id: string;
  academic_year: string;
  term_name: string;
  is_active: boolean;
}

interface ClassRecord {
  id: string;
  name: string;
  grade: string;
}

interface GradeRecord {
  id: string;
  name: string;
  code: string;
}

interface StudentRecord {
  id: string;
  custom_id: string;
  first_name: string;
  last_name: string;
  class_name: string;
}

export const Finance: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'detail' | 'record' | 'discount' | 'assign' | 'createStructure' | null>(null);
  
  // Record / Adjust Payment tab state
  const [paymentTab, setPaymentTab] = useState<'record' | 'adjust'>('record');

  // Dynamic Lookup Data from Tables based on your schema
  const [academicTerms, setAcademicTerms] = useState<AcademicTermRecord[]>([]);
  const [classesList, setClassesList] = useState<ClassRecord[]>([]);
  const [gradesList, setGradesList] = useState<GradeRecord[]>([]);
  const [studentsList, setStudentsList] = useState<StudentRecord[]>([]);

  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2026/2027');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');

  // Dynamic State
  const [classFinances] = useState<ClassFinance[]>([]);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [kpiData, setKpiData] = useState({
    expectedFees: 'GHS 0.00',
    collectedFees: 'GHS 0.00',
    outstandingFees: 'GHS 0.00',
    collectionRate: '0.0%',
    collectionRateNumber: 0,
    studentCount: 0,
    attentionCount: 0,
  });
  const [agingData] = useState({
    current: 'GHS 0.00',
    overdue: 'GHS 0.00',
    significantlyOverdue: 'GHS 0.00',
  });

  // Form states for Create Fee Structure
  const [newFeeName, setNewFeeName] = useState('');
  const [newFeeCategory, setNewFeeCategory] = useState('');
  const [newFeeDescription, setNewFeeDescription] = useState('');
  const [newFeeAmount, setNewFeeAmount] = useState('');
  const [lateFeePolicy, setLateFeePolicy] = useState('');
  const [scopeType, setScopeType] = useState<'all_grades' | 'specific_grades' | 'specific_programs'>('all_grades');

  // Form states for Record Payment
  const [paymentStudentSearch, setPaymentStudentSearch] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

  // Fetch dynamic lookups using your exact table schemas (academic_terms, classes, grades, students, fee_payments)
  const fetchFinanceData = useCallback(async () => {
    try {
      // 1. Fetch academic_terms for years and terms dropdowns
      const { data: termsData } = await supabase.from('academic_terms').select('*');
      if (termsData && termsData.length > 0) {
        setAcademicTerms(termsData as AcademicTermRecord[]);
        // Default to active term if available
        const activeTerm = termsData.find((t: AcademicTermRecord) => t.is_active);
        if (activeTerm) {
          setSelectedAcademicYear(activeTerm.academic_year);
          setSelectedTerm(activeTerm.term_name);
        }
      }

      // 2. Fetch classes for scoping/assignments
      const { data: classData } = await supabase.from('classes').select('*');
      if (classData) {
        setClassesList(classData as ClassRecord[]);
      }

      // 3. Fetch grades
      const { data: gradeData } = await supabase.from('grades').select('*');
      if (gradeData) {
        setGradesList(gradeData as GradeRecord[]);
      }

      // 4. Fetch students for payment search or allocations
      const { data: studentData } = await supabase.from('students').select('*');
      if (studentData) {
        setStudentsList(studentData as StudentRecord[]);
        setKpiData(prev => ({ ...prev, studentCount: studentData.length }));
      }

      // 5. Fetch fee payments
      const { data: payments, error } = await supabase.from('fee_payments').select('*');
      if (!error && payments) {
        const typedPayments = payments as FeePaymentRecord[];
        
        // Map recent payments feed
        const mappedRecent: RecentPayment[] = typedPayments.slice(0, 5).map((p) => ({
          id: p.id,
          studentName: p.student_name || 'Unknown Student',
          className: p.class_name || 'General',
          method: p.payment_method || 'Cash',
          amount: `+GHS ${(p.amount || 0).toLocaleString()}`,
        }));
        setRecentPayments(mappedRecent);

        // Calculate totals dynamically from real payments table if available
        const totalCollected = typedPayments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        setKpiData(prev => ({
          ...prev,
          collectedFees: `GHS ${totalCollected.toLocaleString()}`,
        }));
      }
    } catch (err: unknown) {
      console.error('Error fetching finance data:', err);
    }
  }, []);

  // Initialize data load cleanly
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (isMounted) {
        await fetchFinanceData();
      }
    };
    void loadData();
    return () => {
      isMounted = false;
    };
  }, [fetchFinanceData]);

  // Extract unique academic years from academic_terms
  const uniqueAcademicYears = Array.from(new Set(academicTerms.map(t => t.academic_year)));
  // Filter terms belonging to selected academic year
  const availableTermsForYear = academicTerms.filter(t => t.academic_year === selectedAcademicYear);

  // CREATE: Save new Fee Structure to Supabase and apply to scope
  const handleSaveFeeStructure = async () => {
    try {
      const baseNumAmount = parseFloat(newFeeAmount) || 0;

      // 1. Insert into fee_structures table
      const { data: insertedStructure, error: structError } = await supabase
        .from('fee_structures')
        .insert([
          {
            name: newFeeName,
            category: newFeeCategory,
            description: newFeeDescription,
            base_amount: baseNumAmount,
            academic_year: selectedAcademicYear,
            term: selectedTerm,
            late_fee_policy: lateFeePolicy,
            scope: scopeType,
          }
        ])
        .select()
        .single();

      if (structError) {
        console.error('Error creating fee structure:', structError.message);
        alert(`Failed to save: ${structError.message}`);
        return;
      }

      // 2. Automatically assign and affect target students based on scope using the fetched students list
      if (studentsList && studentsList.length > 0) {
        const allocations = studentsList.map((st) => ({
          student_id: st.id,
          fee_structure_id: insertedStructure?.id,
          amount_due: baseNumAmount,
          balance: baseNumAmount,
          academic_year: selectedAcademicYear,
          term: selectedTerm,
        }));

        await supabase.from('student_fee_allocations').insert(allocations);
      }

      alert('Fee structure created and assigned successfully!');
      setActiveModal(null);
      setNewFeeName('');
      setNewFeeCategory('');
      setNewFeeDescription('');
      setNewFeeAmount('');
      setLateFeePolicy('');
      void fetchFinanceData();
    } catch (err) {
      console.error('Unexpected error creating fee structure:', err);
    }
  };

  // CREATE: Record a new Payment to Supabase
  const handleRecordPayment = async () => {
    try {
      const { error } = await supabase.from('fee_payments').insert([
        {
          student_name: paymentStudentSearch,
          amount: parseFloat(paymentAmount) || 0,
          payment_method: paymentMethod,
          reference_no: paymentReference,
          payment_date: paymentDate || new Date().toISOString(),
        }
      ]);

      if (error) {
        console.error('Error recording payment:', error.message);
        alert(`Failed to record payment: ${error.message}`);
      } else {
        alert('Payment recorded successfully!');
        setActiveModal(null);
        setPaymentStudentSearch('');
        setPaymentAmount('');
        setPaymentMethod('');
        setPaymentReference('');
        setPaymentDate('');
        void fetchFinanceData();
      }
    } catch (err) {
      console.error('Unexpected error recording payment:', err);
    }
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    boxSizing: 'border-box',
  };

  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px'
  };

  const modalContainerStyle: React.CSSProperties = {
    backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '680px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', fontFamily: "'Inter', sans-serif"
  };

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Fee & Finance Management</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Monitor school fee collections, outstanding balances and financial activity.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select 
              value={selectedAcademicYear} 
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold', color: '#334155', backgroundColor: '#ffffff' }}
            >
              {uniqueAcademicYears.length === 0 ? (
                <option value="2026/2027">2026/2027</option>
              ) : (
                uniqueAcademicYears.map((ay) => (
                  <option key={ay} value={ay}>{ay}</option>
                ))
              )}
            </select>
            <select 
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold', color: '#334155', backgroundColor: '#ffffff' }}
            >
              {availableTermsForYear.length === 0 ? (
                <option value="Term 1">Term 1</option>
              ) : (
                availableTermsForYear.map((t) => (
                  <option key={t.id} value={t.term_name}>{t.term_name}</option>
                ))
              )}
            </select>
            <button 
              onClick={() => setActiveModal('createStructure')} 
              style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Fee Configuration
            </button>
            <button style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Financial Reports
            </button>
          </div>
        </div>

        {/* FEE CYCLE STATUS BANNER */}
        <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <div>
              <span style={{ fontWeight: '800', color: '#1e3a8a', fontSize: '15px' }}>{selectedAcademicYear} — {selectedTerm}</span>
              <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', marginLeft: '10px' }}>Fee cycle: Active</span>
              <span style={{ fontSize: '12px', color: '#475569', marginLeft: '12px' }}>Academic Terms Synced</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e40af' }}>-- Days remaining</span>
            <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>ON TRACK</span>
          </div>
        </div>

        {/* TOP KPI CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>EXPECTED FEES</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{kpiData.expectedFees}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Total fees expected</div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>COLLECTED ({kpiData.collectionRate})</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{kpiData.collectedFees}</div>
            <div style={{ fontSize: '11px', color: '#166534', fontWeight: 'bold', marginTop: '4px' }}>-- vs prev term</div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>OUTSTANDING</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{kpiData.outstandingFees}</div>
            <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 'bold', marginTop: '4px' }}>{kpiData.studentCount} Students • {kpiData.attentionCount} Attention needed</div>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>COLLECTION RATE</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{kpiData.collectionRate}</div>
            <div style={{ height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', marginTop: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${kpiData.collectionRateNumber}%`, height: '100%', backgroundColor: '#002b49' }}></div>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: INSIGHTS & OUTSTANDING AGING */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '20px' }}>
          
          {/* Financial Insights */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Financial Insights</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: '#991b1b', fontSize: '13px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
                  Collection Gap
                </div>
                <p style={{ margin: '6px 0 10px 0', fontSize: '12px', color: '#7f1d1d' }}>
                  Fee collection analysis synced with Supabase.
                </p>
                <span onClick={() => setActiveModal('discount')} style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e40af', cursor: 'pointer' }}>Review Outstanding →</span>
              </div>

              <div style={{ backgroundColor: '#fffbe3', border: '1px solid #fde047', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: '#854d0e', fontSize: '13px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
                  High Outstanding Balances
                </div>
                <p style={{ margin: '6px 0 10px 0', fontSize: '12px', color: '#713f12' }}>
                  Threshold accounts monitoring active.
                </p>
                <span onClick={() => setActiveModal('detail')} style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e40af', cursor: 'pointer' }}>Review Balances →</span>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Aging & Recent Activity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Outstanding Aging */}
            <div style={cardStyle}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Outstanding Aging</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Current (0-30 days)</span>
                  <strong style={{ color: '#0f172a' }}>{agingData.current}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#d97706', fontWeight: 'bold' }}>Overdue (31-60 days)</span>
                  <strong style={{ color: '#d97706' }}>{agingData.overdue}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#dc2626', fontWeight: 'bold' }}>Significantly Overdue (90+)</span>
                  <strong style={{ color: '#dc2626' }}>{agingData.significantlyOverdue}</strong>
                </div>
              </div>
            </div>

            {/* Recent Payments Quick Feed */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Recent Payments</h4>
                <button onClick={() => setActiveModal('record')} style={{ border: 'none', background: 'none', fontSize: '11px', fontWeight: 'bold', color: '#1e40af', cursor: 'pointer' }}>+ Record</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentPayments.length === 0 ? (
                  <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', padding: '10px 0' }}>No recent payments recorded.</div>
                ) : (
                  recentPayments.map((payment) => (
                    <div key={payment.id} onClick={() => setActiveModal('detail')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', borderRadius: '8px', backgroundColor: '#f8fafc', cursor: 'pointer' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '12px' }}>{payment.studentName}</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>{payment.className} • {payment.method}</div>
                      </div>
                      <strong style={{ color: '#166534', fontSize: '12px' }}>{payment.amount}</strong>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div style={cardStyle}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Quick Actions</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={() => setActiveModal('assign')} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                  Manage Fee Structures
                </button>
                <button onClick={() => setActiveModal('discount')} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>
                  Waive / Discount Fee
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* CLASS COLLECTION PERFORMANCE TABLE */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Class Collection Performance</h3>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e40af', cursor: 'pointer' }}>View All Classes</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left' }}>CLASS</th>
                <th style={{ padding: '14px 20px', textAlign: 'left' }}>EXPECTED</th>
                <th style={{ padding: '14px 20px', textAlign: 'left' }}>COLLECTED</th>
                <th style={{ padding: '14px 20px', textAlign: 'left' }}>OUTSTANDING</th>
                <th style={{ padding: '14px 20px', textAlign: 'left' }}>RATE</th>
              </tr>
            </thead>
            <tbody>
              {classFinances.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                    No class finance performance data available. Connect backend or add structures.
                  </td>
                </tr>
              ) : (
                classFinances.map((cls) => (
                  <tr key={cls.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 'bold', color: '#0f172a' }}>
                      {cls.className} {cls.hasWarning && <span style={{ color: '#dc2626', marginLeft: '4px' }}>!</span>}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#334155' }}>{cls.expected}</td>
                    <td style={{ padding: '14px 20px', fontWeight: 'bold', color: '#166534' }}>{cls.collected}</td>
                    <td style={{ padding: '14px 20px', fontWeight: 'bold', color: cls.hasWarning ? '#dc2626' : '#334155' }}>{cls.outstanding}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 'bold', color: cls.rate < 70 ? '#dc2626' : '#0f172a', minWidth: '45px' }}>{cls.rate}%</span>
                        <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', maxWidth: '120px' }}>
                          <div style={{ width: `${cls.rate}%`, height: '100%', backgroundColor: cls.rate < 70 ? '#dc2626' : '#002b49' }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ========================================================================= */}
        {/* POPUP 1: PAYMENT DETAIL MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'detail' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '720px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/></svg>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Payment Detail</h3>
                      <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>COMPLETED</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>--</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Adjust Payment</button>
                  <button style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Receipt</button>
                  <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b', marginLeft: '8px' }}>✕</button>
                </div>
              </div>

              <div style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
                
                {/* Payer Information & Transaction Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: '#ffffff' }}>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '12px' }}>PAYER INFORMATION</div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0' }} />
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#0f172a' }}>--</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>--</div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                      <div><span style={{ color: '#64748b' }}>Student ID</span><br /><strong>--</strong></div>
                      <div><span style={{ color: '#64748b' }}>Guardian</span><br /><strong>--</strong></div>
                    </div>
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: '#ffffff' }}>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '8px' }}>TRANSACTION DETAILS</div>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a' }}>--</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '12px' }}>--</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                      <div><span style={{ color: '#64748b' }}>Date</span><br /><strong>--</strong></div>
                      <div><span style={{ color: '#64748b' }}>Reference</span><br /><strong>--</strong></div>
                    </div>
                  </div>

                </div>

                {/* Fee Allocation Table */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontSize: '11px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase' }}>
                    FEE ALLOCATION
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9', color: '#64748b', fontSize: '10px', textTransform: 'uppercase', textAlign: 'left' }}>
                        <th style={{ padding: '10px 16px' }}>DESCRIPTION</th>
                        <th style={{ padding: '10px 16px' }}>TERM</th>
                        <th style={{ padding: '10px 16px' }}>AMOUNT APPLIED</th>
                        <th style={{ padding: '10px 16px' }}>REMAINING BALANCE</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={4} style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>No allocations loaded.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Audit Trail Info */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '8px' }}>AUDIT TRAIL</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '11px' }}>
                    <div><span style={{ color: '#64748b' }}>RECORDED BY</span><br /><strong>--</strong></div>
                    <div><span style={{ color: '#64748b' }}>RECORDED AT</span><br /><strong>--</strong></div>
                    <div><span style={{ color: '#64748b' }}>SOURCE INFO</span><br /><strong>--</strong></div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 2: RECORD OR ADJUST PAYMENT MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'record' && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Record or Adjust Payment</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Transaction Management</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
                  <button 
                    onClick={() => setPaymentTab('record')} 
                    style={{ flex: 1, padding: '10px', border: 'none', background: 'none', borderBottom: paymentTab === 'record' ? '2px solid #002b49' : 'none', fontWeight: 'bold', fontSize: '12px', color: paymentTab === 'record' ? '#002b49' : '#64748b', cursor: 'pointer' }}
                  >
                    RECORD NEW PAYMENT
                  </button>
                  <button 
                    onClick={() => setPaymentTab('adjust')} 
                    style={{ flex: 1, padding: '10px', border: 'none', background: 'none', borderBottom: paymentTab === 'adjust' ? '2px solid #002b49' : 'none', fontWeight: 'bold', fontSize: '12px', color: paymentTab === 'adjust' ? '#002b49' : '#64748b', cursor: 'pointer' }}
                  >
                    ADJUST EXISTING
                  </button>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Student ID / Name</label>
                  <select 
                    value={paymentStudentSearch}
                    onChange={(e) => setPaymentStudentSearch(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', backgroundColor: '#ffffff' }}
                  >
                    <option value="">Select student from database...</option>
                    {studentsList.map((st) => (
                      <option key={st.id} value={`${st.first_name} ${st.last_name}`}>
                        {st.first_name} {st.last_name} ({st.custom_id}) - {st.class_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Amount (GHS)</label>
                    <input 
                      type="number" 
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="0.00" 
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Payment Method</label>
                    <select 
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}
                    >
                      <option value="">Select method...</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Mobile Money">Mobile Money</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Reference Number</label>
                    <input 
                      type="text" 
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="e.g. TXN-123456" 
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Date</label>
                    <input 
                      type="date" 
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} 
                    />
                  </div>
                </div>

                {/* Balance Impact */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>CURRENT OUTSTANDING</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#dc2626' }}>--</div>
                  </div>
                  <div style={{ fontSize: '18px', color: '#64748b' }}>→</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>PROJECTED BALANCE</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>--</div>
                  </div>
                </div>

              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>This action will be logged in the financial audit trail.</span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleRecordPayment} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Process Transaction</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 3: WAIVE OR DISCOUNT FEE MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'discount' && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#002b49" strokeWidth="2"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Waive or Discount Fee</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Adjust fee obligations for an individual student.</p>
                  </div>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Student</label>
                    <select style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', backgroundColor: '#ffffff' }}>
                      <option value="">Select student...</option>
                      {studentsList.map((st) => (
                        <option key={st.id} value={st.id}>{st.first_name} {st.last_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Fee Item</label>
                    <select style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', backgroundColor: '#ffffff' }}>
                      <option>Select fee item...</option>
                    </select>
                  </div>
                </div>

                <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>ADJUSTMENT DETAILS</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Adjustment Type</label>
                    <select style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                      <option>Fixed Amount Discount</option>
                      <option>Percentage Discount</option>
                      <option>Full Fee Waiver</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Value (GHS)</label>
                    <input type="number" placeholder="0.00" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Reason Code</label>
                  <select style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px' }}>
                    <option>Scholarship</option>
                    <option>Financial Hardship</option>
                    <option>Staff Child Discount</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Supporting Note</label>
                  <textarea placeholder="Provide context for this adjustment..." style={{ width: '100%', height: '60px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                </div>

                {/* Calculation summary */}
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>ORIGINAL</div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#0f172a' }}>--</div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>→</div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#dc2626' }}>DISCOUNT</div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#dc2626' }}>--</div>
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>→</div>
                  <div style={{ backgroundColor: '#e0e7ff', border: '1px solid #c7d2fe', padding: '8px 14px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#3730a3', fontWeight: 'bold' }}>NEW BALANCE</div>
                    <div style={{ fontWeight: '900', fontSize: '16px', color: '#3730a3' }}>--</div>
                  </div>
                </div>

              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Review Impact</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Confirm Adjustment</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 4: ASSIGN FEE STRUCTURE MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'assign' && (
          <div style={modalOverlayStyle}>
            <div style={modalContainerStyle}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Assign Fee Structure</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Configure and allocate fees to specific student groups.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px' }}>
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '8px' }}>1. SELECT FEE STRUCTURE</div>
                <select style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginBottom: '20px', backgroundColor: '#ffffff' }}>
                  <option>Choose a predefined structure...</option>
                </select>

                <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '8px' }}>2. TARGET AUDIENCE</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Entire Grade ({gradesList.length})</div>
                  </div>
                  <div style={{ border: '2px solid #002b49', backgroundColor: '#f0f9ff', borderRadius: '10px', padding: '12px', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#002b49' }}>Specific Class ({classesList.length})</div>
                  </div>
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px', textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Individual ({studentsList.length})</div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>Select Class(es) from Database</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {classesList.map((cls) => (
                      <span key={cls.id} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: 'bold', color: '#1e40af' }}>
                        {cls.name}
                      </span>
                    ))}
                    {classesList.length === 0 && <span style={{ fontSize: '11px', color: '#64748b' }}>No classes found</span>}
                  </div>
                </div>

                <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '8px' }}>3. CUSTOM ADJUSTMENTS</div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
                  <input type="number" placeholder="GHS 0.00" style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                    <input type="radio" name="adj" defaultChecked /> Discount
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                    <input type="radio" name="adj" /> Surcharge
                  </label>
                </div>

                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#1e3a8a' }}>Impact Analysis</div>
                    <div style={{ fontWeight: '800', fontSize: '15px', color: '#1e40af' }}>Assigning to {studentsList.length} students</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#1e3a8a' }}>Total Projected Revenue</div>
                    <div style={{ fontWeight: '800', fontSize: '14px', color: '#1e40af' }}>GHS 0.00</div>
                  </div>
                </div>

              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Confirm Assignment</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* POPUP 5: CREATE FEE STRUCTURE MODAL */}
        {/* ========================================================================= */}
        {activeModal === 'createStructure' && (
          <div style={modalOverlayStyle}>
            <div style={{ ...modalContainerStyle, maxWidth: '720px' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Create Fee Structure</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Define billing parameters and scope for a new institutional fee.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>

              <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                
                {/* 1. Basic Info */}
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>BASIC INFORMATION</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '4px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Fee Name *</label>
                    <input 
                      type="text" 
                      value={newFeeName}
                      onChange={(e) => setNewFeeName(e.target.value)}
                      placeholder="e.g. Tuition Fall 2026" 
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Category *</label>
                    <select 
                      value={newFeeCategory}
                      onChange={(e) => setNewFeeCategory(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', backgroundColor: '#ffffff' }}
                    >
                      <option value="">Select category...</option>
                      <option value="Tuition">Tuition</option>
                      <option value="Facility Fee">Facility Fee</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '20px', marginTop: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Internal Description</label>
                  <textarea 
                    value={newFeeDescription}
                    onChange={(e) => setNewFeeDescription(e.target.value)}
                    placeholder="Optional notes regarding this fee's purpose..." 
                    style={{ width: '100%', height: '50px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} 
                  />
                </div>

                {/* 2. Applicability Scope */}
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>2. APPLICABILITY SCOPE</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Academic Year</label>
                    <select 
                      value={selectedAcademicYear} 
                      onChange={(e) => setSelectedAcademicYear(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', backgroundColor: '#ffffff' }}
                    >
                      {uniqueAcademicYears.map((ay) => (
                        <option key={ay} value={ay}>{ay}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Term / Semester</label>
                    <select 
                      value={selectedTerm}
                      onChange={(e) => setSelectedTerm(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', backgroundColor: '#ffffff' }}
                    >
                      {availableTermsForYear.map((t) => (
                        <option key={t.id} value={t.term_name}>{t.term_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginBottom: '20px', display: 'flex', gap: '16px', fontSize: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input 
                      type="checkbox" 
                      checked={scopeType === 'all_grades'} 
                      onChange={() => setScopeType('all_grades')} 
                    /> All Grades ({gradesList.length})
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input 
                      type="checkbox" 
                      checked={scopeType === 'specific_grades'} 
                      onChange={() => setScopeType('specific_grades')} 
                    /> Specific Grades
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input 
                      type="checkbox" 
                      checked={scopeType === 'specific_programs'} 
                      onChange={() => setScopeType('specific_programs')} 
                    /> Specific Programs
                  </label>
                </div>

                {/* 3. Pricing & Rules */}
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>3. PRICING & RULES</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Base Amount</label>
                    <input 
                      type="number" 
                      value={newFeeAmount}
                      onChange={(e) => setNewFeeAmount(e.target.value)}
                      placeholder="0.00 GHS" 
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Late Fee Policy</label>
                    <textarea 
                      value={lateFeePolicy}
                      onChange={(e) => setLateFeePolicy(e.target.value)}
                      placeholder="Enter late fee policy or penalty amount here..." 
                      style={{ width: '100%', height: '38px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} 
                    />
                  </div>
                </div>

                {/* 4. Billing Schedule */}
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>4. BILLING SCHEDULE</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Invoice Issue Date</label>
                    <input type="date" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Payment Due Date</label>
                    <input type="date" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} />
                  </div>
                </div>

              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSaveFeeStructure} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer' }}>Save Structure</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};
