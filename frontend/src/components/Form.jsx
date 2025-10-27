// src/components/Form.jsx
import { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";

function Form({ route, method }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const name = method === "login" ? "Login" : "Register";

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
        // Store tokens
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);

        // Decode and redirect based on role
        const decoded = jwtDecode(res.data.access);
        localStorage.setItem("is_staff", decoded.is_staff);
        navigate(decoded.is_staff ? "/admin" : "/");
      } else {
        // Registration successful → go to login
        navigate("/login");
      }
    } catch (error) {
      alert("Error: " + (error.response?.data?.detail || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form-box">
        <h2>{name}</h2>

        <input
          className="form-input"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />

        <input
          className="form-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />

        {method === "register" && (
          <input
            className="form-input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            required
          />
        )}

        <button className="form-button" type="submit" disabled={loading}>
          {loading ? "Processing..." : name}
        </button>

        {method === "login" ? (
          <p className="form-switch">
            Don’t have an account? <Link to="/register">Register here</Link>
          </p>
        ) : (
          <p className="form-switch">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        )}
      </form>
    </div>
  );
}

export default Form;
