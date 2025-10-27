import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants.js";

function ProtectedRoute({ children, requireAdmin = false }) {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    auth().catch(() => setIsAuthorized(false));
  }, []);

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    try {
      const res = await api.post("/api/token/refresh/", { refresh: refreshToken });
      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      setIsAuthorized(true);
    } catch (error) {
      setIsAuthorized(false);
    }
  };

  const auth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      setIsAuthorized(false);
      return;
    }

    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;

    if (decoded.exp < now) {
      await refreshToken();
    } else {
      const isStaff = decoded.is_staff;
      if (requireAdmin && !isStaff) {
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
      }
    }
  };

  if (isAuthorized === null) return <div>Loading...</div>;

  return isAuthorized ? children : <Navigate to="/unauthorized" />;
}

export default ProtectedRoute;
