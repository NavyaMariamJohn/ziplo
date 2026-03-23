// =========================
// UserFilters.jsx
// =========================

function UserFilters({ search, setSearch, role, setRole, status, setStatus }) {
  return (
    <div className="user-filters">
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="all">Role: All</option>
        <option value="admin">Admin</option>
        <option value="pro">Pro</option>
        <option value="free">Free</option>
      </select>

      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="all">Status: All</option>
        <option value="active">Active</option>
        <option value="suspended">Suspended</option>
      </select>
    </div>
  );
}

export default UserFilters;