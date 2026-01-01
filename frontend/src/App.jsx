import { Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from './DashboardLayout'; // Import the new layout
import EmployeeTablePage from './EmployeeTablePage'; // Import the renamed page
import LeaveChart from './LeaveChart'; // Import the chart

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* This is a nested route structure */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* The default page shown inside the layout */}
        <Route index element={<EmployeeTablePage />} /> 
        {/* The chart page, also shown inside the layout */}
        <Route path="chart" element={<LeaveChart />} /> 
      </Route>
    </Routes>
  );
}

export default App;