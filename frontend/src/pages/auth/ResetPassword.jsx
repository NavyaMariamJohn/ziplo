import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../utils/api";
import toast from "react-hot-toast";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Password reset successful ✅");

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        toast.error(data.error || "Error");
      }

    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setLoading(false); // ✅ always runs
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-right">
        <div className="auth-card">
          <h2>Reset Password</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="Enter new password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button className="btn-primary full" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;