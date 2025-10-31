// landing-page/LandingPage.tsx - REFATORADO COM DESIGN SYSTEM NEON
import Hero from './components/Hero';
import Features from './components/Features';
import PricingSection from './components/PricingSection';
import Testimonials from './components/Testimonials';
import IntegrationsSection from './components/IntegrationsSection';
import FAQ from './components/FAQ';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

export default function LandingPage() {
  return (
    <main className="landing-page bg-black text-white overflow-x-clip">
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <Features />

      {/* Pricing Section */}
      <PricingSection />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Integrations Section */}
      <IntegrationsSection />

      {/* FAQ Section */}
      <FAQ />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
