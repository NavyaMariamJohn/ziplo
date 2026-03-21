/**
 * @file Landing.jsx
 * @description Public landing page: Landing. The main entry point for unauthenticated visitors.
 */

import Header from '../../components/layout/Header';
import HeroSection from '../../components/landing/HeroSection';
import LandingStatsCards from '../../components/landing/LandingStatsCards';
import FeaturesSection from '../../components/landing/FeaturesSection';
import HowItWorksSection from '../../components/landing/HowItWorksSection';
import CTASection from '../../components/landing/CTASection';
import Footer from '../../layout/Footer';

function Landing() {
  return (
    <div className="landing-page-wrapper">
      <Header />
      <main>
        <HeroSection />
        <LandingStatsCards />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

export default Landing;