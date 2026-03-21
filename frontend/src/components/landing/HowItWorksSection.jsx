/**
 * @file HowItWorksSection.jsx
 * @description Landing page component for how it works section. Part of the public-facing website.
 */

import './HowItWorksSection.css';

function HowItWorksSection() {
  const steps = [
    { number: '1', title: 'Paste URL', desc: 'Copy and paste your long link into our secure shortener.' },
    { number: '2', title: 'Share', desc: 'Get your clean, brandable short link instantly.' },
    { number: '3', title: 'Track', desc: 'Monitor clicks and visitor data from your dashboard.' }
  ];

  return (
    <section id="how-it-works" className="how-it-works-section container">
      <div className="how-it-works-header text-center">
        <h2>How It Works</h2>
        <p>Shorten and track your links in three simple steps.</p>
      </div>
      
      <div className="steps-container">
        {steps.map((step, idx) => (
          <div key={idx} className="step-card">
            <div className="step-number">{step.number}</div>
            <h3 className="step-title">{step.title}</h3>
            <p className="step-desc">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorksSection;
