/**
 * @file HeroSection.jsx
 * @description Landing page component for hero section. Part of the public-facing website.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import './HeroSection.css';

function HeroSection() {
  const [url, setUrl] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');

  const handleShorten = (e) => {
    e.preventDefault();
    if (url) {
      // Mock shortening
      setShortenedUrl('zip.lo/x7j92l');
    }
  };

  return (
    <section className="hero-section container flex-col items-center text-center">

      <div className="badge bg-primary-light flex items-center gap-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
        <span className="badge-text" style={{ color: 'var(--color-primary)', fontWeight: '600', fontSize: '12px' }}>Secure. Controlled. Analytical.</span>
      </div>

      <h1 className="hero-title">
        Link sharing,<br />
        <span className="gradient-text">elevated & secured.</span>
      </h1>

      <p className="hero-subtitle">
        Ziplo is a secure web-based URL shortening platform for organizations. Track usage, control redirects, and analyze traffic effortlessly.
      </p>



      <div className="hero-cta">
        <Link to="/shorten" className="cta-button">
          Start Shortening →
        </Link>
      </div>

    </section>
  );
}

export default HeroSection;
