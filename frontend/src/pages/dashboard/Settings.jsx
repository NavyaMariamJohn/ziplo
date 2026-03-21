/**
 * @file Settings.jsx
 * @description Dashboard page: Settings. Standard user dashboard view for managing links and viewing analytics.
 */

import { useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../utils/api";
import toast from "react-hot-toast";
import "./Settings.css";

function Settings() {
  const [name, setName] = useState(localStorage.getItem("userName") || "");
  const [avatar, setAvatar] = useState(localStorage.getItem("avatar") || "");
  const [email] = useState(localStorage.getItem("email") || "");
  const [loading, setLoading] = useState(false);
  

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");

  setLoading(true);

  try {
    // 🔹 update name
    await fetch(`${API}/update-profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    // 🔹 update avatar
    await fetch(`${API}/update-avatar`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ avatar }),
    });

    // 🔥 save locally
    localStorage.setItem("userName", name);
    localStorage.setItem("avatar", avatar);

    toast.success("Profile updated!");

  } catch (err) {
    console.error(err);
    toast.error("Error updating profile");
  } finally {
    setLoading(false);
  }
};

  return (
    <DashboardLayout>
        <div className="settings-container">

          <h2 className="settings-title">Settings</h2>

          <div className="settings-card">

            {/* NAME */}
            <div className="settings-group">
              <label>Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* EMAIL (READ ONLY) */}
            <div className="settings-group">
              <label>Email</label>
              <input value={email} disabled />
            </div>
                {/* AVATAR */}
            <div className="settings-group">
                <label>Profile Picture URL</label>
                <input
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="Paste image URL"
                />
            </div>
            {/* BUTTONS */}
            <div className="settings-actions">
              <button
                onClick={handleUpdate}
                className="btn btn-primary"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>

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

          </div>

        </div>
    </DashboardLayout>
  );
}

export default Settings;