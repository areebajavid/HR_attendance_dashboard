import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CSVLink } from 'react-csv';

// This list now contains your exact leave types, plus a default "Select" option.
const LEAVE_TYPES = ['Select...', 'Earned Leave - EL', 'Sick Leave - SL', 'Mandatory Holiday', 'Optional Holiday - OH', 'Comp Off', 'LWP', 'WFH', 'Maternity', 'Paternity', 'Earned Leave - EL (0.5)', 'Sick Leave - SL(0.5)'];

function EmployeeTablePage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalDate, setGlobalDate] = useState('');
  const [csvReport, setCsvReport] = useState(null);
  const csvLinkRef = useRef();

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/employees');
      if (!response.ok) throw new Error('Data could not be fetched!');
      const data = await response.json();
      const employeesWithLeaveFields = data.map(emp => ({ ...emp, selectedLeaveType: '' }));
      setEmployees(employeesWithLeaveFields);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getToday = () => new Date().toISOString().split('T')[0];
    setGlobalDate(getToday());
    fetchEmployees();
  }, []);

  const handleLeaveTypeChange = (employeeId, newLeaveType) => {
    // If the user selects the default "Select..." option, treat it as an empty string
    const leaveTypeToSet = newLeaveType === 'Select...' ? '' : newLeaveType;
    setEmployees(employees.map(emp => emp.id === employeeId ? { ...emp, selectedLeaveType: leaveTypeToSet } : emp));
  };

  const handleBatchSave = async () => {
    const leavesToSave = employees.filter(emp => emp.selectedLeaveType).map(emp => ({
      employee_id: emp.id,
      leave_date: globalDate,
      leave_type: emp.selectedLeaveType,
    }));
    if (leavesToSave.length === 0) return alert('No leaves have been marked to save.');
    try {
      const response = await fetch('http://localhost:3001/api/leaves/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaves: leavesToSave })
      });
      if (!response.ok) throw new Error('Failed to save leaves.');
      alert('All leaves saved successfully!');
      fetchEmployees();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/leaves/by-date?date=${globalDate}`);
      if (!response.ok) throw new Error('Could not fetch report data.');
      const data = await response.json();
      if (data.length === 0) return alert('No leave records found for the selected date.');
      
      const headers = [
        { label: "Employee ID", key: "ee_id" }, { label: "Employee Name", key: "employee_name" },
        { label: "Department", key: "department" }, { label: "Position", key: "position_title" },
        { label: "Leave Type", key: "leave_type" }
      ];
      setCsvReport({ data, headers, filename: `Leave_Report_${globalDate}.csv` });
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    if (csvReport && csvLinkRef.current) {
      csvLinkRef.current.link.click();
      setCsvReport(null);
    }
  }, [csvReport]);

  if (loading) return <main className="container" aria-busy="true">Loading...</main>;
  if (error) return <main className="container">Error: {error}</main>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <label htmlFor="globalDate">
          <strong>Select Date for Leave Entry:</strong>
          <input type="date" id="globalDate" value={globalDate} onChange={(e) => setGlobalDate(e.target.value)} style={{ maxWidth: '200px', marginTop: '0.5rem' }}/>
        </label>
        <button onClick={handleDownload}>Download Report</button>
      </div>
      <div className="table-container">
        <table className="employee-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>EE ID</th>
              <th>Department</th>
              <th>Reporting Manager</th>
              <th>Position Title</th>
             
              <th>Mark Leaves</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.employee_name}</td>
                <td>{employee.ee_id}</td>
                <td>{employee.department}</td>
                <td>{employee.reporting_manager}</td>
                <td>{employee.position_title}</td>
                
                <td>
                  {/* === THIS IS THE ONLY CHANGE I MADE === */}
                  <select
                    value={employee.selectedLeaveType || ''}
                    onChange={(e) => handleLeaveTypeChange(employee.id, e.target.value)}
                  >
                    {LEAVE_TYPES.map(leaveType => (
                      <option key={leaveType} value={leaveType}>
                        {leaveType}
                      </option>
                    ))}
                  </select>
                  {/* === END OF CHANGE === */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {csvReport && <CSVLink {...csvReport} ref={csvLinkRef} target="_blank" style={{ display: 'none' }} />}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button onClick={handleBatchSave} style={{ minWidth: '200px' }}>Save All Changes</button>
      </div>
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <Link to="/chart">View Leave Summary Chart &rarr;</Link>
      </div>
    </>
  );
}

export default EmployeeTablePage;