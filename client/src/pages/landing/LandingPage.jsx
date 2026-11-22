import React from 'react';
import LandingNav from './components/LandingNav';
import HeroSection from './components/HeroSection';
import ServicesSection from './components/ServicesSection';
import HowItWorksSection from './components/HowItWorksSection';
import ArchitectureSection from './components/ArchitectureSection';
import CtaSection from './components/CtaSection';
import LandingFooter from './components/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-navy-950 font-sans selection:bg-navy-800 selection:text-white">
      {/* Top Sticky Navigation */}
      <LandingNav />

      {/* Main Single-Page Unified Sections */}
      <main>
        <HeroSection />
        <ServicesSection />
        <HowItWorksSection />
        <ArchitectureSection />
        <CtaSection />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
