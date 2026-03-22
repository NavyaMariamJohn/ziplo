import { useState, useRef } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../utils/api";
import toast from "react-hot-toast";
import "./Settings.css";

function Settings() {
  const [name, setName] = useState(localStorage.getItem("userName") || "");
  const [avatar, setAvatar] = useState(localStorage.getItem("avatar") || "");
  const [email] = useState(localStorage.getItem("email") || "");
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [expiry, setExpiry] = useState("Never");
  const [notifications, setNotifications] = useState(true);

  const editRef = useRef(null);

  // 🔹 UPDATE PROFILE
  const handleUpdate = async () => {
    const token = localStorage.getItem("token");

    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setLoading(true);

    try {
      const res1 = await fetch(`${API}/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const res2 = await fetch(`${API}/update-avatar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar }),
      });

      if (!res1.ok || !res2.ok) {
        throw new Error("Update failed");
      }

      localStorage.setItem("userName", name);
      localStorage.setItem("avatar", avatar);

      toast.success("Profile updated!");
    } catch (err) {
      toast.error("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 SCROLL
  const handleScrollToEdit = () => {
    editRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 🔹 CHANGE PASSWORD
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All fields required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const token = localStorage.getItem("token");
    setPasswordLoading(true);

    try {
      const res = await fetch(`${API}/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.status === 401) {
        toast.error("Session expired. Please login again.");

        localStorage.clear();
        window.location.href = "/login";
        return;
      }
      if (res.ok) {
        toast.success(data.message || "Password updated");
        setShowModal(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Failed to update password");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setPasswordLoading(false);
    }
  };

  // 🔹 DELETE ACCOUNT (TEMP)
  const handleDelete = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account?"
    );

    if (confirmDelete) {
      toast.success("Account deleted (demo)");
    }
  };

  return (
    <DashboardLayout>
      <div className="settings-container">

        <h2 className="settings-title">Settings</h2>

        {/* PROFILE */}
        <div className="settings-card profile-card">
          <div className="profile-left">
            <img
              src={avatar || "https://via.placeholder.com/60"}
              alt="avatar"
              className="profile-avatar"
            />
            <div>
              <h4>{name}</h4>
              <p>{email}</p>
              <small>Member</small>
            </div>
          </div>

          <button
            className="btn btn-secondary"
            onClick={handleScrollToEdit}
          >
            Edit Profile
          </button>
        </div>

        {/* ACCOUNT */}
        <div className="settings-card">
          <h3>Account</h3>

          <div className="settings-group">
            <label>Email</label>
            <input value={email} disabled />
          </div>

          <div className="settings-group">
            <label>Password</label>
            <div className="password-row">
              <input value="••••••••••" disabled />
              <span
                className="change-link"
                onClick={() => setShowModal(true)}
              >
                Change →
              </span>
            </div>
          </div>
        </div>

        {/* EDIT PROFILE */}
        <div className="settings-card" ref={editRef}>
          <h3>Edit Profile</h3>

          <div className="settings-group">
            <label>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="settings-group">
            <label>Profile Picture URL</label>
            <input
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="Paste image URL"
            />
          </div>

          <button
            onClick={handleUpdate}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* PREFERENCES */}
        <div className="settings-card">
          <h3>Preferences</h3>

          <div className="settings-group row">
            <label>Default link expiry</label>
            <select
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
            >
              <option>Never</option>
              <option>24 Hours</option>
              <option>7 Days</option>
            </select>
          </div>

          <div className="settings-group row">
            <label>Weekly summary reports</label>

            <div
              className={`toggle ${notifications ? "active" : ""}`}
              onClick={() => {
                setNotifications(!notifications);
                toast.success(
                  notifications
                    ? "Notifications Off"
                    : "Notifications On"
                );
              }}
            >
              <div className="toggle-circle" />
            </div>
          </div>
        </div>

        {/* DANGER */}
        <div className="settings-card danger">
          <h3>Danger Zone</h3>

          <div className="danger-row">
            <div>
              <h4>Delete Account</h4>
              <p>This action cannot be undone</p>
            </div>

            <button
              className="btn btn-danger"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>

        {/* LOGOUT */}
        <div className="settings-actions">
          <button
            className="btn btn-secondary"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">

              <h3>Change Password</h3>

              <div className="settings-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="settings-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="settings-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-primary"
                  onClick={handleChangePassword}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? "Updating..." : "Update"}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default Settings;