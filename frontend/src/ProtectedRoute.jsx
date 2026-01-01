import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function ProtectedRoute({ children }) {
  const auth = useAuth();

  if (!auth.token) {
    // If there is no token, redirect to the /login page
    return <Navigate to="/login" />;
  }

  // If there is a token, display the page
  return children;
}

export default ProtectedRoute;