import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function LeaveBalancePage() {
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBalances = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/leave-balances');
                if (!response.ok) {
                    throw new Error('Data could not be fetched!');
                }
                const data = await response.json();
                setBalances(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBalances();
    }, []);

    if (loading) return <main className="container" aria-busy="true">Loading balances...</main>;
    if (error) return <main className="container">Error: {error}</main>;

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1>Annual Leave Balance Report ({new Date().getFullYear()})</h1>
                <Link to="/" role="button" style={{ textDecoration: 'none' }}>&larr; Back to Dashboard</Link>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Employee Name</th>
                            <th>EE ID</th>
                            <th>Earned Leave</th>
                            <th>Sick Leave</th>
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
                        {balances.map((employee) => (
                            <tr key={employee.id}>
                                <td>{employee.employee_name}</td>
                                <td>{employee.ee_id}</td>
                                <td>{employee.earned_leave}</td>
                                <td>{employee.sick_leave}</td>
                                <td>{employee.wfh}</td>
                                <td>{employee.comp_off}</td>
                                <td>{employee.lwp}</td>
                                <td>{employee.half_days}</td>
                                <td>{employee.maternity}</td>
                                <td>{employee.paternity}</td>
                                <td>{employee.mandatory_holiday}</td>
                                <td>{employee.optional_holiday}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default LeaveBalancePage;