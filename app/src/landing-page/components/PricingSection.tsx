// components/PricingSection.tsx - NOVO COMPONENTE COM DESIGN SYSTEM NEON
import { motion } from 'framer-motion';
import { Card } from '../../client/components/ui/Card';
import { GradientText } from '../../client/components/ui/GradientText';
import { Badge } from '../../client/components/ui/Badge';
import { Button } from '../../client/components/ui/Button';
import { GlowEffect } from '../../client/components/ui/GlowEffect';
import { useRef, useState, useEffect } from 'react';

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  cta: string;
}

const pricingPlans: PricingPlan[] = [
  {
    name: 'Starter',
    price: '$49',
    period: 'per month',
    description: 'Perfect for solo professionals starting their journey',
    features: [
      'Up to 100 bookings/month',
      '1 professional',
      'Basic scheduling',
      'WhatsApp reminders',
      'Payment integration',
      'Mobile app access',
      'Email support',
    ],
    cta: 'Start Free Trial',
  },
  {
    name: 'Professional',
    price: '$99',
    period: 'per month',
    description: 'Most popular choice for growing businesses',
    features: [
      'Unlimited bookings',
      'Up to 5 professionals',
      'AI-powered scheduling',
      'Advanced analytics',
      'Marketing automation',
      'Custom branding',
      'Priority support',
      'Team management',
      'Multi-location support',
    ],
    highlighted: true,
    badge: 'Most Popular',
    cta: 'Get Started Now',
  },
  {
    name: 'Enterprise',
    price: '$299',
    period: 'per month',
    description: 'Complete solution for large organizations',
    features: [
      'Everything in Professional',
      'Unlimited professionals',
      'Unlimited locations',
      'White label solution',
      'Custom domain',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'On-premise option',
    ],
    cta: 'Contact Sales',
  },
];

export default function PricingSection() {
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
      <GlowEffect position="top-left" size="xl" color="purple" animated />
      <GlowEffect position="bottom-right" size="xl" color="neon" animated />

      <div className="container mx-auto px-4 relative z-10">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <Badge variant="glow" className="mb-6">
            PRICING
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            The best in the class{' '}
            <GradientText variant="neon" as="span" className="text-4xl md:text-6xl font-bold">
              product for you today!
            </GradientText>
          </h2>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            Choose the perfect plan for your business needs
          </p>
        </motion.div>

        {/* Grid de pricing cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {pricingPlans.map((plan, index) => (
            <PricingCard
              key={index}
              plan={plan}
              index={index}
              inView={inView}
            />
          ))}
        </div>

        {/* Garantias / Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          {[
            { icon: '✅', label: '14-day free trial' },
            { icon: '🔒', label: 'Secure payments' },
            { icon: '🚫', label: 'No credit card' },
            { icon: '⚡', label: 'Cancel anytime' },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-sm text-zinc-400">{item.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function PricingCard({
  plan,
  index,
  inView,
}: {
  plan: PricingPlan;
  index: number;
  inView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className={`relative ${plan.highlighted ? 'md:-mt-8 md:mb-8' : ''}`}
    >
      {plan.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <Badge variant="glow">{plan.badge}</Badge>
        </div>
      )}

      <Card
        variant={plan.highlighted ? 'glass-neon' : 'glass'}
        hover
        glow={plan.highlighted}
        className={`h-full flex flex-col relative ${
          plan.highlighted ? 'border-2 border-neon-500/50 shadow-glow-lg' : ''
        }`}
      >
        {/* Plan Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
          <p className="text-sm text-zinc-400 mb-6">{plan.description}</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl font-bold ${plan.highlighted ? 'text-neon-500' : 'text-white'}`}>
              {plan.price}
            </span>
            <span className="text-zinc-400">/ {plan.period}</span>
          </div>
        </div>

        {/* Features List */}
        <ul className="space-y-4 mb-8 flex-1">
          {plan.features.map((feature, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.15 + idx * 0.05 }}
              className="flex items-start gap-3"
            >
              <svg
                className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  plan.highlighted ? 'text-neon-500' : 'text-zinc-400'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-zinc-300 text-sm">{feature}</span>
            </motion.li>
          ))}
        </ul>

        {/* CTA Button */}
        <Button
          variant={plan.highlighted ? 'primary-glow' : 'secondary'}
          size="lg"
          className="w-full"
        >
          {plan.cta}
        </Button>
      </Card>
    </motion.div>
  );
}
