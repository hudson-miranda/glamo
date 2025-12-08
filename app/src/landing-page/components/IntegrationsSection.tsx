// components/IntegrationsSection.tsx - NOVO COMPONENTE COM DESIGN SYSTEM BRAND (Soft Purple)
import { motion } from 'framer-motion';
import { Card } from '../../client/components/ui/Card';
import { GradientText } from '../../client/components/ui/GradientText';
import { Badge } from '../../client/components/ui/Badge';
import { GlowEffect } from '../../client/components/ui/GlowEffect';
import { useRef, useState, useEffect, ReactNode } from 'react';
import { FaStripeS, FaWhatsapp  } from "react-icons/fa";
import { SiPagseguro, SiMercadopago, SiGooglecalendar, SiOpenai    } from "react-icons/si";

interface Integration {
  name: string;
  icon: ReactNode;
  color: string;
}

const integrations: Integration[] = [
  { name: 'Mercado Pago', icon: <SiMercadopago className="text-white"/>, color: 'from-brand-400 to-brand-600' },
  { name: 'PagSeguro', icon: <SiPagseguro className="text-white"/>, color: 'from-brand-400 to-brand-600' },
  { name: 'Stripe', icon: <FaStripeS className="text-white"/>, color: 'from-brand-400 to-brand-600' },
  { name: 'WhatsApp', icon: <FaWhatsapp className="text-white"/>, color: 'from-brand-400 to-brand-600' },
  { name: 'Google Cal', icon: <SiGooglecalendar className="text-white"/>, color: 'from-brand-400 to-brand-600' },
  { name: 'OpenAI', icon: <SiOpenai className="text-white"/>, color: 'from-brand-400 to-brand-600' },
];

export default function IntegrationsSection() {
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
      className="relative py-24 bg-white dark:bg-black text-gray-900 dark:text-white overflow-hidden transition-colors duration-300"
    >
      {/* Glow Effects de fundo */}
      <GlowEffect position="top-left" size="xl" color="brand" animated />
      <GlowEffect position="bottom-right" size="xl" color="brand" animated />

      <div className="container mx-auto px-4 relative z-10">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <Badge variant="glow" className="mb-6" id="integracoes">
            INTEGRAÇÕES
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            <GradientText variant="brand" as="span" className="text-4xl md:text-6xl font-bold">
              Conecte com suas ferramentas favoritas
            </GradientText>
          </h2>
          <p className="text-xl text-gray-600 dark:text-zinc-400 max-w-3xl mx-auto">
            Integrações nativas com as principais plataformas de pagamento e comunicação
          </p>
        </motion.div>

        {/* Grid de integrações */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {integrations.map((integration, index) => (
            <IntegrationCard
              key={index}
              integration={integration}
              index={index}
              inView={inView}
            />
          ))}
        </div>

        {/* CTA - Oculto por enquanto */}
        {/* <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 dark:text-zinc-400 mb-4">
            <span className="text-brand-500 font-bold">+20 integrações</span> disponíveis
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-400 font-semibold transition-colors duration-300 underline-offset-4 hover:underline"
          >
            Ver todas as integrações
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </motion.div> */}
      </div>
    </section>
  );
}

function IntegrationCard({
  integration,
  index,
  inView,
}: {
  integration: Integration;
  index: number;
  inView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Card
        variant="glass"
        hover
        className="group cursor-pointer aspect-square flex flex-col items-center justify-center"
      >
        <div
          className={`w-16 h-16 bg-gradient-to-br ${integration.color} rounded-2xl flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-all duration-300 shadow-glow-sm group-hover:shadow-glow-md`}
        >
          {integration.icon}
        </div>
        <span className="text-sm font-semibold text-gray-700 dark:text-zinc-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
          {integration.name}
        </span>
      </Card>
    </motion.div>
  );
}