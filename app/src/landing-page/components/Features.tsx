// components/Features.tsx - REFATORADO COM DESIGN SYSTEM NEON
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
    title: 'Smart Scheduling',
    description: 'AI-powered booking system that works 24/7 for your clients',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: '👥',
    title: 'Client Management',
    description: 'Complete CRM to manage relationships and loyalty programs',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: '💳',
    title: 'Online Payments',
    description: 'Accept payments in advance and reduce no-shows to zero',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: '📊',
    title: 'Advanced Analytics',
    description: 'Real-time dashboards with all your business metrics',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: '📱',
    title: 'WhatsApp Integration',
    description: 'Automatic confirmations, reminders and marketing campaigns',
    color: 'from-green-400 to-green-600',
  },
  {
    icon: '🤖',
    title: 'AI Assistant',
    description: 'Intelligent AI that learns and optimizes your business',
    color: 'from-purple-500 to-pink-500',
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
      className="relative py-24 bg-black text-white overflow-hidden"
    >
      {/* Glow Effects de fundo */}
      <GlowEffect position="top-right" size="xl" color="neon" animated />
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
            FEATURES
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Choose from over{' '}
            <GradientText variant="neon" as="span" className="text-4xl md:text-6xl font-bold">
              10+ cutting-edge products
            </GradientText>
          </h2>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            Everything you need to transform your business in one place
          </p>
        </motion.div>

        {/* Grid de features */}
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

        {/* CTA final */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <Button variant="primary-glow" size="lg">
            Get Started - It's Free
          </Button>
          <p className="text-sm text-zinc-400 mt-4">
            ✨ 14 days free trial • No credit card • Cancel anytime
          </p>
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
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card
        variant="glass-neon"
        hover
        glow
        className="group cursor-pointer h-full"
        role="article"
        aria-label={`Feature: ${feature.title}`}
      >
        <div
          className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300`}
        >
          {feature.icon}
        </div>
        <h3 className="text-xl font-bold mb-2 text-white group-hover:text-neon-500 transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-zinc-400 text-sm leading-relaxed">
          {feature.description}
        </p>
      </Card>
    </motion.div>
  );
}
