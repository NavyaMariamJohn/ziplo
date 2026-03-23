// =========================
// UserActionsDropdown.jsx
// =========================

import { useState } from "react";

function UserActionsDropdown({ user }) {
  const [open, setOpen] = useState(false);

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
            <button className="menu-item"><span className="icon">⏸</span> Suspend</button>
            <div className="divider" />
            <button className="menu-item danger"><span className="icon">🗑</span> Delete</button>
          </div>
        </>
      )}
    </div>
  );
}

export default UserActionsDropdown;