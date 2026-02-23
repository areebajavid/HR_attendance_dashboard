import { useState, useEffect, useRef, useCallback } from 'react';
import { CSVLink } from 'react-csv';
import { useAuth } from './AuthContext';

const LEAVE_TYPES = [
  'Select…',
  'Earned Leave - EL',
  'Sick Leave - SL',
  'Mandatory Holiday',
  'Optional Holiday - OH',
  'Comp Off',
  'LWP',
  'WFH',
  'Maternity',
  'Paternity',
  'Earned Leave - EL (0.5)',
  'Sick Leave - SL(0.5)',
];

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`toast ${type}`}>
      {type === 'success' ? '✅' : '⚠️'} {message}
    </div>
  );
}

function EmployeeTablePage() {
  const { authFetch } = useAuth();
  const [employees, setEmployees]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [globalDate, setGlobalDate] = useState('');
  const [csvReport, setCsvReport]   = useState(null);
  const [toasts, setToasts]         = useState([]);
  const [saving, setSaving]         = useState(false);
  const csvLinkRef = useRef();

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
  };

  const removeToast = (id) => setToasts(t => t.filter(x => x.id !== id));

  // Fetch all employees + merge in any saved leaves for the given date
  const fetchEmployeesForDate = useCallback(async (date) => {
    setLoading(true);
    try {
      // Fetch all employees and that day's saved leaves in parallel
      const [empRes, leaveRes] = await Promise.all([
        authFetch(`${API}/api/employees`),
        authFetch(`${API}/api/leaves/by-date?date=${date}`),
      ]);

      if (!empRes.ok) throw new Error('Could not load employees.');

      const empData   = await empRes.json();
      const leaveData = leaveRes.ok ? await leaveRes.json() : [];

      // Build a map of employee_id -> leave_type from saved records
      const leaveMap = {};
      leaveData.forEach(l => {
        // by-date returns ee_id not employee id, so match by ee_id
        leaveMap[l.ee_id] = l.leave_type;
      });

      // Merge: pre-populate selectedLeaveType from saved data
      setEmployees(empData.map(emp => ({
        ...emp,
        selectedLeaveType: leaveMap[emp.ee_id] || '',
      })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  // On mount — set today and fetch
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setGlobalDate(today);
    fetchEmployeesForDate(today);
  }, []);

  // When date changes — re-fetch saved leaves for that date
  const handleDateChange = (newDate) => {
    setGlobalDate(newDate);
    fetchEmployeesForDate(newDate);
  };

  const handleLeaveTypeChange = (id, value) => {
    setEmployees(prev =>
      prev.map(emp =>
        emp.id === id
          ? { ...emp, selectedLeaveType: value === 'Select…' ? '' : value }
          : emp
      )
    );
  };

  const markedCount = employees.filter(e => e.selectedLeaveType).length;

  const handleBatchSave = async () => {
    const leaves = employees
      .filter(e => e.selectedLeaveType)
      .map(e => ({ employee_id: e.id, leave_date: globalDate, leave_type: e.selectedLeaveType }));

    if (leaves.length === 0) {
      addToast('No leaves marked to save.', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await authFetch(`${API}/api/leaves/batch`, {
        method: 'POST',
        body: JSON.stringify({ leaves }),
      });
      if (!res.ok) throw new Error('Failed to save.');
      addToast(`${leaves.length} leave record${leaves.length > 1 ? 's' : ''} saved successfully!`);
      fetchEmployeesForDate(globalDate);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await authFetch(`${API}/api/leaves/by-date?date=${globalDate}`);
      if (!res.ok) throw new Error('Could not fetch report.');
      const data = await res.json();
      if (data.length === 0) {
        addToast('No leave records found for this date.', 'error');
        return;
      }
      const headers = [
        { label: 'Employee ID',   key: 'ee_id' },
        { label: 'Employee Name', key: 'employee_name' },
        { label: 'Department',    key: 'department' },
        { label: 'Position',      key: 'position_title' },
        { label: 'Leave Type',    key: 'leave_type' },
      ];
      setCsvReport({ data, headers, filename: `Leave_Report_${globalDate}.csv` });
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  useEffect(() => {
    if (csvReport && csvLinkRef.current) {
      csvLinkRef.current.link.click();
      setCsvReport(null);
    }
  }, [csvReport]);

  const totalEmp     = employees.length;
  const todayOnLeave = markedCount;

  // "Who is out" — employees with a leave selected
  const outToday = employees.filter(e => e.selectedLeaveType);

  if (loading) return (
    <div className="state-container">
      <div className="spinner" />
      <span className="state-text">Loading attendance…</span>
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
      {/* ── Page header ── */}
      <div className="page-header">
        <h1 className="page-title">Daily Attendance</h1>
        <p className="page-subtitle">
          {new Date(globalDate + 'T00:00:00').toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      {/* ── Stat strip ── */}
      <div className="stat-strip">
        <div className="stat-card">
          <div className="stat-icon sage">👥</div>
          <div>
            <div className="stat-value">{totalEmp}</div>
            <div className="stat-label">Total Employees</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon coral">🏖️</div>
          <div>
            <div className="stat-value">{todayOnLeave}</div>
            <div className="stat-label">On Leave</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">💼</div>
          <div>
            <div className="stat-value">{totalEmp - todayOnLeave}</div>
            <div className="stat-label">Present</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon lavender">📅</div>
          <div>
            <div className="stat-value">
              {new Date(globalDate + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
            </div>
            <div className="stat-label">Selected Date</div>
          </div>
        </div>
      </div>

      {/* ── Who is out today ── */}
      {outToday.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <div>
              <div className="card-title">🏖️ Who's Out</div>
              <div className="card-subtitle">{outToday.length} employee{outToday.length > 1 ? 's' : ''} on leave for this date</div>
            </div>
          </div>
          <div style={{ padding: '1rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {outToday.map(emp => (
              <div key={emp.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'var(--cream)', border: '1px solid var(--cream-border)',
                borderRadius: 'var(--radius-md)', padding: '0.4rem 0.85rem',
              }}>
                <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--slate)' }}>
                  {emp.employee_name}
                </span>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 600, padding: '2px 7px',
                  borderRadius: '20px', background: 'var(--coral-light)', color: 'var(--coral)',
                }}>
                  {emp.selectedLeaveType}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Main card ── */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Employee Leave Entry</div>
            <div className="card-subtitle">
              Change date to view or edit any past day's records
            </div>
          </div>
          <div className="toolbar">
            <label className="date-label" htmlFor="gDate">Date</label>
            <input
              type="date"
              id="gDate"
              value={globalDate}
              onChange={e => handleDateChange(e.target.value)}
            />
            <button className="btn btn-outline" onClick={handleDownload}>
              ⬇️ Export CSV
            </button>
            <button
              className="btn btn-primary"
              onClick={handleBatchSave}
              disabled={saving || markedCount === 0}
            >
              {saving ? 'Saving…' : `💾 Save${markedCount > 0 ? ` (${markedCount})` : ''}`}
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>EE ID</th>
                <th>Department</th>
                <th>Reporting Manager</th>
                <th>Position</th>
                <th>Leave Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id}>
                  <td><span className="emp-name">{emp.employee_name}</span></td>
                  <td><span className="emp-id-badge">{emp.ee_id}</span></td>
                  <td><span className="dept-pill">{emp.department}</span></td>
                  <td>{emp.reporting_manager}</td>
                  <td>{emp.position_title}</td>
                  <td>
                    <select
                      className={emp.selectedLeaveType ? 'has-value' : ''}
                      value={emp.selectedLeaveType || ''}
                      onChange={e => handleLeaveTypeChange(emp.id, e.target.value)}
                    >
                      {LEAVE_TYPES.map(lt => (
                        <option key={lt} value={lt}>{lt}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hidden CSV trigger */}
      {csvReport && (
        <CSVLink {...csvReport} ref={csvLinkRef} target="_blank" style={{ display: 'none' }} />
      )}

      {/* Toast notifications */}
      <div className="toast-wrap">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </>
  );
}

export default EmployeeTablePage;
