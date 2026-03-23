// =========================
// UserManagement.jsx (REFINED)
// =========================

import { useEffect, useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import DashboardNavbar from "../../layout/DashboardNavbar";
import DashboardLayout from "../../layout/DashboardLayout";
import UserTable from "./UserTable";
import UserFilters from "./UserFilters";
import { fetchWithAuth } from "../../utils/api";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(false); // ✅ added

  useEffect(() => {
    fetchUsers();
  }, [search, role, status]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(
        `/admin/users?search=${search}&role=${role}&status=${status}`
      );
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <DashboardLayout>
      <div className="admin-container">
        <div className="admin-header">
          <h2>User Management</h2>
          <button className="add-user-btn">+ Add User</button>
        </div>

        <UserFilters
          search={search}
          setSearch={setSearch}
          role={role}
          setRole={setRole}
          status={status}
          setStatus={setStatus}
        />

        {/* ✅ Loading State */}
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <UserTable users={users} />
        )}
      </div>
    </DashboardLayout>
  );
}

export default UserManagement;