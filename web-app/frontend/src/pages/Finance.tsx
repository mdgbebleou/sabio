import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { supabase } from '../services/supabase';

interface AcademicTermRecord {
  id: string;
  academic_year: string;
  term_name: string;
  is_active: boolean;
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
  class_id?: string;
  class_name: string;
  outstanding_balance?: number;
}

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

interface RecentPayment {
  id: string;
  studentName: string;
  amount: string;
}

export const Finance: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'detail' | 'record' | 'discount' | 'assign' | 'createStructure' | null>(null);
  
  // Dynamic Lookup Data from Tables
  const [academicTerms, setAcademicTerms] = useState<AcademicTermRecord[]>([]);
  const [gradesList, setGradesList] = useState<GradeRecord[]>([]);
  const [studentsList, setStudentsList] = useState<StudentRecord[]>([]);
  const [feeStructuresList, setFeeStructuresList] = useState<FeeStructureRecord[]>([]);

  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2026/2027');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');

  // Dynamic State
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [kpiData, setKpiData] = useState({
    expectedFees: 'GHS 0.00',
    collectedFees: 'GHS 0.00',
    outstandingFees: 'GHS 0.00',
    collectionRate: '0.0%',
    studentCount: 0,
  });

  // Form states for Create Fee Structure Modal
  const [newFeeName, setNewFeeName] = useState('');
  const [newFeeCategory, setNewFeeCategory] = useState('');
  const [newFeeDescription, setNewFeeDescription] = useState('');
  const [newFeeAmount, setNewFeeAmount] = useState('');
  const [lateFeePolicy, setLateFeePolicy] = useState('');
  
  // Scope and Grade selection state
  const [scopeType, setScopeType] = useState<'all' | 'grades'>('all');
  const [selectedGradeIds, setSelectedGradeIds] = useState<string[]>([]);
  const [savingStructure, setSavingStructure] = useState(false);

  // Toggle Grade selection buttons
  const toggleGradeSelection = (gradeId: string) => {
    setSelectedGradeIds(prev => 
      prev.includes(gradeId) ? prev.filter(id => id !== gradeId) : [...prev, gradeId]
    );
  };

  // Fetch dynamic lookups, fee structures & KPI totals
  const fetchFinanceData = useCallback(async () => {
    try {
      const { data: termsData } = await supabase.from('academic_terms').select('*');
      if (termsData && termsData.length > 0) {
        setAcademicTerms(termsData as AcademicTermRecord[]);
        const activeTerm = termsData.find((t: AcademicTermRecord) => t.is_active);
        if (activeTerm) {
          setSelectedAcademicYear(activeTerm.academic_year);
          setSelectedTerm(activeTerm.term_name);
        }
      }

      const { data: gradeData } = await supabase.from('grades').select('*');
      if (gradeData) setGradesList(gradeData as GradeRecord[]);

      // Fetch students along with their class and grade relation if available
      const { data: studentData } = await supabase.from('students').select('*, classes:class_id(id, grade, name)');
      if (studentData) {
        const formattedStudents: StudentRecord[] = studentData.map((st: any) => ({
          id: st.id,
          custom_id: st.custom_id,
          first_name: st.first_name,
          last_name: st.last_name,
          class_id: st.class_id,
          class_name: st.classes?.name || st.class_name || 'Unassigned',
        }));
        setStudentsList(formattedStudents);
        setKpiData(prev => ({ ...prev, studentCount: formattedStudents.length }));
      }

      // Fetch Fee Structures
      const { data: structData } = await supabase.from('fee_structures').select('*').order('created_at', { ascending: false });
      if (structData) setFeeStructuresList(structData as FeeStructureRecord[]);

      // Fetch Fees / Payments summary for KPIs
      const { data: feesData } = await supabase.from('fees').select('total_fees, amount_paid, balance');
      if (feesData && feesData.length > 0) {
        let totalExpected = 0;
        let totalCollected = 0;
        let totalOutstanding = 0;

        feesData.forEach((f: any) => {
          totalExpected += Number(f.total_fees || 0);
          totalCollected += Number(f.amount_paid || 0);
          totalOutstanding += Number(f.balance || 0);
        });

        const rate = totalExpected > 0 ? ((totalCollected / totalExpected) * 100).toFixed(1) + '%' : '0.0%';

        setKpiData(prev => ({
          ...prev,
          expectedFees: `GHS ${totalExpected.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          collectedFees: `GHS ${totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          outstandingFees: `GHS ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
          collectionRate: rate,
        }));
      }
    } catch (err) {
      console.error('Error fetching finance data:', err);
    }
  }, []);

  useEffect(() => {
    void fetchFinanceData();
  }, [fetchFinanceData]);

  // Handle Saving Fee Structure & Precise Grade-Targeted Ledger Syncing
  const handleSaveFeeStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeeCategory.trim() || !newFeeAmount) {
      alert('Please fill in category and base amount.');
      return;
    }
    const amt = parseFloat(newFeeAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid base amount.');
      return;
    }

    setSavingStructure(true);
    try {
      // 1. Insert master fee structure record
      const { error: insErr } = await supabase.from('fee_structures').insert([
        {
          category: newFeeCategory.trim(),
          amount: amt,
          term: selectedTerm,
          academic_year: selectedAcademicYear,
          notes: newFeeDescription.trim() || null,
          status: 'Active',
        },
      ]);
      if (insErr) throw insErr;

      // 2. Precisely filter target students based on selected scope
      let targetStudents = studentsList;
      if (scopeType === 'grades' && selectedGradeIds.length > 0) {
        // Fetch matching classes for the selected grade IDs to ensure accurate filtering
        const { data: matchingClasses } = await supabase
          .from('classes')
          .select('id')
          .in('grade_id', selectedGradeIds); // or check if class belongs to selected grades

        const classIds = matchingClasses ? matchingClasses.map((c: any) => c.id) : [];

        targetStudents = studentsList.filter(st => {
          return selectedGradeIds.includes(st.class_id || '') || classIds.includes(st.class_id || '');
        });
      }

      // If scope is 'all', targetStudents remains all students. If 'grades' was selected but none matched, target is empty.
      if (scopeType === 'grades' && targetStudents.length === 0) {
        alert('Fee structure created, but no students were found matching the selected grade(s).');
      } else if (targetStudents.length > 0) {
        // 3. Sync/upsert allocations strictly into the targeted students' `fees` ledgers
        const defaultDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

        for (const st of targetStudents) {
          const { data: existingFee } = await supabase
            .from('fees')
            .select('id, total_fees, balance, amount_paid, status')
            .eq('student_id', st.id)
            .eq('term', selectedTerm)
            .eq('category', newFeeCategory.trim())
            .maybeSingle();

          if (existingFee) {
            const newTotal = Number(existingFee.total_fees || 0) + amt;
            const newBalance = Number(existingFee.balance || 0) + amt;
            await supabase
              .from('fees')
              .update({ 
                total_fees: newTotal, 
                balance: newBalance,
                status: newBalance > Number(existingFee.amount_paid || 0) ? 'Outstanding' : 'Paid'
              })
              .eq('id', existingFee.id);
          } else {
            await supabase.from('fees').insert([
              {
                student_id: st.id,
                total_fees: amt,
                amount_paid: 0,
                balance: amt,
                status: 'Outstanding',
                due_date: defaultDueDate,
                term: selectedTerm,
                category: newFeeCategory.trim(),
                invoice_number: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
                invoice_status: 'Sent',
              },
            ]);
          }
        }
      }

      alert(`Fee structure created and successfully applied to ${targetStudents.length} student(s) ledger!`);
      setActiveModal(null);
      setNewFeeName('');
      setNewFeeCategory('');
      setNewFeeDescription('');
      setNewFeeAmount('');
      setLateFeePolicy('');
      setSelectedGradeIds([]);
      setScopeType('all');
      void fetchFinanceData();
    } catch (err: any) {
      console.error('Unexpected error creating fee structure:', err);
      alert(`Failed to save fee structure: ${err.message || err}`);
    } finally {
      setSavingStructure(false);
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

  // Unique academic years derived from terms list
  const uniqueAcademicYears = Array.from(new Set(academicTerms.map(t => t.academic_year)));
  const availableTermsForYear = academicTerms.filter(t => t.academic_year === selectedAcademicYear);

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
              Fee Configuration
            </button>
          </div>
        </div>

        {/* TOP KPI CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={cardStyle}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>EXPECTED FEES</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{kpiData.expectedFees}</div>
          </div>
          <div style={cardStyle}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>COLLECTED ({kpiData.collectionRate})</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{kpiData.collectedFees}</div>
          </div>
          <div style={cardStyle}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>OUTSTANDING</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{kpiData.outstandingFees}</div>
          </div>
          <div style={cardStyle}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>COLLECTION RATE</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>{kpiData.collectionRate}</div>
          </div>
        </div>

        {/* RECENT PAYMENTS & ACTIONS */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Financial Insights</h3>
            <p style={{ fontSize: '13px', color: '#64748b' }}>Fee collection active sync linked with Supabase databases.</p>
          </div>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Recent Payments</h4>
            </div>
            {recentPayments.length === 0 ? (
              <span style={{ fontSize: '12px', color: '#64748b' }}>No recent payments recorded.</span>
            ) : (
              recentPayments.map((payment) => (
                <div key={payment.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: '12px' }}>
                  <span>{payment.studentName}</span>
                  <strong style={{ color: '#166534' }}>{payment.amount}</strong>
                </div>
              ))
            )}
          </div>
        </div>

        {/* BOTTOM TABLE: ACTIVE FEE STRUCTURES */}
        <div style={{ ...cardStyle, padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Active Fee Structures</h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Total: {feeStructuresList.length} structures defined</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 20px' }}>Category</th>
                  <th style={{ padding: '12px 20px' }}>Academic Year & Term</th>
                  <th style={{ padding: '12px 20px' }}>Base Amount</th>
                  <th style={{ padding: '12px 20px' }}>Notes / Description</th>
                  <th style={{ padding: '12px 20px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {feeStructuresList.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                      No fee structures created yet. Use "Fee Configuration" to add one.
                    </td>
                  </tr>
                ) : (
                  feeStructuresList.map((struct) => (
                    <tr key={struct.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 20px', fontWeight: 'bold', color: '#0f172a' }}>{struct.category}</td>
                      <td style={{ padding: '14px 20px', color: '#334155' }}>{struct.academic_year} • {struct.term}</td>
                      <td style={{ padding: '14px 20px', fontWeight: '900', color: '#1e40af' }}>GHS {Number(struct.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: '14px 20px', color: '#64748b' }}>{struct.notes || '—'}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' }}>
                          {struct.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* POPUP: CREATE FEE STRUCTURE MODAL */}
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
                      <option value="School Fees">School Fees</option>
                      <option value="ICT Levy">ICT Levy</option>
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

                {/* 2. Applicability Scope & Grades Rendering */}
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>2. APPLICABILITY SCOPE</div>
                
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>Select Scope Target:</div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', marginBottom: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input 
                        type="radio" 
                        name="scopeOpt"
                        checked={scopeType === 'all'} 
                        onChange={() => { setScopeType('all'); setSelectedGradeIds([]); }} 
                      /> All Students / Grades ({studentsList.length})
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input 
                        type="radio" 
                        name="scopeOpt"
                        checked={scopeType === 'grades'} 
                        onChange={() => { setScopeType('grades'); }} 
                      /> Specific Grades ({gradesList.length} available)
                    </label>
                  </div>

                  {scopeType === 'grades' && (
                    <div style={{ marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>Select grades to apply this fee to:</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {gradesList.map((grade) => {
                          const isSelected = selectedGradeIds.includes(grade.id);
                          return (
                            <button
                              key={grade.id}
                              type="button"
                              onClick={() => toggleGradeSelection(grade.id)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: isSelected ? '2px solid #002b49' : '1px solid #cbd5e1',
                                backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                                color: isSelected ? '#1e40af' : '#334155',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                              }}
                            >
                              {grade.name} {isSelected && '✓'}
                            </button>
                          );
                        })}
                        {gradesList.length === 0 && (
                          <span style={{ fontSize: '11px', color: '#64748b' }}>No grades found in system.</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Pricing & Rules */}
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#002b49', textTransform: 'uppercase', marginBottom: '10px' }}>3. PRICING & RULES</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Base Amount (GHS) * <span style={{ color: '#dc2626' }}>(Required)</span></label>
                    <input 
                      type="number" 
                      value={newFeeAmount}
                      onChange={(e) => setNewFeeAmount(e.target.value)}
                      placeholder="0.00" 
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#334155' }}>Late Fee Policy</label>
                    <input 
                      type="text"
                      value={lateFeePolicy}
                      onChange={(e) => setLateFeePolicy(e.target.value)}
                      placeholder="Policy notes..." 
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '4px', boxSizing: 'border-box' }} 
                    />
                  </div>
                </div>

              </div>

              <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setActiveModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSaveFeeStructure} disabled={savingStructure} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#002b49', fontSize: '13px', fontWeight: 'bold', color: '#ffffff', cursor: 'pointer', opacity: savingStructure ? 0.7 : 1 }}>
                  {savingStructure ? 'Saving...' : 'Save Structure'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};