/**
 * @file Header.jsx
 * @description Layout component: Header. Provides structural layout like headers or footers.
 */

import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header container flex justify-between items-center w-full">
      <div className="logo flex items-center gap-sm">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 12H12L8 4" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20 12H12L16 20" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 4L4 12L12 12M16 20L20 12L12 12" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <Link to="/" className="logo-text">Ziplo</Link>
      </div>

      <nav className="nav-center hidden-mobile flex items-center gap-md">
        <a href="#features" className="nav-link">Features</a>
        <a href="#pricing" className="nav-link">Pricing</a>
        <a href="#about" className="nav-link">About</a>
      </nav>

      <div className="nav-actions flex items-center gap-md">
        <Link to="/login" className="nav-link font-semibold">Log in</Link>
        <Link to="/register" className="btn btn-primary get-started-btn">Get Started</Link>
      </div>
    </header>
  );
}

export default Header;
