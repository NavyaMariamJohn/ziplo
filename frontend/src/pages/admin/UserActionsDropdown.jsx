// =========================
// UserActionsDropdown.jsx
// =========================

import { useState } from "react";
import { fetchWithAuth } from "../../utils/api";

function UserActionsDropdown({ user }) {
  const [open, setOpen] = useState(false);

  const deactivateUser = async () => {
    try {
      if (window.confirm(`Are you sure you want to suspend ${user.username || user.email}?`)) {
        await fetchWithAuth(`/admin/users/${user.id}/deactivate`, { method: "PUT" });
        window.location.reload();
      }
    } catch (err) {
      console.error("Deactivate error:", err);
    }
  };

  const deleteUser = async () => {
    try {
      if (window.confirm(`PERMANENT: Delete ${user.username || user.email} and all their links?`)) {
        await fetchWithAuth(`/admin/users/${user.id}`, { method: "DELETE" });
        window.location.reload();
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
            <button className="menu-item"><span className="icon">👁</span> View Profile</button>
            <button className="menu-item"><span className="icon">✏️</span> Edit</button>
            <button className="menu-item"><span className="icon">🔗</span> View Links</button>
            
            <button className="menu-item" onClick={deactivateUser}>
              <span className="icon">⏸</span> Suspend
            </button>

            <div className="divider" />
            
            <button className="menu-item danger" onClick={deleteUser}>
              <span className="icon">🗑</span> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default UserActionsDropdown;