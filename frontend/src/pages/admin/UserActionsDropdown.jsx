// =========================
// UserActionsDropdown.jsx
// =========================

import { useState } from "react";

function UserActionsDropdown({ user }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="dropdown">
      <button onClick={() => setOpen((prev) => !prev)}>
        ⋮
      </button>

      {open && (
        <div className="dropdown-menu">
          <p>👁 View Profile</p>
          <p>✏️ Edit</p>
          <p>🔗 View Links</p>
          <p>⏸ Suspend</p>
          <p className="danger">🗑 Delete</p>
        </div>
      )}
    </div>
  );
}

export default UserActionsDropdown;