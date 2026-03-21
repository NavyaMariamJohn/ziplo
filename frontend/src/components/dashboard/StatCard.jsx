/**
 * @file StatCard.jsx
 * @description Dashboard component for stat card. Used within the user or admin dashboard.
 */

import './StatCard.css';

function StatCard({ title, value, badgeIcon, active }) {
  return (
    <div className={`dashboard-stat-card ${active ? 'active-card' : ''}`}>
      <div className="stat-content">
        <h3 className="stat-card-title">{title}</h3>
        <p className="stat-card-value">{value}</p>
      </div>
      
      {badgeIcon && (
        <div className="stat-badge">
          {badgeIcon}
        </div>
      )}
    </div>
  );
}

export default StatCard;
