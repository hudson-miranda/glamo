// components/CTASection.tsx - NOVO COMPONENTE COM DESIGN SYSTEM BRAND (Soft Purple)
import { motion } from 'framer-motion';
import { GradientText } from '../../client/components/ui/GradientText';
import { Button } from '../../client/components/ui/Button';
import { GlowEffect } from '../../client/components/ui/GlowEffect';
import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CTASection() {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative py-32 bg-white dark:bg-black text-gray-900 dark:text-white overflow-hidden transition-colors duration-300"
    >
      {/* Glow Effects de fundo - mais intensos para destaque */}
      <GlowEffect position="center" size="xl" color="brand" animated />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/50 dark:via-black/50 to-white dark:to-black pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto text-center"
        >
          {/* Headline impactante */}
          <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Transforme seu salão{' '}
            <GradientText variant="brand" as="span" className="text-5xl md:text-7xl font-bold">
              hoje mesmo!
            </GradientText>
          </h2>

          {/* Subtítulo */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-zinc-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Junte-se a mais de 1.000 salões que já modernizaram sua gestão com o Glamo.
            Teste grátis por 14 dias, sem compromisso.
          </p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <Link to="/signup">
              <Button variant="primary-glow" size="xl">
                Começar Teste Grátis
              </Button>
            </Link>
            <Button variant="secondary" size="xl">
              Agendar Demonstração
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-zinc-400"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>14 dias grátis</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Cancele quando quiser</span>
            </div>
          </motion.div>

          {/* Social proof em números */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-16 pt-16 border-t border-gray-200 dark:border-zinc-800"
          >
            {[
              { value: '2,500+', label: 'Active Users' },
              { value: '50K+', label: 'Bookings/Month' },
              { value: '4.9/5', label: 'Rating' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-brand-500 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-zinc-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-1/4 left-10 w-20 h-20 bg-brand-500 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        className="absolute bottom-1/4 right-10 w-32 h-32 bg-brand-500 rounded-full blur-3xl"
      />
    </section>
  );
}
