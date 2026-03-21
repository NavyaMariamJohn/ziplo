/**
 * @file AdminDashboard.jsx
 * @description Admin page: AdminDashboard. Accessible only to administrators for managing the platform.
 */

import { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import API from "../../utils/api";
import toast from "react-hot-toast";

function AdminDashboard() {

  const [users, setUsers] = useState([]);
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // 🔹 FETCH USERS
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 403) {
        toast.error("Access denied (Admin only)");
        window.location.href = "/dashboard";
        return;
      }

      const data = await res.json();
      setUsers(data);

    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    }
  };

  // 🔹 FETCH URLS
  const fetchUrls = async () => {
    try {
      const res = await fetch(`${API}/admin/urls`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 403) {
        toast.error("Access denied (Admin only)");
        window.location.href = "/dashboard";
        return;
      }

      const data = await res.json();
      setUrls(data);

    } catch (err) {
      console.error(err);
      toast.error("Failed to load URLs");
    }
  };

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const loadData = async () => {
      setLoading(true);
      await fetchUsers();
      await fetchUrls();
      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <DashboardLayout>
        <div className="dashboard-scrollable-area container flex-col gap-md">

          <h1 className="text-3xl font-bold">Admin Dashboard</h1>

          {/* 🔄 LOADING */}
          {loading ? (
            <p>Loading admin data...</p>
          ) : (
            <>
              {/* 🔹 USERS */}
              <div className="card">
                <h3>Users</h3>

                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="4">No users found</td>
                      </tr>
                    ) : (
                      users.map(user => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>{user.role}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* 🔹 URLS */}
              <div className="card">
                <h3>All URLs</h3>

                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Short</th>
                      <th>Original</th>
                      <th>User</th>
                      <th>Clicks</th>
                    </tr>
                  </thead>

                  <tbody>
                    {urls.length === 0 ? (
                      <tr>
                        <td colSpan="4">No URLs found</td>
                      </tr>
                    ) : (
                      urls.map(url => (
                        <tr key={url.id}>
                          <td>{url.short_code}</td>
                          <td>{url.original_url}</td>
                          <td>{url.created_by || "Guest"}</td>
                          <td>{url.click_count}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

        </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;