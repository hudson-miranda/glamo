// components/FAQ.tsx - PADRONIZADO E OTIMIZADO
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, KeyboardEvent } from 'react';

interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
  relatedLinks?: {
    text: string;
    url: string;
  }[];
}

const faqCategories = [
  'Todos',
  'Planos e Preços',
  'Funcionalidades',
  'Suporte',
  'Segurança',
  'Integração'
];

const faqs: FAQItem[] = [
  {
    id: 1,
    category: 'Planos e Preços',
    question: 'Quanto custa o Glamo?',
    answer: 'Oferecemos planos a partir de R$ 49/mês com todos os recursos essenciais. Temos um período de teste gratuito de 14 dias, sem necessidade de cartão de crédito. Você pode cancelar a qualquer momento sem multas ou taxas.',
    relatedLinks: [
      { text: 'Ver todos os planos', url: '/pricing' },
      { text: 'Comparar recursos', url: '/features' }
    ]
  },
  {
    id: 2,
    category: 'Planos e Preços',
    question: 'Existe período de teste gratuito?',
    answer: 'Sim! Oferecemos 14 dias de teste gratuito com acesso completo a todos os recursos premium. Não pedimos cartão de crédito no cadastro. Você pode explorar todas as funcionalidades sem compromisso.',
    relatedLinks: [
      { text: 'Começar teste grátis', url: '/signup' }
    ]
  },
  {
    id: 3,
    category: 'Planos e Preços',
    question: 'Vocês cobram taxa sobre as vendas?',
    answer: 'Não! Diferente de outras plataformas, não cobramos nenhuma taxa sobre suas vendas ou transações. Você paga apenas a mensalidade fixa do plano escolhido. Todo o dinheiro que você ganha é 100% seu.',
    relatedLinks: [
      { text: 'Entender modelo de preços', url: '/pricing' }
    ]
  },
  {
    id: 4,
    category: 'Funcionalidades',
    question: 'Como funciona o agendamento inteligente com IA?',
    answer: 'Nossa IA analisa o histórico de agendamentos, preferências dos clientes, taxa de ocupação e outros fatores para sugerir os melhores horários. Ela também envia lembretes automáticos e pode prever possíveis cancelamentos, ajudando você a otimizar sua agenda.',
    relatedLinks: [
      { text: 'Ver demo da IA', url: '/features/ai' }
    ]
  },
  {
    id: 5,
    category: 'Funcionalidades',
    question: 'Posso gerenciar múltiplos profissionais e locais?',
    answer: 'Sim! Você pode adicionar quantos profissionais e locais precisar. Cada profissional tem sua própria agenda, e você tem visão completa de tudo em um dashboard centralizado. Perfeito para salões e clínicas com múltiplas unidades.',
    relatedLinks: [
      { text: 'Recursos para equipes', url: '/features/team' }
    ]
  },
  {
    id: 6,
    category: 'Funcionalidades',
    question: 'Os clientes podem agendar pelo celular?',
    answer: 'Sim! Seus clientes podem agendar 24/7 através do app mobile (iOS e Android) ou pelo link personalizado que você compartilha. Eles recebem confirmações automáticas por WhatsApp, SMS ou email.',
    relatedLinks: [
      { text: 'Ver app mobile', url: '/mobile' }
    ]
  },
  {
    id: 7,
    category: 'Integração',
    question: 'Quais formas de pagamento são aceitas?',
    answer: 'Integramos com as principais plataformas: PIX, cartão de crédito/débito, boleto e carteiras digitais. Você pode receber pagamentos online ou registrar pagamentos em dinheiro. Tudo sincronizado automaticamente no seu financeiro.',
    relatedLinks: [
      { text: 'Integrações de pagamento', url: '/integrations/payments' }
    ]
  },
  {
    id: 8,
    category: 'Integração',
    question: 'Posso integrar com WhatsApp?',
    answer: 'Sim! Temos integração nativa com WhatsApp Business API. Envie confirmações, lembretes, promoções e até permita agendamentos direto pelo WhatsApp. Tudo automatizado.',
    relatedLinks: [
      { text: 'Configurar WhatsApp', url: '/integrations/whatsapp' }
    ]
  },
  {
    id: 9,
    category: 'Suporte',
    question: 'Como funciona o suporte?',
    answer: 'Oferecemos suporte em português via WhatsApp, email e chat ao vivo. Nosso tempo médio de resposta é inferior a 5 minutos durante horário comercial. Também temos uma base de conhecimento completa e tutoriais em vídeo.',
    relatedLinks: [
      { text: 'Central de ajuda', url: '/help' },
      { text: 'Falar com suporte', url: '/contact' }
    ]
  },
  {
    id: 10,
    category: 'Suporte',
    question: 'Vocês oferecem treinamento?',
    answer: 'Sim! Todo novo cliente recebe onboarding personalizado gratuito. Também oferecemos webinars semanais, tutoriais em vídeo e documentação completa. Para planos enterprise, oferecemos treinamento presencial.',
    relatedLinks: [
      { text: 'Agendar onboarding', url: '/onboarding' }
    ]
  },
  {
    id: 11,
    category: 'Segurança',
    question: 'Meus dados estão seguros?',
    answer: 'Absolutamente! Usamos criptografia de ponta a ponta, servidores em nuvem com certificação ISO 27001, backups diários automáticos e somos 100% conformes com a LGPD. Seus dados nunca são compartilhados com terceiros.',
    relatedLinks: [
      { text: 'Política de privacidade', url: '/privacy' },
      { text: 'Certificações', url: '/security' }
    ]
  },
  {
    id: 12,
    category: 'Segurança',
    question: 'Vocês são conformes com a LGPD?',
    answer: 'Sim! Somos 100% conformes com a Lei Geral de Proteção de Dados (LGPD). Temos ferramentas integradas para gestão de consentimento, exportação de dados e direito ao esquecimento. Você e seus clientes estão protegidos.',
    relatedLinks: [
      { text: 'Conformidade LGPD', url: '/lgpd' }
    ]
  },
  {
    id: 13,
    category: 'Funcionalidades',
    question: 'Posso personalizar a aparência do sistema?',
    answer: 'Sim! Você pode personalizar cores, logo, domínio personalizado e até criar sua própria marca no app que seus clientes usam. Tudo para manter a identidade visual do seu negócio.',
    relatedLinks: [
      { text: 'Opções de personalização', url: '/features/branding' }
    ]
  },
  {
    id: 14,
    category: 'Funcionalidades',
    question: 'Como funcionam os relatórios e analytics?',
    answer: 'Temos dashboards em tempo real com métricas de faturamento, ocupação, clientes mais frequentes, serviços mais vendidos, horários de pico e muito mais. Você pode exportar relatórios em PDF ou Excel e configurar relatórios automáticos por email.',
    relatedLinks: [
      { text: 'Ver demo do dashboard', url: '/features/analytics' }
    ]
  },
  {
    id: 15,
    category: 'Integração',
    question: 'Posso importar meus dados de outro sistema?',
    answer: 'Sim! Oferecemos importação gratuita de dados de clientes, serviços e histórico de agendamentos. Suportamos arquivos Excel, CSV e integrações diretas com os principais sistemas do mercado. Nossa equipe ajuda no processo.',
    relatedLinks: [
      { text: 'Solicitar importação', url: '/migration' }
    ]
  }
];

