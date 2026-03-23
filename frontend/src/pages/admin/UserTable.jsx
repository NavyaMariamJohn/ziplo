// =========================
// UserTable.jsx
// =========================

import UserRow from "./UserRow";

function UserTable({ users = [] }) {
  return (
    <div className="user-table">
      
      {/* TABLE HEADER */}
      <div className="table-header">
        <span>User</span>
        <span>Email</span>
        <span>Role</span>
        <span>Links</span>
        <span>Status</span>
        <span></span>
      </div>

      {/* EMPTY STATE */}
      {users.length === 0 ? (
        <p className="empty">No users found</p>
      ) : (
        users.map((user) => (
          <UserRow key={user._id} user={user} />
        ))
      )}

    </div>
  );
}

export default UserTable;