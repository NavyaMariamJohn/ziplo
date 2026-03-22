import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../layout/DashboardLayout";
import API, { fetchWithAuth } from "../../utils/api";
import "./Analytics.css";

import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function Analytics() {
  const { id } = useParams();

  const [urls, setUrls] = useState([]);
  const [selectedCode, setSelectedCode] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [locationData, setLocationData] = useState([]);

  // 🔹 FETCH LOCATION STATS
  const fetchLocationStats = async (shortCode) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetchWithAuth(`/location-clicks/${shortCode}`);

      const data = await res.json();
      setLocationData(data);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 FETCH USER URLS
  const fetchUrls = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetchWithAuth("/user-urls");

      const data = await res.json();
      setUrls(data);

      if (id) {
        const found = data.find((u) => u.id === Number(id));
        if (found) {
          const code = found.short_code;
          setSelectedCode(code);
          fetchAnalytics(code);
          fetchLocationStats(code);
        }
      } else if (data.length > 0) {
        const code = data[0].short_code;
        setSelectedCode(code);
        fetchAnalytics(code);
        fetchLocationStats(code);
      }

    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 FETCH ANALYTICS
  const fetchAnalytics = async (shortCode) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetchWithAuth(`/analytics/${shortCode}`);

      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetchUrls();
  }, [id]);

  // 🔥 LOADING
  if (!analytics) {
    return (
      <DashboardLayout>
        <div className="analytics-container">
          <p className="empty-text">Loading analytics...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="analytics-container">

        <h2 className="analytics-title">Analytics</h2>

        {/* SELECT */}
        <div className="analytics-select-box">
          <select
            value={selectedCode}
            onChange={(e) => {
              const code = e.target.value;
              setSelectedCode(code);
              fetchAnalytics(code);
              fetchLocationStats(code);
            }}
          >
            <option value="">Select a link</option>
            {urls.map((url) => (
              <option key={url.id} value={url.short_code}>
                {url.short_code}
              </option>
            ))}
          </select>
        </div>

        {/* STATS */}
        <div className="analytics-cards">
          <div className="analytics-card">
            <h4>Total Clicks</h4>
            <p>{analytics.total_clicks}</p>
          </div>
          <div className="analytics-card">
            <h4>Today</h4>
            <p>{analytics.today_clicks || 0}</p>
          </div>
          <div className="analytics-card">
            <h4>This Week</h4>
            <p>{analytics.week_clicks || 0}</p>
          </div>
          <div className="analytics-card">
            <h4>Unique</h4>
            <p>{analytics.unique_clicks || 0}</p>
          </div>
        </div>

        {/* 📈 PREMIUM CHART */}
        <div className="analytics-chart-card">
          <h3 className="chart-title">Clicks (Last 7 Days)</h3>

          {analytics.click_trend?.length > 0 ? (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%" debounce={200}>
                <LineChart data={analytics.click_trend}>

                  {/* 🔥 GRADIENT */}
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff4d6d" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ff4d6d" stopOpacity={0}/>
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis />

                  {/* 🔥 TOOLTIP */}
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: "none",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value) => [`${value} clicks`, "Traffic"]}
                  />

                  {/* 🔥 AREA */}
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke="none"
                    fill="url(#colorClicks)"
                  />

                  {/* 🔥 LINE */}
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="#ff4d6d"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={true}
                    animationDuration={600}
                  />

                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="empty-text">No trend data 📉</p>
          )}
        </div>

        {/* 🌍 PIE */}
        {locationData.length > 0 && (
          <div className="analytics-chart-card">
            <h3 className="chart-title">Clicks by Location</h3>

            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%" debounce={200}>
                <PieChart>
                  <Pie
                    data={locationData}
                    dataKey="clicks"
                    nameKey="location"
                    outerRadius={90}
                    label={({ percent }) =>
                      `${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {locationData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={
                          ["#ff4d6d", "#ff758f", "#ff9fb2", "#ffc2d1"][
                            index % 4
                          ]
                        }
                      />
                    ))}
                  </Pie>

                  <Tooltip formatter={(v, n) => [`${v} clicks`, n]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TABLE */}
        <div className="analytics-table">
          <h3>Recent Clicks</h3>

          {analytics.click_details?.length > 0 ? (
            analytics.click_details.map((item, index) => (
              <div key={index} className="click-row">
                <span>📍 {item.location}</span>
                <span>🌐 {item.ip}</span>
                <span>🕒 {new Date(item.timestamp).toLocaleString()}</span>
              </div>
            ))
          ) : (
            <p className="empty-text">🚀 No clicks yet — share your link!</p>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}

export default Analytics;