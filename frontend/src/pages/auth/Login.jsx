/**
 * @file Login.jsx
 * @description Authentication page: Login. Handles user login, registration, and related flows.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../utils/api";
import toast from "react-hot-toast";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({email, password })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // ✅ STORE DATA
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.username);
        localStorage.setItem("email", data.email);

        const role = data.role ? data.role.trim() : "user";
        localStorage.setItem("role", role);

        toast.success("Welcome back 🎉");

        // slight delay for UX
        setTimeout(() => {
          navigate(role === "admin" ? "/admin" : "/dashboard");
        }, 300);

      } else {
        toast.error(data.error || "Login failed");
      }

    } catch (err) {
      console.error(err);
      toast.error("Server connection failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">

      {/* 🔥 LEFT SIDE */}
      <div className="auth-left">
        <div className="auth-brand">Ziplo</div>

        <div className="auth-hero">
          <h2>Welcome back to Ziplo</h2>
          <p>
            Secure link intelligence starts here. Your data,
            your control, your insights — all in one place.
          </p>
        </div>
      </div>

      {/* 🔥 RIGHT SIDE */}
      <div className="auth-right">
        <div className="auth-card">

          <h2>Sign in</h2>
          <p className="subtitle">
            Enter your details to continue
          </p>

          <form onSubmit={handleLogin} className="auth-form">

            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@organization.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="auth-options">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <span className="forgot">Forgot password?</span>
            </div>

            <button
              type="submit"
              className="btn-primary full"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Sign In"}
            </button>

          </form>

          <div className="divider">or continue with</div>

          <div className="social-login">
            <button className="btn-outline">Google</button>
            <button className="btn-outline">GitHub</button>
          </div>

          <p className="bottom-text">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>

        </div>
      </div>

    </div>
  );
}

export default Login;