/**
 * @file Register.jsx
 * @description Authentication page: Register. Handles user login, registration, and related flows.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../utils/api";
import toast from "react-hot-toast";
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

  const getStrength = () => {
    if (password.length < 6) return "Weak";
    if (password.match(/[A-Z]/) && password.match(/[0-9]/)) return "Strong";
    return "Medium";
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: name, // ✅ FIXED
          email,
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Account created 🎉");

        // 🔥 AUTO LOGIN
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.username);
        localStorage.setItem("email", data.email);
        localStorage.setItem("role", data.role || "user");

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

            <label>Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@organization.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* PASSWORD */}
            <label>Password</label>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span onClick={() => setShowPassword(!showPassword)}>👁</span>
            </div>

            {/* STRENGTH */}
            <div className={`strength ${getStrength().toLowerCase()}`}>
              {getStrength()} Password
            </div>

            {/* CONFIRM */}
            <label>Confirm Password</label>
            <div className="password-field">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span onClick={() => setShowConfirm(!showConfirm)}>👁</span>
            </div>

            <label className="remember-me">
              <input type="checkbox" required />
              I agree to Terms & Privacy Policy
            </label>

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