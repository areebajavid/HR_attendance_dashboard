import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function DashboardLayout() {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <main className="container">
      <nav>
        <ul><li><strong>Employee Dashboard</strong></li></ul>
        <ul><li><button className="secondary" onClick={handleLogout}>Logout</button></li></ul>
      </nav>
      
      {/* Child pages (table or chart) will be rendered here */}
      <Outlet /> 
    </main>
  );
}

export default DashboardLayout;