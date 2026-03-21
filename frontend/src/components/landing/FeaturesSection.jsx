/**
 * @file FeaturesSection.jsx
 * @description Landing page component for features section. Part of the public-facing website.
 */

import './FeaturesSection.css';

function FeaturesSection() {
  const features = [
    { title: 'Fast redirects', desc: 'Lightning-fast 2-second redirects keeping your users happy.', icon: '⚡' },
    { title: 'Analytics', desc: 'Powerful real-time analytics to track clicks, referrers, and locations.', icon: '📊' },
    { title: 'Security', desc: 'Enterprise-grade security and role-based access control.', icon: '🔒' },
    { title: 'Custom aliases', desc: 'Create branded links with custom back-halves for better trust.', icon: '✏️' },
    { title: 'QR codes', desc: 'Instantly generate scannable QR codes for your short links.', icon: '📱' },
    { title: 'Bulk links', desc: 'Shorten multiple URLs at once to save hours of manual work.', icon: '📦' },
  ];

  return (
    <section id="features" className="features-section container">
      <div className="features-header text-center">
        <h2>Features that power your links</h2>
        <p>Everything you need to manage links at scale.</p>
      </div>

      <div className="features-grid">
        {features.map((feature, idx) => (
          <div key={idx} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-desc">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturesSection;
