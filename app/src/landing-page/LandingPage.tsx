// landing-page/LandingPage.tsx - REFATORADO COM DESIGN SYSTEM BRAND (Soft Purple) + THEME SUPPORT
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
    <main className="landing-page bg-white dark:bg-black text-gray-900 dark:text-white overflow-x-clip transition-colors duration-300">
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
