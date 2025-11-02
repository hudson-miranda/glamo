// components/FAQ.tsx - REFATORADO COM DESIGN SYSTEM BRAND (Soft Purple)
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../client/components/ui/Card';
import { GradientText } from '../../client/components/ui/GradientText';
import { Badge } from '../../client/components/ui/Badge';
import { Button } from '../../client/components/ui/Button';
import { GlowEffect } from '../../client/components/ui/GlowEffect';
import { useRef, useState, useEffect, KeyboardEvent } from 'react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: 1,
    question: 'How much does it cost?',
    answer: 'We offer plans starting from $49/month with all essential features. You get a 14-day free trial with no credit card required. Cancel anytime without penalties.',
  },
  {
    id: 2,
    question: 'Is there a free trial?',
    answer: 'Yes! We offer a 14-day free trial with full access to all premium features. No credit card needed for signup. Explore everything without commitment.',
  },
  {
    id: 3,
    question: 'Can I manage multiple professionals?',
    answer: 'Absolutely! You can add as many professionals and locations as you need. Each professional has their own schedule, and you get complete visibility through a centralized dashboard.',
  },
  {
    id: 4,
    question: 'What payment methods do you accept?',
    answer: 'We integrate with major platforms: credit/debit cards, PayPal, Stripe, and digital wallets. You can receive online payments or record cash transactions.',
  },
  {
    id: 5,
    question: 'Is WhatsApp integration available?',
    answer: 'Yes! We have native WhatsApp Business API integration. Send confirmations, reminders, promotions, and even allow bookings directly through WhatsApp.',
  },
  {
    id: 6,
    question: 'How does customer support work?',
    answer: 'We offer support in multiple languages via WhatsApp, email, and live chat. Our average response time is under 5 minutes during business hours.',
  },
];

export default function FAQ() {
  const [inView, setInView] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
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

  const toggleFAQ = (id: number) => {
    setOpenFAQ((prev) => (prev === id ? null : id));
  };

  return (
    <section
      ref={ref}
      className="relative py-24 bg-black text-white overflow-hidden"
    >
      {/* Glow Effects de fundo */}
      <GlowEffect position="top-right" size="xl" color="brand" animated />

      <div className="container mx-auto px-4 relative z-10">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="glow" className="mb-6">
            FAQ
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Frequently Asked{' '}
            <GradientText variant="brand" as="span" className="text-4xl md:text-6xl font-bold">
              Questions
            </GradientText>
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Everything you need to know about our platform
          </p>
        </motion.div>

        {/* Lista de FAQs */}
        <div className="max-w-3xl mx-auto space-y-4 mb-16">
          {faqs.map((faq, index) => (
            <FAQItemComponent
              key={faq.id}
              faq={faq}
              index={index}
              inView={inView}
              isOpen={openFAQ === faq.id}
              onToggle={() => toggleFAQ(faq.id)}
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
          <Card variant="glass-brand" className="max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">
              Still have questions?
            </h3>
            <p className="text-xl text-zinc-400 mb-8">
              Our team is ready to help you
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary-glow" size="lg">
                Contact Support
              </Button>
              <Button variant="secondary" size="lg">
                Schedule Demo
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

function FAQItemComponent({
  faq,
  index,
  inView,
  isOpen,
  onToggle,
}: {
  faq: FAQItem;
  index: number;
  inView: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Card
        variant={isOpen ? 'glass-brand' : 'glass'}
        className={`transition-all duration-300 ${
          isOpen ? 'shadow-glow-md border-brand-500/50' : ''
        }`}
      >
        <button
          onClick={onToggle}
          onKeyDown={onKeyDown}
          className="w-full flex items-center justify-between gap-4 text-left focus:outline-none"
          aria-expanded={isOpen}
          aria-controls={`faq-panel-${faq.id}`}
        >
          <h3
            className={`text-lg font-bold transition-colors duration-300 ${
              isOpen ? 'text-brand-500' : 'text-white'
            }`}
          >
            {faq.question}
          </h3>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              isOpen
                ? 'bg-gradient-to-br from-brand-500 to-purple-500'
                : 'bg-zinc-800'
            }`}
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </motion.div>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              id={`faq-panel-${faq.id}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
              role="region"
              aria-label={`Answer: ${faq.question}`}
            >
              <p className="text-zinc-300 leading-relaxed mt-4 pt-4 border-t border-zinc-800">
                {faq.answer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
