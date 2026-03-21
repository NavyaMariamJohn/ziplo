/**
 * @file Footer.jsx
 * @description Global layout wrapper: Footer. Defines the overall layout structure for specific sections (like Dashboard or full app).
 */

import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer-section container">
      <div className="footer-grid">
        <div className="footer-brand flex-col">
          <div className="logo flex items-center gap-sm" style={{marginBottom: 'var(--space-md)'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 12H12L8 4" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 12H12L16 20" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 4L4 12L12 12M16 20L20 12L12 12" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <strong className="logo-text" style={{fontSize: '1.25rem'}}>Ziplo</strong>
          </div>
          <p className="footer-desc">Link sharing, elevated & secured.</p>
        </div>

        <div className="footer-links-col">
          <h4>Product</h4>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <Link to="/shorten">URL Shortener</Link>
        </div>

        <div className="footer-links-col">
          <h4>Company</h4>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <a href="#blog">Blog</a>
        </div>

        <div className="footer-links-col">
          <h4>Legal</h4>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <p className="footer-credits mt-auto">
            &copy; 2026 Ziplo<br/>
            <span style={{fontSize: '0.8rem', opacity: 0.7}}>Project Members: Aleena, Anna, Navya, Surya</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
