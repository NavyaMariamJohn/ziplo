/**
 * @file CTASection.jsx
 * @description Landing page component for c t a section. Part of the public-facing website.
 */

import { Link } from 'react-router-dom';
import './CTASection.css';

function CTASection() {
  return (
    <section className="cta-section container text-center">
      <div className="cta-content">
        <h2>Ready to get started?</h2>
        <p>Join thousands of users sharing smart links with Ziplo.</p>
        <Link to="/register" className="btn btn-primary cta-btn">
          Create Free Account
        </Link>
      </div>
    </section>
  );
}

export default CTASection;
