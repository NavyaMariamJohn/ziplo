/**
 * @file LandingStatsCards.jsx
 * @description Landing page component for landing stats cards. Part of the public-facing website.
 */

import './LandingStatsCards.css';

function LandingStatsCards() {
  const stats = [
    { label: 'Links Created', value: '45.2K', trend: '+12% this month' },
    { label: 'Total Clicks', value: '1.2M', trend: '+24% this month' },
    { label: 'Uptime', value: '99.99%', trend: 'Status: Operational' },
  ];

  return (
    <section className="stats-section container">
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card minimal-card">
            <h3 className="stat-label">{stat.label}</h3>
            <div className="stat-value">{stat.value}</div>
            <p className="stat-trend">{stat.trend}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default LandingStatsCards;
