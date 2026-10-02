import React, { useState } from 'react';
import { AccountantLayout } from '../components/AccountantLayout';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

interface FeeStructureRecord {
  id: string;
  feeStructure: string;
  academicYear: string;
  term: string;
  className: string;
  numberOfFeeItems: number;
  totalAmount: string;
  studentsAssigned: number;
  status: 'Active' | 'Draft';
}

const feeOverviewData = [
  { class: 'JHS 1', amount: 3800 },
  { class: 'JHS 2', amount: 4500 },
  { class: 'JHS 3', amount: 5000 },
  { class: 'SHS 1', amount: 5500 },
  { class: 'SHS 2', amount: 4800 },
  { class: 'SHS 3', amount: 4200 },
];

const mockFeeStructures: FeeStructureRecord[] = [
  { id: '1', feeStructure: 'JHS 2 - Second Term', academicYear: '2025/2026', term: 'Second Term', className: 'JHS 2', numberOfFeeItems: 4, totalAmount: 'GHS 2,450', studentsAssigned: 42, status: 'Active' },
  { id: '2', feeStructure: 'JHS 3 - Second Term', academicYear: '2025/2026', term: 'Second Term', className: 'JHS 3', numberOfFeeItems: 5, totalAmount: 'GHS 5,000', studentsAssigned: 38, status: 'Active' },
  { id: '3', feeStructure: 'SHS 1 - Second Term', academicYear: '2025/2026', term: 'Second Term', className: 'SHS 1', numberOfFeeItems: 6, totalAmount: 'GHS 5,500', studentsAssigned: 51, status: 'Draft' },
];

export const AccountantStructures: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [overviewTab, setOverviewTab] = useState<'Current Term' | 'Previous Term' | 'Academic Year'>('Current Term');

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    boxSizing: 'border-box',
  };

  return (
    <AccountantLayout>
      <div style={{ padding: 'clamp(16px, 3vw, 30px)', maxWidth: '1600px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
        
        {/* PAGE HEADER & TERM SELECTORS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
              Fee Structures
            </h1>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Define and manage the fees students are expected to pay by class and term.</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>
              <option>2025/2026</option>
            </select>
            <select style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>
              <option>Second Term</option>
            </select>
          </div>
        </div>

        {/* 4 SUMMARY METRIC CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          
          <div style={cardStyle}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Active Fee Structures</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>18</div>
            <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', display: 'inline-block', marginTop: '8px' }}>
              Across all classes
            </span>
          </div>

          <div style={cardStyle}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Classes With Fees Assigned</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>12</div>
            <span style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', display: 'inline-block', marginTop: '8px' }}>
              Currently configured
            </span>
          </div>

          <div style={cardStyle}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Total Fee Categories</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>8</div>
            <span style={{ backgroundColor: '#fdf4ff', color: '#86198f', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', display: 'inline-block', marginTop: '8px' }}>
              Active categories
            </span>
          </div>

          <div style={cardStyle}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Average Term Fee</span>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>GHS 4,250</div>
            <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>Across configured classes</span>
          </div>

        </div>

        {/* OVERVIEW SECTION & CHART */}
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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feeOverviewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="class" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px', border: 'none' }} />
                  <Bar dataKey="amount" fill="#002b49" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
              <button style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Academic Year</button>
              <button style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Term</button>
              <button style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Class</button>
              <button style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12px', fontWeight: 'bold', color: '#334155', cursor: 'pointer' }}>Status</button>
              <button style={{ border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', color: '#64748b', cursor: 'pointer' }}>Clear Filters</button>
            </div>
          </div>
        </div>

        {/* FEE STRUCTURES TABLE */}
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
                </tr>
              </thead>
              <tbody>
                {mockFeeStructures.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 20px', fontWeight: 'bold', color: '#002b49' }}>{item.feeStructure}</td>
                    <td style={{ padding: '12px 20px', color: '#334155' }}>{item.academicYear}</td>
                    <td style={{ padding: '12px 20px', color: '#334155' }}>{item.term}</td>
                    <td style={{ padding: '12px 20px', color: '#334155', fontWeight: 'bold' }}>{item.className}</td>
                    <td style={{ padding: '12px 20px', color: '#334155', textAlign: 'center' }}>{item.numberOfFeeItems}</td>
                    <td style={{ padding: '12px 20px', fontWeight: 'bold', color: '#0f172a' }}>{item.totalAmount}</td>
                    <td style={{ padding: '12px 20px', color: '#334155', textAlign: 'center' }}>{item.studentsAssigned}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ 
                        backgroundColor: item.status === 'Active' ? '#dcfce7' : '#f1f5f9', 
                        color: item.status === 'Active' ? '#166534' : '#475569', 
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
            <div>Showing <strong>1 to 3</strong> of <strong>18 entries</strong></div>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155' }}>Prev</button>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer' }}>1</button>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155' }}>2</button>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', color: '#334155' }}>Next</button>
            </div>
          </div>

        </div>

      </div>
    </AccountantLayout>
  );
};