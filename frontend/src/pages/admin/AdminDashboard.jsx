import { useEffect, useState } from "react";
import DashboardLayout from "../../layout/DashboardLayout";
import { fetchWithAuth } from "../../utils/api";
import toast from "react-hot-toast";
import "./AdminDashboard.css";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

/* 🔥 CHART (User Signups) */
function AdminChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
        <Tooltip cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
        <Line
          type="monotone"
          dataKey="signups"
          stroke="#ff537e"
          strokeWidth={3}
          dot={{ r: 4, fill: '#ff537e', strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Relative time helper
function timeAgo(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (isNaN(diffInSeconds)) return dateString;

  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d`;
}

function AdminDashboard() {
  const [trend, setTrend] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const load = async () => {
      try {
        const [usersData, urlsData, trendData] = await Promise.all([
          fetchWithAuth("/admin/users"),
          fetchWithAuth("/admin/urls"),
          fetchWithAuth("/admin/signup-trend")
        ]);

        setUsers(usersData.users || usersData);
        setUrls(urlsData);
        setTrend(trendData);
      } catch {
        toast.error("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* 🔥 STATS */
  const totalUsers = users.length;
  const totalLinks = urls.length;
  const totalClicks = urls.reduce(
    (sum, u) => sum + (u.click_count || 0),
    0
  );
  const activeUsers = users.filter(
    (u) => u.role !== "inactive"
  ).length;

  // Chart data: Signups for the last 7 days
  const chartData = [];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const isoDate = d.toISOString().split('T')[0]; // "YYYY-MM-DD"
    
    const dayData = (trend || []).find(t => t.date === isoDate);
    chartData.push({ 
      name: label, 
      signups: dayData ? dayData.count : 0 
    });
  }

  // Activity Feed
  let activities = [];
  users.forEach(u => {
    if (u.created_at) {
      activities.push({
        type: 'user',
        text: `New user registered: ${u.email}`,
        timeString: u.created_at,
        timeAgo: timeAgo(u.created_at),
        timestamp: new Date(u.created_at).getTime()
      });
    }
  });
  
  urls.forEach(u => {
    if (u.created_at && u.created_at !== "None") {
      activities.push({
        type: 'link',
        text: `Link created: /${u.short_code} by ${u.created_by}`,
        timeString: u.created_at,
        timeAgo: timeAgo(u.created_at),
        timestamp: new Date(u.created_at).getTime()
      });
    }
  });

  // Sort descending and take top 5
  activities.sort((a, b) => b.timestamp - a.timestamp);
  const recentActivities = activities.slice(0, 5);

  /* 🔥 TOP USERS BY LINKS */
  // Group by username/created_by
  const userStats = {};
  urls.forEach(u => {
    const creator = u.created_by || 'Unknown';
    if (!userStats[creator]) {
      userStats[creator] = { links: 0, clicks: 0, email: creator };
    }
    userStats[creator].links += 1;
    userStats[creator].clicks += (u.click_count || 0);
  });

  const topUsersByLinks = Object.values(userStats)
    .sort((a, b) => b.links - a.links)
    .slice(0, 5);

  return (
    <DashboardLayout>
      <div className="admin-container">

        {/* HEADER */}
        <div className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>

          <select className="admin-filter">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>All time</option>
          </select>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {/* STATS */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-title">Total Users</div>
                <div className="stat-value">{totalUsers.toLocaleString()}</div>
              </div>

              <div className="stat-card">
                <div className="stat-title">Total Links</div>
                <div className="stat-value">{totalLinks.toLocaleString()}</div>
              </div>

              <div className="stat-card">
                <div className="stat-title">Total Clicks</div>
                <div className="stat-value">{totalClicks.toLocaleString()}</div>
              </div>

              <div className="stat-card">
                <div className="stat-title">Active Users</div>
                <div className="stat-value">{activeUsers.toLocaleString()}</div>
              </div>
            </div>

            {/* ROW 2: Charts and System Health */}
            <div className="admin-row-2">
              <div className="admin-card">
                <h3 className="card-heading">User Signups</h3>
                <div className="chart-box">
                  {chartData.length > 0 ? (
                    <AdminChart data={chartData} />
                  ) : (
                    <p className="no-data">Not enough data to display chart.</p>
                  )}
                </div>
              </div>

              <div className="admin-card">
                <h3 className="card-heading">System Health</h3>
                <div className="system-health">
                  <div className="health-item">
                    <span>API Response</span>
                    <span className="health-status">Online ✓</span>
                  </div>
                  <div className="health-item">
                    <span>Database</span>
                    <span className="health-status">Connected ✓</span>
                  </div>
                  <div className="health-item">
                    <span>System Uptime</span>
                    <span className="health-status">Stable</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 3: Recent Activity */}
            <div className="admin-row-1">
              <div className="admin-card large-card">
                <h3 className="card-heading">Recent Activity</h3>
                <div className="activity-list">
                  {recentActivities.map((act, i) => (
                    <div key={i} className="activity-row">
                      <span className="activity-dot">•</span>
                      <span className="activity-text">{act.text}</span>
                      <span className="activity-time">{act.timeAgo}</span>
                    </div>
                  ))}
                  {recentActivities.length === 0 && (
                    <p className="no-data">No recent activity.</p>
                  )}
                </div>
              </div>
            </div>

             {/* ROW 4: Top Users */}
             <div className="admin-row-1">
              <div className="admin-card large-card">
                <h3 className="card-heading">Top Users by Links</h3>
                <div className="top-users-list">
                  {topUsersByLinks.map((u, i) => (
                    <div key={i} className="top-user-row">
                      <span className="top-user-rank">{i + 1}.</span>
                      <span className="top-user-email">{u.email}</span>
                      <div className="top-user-stats">
                        <span className="top-user-links">{u.links.toLocaleString()} links</span>
                        <span className="top-user-clicks">{u.clicks.toLocaleString()} clicks</span>
                      </div>
                    </div>
                  ))}
                  {topUsersByLinks.length === 0 && (
                    <p className="no-data">No user data available.</p>
                  )}
                </div>
              </div>
            </div>

          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;