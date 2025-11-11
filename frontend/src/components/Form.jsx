// src/components/Form.jsx
import { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { Bike, Mail, Lock } from "lucide-react";
import "../styles/Form.css";

function Form({ route, method }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const name = method === "login" ? "Sign In" : "Register";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (method === "register" && password !== confirmPassword) {
      alert("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post(route, { username, password });
      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);

        const decoded = jwtDecode(res.data.access);
        localStorage.setItem("is_staff", decoded.is_staff);
        navigate(decoded.is_staff ? "/dashboard" : "/home");
      } else {
        navigate("/login");
      }
    } catch (error) {
      alert("Error: " + (error.response?.data?.detail || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="smartbi-container">
      <div className="smartbi-card">
        <div className="smartbi-header">
          <div className="smartbi-icon">
            <Bike size={32} color="#2563eb" />
          </div>
          <h1 className="smartbi-title">SmartBI</h1>
          <p className="smartbi-subtitle">Student Bike Renting at VIT Chennai</p>
        </div>

        <div className="smartbi-tabs">
          <Link
            to="/login"
            className={`smartbi-tab ${method === "login" ? "active" : ""}`}
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className={`smartbi-tab ${method === "register" ? "active" : ""}`}
          >
            Register
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="smartbi-form">
          <div className="smartbi-input-box">
            <Mail size={18} className="smartbi-icon-input" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Email address"
              required
            />
          </div>

          <div className="smartbi-input-box">
            <Lock size={18} className="smartbi-icon-input" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>

          {method === "register" && (
            <div className="smartbi-input-box">
              <Lock size={18} className="smartbi-icon-input" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
              />
            </div>
          )}

          <button className="smartbi-button" type="submit" disabled={loading}>
            {loading ? "Processing..." : name}
          </button>

        </form>
      </div>
    </div>
  );
}

export default Form;
