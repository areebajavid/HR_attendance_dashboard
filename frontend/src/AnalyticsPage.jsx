import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const PALETTE = [
  '#6B9E78', '#E8846A', '#D4A843', '#8B7EC8',
  '#5B9BD5', '#E06B9A', '#4ABFA3', '#D4845A',
];

function AnalyticsPage() {
  const { authFetch } = useAuth();
  const [summary,     setSummary]     = useState([]);
  const [balances,    setBalances]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetting,   setResetting]   = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, b] = await Promise.all([
        authFetch(`${API}/api/leaves/summary`).then(r => r.json()),
        authFetch(`${API}/api/leave-balances`).then(r => r.json()),
      ]);
      setSummary(s);
      setBalances(b);
    } catch {
      setError('Could not load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleReset = async () => {
    setResetting(true);
    try {
      const res = await authFetch(`${API}/api/leaves/reset`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to reset.');
      setShowConfirm(false);
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setResetting(false);
    }
  };

  if (loading) return (
    <div className="state-container">
      <div className="spinner" />
      <span className="state-text">Loading analytics…</span>
    </div>
  );

  if (error) return (
    <div className="state-container">
      <span className="state-icon">😕</span>
      <span className="state-text">{error}</span>
    </div>
  );

  const totalLeaves = summary.reduce((acc, s) => acc + Number(s.count), 0);
  const sorted      = [...summary].sort((a, b) => b.count - a.count);
  const maxCount    = sorted[0]?.count || 1;
  const topLeave    = sorted[0];
  const total       = totalLeaves || 1;

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Leave distribution and patterns across your team — {new Date().getFullYear()}</p>
        </div>
        <button
          className="btn"
          onClick={() => setShowConfirm(true)}
          style={{
            background: 'var(--coral-light)', color: 'var(--coral)',
            border: '1px solid var(--coral)', fontWeight: 600, marginTop: '0.25rem',
          }}
        >
          🗑️ Reset All Data
        </button>
      </div>

      {/* ── Stat strip ── */}
      <div className="stat-strip">
        <div className="stat-card">
          <div className="stat-icon sage">📊</div>
          <div>
            <div className="stat-value">{totalLeaves}</div>
            <div className="stat-label">Total Leaves (YTD)</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon coral">🏆</div>
          <div>
            <div className="stat-value" style={{ fontSize: '1rem', paddingTop: 4 }}>
              {topLeave ? topLeave.leave_type.split(' - ')[0].split(' ')[0] : '—'}
            </div>
            <div className="stat-label">Most Common Leave</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">🗂️</div>
          <div>
            <div className="stat-value">{summary.length}</div>
            <div className="stat-label">Leave Types Used</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon lavender">👤</div>
          <div>
            <div className="stat-value">{balances.length}</div>
            <div className="stat-label">Employees Tracked</div>
          </div>
        </div>
      </div>

      {/* ── Charts grid ── */}
      <div className="charts-grid">

        {/* Bar chart */}
        <div className="chart-card full-width">
          <div className="chart-title">Leave Type Breakdown</div>
          <div className="chart-subtitle">Total instances of each leave category recorded this year</div>
          <div className="bar-chart">
            {sorted.map((item, i) => {
              const pct = Math.round((item.count / maxCount) * 100);
              return (
                <div className="bar-row" key={item.leave_type}>
                  <div className="bar-label" title={item.leave_type}>
                    {item.leave_type.length > 22 ? item.leave_type.slice(0, 22) + '…' : item.leave_type}
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${pct}%`, background: PALETTE[i % PALETTE.length] }} />
                  </div>
                  <div className="bar-count">{item.count}</div>
                </div>
              );
            })}
            {sorted.length === 0 && (
              <div style={{ color: 'var(--slate-xlight)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
                No leave data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Distribution legend */}
        <div className="chart-card">
          <div className="chart-title">Distribution Share</div>
          <div className="chart-subtitle">Percentage of each leave type out of all recorded leaves</div>
          <div className="donut-wrap" style={{ flexDirection: 'column', gap: '0.6rem' }}>
            {sorted.map((item, i) => {
              const pct = Math.round((item.count / total) * 100);
              return (
                <div className="legend-item" key={item.leave_type}>
                  <div className="legend-dot" style={{ background: PALETTE[i % PALETTE.length] }} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--slate)' }}>{item.leave_type}</span>
                  <span className="legend-pct">{pct}%</span>
                </div>
              );
            })}
            {sorted.length === 0 && (
              <div style={{ color: 'var(--slate-xlight)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                No data yet.
              </div>
            )}
          </div>
        </div>

        {/* Top leave takers */}
        <div className="chart-card">
          <div className="chart-title">Top Leave Takers</div>
          <div className="chart-subtitle">Employees with the highest total leave usage this year</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {balances
              .map(emp => ({
                ...emp,
                total:
                  (emp.earned_leave || 0) + (emp.sick_leave || 0) + (emp.wfh || 0) +
                  (emp.comp_off || 0) + (emp.lwp || 0) + (emp.maternity || 0) +
                  (emp.paternity || 0) + (emp.mandatory_holiday || 0) +
                  (emp.optional_holiday || 0) + (emp.half_days ? emp.half_days * 0.5 : 0),
              }))
              .filter(emp => emp.total > 0)
              .sort((a, b) => b.total - a.total)
              .slice(0, 8)
              .map((emp, i, arr) => {
                const maxTotal = arr[0]?.total || 1;
                const pct = Math.round((emp.total / maxTotal) * 100);
                return (
                  <div className="bar-row" key={emp.id}>
                    <div className="bar-label" title={emp.employee_name} style={{ textAlign: 'left', width: 110 }}>
                      {emp.employee_name.split(' ')[0]}
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${pct}%`, background: PALETTE[i % PALETTE.length] }} />
                    </div>
                    <div className="bar-count">{emp.total}</div>
                  </div>
                );
              })}
            {balances.filter(e => (e.earned_leave||0)+(e.sick_leave||0)+(e.wfh||0) > 0).length === 0 && (
              <div style={{ color: 'var(--slate-xlight)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                No data yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Confirm Dialog ── */}
      {showConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(74,85,104,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999, backdropFilter: 'blur(2px)',
        }}>
          <div style={{
            background: 'white', borderRadius: 'var(--radius-xl)',
            padding: '2rem', maxWidth: '420px', width: '90%',
            boxShadow: 'var(--shadow-lg)', textAlign: 'center',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--slate)', marginBottom: '0.5rem' }}>
              Reset All Leave Data?
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-light)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              This will <strong>permanently delete all leave records</strong> from the database.
              Employee list will remain intact. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setShowConfirm(false)} disabled={resetting}>
                Cancel
              </button>
              <button
                className="btn"
                onClick={handleReset}
                disabled={resetting}
                style={{ background: 'var(--coral)', color: 'white' }}
              >
                {resetting ? 'Deleting…' : 'Yes, Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AnalyticsPage;
