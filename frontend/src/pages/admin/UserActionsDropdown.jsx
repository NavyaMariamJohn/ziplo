// =========================
// UserActionsDropdown.jsx
// =========================

import { useState } from "react";
import { fetchWithAuth } from "../../utils/api";
import UserEditModal from "./UserEditModal";
import UserLinksModal from "./UserLinksModal";

function UserActionsDropdown({ user, refreshUsers }) {
  const [open, setOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showLinks, setShowLinks] = useState(false);

  const toggleStatus = async () => {
    try {
      const action = user.is_active ? "suspend" : "activate";
      if (window.confirm(`Are you sure you want to ${action} ${user.username || user.email}?`)) {
        await fetchWithAuth(`/admin/users/${user.id}/toggle-status`, { method: "PUT" });
        refreshUsers();
        setOpen(false);
      }
    } catch (err) {
      console.error("Deactivate error:", err);
    }
  };

  const deleteUser = async () => {
    try {
      if (window.confirm(`PERMANENT: Delete ${user.username || user.email} and all their links?`)) {
        await fetchWithAuth(`/admin/users/${user.id}`, { method: "DELETE" });
        refreshUsers();
        setOpen(false);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="user-actions-dropdown">
      <button className="menu-trigger" onClick={() => setOpen((prev) => !prev)}>
        ⋮
      </button>

      {open && (
        <>
          <div className="dropdown-overlay" onClick={() => setOpen(false)} />
          <div className="dropdown-menu shadow">
            <button className="menu-item" onClick={() => { setShowEdit(true); setOpen(false); }}>
              <span className="icon">👁</span> View Profile
            </button>
            <button className="menu-item" onClick={() => { setShowEdit(true); setOpen(false); }}>
              <span className="icon">✏️</span> Edit
            </button>
            <button className="menu-item" onClick={() => { setShowLinks(true); setOpen(false); }}>
              <span className="icon">🔗</span> View Links
            </button>
            
            <button className="menu-item" onClick={toggleStatus}>
              <span className="icon">{user.is_active ? "⏸" : "▶️"}</span> 
              {user.is_active ? "Suspend" : "Activate"}
            </button>

            <div className="divider" />
            
            <button className="menu-item danger" onClick={deleteUser}>
              <span className="icon">🗑</span> Delete
            </button>
          </div>
        </>
      )}

      {showEdit && <UserEditModal user={user} onClose={() => setShowEdit(false)} refreshUsers={refreshUsers} />}
      {showLinks && <UserLinksModal user={user} onClose={() => setShowLinks(false)} />}
    </div>
  );
}

export default UserActionsDropdown;