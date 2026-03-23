/**
 * @file DashboardNavbar.jsx
 * @description Global layout wrapper: DashboardNavbar. Defines the overall layout structure for specific sections (like Dashboard or full app).
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardNavbar.css";

function DashboardNavbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef();

  const name = localStorage.getItem("userName") || "User";
  const avatar = localStorage.getItem("avatar");
  const email = localStorage.getItem("email") || "user@email.com";

  // 🔥 Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <nav className="dashboard-navbar flex justify-between items-center">

      <div className="flex items-center gap-4">
        {/* ☰ TOGGLE BUTTON */}
        <button className="sidebar-toggle-btn" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        
        {/* 🔥 MOBILE LOGO */}
        <span className="navbar-logo-mobile">Ziplo</span>
      </div>

      {/* 👤 PROFILE */}
      <div className="profile-wrapper" ref={dropdownRef}>

        <div
          className="profile-avatar"
          onClick={() => setOpen(!open)}
        >
          {avatar ? (
            <img src={avatar} alt="avatar" />
          ) : (
            name[0].toUpperCase()
          )}
        </div>

        {/* 🔽 DROPDOWN */}
        {open && (
          <div className="profile-dropdown">

            {/* 👤 USER INFO */}
            <div className="dropdown-user">
              <div className="avatar-large">
                {avatar ? (
                  <img src={avatar} alt="avatar" />
                ) : (
                  name[0].toUpperCase()
                )}
              </div>

              <div>
                <p className="dropdown-name">{name}</p>
                <p className="dropdown-email">{email}</p>
              </div>
            </div>

            <hr />

            <button onClick={() => navigate("/settings")}>
              ⚙️ Settings
            </button>

            <button
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
              className="logout"
            >
              🚪 Logout
            </button>

          </div>
        )}
      </div>

    </nav>
  );
}

export default DashboardNavbar;