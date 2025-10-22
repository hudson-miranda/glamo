import ContactForm from './components/ContactForm';
import FAQ from './components/FAQ';
import FeaturesGrid from './components/FeaturesGrid';
import Footer from './components/Footer';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import ScrollProgress from './components/ScrollProgress';
import Testimonials from './components/Testimonials';
import WhyDifferent from './components/WhyDifferent';
import { faqs, features, footerNavigation, testimonials } from './contentSections';

export default function LandingPage() {
  return (
    <div className='bg-background text-foreground overflow-x-hidden'>
      <ScrollProgress />
      <main className='isolate'>
        <Hero />
        <FeaturesGrid features={features} />
        <HowItWorks />
        <WhyDifferent />
        <Testimonials testimonials={testimonials} />
        <FAQ faqs={faqs} />
        <ContactForm />
      </main>
      <Footer footerNavigation={footerNavigation} />
    </div>
  );
}

