import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
} from "recharts";

function AnalyticsOverview() {
  const [data, setData] = useState(null);

  // 🔹 FETCH OVERVIEW DATA
  const fetchOverview = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetchWithAuth("/analytics-overview");

      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  // 🔥 LOADING
  if (!data) {
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

        <h2 className="analytics-title">Analytics Overview</h2>

        {/* EMPTY */}
        {data.totalClicks === 0 && (
          <p className="empty-text">
            🚀 Start sharing your links to see analytics
          </p>
        )}

        {/* STATS */}
        <div className="analytics-cards">
          <div className="analytics-card">
            <h4>All Clicks</h4>
            <p>{data.totalClicks}</p>
          </div>

          <div className="analytics-card">
            <h4>Unique Visits</h4>
            <p>{data.uniqueClicks}</p>
          </div>

          <div className="analytics-card">
            <h4>Avg / Day</h4>
            <p>{data.avgPerDay}</p>
          </div>

          <div className="analytics-card">
            <h4>Top Link</h4>
            <p>{data.topLink?.short_code || "-"}</p>
          </div>
        </div>

        {/* 📈 PREMIUM CHART */}
        {data.trend?.length > 0 && (
          <div className="analytics-chart-card">
            <h3 className="chart-title">Traffic Overview</h3>

            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%" debounce={200}>
                <LineChart
                  data={data.trend}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >

                  {/* 🔥 GRADIENT */}
                  <defs>
                    <linearGradient id="colorOverview" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff4d6d" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ff4d6d" stopOpacity={0}/>
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    minTickGap={20}
                  />

                  <YAxis domain={["auto", "auto"]} />

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
                    fill="url(#colorOverview)"
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
          </div>
        )}

        {/* 🔗 TOP LINKS */}
        {data.topLinks?.length > 0 && (
          <div className="analytics-table">
            <h3>Top Performing Links</h3>

            {data.topLinks.map((link, index) => {
              const max = data.topLinks[0]?.click_count || 1;

              const percent =
                max > 0 ? (link.click_count / max) * 100 : 0;

              return (
                <Link
                  key={link.id}
                  to={`/analytics/${link.id}`}
                  className="top-link-row"
                >
                  <div className="top-link-header">
                    <span>
                      {index + 1}. ziplo.in/{link.short_code}
                    </span>

                    <span>
                      {link.click_count === 0
                        ? "No clicks"
                        : link.click_count}
                    </span>
                  </div>

                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${
                        link.click_count === 0 ? "zero" : ""
                      }`}
                      style={{
                        width: `${percent}%`,
                        minWidth: "4px",
                      }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default AnalyticsOverview;