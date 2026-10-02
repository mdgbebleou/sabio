import React from 'react';

export const AnalyticsPage: React.FC = () => {
  
  const handleDownloadPDF = () => {
    // Trigger direct download from Django REST API
    window.open('http://127.0.0.1:8000/api/academics/report-card/pdf/1/', '_blank');
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '30px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '26px', color: '#0f172a', fontWeight: '800' }}>Academic Analytics & Reports</h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>System-wide academic performance metrics & official document exports</p>
          </div>
          <button
            onClick={handleDownloadPDF}
            style={{
              backgroundColor: '#1e3a8a',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 20px',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(30,58,138,0.2)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download Sample PDF Report
          </button>
        </div>

        {/* Metric Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>TOTAL ENROLLED</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>450</div>
            <div style={{ fontSize: '12px', color: '#166534', marginTop: '4px', fontWeight: 'bold' }}>+5% from last term</div>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>OVERALL PASS RATE</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#1e3a8a', marginTop: '6px' }}>94.2%</div>
            <div style={{ fontSize: '12px', color: '#166534', marginTop: '4px', fontWeight: 'bold' }}>High Performance</div>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>AVERAGE SCORE</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>78.5%</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Across 8 subjects</div>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>TOP SUBJECT</div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#15803d', marginTop: '10px' }}>Science</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>84% Average</div>
          </div>
        </div>

        {/* Main Content Split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          {/* Grade Distribution Breakdown */}
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#0f172a', fontWeight: 'bold' }}>Grade Distribution</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { grade: 'Grade A (80-100%)', pct: 41, count: 185, color: '#1e3a8a' },
                { grade: 'Grade B (70-79%)', pct: 31, count: 140, color: '#2563eb' },
                { grade: 'Grade C (60-69%)', pct: 18, count: 80, color: '#0284c7' },
                { grade: 'Grade D (50-59%)', pct: 7, count: 30, color: '#f59e0b' },
                { grade: 'Grade F (0-49%)', pct: 3, count: 15, color: '#dc2626' }
              ].map((g) => (
                <div key={g.grade}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>
                    <span>{g.grade}</span>
                    <span>{g.count} Students ({g.pct}%)</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${g.pct}%`, backgroundColor: g.color, height: '100%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PDF Document Preview Card */}
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: 'bold' }}>Official PDF Report Card Generator</h3>
              </div>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>
                Generates official binary PDF report card files on demand using Django's ReportLab engine. The output document includes institutional letterheads, itemized subject grades, teacher comments, and validation signature fields.
              </p>
              
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '15px', marginTop: '15px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a', textTransform: 'uppercase' }}>Sample Document Info</div>
                <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: 'bold', marginTop: '4px' }}>ReportCard_Daniel_Mensah.pdf</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Format: A4 Standard • In-Memory Stream</div>
              </div>
            </div>

            <button
              onClick={handleDownloadPDF}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#1e3a8a',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                marginTop: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Generate & Download Report Card PDF
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};