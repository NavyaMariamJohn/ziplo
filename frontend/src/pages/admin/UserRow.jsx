// =========================
// UserRow.jsx
// =========================

import UserActionsDropdown from "./UserActionsDropdown";

function UserRow({ user }) {
  return (
    <div className="table-row">
      <div className="user-info">
        <div className="avatar">
          {user.name?.charAt(0)}
        </div>
        <span>{user.name}</span>
      </div>

      <span>{user.email}</span>
      <span className={`role ${user.role}`}>
        {user.role}
      </span>
      <span>{user.linksCount}</span>

      <span className={`status ${user.status}`}>
        ●
      </span>

      <UserActionsDropdown user={user} />
    </div>
  );
}

export default UserRow;