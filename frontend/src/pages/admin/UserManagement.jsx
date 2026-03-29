// =========================
// UserManagement.jsx (FINAL REFINED)
// =========================

import { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import UserTable from "./UserTable";
import UserFilters from "./UserFilters";
import { fetchWithAuth } from "../../utils/api";
import "./UserManagement.css";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [stats, setStats] = useState(null);

  // 🔹 Fetch users (depends on filters)
  useEffect(() => {
    fetchUsers();
  }, [search, role, status, page]);

  // 🔹 Fetch stats ONLY once
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // ✅ Using server-side filtering + pagination
      const data = await fetchWithAuth(
        `/admin/users?search=${search}&role=${role}&status=${status}&page=${page}`
      );

      // ✅ Merging User's Mapping logic
      const mappedUsers = (data.users || []).map((u) => ({
        id: u.id,
        username: u.username || u.email,
        email: u.email,
        role: u.role || "user",
        is_active: u.is_active,
        status: u.is_active ? "active" : "suspended",
        linksCount: u.linksCount || 0,
      }));

      setUsers(mappedUsers);
      setTotalUsers(data.total || 0);
    } catch (err) {
      console.error("User fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await fetchWithAuth("/admin/user-stats");
      setStats(data);
    } catch (err) {
      console.error("Stats fetch error:", err);
    }
  };

  return (
    <DashboardLayout>
      <div className="admin-user-management">
        <header className="admin-header">
          <div className="title-group">
            <h1>User Management</h1>
          </div>
          <button className="add-user-btn">+ Add User</button>
        </header>

        {/* 🔥 STATS CARDS */}
        <div className="stats-grid">
          <div className="stat-card" onClick={() => { setRole("all"); setStatus("all"); setPage(1); }}>
            <p>Total Users</p>
            <h2>{stats ? stats.total_users : "..."}</h2>
          </div>
          <div className="stat-card green" onClick={() => { setStatus("active"); setPage(1); }}>
            <p>Active</p>
            <h2>{stats ? stats.active_users : "..."}</h2>
          </div>
          <div className="stat-card red" onClick={() => { setStatus("suspended"); setPage(1); }}>
            <p>Suspended</p>
            <h2>{stats ? stats.suspended_users : "..."}</h2>
          </div>
          <div className="stat-card blue" onClick={() => { setRole("admin"); setPage(1); }}>
            <p>Admins</p>
            <h2>{stats ? stats.admin_users : "..."}</h2>
          </div>
          <div className="stat-card yellow">
            <p>New (7 days)</p>
            <h2>{stats ? stats.new_users : "..."}</h2>
          </div>
        </div>

        <UserFilters
          search={search}
          setSearch={setSearch}
          role={role}
          setRole={setRole}
          status={status}
          setStatus={setStatus}
        />

        <div className="table-container shadow-sm">
          {loading ? (
            <div className="loading-state">
              <p>Loading users...</p>
            </div>
          ) : (
            <>
              {/* ✅ User's local filtering (as a safety layer) */}
              <UserTable
                users={users.filter((u) => {
                  return (
                    (role === "all" || u.role === role) &&
                    (status === "all" || u.status === status)
                  );
                })}
              />

              <footer className="table-footer">
                <div className="showing-text">
                  Showing {users.length > 0 ? (page - 1) * 10 + 1 : 0}-
                  {Math.min(page * 10, totalUsers)} of {totalUsers.toLocaleString()}
                </div>

                <div className="pagination">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>←</button>
                  <span className="page-nums">
                    <button className={page === 1 ? "active" : ""} onClick={() => setPage(1)}>1</button>
                    {page > 3 && <span>...</span>}
                    {page !== 1 && page !== Math.ceil(totalUsers / 10) && (
                      <button className="active">{page}</button>
                    )}
                    {page < Math.ceil(totalUsers / 10) - 2 && <span>...</span>}
                    {totalUsers > 10 && (
                      <button onClick={() => setPage(Math.ceil(totalUsers / 10))}>{Math.ceil(totalUsers / 10)}</button>
                    )}
                  </span>
                  <button onClick={() => setPage((p) => p + 1)} disabled={page * 10 >= totalUsers}>→</button>
                </div>
              </footer>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default UserManagement;