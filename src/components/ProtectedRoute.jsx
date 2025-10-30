// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element: Element }) => {
  const user = localStorage.getItem("user");
  if (!user) {
    return <Navigate to="/" replace />;
  }
  // Element may be a component or a function returning component
  if (typeof Element === "function") {
    return <Element />;
  }
  return <Element />;
};

export default ProtectedRoute;
