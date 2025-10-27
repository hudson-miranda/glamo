// landing-page/LandingPage.tsx - PADRONIZADO COM TRANSIÇÕES SUAVES
import ScrollProgress from './components/ScrollProgress';
import SectionTransition from './components/SectionTransition';

import Hero from './components/Hero';
import FeaturesGrid from './components/FeaturesGrid';
import HowItWorks from './components/HowItWorks';
import WhyDifferent from './components/WhyDifferent';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';

export default function LandingPage() {
  return (
    <main className="landing-page bg-black text-white overflow-x-clip">
      <ScrollProgress variant="glow" />

      {/* Hero (topo absoluto) */}
      <SectionTransition fromColor="black" toColor="gray" variant="with-blur-bottom" divider="bottom" className="pt-0" >
        <section id="hero" aria-label="Apresentação">
          <Hero />
        </section>
      </SectionTransition>

      {/* Features */}
      <SectionTransition fromColor="gray" toColor="black" variant="with-blur-both" divider="both">
        <section id="features" aria-label="Recursos">
          <FeaturesGrid />
        </section>
      </SectionTransition>

      {/* How It Works */}
      <SectionTransition fromColor="black" toColor="gray" variant="with-blur-both" divider="both">
        <section id="como-funciona" aria-label="Como funciona">
          <HowItWorks />
        </section>
      </SectionTransition>

      {/* Why Different */}
      <SectionTransition fromColor="gray" toColor="black" variant="with-blur-both" divider="both">
        <section id="por-que-diferente" aria-label="Por que o Glamo é diferente">
          <WhyDifferent />
        </section>
      </SectionTransition>

      {/* Testimonials */}
      <SectionTransition fromColor="black" toColor="gray" variant="with-blur-both" divider="both">
        <section id="depoimentos" aria-label="Depoimentos de clientes">
          <Testimonials />
        </section>
      </SectionTransition>

      {/* FAQ */}
      <SectionTransition fromColor="gray" toColor="black" variant="with-blur-both" divider="both">
        <section id="faq" aria-label="Perguntas frequentes">
          <FAQ />
        </section>
      </SectionTransition>

      {/* Contact */}
      <SectionTransition fromColor="black" toColor="black" variant="with-blur-top" divider="top">
        <section id="contato" aria-label="Formulário de contato">
          <ContactForm />
        </section>
      </SectionTransition>

      {/* Footer (sem transição interna; já tem glow sutil no topo) */}
      <Footer />
    </main>
  );
}