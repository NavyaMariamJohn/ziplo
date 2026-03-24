/**
 * @file Dashboard.jsx
 * @description Dashboard page: Dashboard. Standard user dashboard view for managing links and viewing analytics.
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '../../layout/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import LinksTable from '../../components/dashboard/LinksTable';
import API, { fetchWithAuth } from "../../utils/api";
import toast from "react-hot-toast";
import './Dashboard.css';

function Dashboard() {

  const [newUrl, setNewUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdShortUrl, setCreatedShortUrl] = useState("");
  const [urls, setUrls] = useState([]);
  const [loadingUrls, setLoadingUrls] = useState(true);

  const userName = localStorage.getItem("userName") || "User";

  // 🔹 FETCH
  const fetchUrls = async () => {
    setLoadingUrls(true);

    try {
      const data = await fetchWithAuth("/user-urls");
      setUrls(data);
    } catch {
      toast.error("Failed to load links");
    } finally {
      setLoadingUrls(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return (window.location.href = "/login");
    fetchUrls();
  }, []);

  // 🔹 CREATE
  const handleCreate = async () => {
    if (!newUrl.startsWith("http")) {
      toast.error("Enter valid URL");
      return;
    }

    setLoading(true);

    try {
      const data = await fetchWithAuth("/create-url", {
        method: "POST",
        body: JSON.stringify({ 
          original_url: newUrl,
          custom_code: customCode.trim()
        }),
      });

      const full = `http://localhost:5000/api/${data.short_code}`;
      setCreatedShortUrl(full);
      setNewUrl("");
      setCustomCode("");
      toast.success("Link created 🚀");
      fetchUrls();

    } catch (err) {
      toast.error(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
        <div className="dashboard-container">

          {/* 🔥 HEADER */}
          <div className="dashboard-header">
            <h2>Good morning, {userName} 👋</h2>
            <p>Here’s your link activity overview</p>
          </div>

          {/* 🔥 STATS */}
          <div className="dashboard-stats">
            <StatCard title="Total Links" value={urls.length} />

            <StatCard
              title="Total Clicks"
              value={urls.reduce((sum, u) => sum + (u.click_count || 0), 0)}
            />

            <StatCard title="Active Links" value={urls.length} />
          </div>

          {/* 🔥 QUICK SHORTEN */}
          <div className="quick-box">
            <h3>Quick Shorten</h3>

            <div className="quick-row">
              <input
                type="url"
                placeholder="Paste your long URL..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />

              <input
                type="text"
                className="custom-code-input"
                placeholder="Custom name (optional)"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
              />

              <button onClick={handleCreate} disabled={loading}>
                {loading ? "Creating..." : "Shorten"}
              </button>
            </div>

            {createdShortUrl && (
              <div className="quick-result">
                <span>{createdShortUrl}</span>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdShortUrl);
                    toast.success("Copied!");
                  }}
                >
                  Copy
                </button>
              </div>
            )}
          </div>

          {/* 🔥 TABLE */}
          <div className="links-section">
            <div className="section-header">
              <h3>Recent Links</h3>
            </div>

            <LinksTable
              urls={urls}
              loading={loadingUrls}
              refreshUrls={fetchUrls}
            />
          </div>

        </div>
    </DashboardLayout>
  );
}

export default Dashboard;