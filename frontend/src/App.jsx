import { Routes, Route } from 'react-router-dom';
import LoginPage         from './LoginPage';
import ProtectedRoute    from './ProtectedRoute';
import DashboardLayout   from './DashboardLayout';
import EmployeeTablePage from './EmployeeTablePage';
import LeaveBalancePage  from './LeaveBalancePage';
import AnalyticsPage     from './AnalyticsPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index        element={<EmployeeTablePage />} />
        <Route path="balances"  element={<LeaveBalancePage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
