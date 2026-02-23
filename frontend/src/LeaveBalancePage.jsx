import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function BalanceCell({ value }) {
  if (!value || value === 0) return <td className="balance-cell zero">—</td>;
  const cls = value >= 10 ? 'high' : value >= 5 ? 'mid' : 'low';
  return <td className="balance-cell"><span className={cls}>{value}</span></td>;
}

function LeaveBalancePage() {
  const { authFetch } = useAuth();
  const [balances, setBalances]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [search, setSearch]           = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetting, setResetting]     = useState(false);

  const loadBalances = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/api/leave-balances`);
      if (!res.ok) throw new Error('Could not load leave balances.');
      setBalances(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBalances(); }, []);

  const handleReset = async () => {
    setResetting(true);
    try {
      const res = await authFetch(`${API}/api/leaves/reset`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to reset.');
      setShowConfirm(false);
      await loadBalances();
    } catch (err) {
      alert(err.message);
    } finally {
      setResetting(false);
    }
  };

  const filtered = balances.filter(b =>
    b.employee_name.toLowerCase().includes(search.toLowerCase()) ||
    String(b.ee_id).includes(search)
  );

  if (loading) return (
    <div className="state-container">
      <div className="spinner" />
      <span className="state-text">Loading leave balances…</span>
    </div>
  );

  if (error) return (
    <div className="state-container">
      <span className="state-icon">😕</span>
      <span className="state-text">{error}</span>
    </div>
  );

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Leave Balances</h1>
        <p className="page-subtitle">Annual leave usage per employee — {new Date().getFullYear()}</p>
      </div>

      <div className="card">
        <div className="card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div className="card-title">Employee Leave Summary</div>
            <div className="card-subtitle">{filtered.length} of {balances.length} employees</div>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="🔍  Search by name or ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                height: 36, padding: '0 0.75rem',
                border: '1px solid var(--cream-border)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.82rem',
                background: 'var(--cream)',
                outline: 'none',
                width: '220px',
              }}
            />
            <button
              className="btn"
              onClick={() => setShowConfirm(true)}
              style={{
                background: 'var(--coral-light)', color: 'var(--coral)',
                border: '1px solid var(--coral)', fontWeight: 600,
              }}
            >
              🗑️ Reset All Data
            </button>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>EE ID</th>
                <th title="Earned Leave">EL</th>
                <th title="Sick Leave">SL</th>
                <th>WFH</th>
                <th>Comp Off</th>
                <th>LWP</th>
                <th>Half Days</th>
                <th>Maternity</th>
                <th>Paternity</th>
                <th>Mandatory Hol.</th>
                <th>Optional Hol.</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
                <tr key={emp.id}>
                  <td><span className="emp-name">{emp.employee_name}</span></td>
                  <td><span className="emp-id-badge">{emp.ee_id}</span></td>
                  <BalanceCell value={emp.earned_leave} />
                  <BalanceCell value={emp.sick_leave} />
                  <BalanceCell value={emp.wfh} />
                  <BalanceCell value={emp.comp_off} />
                  <BalanceCell value={emp.lwp} />
                  <BalanceCell value={emp.half_days} />
                  <BalanceCell value={emp.maternity} />
                  <BalanceCell value={emp.paternity} />
                  <BalanceCell value={emp.mandatory_holiday} />
                  <BalanceCell value={emp.optional_holiday} />
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', color: 'var(--slate-xlight)', padding: '2rem' }}>
                    {search ? `No employees match "${search}"` : 'No leave data recorded yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
              <button
                className="btn btn-outline"
                onClick={() => setShowConfirm(false)}
                disabled={resetting}
              >
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

export default LeaveBalancePage;
