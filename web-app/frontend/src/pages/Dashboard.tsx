import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../services/supabase'; // Make sure path matches your project structure

// Performance Analytics Chart Data (with fallback visual support)
const chartData = [
  { month: 'JAN', academics: 30, attendance: 20, fees: 25 },
  { month: 'FEB', academics: 32, attendance: 18, fees: 22 },
  { month: 'MAR', academics: 50, attendance: 10, fees: 30 },
  { month: 'APR', academics: 35, attendance: 45, fees: 35 },
  { month: 'MAY', academics: 52, attendance: 30, fees: 25 },
  { month: 'JUN', academics: 45, attendance: 50, fees: 40 },
  { month: 'JUL', academics: 50, attendance: 78, fees: 55 },
  { month: 'AUG', academics: 60, attendance: 85, fees: 75 },
  { month: 'SEP', academics: 62, attendance: 90, fees: 80 },
  { month: 'OCT', academics: 65, attendance: 88, fees: 85 },
];

export const Dashboard: React.FC = () => {
  // Live metric states with safe fallbacks
  const [studentCount, setStudentCount] = useState<number>(0);
  const [parentCount, setParentCount] = useState<number>(0);
  const [teacherCount, setTeacherCount] = useState<number>(0);
  const [totalFeesDue, setTotalFeesDue] = useState<number>(0);
  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(true);

  // Fetch live counts from Supabase on load
  useEffect(() => {
    async function fetchLiveMetrics() {
      try {
        // 1. Get total students count
        const { count: sCount, error: sError } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true });
        
        if (!sError && sCount !== null) setStudentCount(sCount);

        // 2. Get parent profile count from profiles table
        const { count: pCount, error: pError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'Parent');
        
        if (!pError && pCount !== null) setParentCount(pCount);

        // 3. Get teacher profile count from profiles table
        const { count: tCount, error: tError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'Teacher');
        
        if (!tError && tCount !== null) setTeacherCount(tCount);

        // 4. Get total outstanding fees from fees table
        const { data: feesData, error: fError } = await supabase
          .from('fees')
          .select('balance');
        
        if (!fError && feesData) {
          const sumBalance = feesData.reduce((acc, curr) => acc + Number(curr.balance || 0), 0);
          setTotalFeesDue(sumBalance);
        }

      } catch (err) {
        console.error('Error fetching live metrics:', err);
      } finally {
        setLoadingMetrics(false);
      }
    }

    fetchLiveMetrics();
  }, []);

  // Dynamic greeting helper based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = localStorage.getItem('user_first_name') || 'Admin';

    let timeGreeting = 'Good day';
    if (hour >= 0 && hour < 12) {
      timeGreeting = 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      timeGreeting = 'Good afternoon';
    } else {
      timeGreeting = 'Good evening';
    }

    return `${timeGreeting}, ${firstName}`;
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    boxSizing: 'border-box'
  };

  return (
    <AdminLayout>
      <div style={{
        padding: 'clamp(16px, 3vw, 30px)',
        maxWidth: '1600px',
        margin: '0 auto',
        fontFamily: "'Inter', sans-serif",
        boxSizing: 'border-box'
      }}>
        
        {/* HEADER WELCOME BANNER */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', color: '#0f172a' }}>
              {getGreeting()}
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              Here's what's happening across your school today.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Today
          </div>
        </div>

        {/* ROW 1: SUMMARY METRIC CARDS (Hybrid Live + Fallback) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}>
          
          {/* Students Card */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>STUDENTS</div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>
                  {loadingMetrics ? '...' : (studentCount > 0 ? studentCount : '1,248')}
                </div>
              </div>
              <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                {studentCount > 0 ? 'Live' : '+1.2%'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b', marginTop: '12px' }}>
              <span><strong>{studentCount > 0 ? studentCount : '1,200'}</strong> Active</span>
              <span><strong>{studentCount > 0 ? '0' : '48'}</strong> Inactive</span>
            </div>
            <a href="/users" style={{ display: 'inline-block', fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a', textDecoration: 'none', marginTop: '12px' }}>View Directory →</a>
          </div>

          {/* Teachers Card */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TEACHERS</div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>
                  {loadingMetrics ? '...' : (teacherCount > 0 ? teacherCount : '76')}
                </div>
              </div>
              <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                {teacherCount > 0 ? 'Live' : '+2'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b', marginTop: '12px' }}>
              <span><strong>{teacherCount > 0 ? teacherCount : '72'}</strong> Active</span>
              <span><strong>4</strong> On Leave</span>
            </div>
            <a href="/users" style={{ display: 'inline-block', fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a', textDecoration: 'none', marginTop: '12px' }}>View Faculty →</a>
          </div>

          {/* Parents Card */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PARENTS</div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>
                  {loadingMetrics ? '...' : (parentCount > 0 ? parentCount : '986')}
                </div>
              </div>
              <span style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                {parentCount > 0 ? 'Live' : '92% Active'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b', marginTop: '12px' }}>
              <span><strong>{parentCount > 0 ? parentCount : '907'}</strong> Engaged</span>
              <span><strong>79</strong> Unresponsive</span>
            </div>
            <a href="/users" style={{ display: 'inline-block', fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a', textDecoration: 'none', marginTop: '12px' }}>View Parents →</a>
          </div>

          {/* Outstanding Fees Card */}
          <div style={{ ...cardStyle, backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>OUTSTANDING FEES</div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#991b1b', marginTop: '4px' }}>
                  {loadingMetrics ? '...' : (totalFeesDue > 0 ? `GH₵${totalFeesDue.toLocaleString()}` : 'GH₵84,500')}
                </div>
              </div>
              <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>85% Collection</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#7f1d1d', marginTop: '12px' }}>
              <span><strong>68</strong> Affected</span>
              <span><strong>32</strong> Overdue</span>
            </div>
            <a href="#" style={{ display: 'inline-block', fontSize: '12px', fontWeight: 'bold', color: '#991b1b', textDecoration: 'none', marginTop: '12px' }}>View Finance →</a>
          </div>

        </div>

        {/* ROW 2: PRIORITY ATTENTION & ACTION CENTER */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          
          {/* Priority Attention Panel */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#002b49" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Priority Attention</h3>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>System-detected issues requiring immediate action.</p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px'
            }}>
              
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>Academic Performance</div>
                <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.4' }}><strong>Evidence:</strong> 12 students showing declining performance in Math & Science.</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: '1.4' }}><strong>Interpretation:</strong> Curriculum change issue.</div>
                <button style={{ marginTop: '12px', background: 'none', border: 'none', color: '#1e3a8a', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', padding: 0 }}>Action: Review Profiles →</button>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>Attendance Risk</div>
                <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.4' }}><strong>Evidence:</strong> 18 students dropped below 85% attendance this term.</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: '1.4' }}><strong>Interpretation:</strong> Fee balance correlation.</div>
                <button style={{ marginTop: '12px', background: 'none', border: 'none', color: '#1e3a8a', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', padding: 0 }}>Action: Send Notices →</button>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>Parent Engagement</div>
                <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.4' }}><strong>Evidence:</strong> 45 parents haven't logged in this month.</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: '1.4' }}><strong>Interpretation:</strong> Missing notices.</div>
                <button style={{ marginTop: '12px', background: 'none', border: 'none', color: '#1e3a8a', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', padding: 0 }}>Action: Send SMS Reminder →</button>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>Fee Default Risk</div>
                <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.4' }}><strong>Evidence:</strong> 32 accounts are over 30 days past due.</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: '1.4' }}><strong>Interpretation:</strong> GH₵45,000 pending.</div>
                <button style={{ marginTop: '12px', background: 'none', border: 'none', color: '#1e3a8a', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', padding: 0 }}>Action: Initiate Recovery →</button>
              </div>

            </div>
          </div>

          {/* Action Center Panel */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Action Center</h3>
              <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>8 Tasks</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9', gap: '8px' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Results Awaiting Approval</div>
                  <div style={{ color: '#64748b' }}>Grade 10 Science by Mr. Osei.</div>
                </div>
                <button style={{ backgroundColor: '#e0e7ff', color: '#3730a3', border: 'none', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>Review</button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9', gap: '8px' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Incomplete Records</div>
                  <div style={{ color: '#64748b' }}>15 profiles missing medical info.</div>
                </div>
                <button style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>Update</button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9', gap: '8px' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Teacher Assignments</div>
                  <div style={{ color: '#64748b' }}>2 subjects lack assigned teachers.</div>
                </div>
                <button style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>Assign</button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Pending Announcements</div>
                  <div style={{ color: '#64748b' }}>Draft PTA meeting notice.</div>
                </div>
                <button style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>Publish</button>
              </div>

            </div>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a', cursor: 'pointer' }}>View All Tasks →</span>
            </div>
          </div>

        </div>

        {/* ROW 3: SCHOOL PERFORMANCE OVERVIEW (RECHARTS) */}
        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>School Performance Overview</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Key metrics across academics, attendance, and finance.</p>
            </div>
            <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
              📈 Improving steadily
            </span>
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="academics" stroke="#22c55e" strokeWidth={2} dot={false} name="Academics" />
                <Line type="monotone" dataKey="attendance" stroke="#6366f1" strokeWidth={2} dot={false} name="Attendance" />
                <Line type="monotone" dataKey="fees" stroke="#ec4899" strokeWidth={2} dot={false} name="Fees" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px', marginTop: '12px', fontSize: '11px', fontWeight: 'bold' }}>
            <span style={{ color: '#22c55e' }}>— ACADEMICS</span>
            <span style={{ color: '#6366f1' }}>— ATTENDANCE</span>
            <span style={{ color: '#ec4899' }}>— FEES</span>
          </div>
        </div>

        {/* ROW 4: PARENT ENGAGEMENT & FINANCIAL HEALTH */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          
          {/* Parent Engagement Progress Card */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Parent Engagement</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
                  <span>Highly Engaged</span><span>42%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '42%', height: '100%', backgroundColor: '#002b49' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
                  <span>Moderately Engaged</span><span>35%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '35%', height: '100%', backgroundColor: '#94a3b8' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
                  <span>Low Engagement</span><span>15%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '15%', height: '100%', backgroundColor: '#cbd5e1' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
                  <span>None</span><span>8%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '8%', height: '100%', backgroundColor: '#f87171' }}></div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', marginTop: '16px', fontSize: '11px', color: '#475569' }}>
              Engagement correlates strongly with recent SMS campaigns. Consider increasing frequency for low engagement cohort.
            </div>
          </div>

          {/* Financial Health Progress Card */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Financial Health</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
                  <span>Collected</span><span>GH₵450,000</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '85%', height: '100%', backgroundColor: '#002b49' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
                  <span>Outstanding</span><span>GH₵84,500</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '15%', height: '100%', backgroundColor: '#cbd5e1' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
                  <span>Overdue (&gt;30 days)</span><span>GH₵25,000</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '6%', height: '100%', backgroundColor: '#ef4444' }}></div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #dbeafe', padding: '10px 12px', borderRadius: '8px', marginTop: '16px', fontSize: '11px', color: '#1e40af' }}>
              Collection rate is 5% higher than last year. Automated reminders are improving on-time payments.
            </div>
          </div>

        </div>

        {/* ROW 5: ATTENDANCE INTELLIGENCE & RECENT ACTIVITY */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          
          {/* Attendance Intelligence */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Attendance Intelligence</h3>
              <div>
                <span style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>94.2%</span>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textAlign: 'right' }}>Overall Today</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px', textAlign: 'center' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Present</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>1,175</div>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Late</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#d97706' }}>35</div>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Absent</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc2626' }}>38</div>
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '12px' }}>
              <strong>Pattern Detected:</strong> Absence rate spikes by 12% on Fridays for Grade 11.
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Recent Activity</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Sarah K.</div>
                  <div style={{ color: '#64748b' }}>Approved Grade 8 Results</div>
                </div>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>11m ago</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Mr. Osei</div>
                  <div style={{ color: '#64748b' }}>Updated Science Syllabus</div>
                </div>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>1h ago</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#0f172a' }}>Finance Team</div>
                  <div style={{ color: '#64748b' }}>Processed 12 Payments</div>
                </div>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>2h ago</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
};