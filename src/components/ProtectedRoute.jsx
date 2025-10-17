import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ element: Element }) {
  const user = JSON.parse(localStorage.getItem('user'));
  const location = useLocation();

  // If no valid user token is found, redirect to login page
  if (!user || !user.token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Otherwise, render the protected component
  return <Element />;
}

export default ProtectedRoute;