interface FAQProps {
  faqs?: typeof faqs;
}

export default function FAQ({ faqs: faqsProp }: FAQProps = {}) {
  const faqsData = faqsProp || faqs;
  const [inView, setInView] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredFAQs = faqsData.filter((faq) => {
    const matchesCategory = activeCategory === 'Todos' || faq.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      faq.question.toLowerCase().includes(q) ||
      faq.answer.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (id: number) => {
    setOpenFAQ((prev) => (prev === id ? null : id));
  };

  return (
    <section
      ref={ref}
      className="relative py-24 bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white overflow-hidden"
    >
      {/* Fundo animado (sem cortes) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-10 left-1/4 w-[28rem] h-[28rem] bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-10 right-1/4 w-[28rem] h-[28rem] bg-pink-500 rounded-full blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold mb-4 border border-purple-500/30">
            FAQ
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Perguntas Frequentes.
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Respostas Claras.
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Tudo que você precisa saber sobre o Glamo
          </p>

          {/* Busca */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar perguntas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pl-14 rounded-full bg-white/5 backdrop-blur-sm border-2 border-white/10 focus:border-purple-500/50 focus:outline-none text-lg transition-colors duration-300 text-white placeholder-gray-400"
                aria-label="Buscar perguntas frequentes"
              />
              <svg
                className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Filtros de categoria */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap gap-3 justify-center mb-12"
        >
          {faqCategories.map((category, index) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={index}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20 border border-white/10'
                }`}
                aria-pressed={isActive}
                aria-label={`Filtrar por categoria: ${category}`}
              >
                {category}
              </button>
            );
          })}
        </motion.div>

        {/* Lista de FAQs */}
        <div className="max-w-4xl mx-auto">
          {filteredFAQs.length > 0 ? (
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
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
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold mb-2">
                Nenhuma pergunta encontrada
              </h3>
              <p className="text-gray-400">
                Tente buscar com outras palavras ou selecione outra categoria
              </p>
            </motion.div>
          )}
        </div>

        {/* CTA final */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10"
        >
          <h3 className="text-3xl font-bold mb-4">
            Ainda tem dúvidas?
          </h3>
          <p className="text-xl text-gray-400 mb-8">
            Nossa equipe está pronta para ajudar você
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105">
              Falar com Suporte
            </button>
            <button className="px-8 py-4 bg-white/10 text-white rounded-full font-semibold text-lg border border-white/30 hover:bg-white/20 transition-all duration-300">
              Agendar Demo
            </button>
          </div>
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
  onToggle
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
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className={`bg-white/5 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300 ${
        isOpen ? 'border-purple-500/50 shadow-xl shadow-purple-500/20' : 'border-white/10'
      }`}
    >
      <button
        onClick={onToggle}
        onKeyDown={onKeyDown}
        className="w-full p-6 flex items-start gap-4 text-left focus:outline-none focus:ring-2 focus:ring-purple-500/40 rounded-2xl"
        aria-expanded={isOpen}
        aria-controls={`faq-panel-${faq.id}`}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
            isOpen ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-white/10'
          }`}
          aria-hidden="true"
        >
          <motion.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className={`w-6 h-6 ${isOpen ? 'text-white' : 'text-gray-400'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {/* Ícone corrigido (seta para baixo) */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-semibold text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
              {faq.category}
            </span>
          </div>
          <h3
            className={`text-lg font-bold transition-colors duration-300 ${
              isOpen
                ? 'text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text'
                : 'text-white'
            }`}
          >
            {faq.question}
          </h3>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-panel-${faq.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden"
            role="region"
            aria-label={`Resposta: ${faq.question}`}
          >
            <div className="px-6 pb-6 pl-20">
              <p className="text-gray-300 leading-relaxed mb-4">
                {faq.answer}
              </p>

              {faq.relatedLinks && faq.relatedLinks.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {faq.relatedLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-300 underline-offset-4 hover:underline"
                    >
                      {link.text}
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}