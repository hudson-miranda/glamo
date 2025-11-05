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
    question: 'Como funciona o período de teste gratuito?',
    answer: 'Você tem 14 dias para testar todas as funcionalidades do Glamo sem precisar informar cartão de crédito. É só criar sua conta e começar a usar imediatamente.',
  },
  {
    id: 2,
    question: 'Preciso instalar algum software?',
    answer: 'Não! O Glamo é 100% online (cloud). Você acessa de qualquer navegador, no computador, tablet ou celular. Sempre atualizado e sem instalação.',
  },
  {
    id: 3,
    question: 'Posso gerenciar vários profissionais?',
    answer: 'Sim! Você pode adicionar quantos profissionais e unidades precisar. Cada profissional tem sua própria agenda e você tem visão completa através de um painel centralizado.',
  },
  {
    id: 4,
    question: 'Quais formas de pagamento são aceitas?',
    answer: 'Integramos com as principais plataformas: cartões de crédito/débito, Mercado Pago, PagSeguro e carteiras digitais. Você pode receber online ou registrar pagamentos em dinheiro.',
  },
  {
    id: 5,
    question: 'Tem integração com WhatsApp?',
    answer: 'Sim! Temos integração nativa com WhatsApp Business API. Envie confirmações, lembretes, promoções e até permita agendamentos direto pelo WhatsApp.',
  },
  {
    id: 6,
    question: 'Como funciona o suporte?',
    answer: 'Oferecemos suporte 100% em português via WhatsApp, email e chat. Nosso tempo médio de resposta é de 5 minutos no horário comercial.',
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
      className="relative py-24 bg-white dark:bg-black text-gray-900 dark:text-white overflow-hidden transition-colors duration-300"
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
            PERGUNTAS FREQUENTES
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Dúvidas{' '}
            <GradientText variant="brand" as="span" className="text-4xl md:text-6xl font-bold">
              Frequentes
            </GradientText>
          </h2>
          <p className="text-xl text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Tudo que você precisa saber sobre o Glamo
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
            <h3 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Still have questions?
            </h3>
            <p className="text-xl text-gray-600 dark:text-zinc-400 mb-8">
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
              isOpen ? 'text-brand-500' : 'text-gray-900 dark:text-white'
            }`}
          >
            {faq.question}
          </h3>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              isOpen
                ? 'bg-gradient-to-br from-brand-500 to-brand-500'
                : 'bg-gray-200 dark:bg-zinc-800'
            }`}
          >
            <svg
              className={`w-5 h-5 ${isOpen ? 'text-white' : 'text-gray-700 dark:text-white'}`}
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
              <p className="text-gray-700 dark:text-zinc-300 leading-relaxed mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800">
                {faq.answer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
