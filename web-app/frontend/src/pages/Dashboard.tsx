import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../services/supabase';

interface MonthPoint {
  month: string;
  attendance: number;
  fees: number;
}

interface ActivityItem {
  id: string;
  actor_name: string;
  action: string;
  created_at: string;
}

interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  action_label: string | null;
  priority: string | null;
  status: string;
  due_date: string | null;
}

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const relativeTime = (iso: string) => {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

export const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  const [studentCount, setStudentCount] = useState(0);
  const [studentActive, setStudentActive] = useState(0);
  const [studentInactive, setStudentInactive] = useState(0);

  const [teacherCount, setTeacherCount] = useState(0);
  const [teacherActive, setTeacherActive] = useState(0);
  const [teacherOnLeave, setTeacherOnLeave] = useState(0);

  const [parentCount, setParentCount] = useState(0);
  const [parentEngaged, setParentEngaged] = useState(0);
  const [parentUnresponsive, setParentUnresponsive] = useState(0);

  const [totalFeesDue, setTotalFeesDue] = useState(0);
  const [feesAffected, setFeesAffected] = useState(0);
  const [feesOverdue, setFeesOverdue] = useState(0);
  const [collectionRate, setCollectionRate] = useState(0);

  const [engagementBuckets, setEngagementBuckets] = useState<{ label: string; count: number }[]>([]);

  const [collected, setCollected] = useState(0);
  const [outstanding, setOutstanding] = useState(0);
  const [overdueAmount, setOverdueAmount] = useState(0);

  const [todayPresent, setTodayPresent] = useState(0);
  const [todayLate, setTodayLate] = useState(0);
  const [todayAbsent, setTodayAbsent] = useState(0);
  const [todayRate, setTodayRate] = useState(0);

  const [decliningCount, setDecliningCount] = useState(0);
  const [attendanceRiskCount, setAttendanceRiskCount] = useState(0);
  const [unresponsiveCount, setUnresponsiveCount] = useState(0);
  const [defaultRiskCount, setDefaultRiskCount] = useState(0);

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  const [chartData, setChartData] = useState<MonthPoint[]>([]);
  const [hasAcademicData] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchStudentMetrics(),
        fetchTeacherMetrics(),
        fetchParentMetrics(),
        fetchFeeMetrics(),
        fetchAttendanceToday(),
        fetchPriorityAttention(),
        fetchTasks(),
        fetchActivity(),
        fetchChartData(),
      ]);
    } catch (err: any) {
      console.error('Dashboard fetch error:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentMetrics = async () => {
    const { data, error, count } = await supabase.from('students').select('status', { count: 'exact' });
    if (error) { console.error(error.message); return; }
    const rows = (data || []) as { status: string | null }[];
    const total = count ?? rows.length;
    const active = rows.filter(r => (r.status || '').toLowerCase().includes('active')).length;
    setStudentCount(total);
    setStudentActive(active);
    setStudentInactive(Math.max(0, total - active));
  };

  const fetchTeacherMetrics = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('employment_status')
      .eq('role', 'teacher');
    if (error) { console.error(error.message); return; }
    const rows = (data || []) as { employment_status: string | null }[];
    const total = rows.length;
    const onLeave = rows.filter(r => (r.employment_status || '').toLowerCase().includes('leave')).length;
    const active = rows.filter(r => {
      const s = (r.employment_status || '').toLowerCase();
      return s === '' || s.includes('active') || s.includes('full');
    }).length;
    setTeacherCount(total);
    setTeacherActive(active);
    setTeacherOnLeave(onLeave);
  };

  const fetchParentMetrics = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('engagement')
      .eq('role', 'parent');
    if (error) { console.error(error.message); return; }
    const rows = (data || []) as { engagement: string | null }[];
    const total = rows.length;

    const buckets: Record<string, number> = {
      'Highly Engaged': 0,
      'Moderately Engaged': 0,
      'Low Engagement': 0,
      'None': 0,
    };

    rows.forEach(r => {
      const e = (r.engagement || '').toLowerCase();
      if (e.includes('high')) buckets['Highly Engaged']++;
      else if (e.includes('moderate')) buckets['Moderately Engaged']++;
      else if (e.includes('low')) buckets['Low Engagement']++;
      else buckets['None']++;
    });

    const engaged = buckets['Highly Engaged'] + buckets['Moderately Engaged'];
    const unresponsive = buckets['Low Engagement'] + buckets['None'];

    setParentCount(total);
    setParentEngaged(engaged);
    setParentUnresponsive(unresponsive);
    setUnresponsiveCount(unresponsive);

    setEngagementBuckets(Object.entries(buckets).map(([label, count]) => ({ label, count })));
  };

  const fetchFeeMetrics = async () => {
    const { data, error } = await supabase
      .from('fees')
      .select('balance, status, due_date');
    if (error) { console.error(error.message); return; }

    const rows = (data || []) as { balance: number | null; status: string | null; due_date: string | null }[];
    const today = startOfDay(new Date()).getTime();

    let totalBalance = 0;
    let affected = 0;
    let overdueCount = 0;
    let overdueSum = 0;

    rows.forEach(r => {
      const bal = Number(r.balance || 0);
      totalBalance += bal;
      if (bal > 0) affected++;
      const due = r.due_date ? new Date(r.due_date).getTime() : null;
      const s = (r.status || '').toLowerCase();
      const isOverdue = s.includes('overdue') || (due !== null && due < today && bal > 0);
      if (isOverdue) { overdueCount++; overdueSum += bal; }
    });

    setTotalFeesDue(totalBalance);
    setFeesAffected(affected);
    setFeesOverdue(overdueCount);
    setOutstanding(totalBalance);
    setOverdueAmount(overdueSum);
    setDefaultRiskCount(overdueCount);

    const totalExpected = totalBalance + (rows.filter(r => (r.status || '').toLowerCase().includes('paid')).reduce((a, r) => a + Number(r.balance || 0), 0));
    if (totalExpected > 0) {
      const paidAmount = totalExpected - totalBalance;
      setCollected(Math.max(0, paidAmount));
      setCollectionRate(Math.round((paidAmount / totalExpected) * 100));
    } else {
      setCollected(0);
      setCollectionRate(0);
    }
  };

  const fetchAttendanceToday = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('attendance')
      .select('status')
      .eq('date', today);
    if (error) { console.error(error.message); return; }

    const rows = (data || []) as { status: string | null }[];
    const present = rows.filter(r => r.status === 'Present').length;
    const late = rows.filter(r => r.status === 'Late').length;
    const absent = rows.filter(r => r.status === 'Absent').length + rows.filter(r => r.status === 'Excused').length;
    const total = rows.length;

    setTodayPresent(present);
    setTodayLate(late);
    setTodayAbsent(absent);
    setTodayRate(total > 0 ? Math.round(((present + late) / total) * 1000) / 10 : 0);
  };

  const fetchPriorityAttention = async () => {
    const { data: decRows } = await supabase
      .from('students')
      .select('academictrend');
    if (decRows) {
      const declining = (decRows as { academictrend: string | null }[])
        .filter(r => (r.academictrend || '').toLowerCase().includes('declin')).length;
      setDecliningCount(declining);
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const { data: absRows } = await supabase
      .from('attendance')
      .select('student_id, status')
      .gte('date', cutoff.toISOString().slice(0, 10))
      .in('status', ['Absent']);
    if (absRows) {
      const counts: Record<string, number> = {};
      (absRows as { student_id: string }[]).forEach(r => {
        counts[r.student_id] = (counts[r.student_id] || 0) + 1;
      });
      const atRisk = Object.values(counts).filter(v => v >= 3).length;
      setAttendanceRiskCount(atRisk);
    }
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, description, action_label, priority, status, due_date')
      .neq('status', 'Done')
      .order('created_at', { ascending: false })
      .limit(6);
    if (error) { console.error(error.message); return; }
    setTasks((data || []) as TaskItem[]);
  };

  const fetchActivity = async () => {
    const { data, error } = await supabase
      .from('activity_log')
      .select('id, actor_name, action, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    if (error) { console.error(error.message); return; }
    setActivity((data || []) as ActivityItem[]);
  };

  const fetchChartData = async () => {
    const now = new Date();
    const months: { key: string; label: string; start: Date; end: Date }[] = [];
    for (let i = 9; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      months.push({
        key: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
        label: start.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        start,
        end,
      });
    }

    const earliest = months[0].start.toISOString().slice(0, 10);

    const [attRes, feesRes] = await Promise.all([
      supabase.from('attendance').select('date, status').gte('date', earliest),
      supabase.from('fees').select('balance, due_date').gte('due_date', earliest),
    ]);

    const attByMonth: Record<string, { present: number; total: number }> = {};
    (attRes.data || []).forEach((r: any) => {
      const k = (r.date || '').slice(0, 7);
      if (!attByMonth[k]) attByMonth[k] = { present: 0, total: 0 };
      attByMonth[k].total++;
      if (r.status === 'Present' || r.status === 'Late') attByMonth[k].present++;
    });

    const feesByMonth: Record<string, number> = {};
    (feesRes.data || []).forEach((r: any) => {
      const k = (r.due_date || '').slice(0, 7);
      feesByMonth[k] = (feesByMonth[k] || 0) + Number(r.balance || 0);
    });

    const points: MonthPoint[] = months.map(m => {
      const a = attByMonth[m.key];
      return {
        month: m.label,
        attendance: a && a.total > 0 ? Math.round((a.present / a.total) * 100) : 0,
        fees: feesByMonth[m.key] || 0,
      };
    });

    setChartData(points);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = localStorage.getItem('user_first_name') || 'Admin';
    let g = 'Good day';
    if (hour < 12) g = 'Good morning';
    else if (hour < 17) g = 'Good afternoon';
    else g = 'Good evening';
    return `${g}, ${firstName}`;
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    boxSizing: 'border-box',
  };

  const totalEngagement = parentCount || 1;

  return (
    <AdminLayout>
      <div style={{
        padding: 'clamp(16px, 3vw, 30px)',
        maxWidth: '1600px',
        margin: '0 auto',
        fontFamily: "'Inter', sans-serif",
        boxSizing: 'border-box'
      }}>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '12px', marginBottom: '24px'
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>STUDENTS</div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>
                  {isLoading ? '…' : studentCount.toLocaleString()}
                </div>
              </div>
              <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                {studentInactive > 0 ? `${studentInactive} inactive` : 'All active'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b', marginTop: '12px' }}>
              <span><strong>{studentActive.toLocaleString()}</strong> Active</span>
              <span><strong>{studentInactive.toLocaleString()}</strong> Inactive</span>
            </div>
            <Link to="/students" style={{ display: 'inline-block', fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a', textDecoration: 'none', marginTop: '12px' }}>View Directory →</Link>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TEACHERS</div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>
                  {isLoading ? '…' : teacherCount.toLocaleString()}
                </div>
              </div>
              <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                {teacherCount > 0 ? 'Live' : '—'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b', marginTop: '12px' }}>
              <span><strong>{teacherActive}</strong> Active</span>
              <span><strong>{teacherOnLeave}</strong> On Leave</span>
            </div>
            <Link to="/teachers" style={{ display: 'inline-block', fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a', textDecoration: 'none', marginTop: '12px' }}>View Faculty →</Link>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PARENTS</div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>
                  {isLoading ? '…' : parentCount.toLocaleString()}
                </div>
              </div>
              <span style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                {parentCount > 0 ? `${Math.round((parentEngaged / parentCount) * 100)}% Active` : '—'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b', marginTop: '12px' }}>
              <span><strong>{parentEngaged}</strong> Engaged</span>
              <span><strong>{parentUnresponsive}</strong> Unresponsive</span>
            </div>
            <Link to="/parents" style={{ display: 'inline-block', fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a', textDecoration: 'none', marginTop: '12px' }}>View Parents →</Link>
          </div>

          <div style={{ ...cardStyle, backgroundColor: totalFeesDue > 0 ? '#fef2f2' : '#ffffff', borderColor: totalFeesDue > 0 ? '#fecaca' : '#e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: totalFeesDue > 0 ? '#991b1b' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>OUTSTANDING FEES</div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: totalFeesDue > 0 ? '#991b1b' : '#0f172a', marginTop: '4px' }}>
                  {isLoading ? '…' : `GH₵${totalFeesDue.toLocaleString()}`}
                </div>
              </div>
              <span style={{ backgroundColor: totalFeesDue > 0 ? '#fee2e2' : '#f1f5f9', color: totalFeesDue > 0 ? '#991b1b' : '#334155', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                {collectionRate}% Collection
              </span>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: totalFeesDue > 0 ? '#7f1d1d' : '#64748b', marginTop: '12px' }}>
              <span><strong>{feesAffected}</strong> Affected</span>
              <span><strong>{feesOverdue}</strong> Overdue</span>
            </div>
            <Link to="/finance" style={{ display: 'inline-block', fontSize: '12px', fontWeight: 'bold', color: totalFeesDue > 0 ? '#991b1b' : '#1e3a8a', textDecoration: 'none', marginTop: '12px' }}>View Finance →</Link>
          </div>

        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' }}>

          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#002b49" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Priority Attention</h3>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>System-detected issues requiring immediate action.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>Academic Performance</div>
                <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.4' }}>
                  {decliningCount > 0
                    ? <><strong>Evidence:</strong> {decliningCount} student{decliningCount === 1 ? '' : 's'} with declining academic trend.</>
                    : <span style={{ color: '#166534' }}>No declining students detected.</span>}
                </div>
                <button
                  disabled={decliningCount === 0}
                  style={{ marginTop: '12px', background: 'none', border: 'none', color: decliningCount > 0 ? '#1e3a8a' : '#94a3b8', fontWeight: 'bold', fontSize: '12px', cursor: decliningCount > 0 ? 'pointer' : 'not-allowed', padding: 0 }}>
                  Review Profiles →
                </button>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>Attendance Risk</div>
                <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.4' }}>
                  {attendanceRiskCount > 0
                    ? <><strong>Evidence:</strong> {attendanceRiskCount} student{attendanceRiskCount === 1 ? '' : 's'} with 3+ absences in the last 30 days.</>
                    : <span style={{ color: '#166534' }}>No attendance risks detected.</span>}
                </div>
                <button
                  disabled={attendanceRiskCount === 0}
                  style={{ marginTop: '12px', background: 'none', border: 'none', color: attendanceRiskCount > 0 ? '#1e3a8a' : '#94a3b8', fontWeight: 'bold', fontSize: '12px', cursor: attendanceRiskCount > 0 ? 'pointer' : 'not-allowed', padding: 0 }}>
                  Send Notices →
                </button>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>Parent Engagement</div>
                <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.4' }}>
                  {unresponsiveCount > 0
                    ? <><strong>Evidence:</strong> {unresponsiveCount} parent{unresponsiveCount === 1 ? '' : 's'} with low or no engagement.</>
                    : <span style={{ color: '#166534' }}>All parents are engaged.</span>}
                </div>
                <button
                  disabled={unresponsiveCount === 0}
                  style={{ marginTop: '12px', background: 'none', border: 'none', color: unresponsiveCount > 0 ? '#1e3a8a' : '#94a3b8', fontWeight: 'bold', fontSize: '12px', cursor: unresponsiveCount > 0 ? 'pointer' : 'not-allowed', padding: 0 }}>
                  Send SMS Reminder →
                </button>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a', marginBottom: '6px' }}>Fee Default Risk</div>
                <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.4' }}>
                  {defaultRiskCount > 0
                    ? <><strong>Evidence:</strong> {defaultRiskCount} account{defaultRiskCount === 1 ? '' : 's'} over 30 days past due. GH₵{overdueAmount.toLocaleString()} pending.</>
                    : <span style={{ color: '#166534' }}>No overdue accounts.</span>}
                </div>
                <button
                  disabled={defaultRiskCount === 0}
                  style={{ marginTop: '12px', background: 'none', border: 'none', color: defaultRiskCount > 0 ? '#1e3a8a' : '#94a3b8', fontWeight: 'bold', fontSize: '12px', cursor: defaultRiskCount > 0 ? 'pointer' : 'not-allowed', padding: 0 }}>
                  Initiate Recovery →
                </button>
              </div>

            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Action Center</h3>
              <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                {isLoading ? '…' : `${tasks.length} Task${tasks.length === 1 ? '' : 's'}`}
              </span>
            </div>

            {isLoading ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>Loading…</div>
            ) : tasks.length === 0 ? (
              <div style={{ padding: '30px 0', textAlign: 'center', color: '#64748b', fontSize: '12px', fontStyle: 'italic' }}>
                N/A (No pending tasks)
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
                {tasks.slice(0, 4).map((t, idx) => (
                  <div key={t.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    paddingBottom: idx === Math.min(tasks.length, 4) - 1 ? 0 : '10px',
                    borderBottom: idx === Math.min(tasks.length, 4) - 1 ? 'none' : '1px solid #f1f5f9',
                    gap: '8px'
                  }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{t.title}</div>
                      <div style={{ color: '#64748b' }}>{t.description || '—'}</div>
                    </div>
                    <button style={{
                      backgroundColor: t.priority === 'Critical' ? '#fee2e2' : '#e0e7ff',
                      color: t.priority === 'Critical' ? '#991b1b' : '#3730a3',
                      border: 'none', padding: '4px 10px', borderRadius: '6px',
                      fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap'
                    }}>
                      {t.action_label || 'Review'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        <div style={{ ...cardStyle, marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>School Performance Overview</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Attendance and fee trends across the last 10 months.</p>
            </div>
            <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
              {hasAcademicData ? '3 metrics' : '2 metrics tracked'}
            </span>
          </div>

          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="attendance" stroke="#6366f1" strokeWidth={2} dot={false} name="Attendance %" />
                <Line type="monotone" dataKey="fees" stroke="#ec4899" strokeWidth={2} dot={false} name="Outstanding Fees (GH₵)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px', marginTop: '12px', fontSize: '11px', fontWeight: 'bold' }}>
            <span style={{ color: '#6366f1' }}>— ATTENDANCE</span>
            <span style={{ color: '#ec4899' }}>— OUTSTANDING FEES</span>
            <span style={{ color: '#94a3b8', fontWeight: 'normal', fontStyle: 'italic' }}>
              Academics trend awaits grade history data.
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>

          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Parent Engagement</h3>
            {parentCount === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748b', fontSize: '12px', fontStyle: 'italic' }}>N/A (No parent data)</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
                {engagementBuckets.map((b, idx) => {
                  const pct = Math.round((b.count / totalEngagement) * 100);
                  const colors = ['#002b49', '#94a3b8', '#cbd5e1', '#f87171'];
                  return (
                    <div key={b.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
                        <span>{b.label}</span><span>{pct}%</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: colors[idx] || '#002b49' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Financial Health</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
                  <span>Collected</span><span>GH₵{collected.toLocaleString()}</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${collectionRate}%`, height: '100%', backgroundColor: '#002b49' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
                  <span>Outstanding</span><span>GH₵{outstanding.toLocaleString()}</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, outstanding > 0 ? 15 : 0)}%`, height: '100%', backgroundColor: '#cbd5e1' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
                  <span>Overdue (&gt;30 days)</span><span>GH₵{overdueAmount.toLocaleString()}</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, overdueAmount > 0 ? 6 : 0)}%`, height: '100%', backgroundColor: '#ef4444' }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Attendance Intelligence</h3>
              <div>
                <span style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>
                  {isLoading ? '…' : `${todayRate}%`}
                </span>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textAlign: 'right' }}>Overall Today</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px', textAlign: 'center' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Present</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>{todayPresent}</div>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Late</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#d97706' }}>{todayLate}</div>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Absent</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc2626' }}>{todayAbsent}</div>
              </div>
            </div>

            {attendanceRiskCount > 0 ? (
              <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '12px' }}>
                <strong>Pattern Detected:</strong> {attendanceRiskCount} student{attendanceRiskCount === 1 ? '' : 's'} with repeated absences in the last 30 days.
              </div>
            ) : (
              <div style={{ backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '8px', fontSize: '12px', color: '#166534' }}>
                No attendance patterns flagged.
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Recent Activity</h3>

            {isLoading ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>Loading…</div>
            ) : activity.length === 0 ? (
              <div style={{ padding: '30px 0', textAlign: 'center', color: '#64748b', fontSize: '12px', fontStyle: 'italic' }}>
                N/A (No activity recorded yet)
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
                {activity.map(a => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{a.actor_name || 'System'}</div>
                      <div style={{ color: '#64748b' }}>{a.action}</div>
                    </div>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>{relativeTime(a.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </AdminLayout>
  );
};