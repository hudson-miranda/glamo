// landing-page/LandingPage.tsx
import Hero from './components/Hero';
import FeaturesGrid from './components/FeaturesGrid';
import HowItWorks from './components/HowItWorks';
import WhyDifferent from './components/WhyDifferent';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import ScrollProgress from './components/ScrollProgress';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <ScrollProgress />
      <Hero />
      <FeaturesGrid />
      <HowItWorks />
      <WhyDifferent />
      <Testimonials />
      <FAQ />
      <ContactForm />
      <Footer />
    </div>
  );
}