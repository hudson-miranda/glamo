// components/FeaturesGrid.tsx - PADRONIZADO E OTIMIZADO
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

export interface GridFeature {
  name: string;
  description: string;
  emoji: string;
  size: 'small' | 'medium' | 'large';
  href: string;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
  color: string; // tailwind gradient: "from-... to-..."
  benefits: string[];
}

const features: Feature[] = [
  {
    icon: '🤖',
    title: 'IA Inteligente',
    description: 'Inteligência artificial que aprende com seu negócio e otimiza automaticamente',
    color: 'from-brand-500 to-brand-500',
    benefits: [
      'Sugestão automática de horários',
      'Previsão de cancelamentos',
      'Otimização de agenda',
      'Insights personalizados'
    ]
  },
  {
    icon: '📅',
    title: 'Agendamento 24/7',
    description: 'Seus clientes agendam a qualquer hora, de qualquer lugar',
    color: 'from-blue-500 to-cyan-500',
    benefits: [
      'Link personalizado',
      'App mobile nativo',
      'Sincronização em tempo real',
      'Múltiplos profissionais'
    ]
  },
  {
    icon: '💳',
    title: 'Pagamentos Online',
    description: 'Receba pagamentos antecipados e reduza inadimplência',
    color: 'from-green-500 to-emerald-500',
    benefits: [
      'PIX, cartão e boleto',
      'Pagamento antecipado',
      'Split de pagamentos',
      'Relatórios financeiros'
    ]
  },
  {
    icon: '📱',
    title: 'WhatsApp Integrado',
    description: 'Confirmações, lembretes e marketing direto no WhatsApp',
    color: 'from-green-400 to-green-600',
    benefits: [
      'Confirmações automáticas',
      'Lembretes personalizados',
      'Campanhas de marketing',
      'Atendimento integrado'
    ]
  },
  {
    icon: '📊',
    title: 'Analytics Avançado',
    description: 'Dashboards em tempo real com todas as métrricas do seu negócio',
    color: 'from-orange-500 to-red-500',
    benefits: [
      'Faturamento em tempo real',
      'Taxa de ocupação',
      'Clientes mais frequentes',
      'Serviços mais vendidos'
    ]
  },
  {
    icon: '👥',
    title: 'CRM Completo',
    description: 'Gerencie relacionamento com clientes e fidelize mais',
    color: 'from-brand-500 to-rose-500',
    benefits: [
      'Histórico completo',
      'Preferências salvas',
      'Programa de fidelidade',
      'Aniversariantes do mês'
    ]
  },
  {
    icon: '🎯',
    title: 'Marketing Automático',
    description: 'Campanhas inteligentes para trazer clientes de volta',
    color: 'from-violet-500 to-brand-500',
    benefits: [
      'Email marketing',
      'SMS em massa',
      'Promoções automáticas',
      'Recuperação de clientes'
    ]
  },
  {
    icon: '🔒',
    title: 'Segurança Total',
    description: 'Seus dados protegidos com criptografia de ponta a ponta',
    color: 'from-gray-600 to-gray-800',
    benefits: [
      'Criptografia SSL',
      'Backup automático',
      'LGPD compliant',
      'Certificação ISO'
    ]
  },
  {
    icon: '🌐',
    title: 'Multi-unidades',
    description: 'Gerencie múltiplas unidades em um único painel',
    color: 'from-indigo-500 to-blue-600',
    benefits: [
      'Visão consolidada',
      'Gestão centralizada',
      'Relatórios por unidade',
      'Transferência entre unidades'
    ]
  },
  {
    icon: '⚡',
    title: 'Super Rápido',
    description: 'Interface otimizada que carrega em milissegundos',
    color: 'from-yellow-500 to-orange-500',
    benefits: [
      'Carregamento instantâneo',
      'Funciona offline',
      'Sincronização rápida',
      'Zero travamentos'
    ]
  },
  {
    icon: '🎨',
    title: 'Personalizável',
    description: 'Customize cores, logo e domínio com sua marca',
    color: 'from-brand-400 to-brand-400',
    benefits: [
      'Logo personalizado',
      'Cores da marca',
      'Domínio próprio',
      'White label'
    ]
  },
  {
    icon: '🇧🇷',
    title: 'Suporte BR',
    description: 'Equipe brasileira que responde em minutos',
    color: 'from-green-500 to-yellow-500',
    benefits: [
      'WhatsApp direto',
      'Chat ao vivo',
      'Email em português',
      'Resposta < 5min'
    ]
  }
];

export default function FeaturesGrid() {
  const [inView, setInView] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative py-24 bg-gradient-to-b from-black via-black to-gray-900 text-white overflow-hidden"
    >
      {/* Fundo animado (sem cortes) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[28rem] h-[28rem] bg-brand-500 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-[28rem] h-[28rem] bg-brand-500 rounded-full blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-2 bg-brand-500/20 text-purple-300 rounded-full text-sm font-semibold mb-4 border border-brand-500/30">
            FUNCIONALIDADES
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Tudo que você precisa.
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              Em um único lugar.
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Mais de 50 funcionalidades poderosas para transformar seu negócio
          </p>
        </motion.div>

        {/* Grid de features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              feature={feature}
              index={index}
              inView={inView}
              isSelected={selectedFeature === index}
              onClick={() =>
                setSelectedFeature(selectedFeature === index ? null : index)
              }
            />
          ))}
        </div>

        {/* Detalhe do item selecionado */}
        {selectedFeature !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 max-w-4xl mx-auto"
          >
            <div className="flex items-start gap-6">
              <div
                className={`w-20 h-20 bg-gradient-to-r ${features[selectedFeature].color} rounded-2xl flex items-center justify-center text-4xl flex-shrink-0`}
              >
                {features[selectedFeature].icon}
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
                  {features[selectedFeature].title}
                </h3>
                <p className="text-xl text-gray-400 mb-6">
                  {features[selectedFeature].description}
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {features[selectedFeature].benefits.map((benefit, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <div
                        className={`w-6 h-6 bg-gradient-to-r ${features[selectedFeature].color} rounded-full flex items-center justify-center flex-shrink-0`}
                      >
                        <svg
                          className="w-4 h-4 text-white"
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
                      </div>
                      <span className="text-gray-300">{benefit}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setSelectedFeature(null)}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors duration-300"
                aria-label="Fechar detalhes da funcionalidade"
              >
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </motion.div>
        )}

        {/* CTA final */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <button className="px-8 py-4 bg-gradient-to-r from-brand-400 to-brand-600 text-white rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105">
            Começar Agora - É Grátis
          </button>
          <p className="text-sm text-gray-400 mt-4">
            ✨ 14 dias grátis • Sem cartão de crédito • Cancele quando quiser
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
  isSelected,
  onClick
}: {
  feature: Feature;
  index: number;
  inView: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      onClick={onClick}
      className={`group cursor-pointer bg-white/5 backdrop-blur-sm rounded-2xl p-6 border ${
        isSelected
          ? 'border-purple-500/50 shadow-xl shadow-purple-500/20 scale-105'
          : 'border-white/10 hover:border-purple-500/30 hover:scale-105'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      aria-pressed={isSelected}
      aria-label={`Abrir detalhes de ${feature.title}`}
    >
      <div
        className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300`}
      >
        {feature.icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-white group-hover:text-purple-300 transition-colors duration-300">
        {feature.title}
      </h3>
      <p className="text-gray-400 text-sm">{feature.description}</p>
    </motion.div>
  );
}
