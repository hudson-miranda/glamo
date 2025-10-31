// components/IntegrationsSection.tsx - NOVO COMPONENTE COM DESIGN SYSTEM NEON
import { motion } from 'framer-motion';
import { Card } from '../../client/components/ui/Card';
import { GradientText } from '../../client/components/ui/GradientText';
import { Badge } from '../../client/components/ui/Badge';
import { GlowEffect } from '../../client/components/ui/GlowEffect';
import { useRef, useState, useEffect } from 'react';

interface Integration {
  name: string;
  icon: string;
  color: string;
}

const integrations: Integration[] = [
  { name: 'Stripe', icon: '💳', color: 'from-blue-500 to-purple-500' },
  { name: 'PayPal', icon: '💰', color: 'from-blue-400 to-blue-600' },
  { name: 'WhatsApp', icon: '💬', color: 'from-green-400 to-green-600' },
  { name: 'Slack', icon: '💬', color: 'from-pink-400 to-purple-600' },
  { name: 'Google Cal', icon: '📅', color: 'from-red-500 to-yellow-500' },
  { name: 'Zoom', icon: '🎥', color: 'from-blue-500 to-cyan-500' },
  { name: 'Mailchimp', icon: '📧', color: 'from-yellow-400 to-orange-500' },
  { name: 'Zapier', icon: '⚡', color: 'from-orange-500 to-red-500' },
  { name: 'Instagram', icon: '📸', color: 'from-pink-500 to-purple-500' },
  { name: 'Facebook', icon: '👥', color: 'from-blue-500 to-blue-700' },
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
      className="relative py-24 bg-black text-white overflow-hidden"
    >
      {/* Glow Effects de fundo */}
      <GlowEffect position="top-right" size="xl" color="purple" animated />
      <GlowEffect position="bottom-left" size="xl" color="neon" animated />

      <div className="container mx-auto px-4 relative z-10">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <Badge variant="glow" className="mb-6">
            INTEGRATIONS
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            <GradientText variant="neon" as="span" className="text-4xl md:text-6xl font-bold">
              I lost popular integration apps
            </GradientText>
          </h2>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            Connect with your favorite tools and streamline your workflow
          </p>
        </motion.div>

        {/* Grid de integrações */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {integrations.map((integration, index) => (
            <IntegrationCard
              key={index}
              integration={integration}
              index={index}
              inView={inView}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-zinc-400 mb-4">
            <span className="text-neon-500 font-bold">+100 integrations</span> available
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-neon-500 hover:text-neon-400 font-semibold transition-colors duration-300 underline-offset-4 hover:underline"
          >
            See all apps
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
        </motion.div>
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
        <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors duration-300">
          {integration.name}
        </span>
      </Card>
    </motion.div>
  );
}
