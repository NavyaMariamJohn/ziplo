// =========================
// UserFilters.jsx
// =========================

function UserFilters({ search, setSearch, role, setRole, status, setStatus }) {
  return (
    <div className="user-filters row shadow-sm">
      <div className="search-group">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="filters-group">
        <div className="filter-item">
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="all">All</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        <div className="filter-item">
          <label>Status:</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default UserFilters;