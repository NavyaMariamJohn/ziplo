/**
 * @file Register.jsx
 * @description Authentication page: Register
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../utils/api";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // 🔥 Password strength
  const getStrength = () => {
    if (password.length < 6) return "Weak";
    if (password.match(/[A-Z]/) && password.match(/[0-9]/)) return "Strong";
    return "Medium";
  };

  // 🔥 REGISTER HANDLER
  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: name,
          email,
          password,
        }),
      });

      const data = await res.json();

      // 🔥 HANDLE TOKEN EXPIRED / UNAUTHORIZED
      if (res.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }

      if (res.ok) {
        toast.success("Account created 🎉");

        // 🔥 AUTO LOGIN (MAIN FIX)
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.username);
        localStorage.setItem("email", data.email);
        localStorage.setItem("role", data.role || "user");

        // 🔥 REDIRECT
        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      } else {
        toast.error(data.error || "Registration failed");
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

      {/* LEFT */}
      <div className="auth-left">
        <div className="auth-brand">Ziplo</div>

        <div className="auth-hero">
          <h2>Create your Ziplo account</h2>
          <p>
            Start shortening links, tracking clicks,
            and gaining insights in seconds.
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="auth-right">
        <div className="auth-card">

          <h2>Create Account</h2>
          <p className="subtitle">Start shortening links in seconds</p>

          <form onSubmit={handleRegister} className="auth-form">

            {/* NAME */}
            <label>Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            {/* EMAIL */}
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@organization.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* PASSWORD */}
            <div className="form-group">
              <div className="label-row">
                <label>Password</label>
                {password && (
                  <span className={`strength-badge ${getStrength().toLowerCase()}`}>
                    {getStrength()}
                  </span>
                )}
              </div>
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="password-field">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* TERMS */}
            <label className="remember-me checkbox-label">
              <input type="checkbox" required />
              <span>I agree to Terms & Privacy Policy</span>
            </label>

            {/* BUTTON */}
            <button
              type="submit"
              className="btn-primary full"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>

          </form>

          <p className="bottom-text">
            Already have an account? <Link to="/login">Log in</Link>
          </p>

        </div>
      </div>

    </div>
  );
}

export default Register;