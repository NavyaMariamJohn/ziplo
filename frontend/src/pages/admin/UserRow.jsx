// =========================
// UserRow.jsx
// =========================

import UserActionsDropdown from "./UserActionsDropdown";

function UserRow({ user }) {
  const status = user.is_active ? "active" : "suspended";
  const initials = user.username
    ? user.username.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "?";

  return (
    <div className="table-row">
      <div className="user-info col-user">
        <div className={`avatar-box ${user.role?.toLowerCase()}`}>
          {initials}
        </div>
        <div className="name-wrap">
          <span className="user-name">{user.username}</span>
          <span className="user-id">#{String(user.id).substring(0, 6)}</span>
        </div>
      </div>

      <span className="col-email">{user.email}</span>
      <span className="col-role">
        <span className={`role-badge ${user.role?.toLowerCase()}`}>
          {user.role}
        </span>
      </span>
      <span className="col-links">{user.linksCount || 0}</span>
      <span className="col-status">
        <span className={`status-dot ${status}`}>●</span>
      </span>

      <div className="col-actions">
        <UserActionsDropdown user={user} />
      </div>
    </div>
  );
}

export default UserRow;