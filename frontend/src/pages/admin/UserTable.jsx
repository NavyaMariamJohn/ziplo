// =========================
// UserTable.jsx
// =========================

import UserRow from "./UserRow";

function UserTable({ users = [] }) {
  return (
    <div className="user-table">
      
      {/* TABLE HEADER */}
      <div className="table-header">
        <span className="col-user">USER</span>
        <span className="col-email">EMAIL</span>
        <span className="col-role">ROLE</span>
        <span className="col-links">LINKS</span>
        <span className="col-status">STATUS</span>
        <span className="col-actions"></span>
      </div>

      {/* EMPTY STATE */}
      {users.length === 0 ? (
        <p className="empty">No users found</p>
      ) : (
        users.map((user) => (
          <UserRow key={user.id} user={user} />
        ))
      )}

    </div>
  );
}

export default UserTable;