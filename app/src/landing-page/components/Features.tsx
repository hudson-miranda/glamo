// components/Features.tsx
import { motion } from 'framer-motion';
import { Card } from '../../client/components/ui/Card';
import { GradientText } from '../../client/components/ui/GradientText';
import { Badge } from '../../client/components/ui/Badge';
import { Button } from '../../client/components/ui/Button';
import { GlowEffect } from '../../client/components/ui/GlowEffect';
import { useRef, useState, useEffect } from 'react';

interface Feature {
  icon: string;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: '📅',
    title: 'Agendamento 24/7',
    description: 'Seus clientes agendam a qualquer hora com confirmação automática',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: '👥',
    title: 'CRM Completo',
    description: 'Gestão completa de clientes com histórico e fidelidade',
    color: 'from-brand-500 to-rose-500',
  },
  {
    icon: '💰',
    title: 'Controle Financeiro',
    description: 'Caixa, vendas e comissões com Mercado Pago e Stripe',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: '📦',
    title: 'Gestão de Estoque',
    description: 'Controle de produtos com alertas inteligentes',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: '📊',
    title: 'Relatórios em Tempo Real',
    description: 'Dashboards automáticos com métricas do negócio',
    color: 'from-brand-500 to-indigo-500',
  },
  {
    icon: '🤖',
    title: 'Assistente com IA',
    description: 'Agente inteligente OpenAI para insights automáticos',
    color: 'from-brand-500 to-brand-500',
  },
];

export default function Features() {
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
      <GlowEffect position="top-right" size="xl" color="brand" animated />
      <GlowEffect position="bottom-left" size="xl" color="brand" animated />

      <div className="container mx-auto px-4 relative z-10">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <Badge variant="glow" className="mb-6">
            FUNCIONALIDADES
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Tudo que você precisa em{' '}
            <GradientText variant="brand" as="span" className="text-4xl md:text-6xl font-bold">
              um só lugar
            </GradientText>
          </h2>
          <p className="text-xl text-gray-600 dark:text-zinc-400 max-w-3xl mx-auto">
            Sistema completo de gestão para transformar seu negócio de beleza
          </p>
        </motion.div>

        {/* Grid de funcionalidades */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              feature={feature}
              index={index}
              inView={inView}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <Button variant="primary-glow" size="lg">
            Explorar Todas as Funcionalidades
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  index,
  inView,
}: {
  feature: Feature;
  index: number;
  inView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card variant="glass" hover className="group h-full p-8 cursor-pointer">
        <div
          className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-all duration-300 shadow-glow-sm group-hover:shadow-glow-md`}
        >
          {feature.icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-gray-600 dark:text-zinc-400 leading-relaxed">
          {feature.description}
        </p>
      </Card>
    </motion.div>
  );
}
