import React, { useState } from 'react';

interface Ward {
  id: number;
  name: string;
  class_name: string;
  admission_number: string;
  avatar: string;
  average: number;
  trend: string;
  attendance_rate: number;
  outstanding_fees: number;
  total_fees: number;
  paid_fees: number;
  unread_messages: number;
  subjects: { name: string; score: number }[];
}

export const ParentPortalPage: React.FC = () => {
  const wardsList: Ward[] = [
    {
      id: 1,
      name: 'Daniel Mensah',
      class_name: 'JHS 2',
      admission_number: 'BFA-2026-0142',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=60',
      average: 78,
      trend: '+2%',
      attendance_rate: 94,
      outstanding_fees: 1250,
      total_fees: 5000,
      paid_fees: 3750,
      unread_messages: 3,
      subjects: [
        { name: 'Mathematics', score: 82 },
        { name: 'English Language', score: 76 },
        { name: 'Integrated Science', score: 79 }
      ]
    },
    {
      id: 2,
      name: 'Abena Mensah',
      class_name: 'Primary 5',
      admission_number: 'BFA-2026-0218',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=60',
      average: 85,
      trend: '+5%',
      attendance_rate: 98,
      outstanding_fees: 0,
      total_fees: 4000,
      paid_fees: 4000,
      unread_messages: 1,
      subjects: [
        { name: 'Mathematics', score: 90 },
        { name: 'English Language', score: 84 },
        { name: 'Natural Science', score: 88 }
      ]
    },
    {
      id: 3,
      name: 'Kumi Mensah',
      class_name: 'Nursery 2',
      admission_number: 'BFA-2026-0301',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
      average: 92,
      trend: '+1%',
      attendance_rate: 96,
      outstanding_fees: 500,
      total_fees: 2500,
      paid_fees: 2000,
      unread_messages: 0,
      subjects: [
        { name: 'Numeracy', score: 95 },
        { name: 'Literacy', score: 90 },
        { name: 'Creative Arts', score: 92 }
      ]
    }
  ];

  const [selectedWard, setSelectedWard] = useState<Ward>(wardsList[0]);
  const [showBottomSheet, setShowBottomSheet] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'Home' | 'Academics' | 'Fees' | 'Messages' | 'More'>('Home');

  return (
    <div style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', display: 'flex', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 20px 10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#002b49', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '12px' }}>B</div>
            <span style={{ fontWeight: 'bold', color: '#002b49', fontSize: '16px' }}>Bright Academy</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#6c757d' }}>Good morning,</div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#002b49' }}>Adzovi</div>
            </div>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <span style={{ fontSize: '18px' }}>🔔</span>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e53e3e' }}></div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px 20px' }}>
          
          {/* Ward Card Trigger */}
          <div 
            onClick={() => setShowBottomSheet(true)}
            style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', margin: '10px 0 20px 0' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={selectedWard.avatar} alt={selectedWard.name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#1e293b', fontWeight: 'bold' }}>{selectedWard.name}</h3>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px', alignItems: 'center' }}>
                  <span style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>{selectedWard.class_name}</span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{selectedWard.admission_number}</span>
                </div>
              </div>
            </div>
            <span style={{ fontSize: '16px', color: '#64748b' }}>▼</span>
          </div>

          {/* Metric Cards Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{selectedWard.average}%</span>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#166534', backgroundColor: '#dcfce7', padding: '2px 6px', borderRadius: '10px' }}>{selectedWard.trend}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontWeight: '500' }}>Current Average</div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{selectedWard.attendance_rate}%</span>
                <span style={{ fontSize: '14px', color: '#166534' }}>🛡️</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontWeight: '500' }}>Attendance</div>
            </div>
          </div>

          {/* Metric Cards Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: '#fff5f5', padding: '16px', borderRadius: '16px', border: '1px solid #ffe3e3' }}>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#991b1b' }}>GHS {selectedWard.outstanding_fees.toLocaleString()}</div>
              <div style={{ fontSize: '12px', color: '#991b1b', marginTop: '4px', fontWeight: '600' }}>Outstanding</div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9', position: 'relative' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>{selectedWard.unread_messages}</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontWeight: '500' }}>Unread Messages</div>
              {selectedWard.unread_messages > 0 && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e53e3e' }}></div>
              )}
            </div>
          </div>

          {/* Academic Performance Card */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a', fontWeight: 'bold' }}>Academic Performance</h4>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a8a' }}>{selectedWard.average}%</span>
            </div>
            
            <span style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '10px' }}>Good Progress</span>
            
            <div style={{ backgroundColor: '#e2e8f0', height: '6px', borderRadius: '3px', margin: '12px 0 16px 0', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#059669', height: '100%', width: `${selectedWard.average}%` }}></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
              {selectedWard.subjects.map((sub, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#475569' }}>{sub.name}</span>
                  <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{sub.score}%</span>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', pt: '10px', borderTop: '1px solid #f1f5f9' }}>
              <a href="#academics" style={{ fontSize: '12px', color: '#1e3a8a', fontWeight: 'bold', textDecoration: 'none' }}>View Academic Performance →</a>
            </div>
          </div>

          {/* School Fees Card */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#0f172a', fontWeight: 'bold' }}>School Fees</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
              <span>Total: GHS {selectedWard.total_fees.toLocaleString()}</span>
              <span style={{ color: '#1e3a8a', fontWeight: 'bold' }}>Paid: GHS {selectedWard.paid_fees.toLocaleString()}</span>
            </div>

            <div style={{ backgroundColor: '#e2e8f0', height: '6px', borderRadius: '3px', marginBottom: '14px', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#1e3a8a', height: '100%', width: `${(selectedWard.paid_fees / selectedWard.total_fees) * 100}%` }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ fontSize: '13px', color: '#475569', fontWeight: '500' }}>Outstanding Balance</span>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#7f1d1d' }}>GHS {selectedWard.outstanding_fees.toLocaleString()}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '10px' }}>
              <button style={{ padding: '10px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '10px', color: '#1e293b', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>View Fees</button>
              <button style={{ padding: '10px', backgroundColor: '#1e3a8a', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Make Payment</button>
            </div>
          </div>

        </div>

        {/* Bottom Sheet Modal Matching Figma */}
        {showBottomSheet && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div style={{ backgroundColor: '#fff', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '20px', boxShadow: '0 -10px 30px rgba(0,0,0,0.15)' }}>
              
              {/* Handle bar */}
              <div style={{ width: '40px', height: '4px', backgroundColor: '#cbd5e1', borderRadius: '2px', margin: '0 auto 15px auto' }}></div>
              
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#0f172a', fontWeight: 'bold' }}>Select Child</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' }}>Choose a child to view their school information.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {wardsList.map((ward) => {
                  const isSelected = ward.id === selectedWard.id;
                  return (
                    <div
                      key={ward.id}
                      onClick={() => setSelectedWard(ward)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'space-between',
                        padding: '12px 16px',
                        borderRadius: '16px',
                        border: isSelected ? '2px solid #1e3a8a' : '1px solid #f1f5f9',
                        backgroundColor: isSelected ? '#eff6ff' : '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={ward.avatar} alt={ward.name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a' }}>{ward.name}</div>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
                            <span style={{ backgroundColor: '#e2e8f0', color: '#475569', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>{ward.class_name}</span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>ID: {ward.admission_number}</span>
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#1e3a8a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>✓</div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setShowBottomSheet(false)}
                style={{ width: '100%', padding: '14px', backgroundColor: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Bottom Mobile Tab Bar */}
        <div style={{ height: '65px', borderTop: '1px solid #e2e8f0', backgroundColor: '#fff', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', alignItems: 'center', textAlign: 'center' }}>
          <div onClick={() => setActiveTab('Home')} style={{ cursor: 'pointer', color: activeTab === 'Home' ? '#1e3a8a' : '#64748b' }}>
            <div style={{ fontSize: '18px' }}>🏠</div>
            <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Home</div>
          </div>
          <div onClick={() => setActiveTab('Academics')} style={{ cursor: 'pointer', color: activeTab === 'Academics' ? '#1e3a8a' : '#64748b' }}>
            <div style={{ fontSize: '18px' }}>🎓</div>
            <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Academics</div>
          </div>
          <div onClick={() => setActiveTab('Fees')} style={{ cursor: 'pointer', color: activeTab === 'Fees' ? '#1e3a8a' : '#64748b' }}>
            <div style={{ fontSize: '18px' }}>💵</div>
            <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Fees</div>
          </div>
          <div onClick={() => setActiveTab('Messages')} style={{ cursor: 'pointer', color: activeTab === 'Messages' ? '#1e3a8a' : '#64748b', position: 'relative' }}>
            <div style={{ fontSize: '18px' }}>✉️</div>
            <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Messages</div>
          </div>
          <div onClick={() => setActiveTab('More')} style={{ cursor: 'pointer', color: activeTab === 'More' ? '#1e3a8a' : '#64748b' }}>
            <div style={{ fontSize: '18px' }}>☰</div>
            <div style={{ fontSize: '10px', fontWeight: 'bold' }}>More</div>
          </div>
        </div>

      </div>
    </div>
  );
};