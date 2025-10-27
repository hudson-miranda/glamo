// components/WhyDifferent.tsx - MELHORADO
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface Differentiator {
  title: string;
  description: string;
  icon: string;
  stats: {
    value: string;
    label: string;
  };
  comparison: {
    others: string;
    glamo: string;
  };
}

const differentiators: Differentiator[] = [
  {
    title: 'IA Integrada',
    description: 'Única plataforma com inteligência artificial nativa que aprende com seu negócio',
    icon: '🤖',
    stats: {
      value: '40%',
      label: 'Mais eficiência'
    },
    comparison: {
      others: 'Agendamento manual e repetitivo',
      glamo: 'IA sugere horários, serviços e otimiza agenda automaticamente'
    }
  },
  {
    title: 'Tudo-em-Um',
    description: 'Não precisa de 5 ferramentas diferentes. Tudo integrado em uma única plataforma',
    icon: '🎯',
    stats: {
      value: 'R$ 500',
      label: 'Economia mensal'
    },
    comparison: {
      others: 'Múltiplas assinaturas e integrações complexas',
      glamo: 'Agendamento + Pagamento + CRM + Marketing em um só lugar'
    }
  },
  {
    title: 'Suporte Brasileiro',
    description: 'Equipe local que entende seu negócio e responde em minutos, não dias',
    icon: '🇧🇷',
    stats: {
      value: '< 5min',
      label: 'Tempo de resposta'
    },
    comparison: {
      others: 'Suporte em inglês, tickets demorados',
      glamo: 'WhatsApp direto, suporte em português, respostas rápidas'
    }
  },
  {
    title: 'Preço Justo',
    description: 'Sem taxas escondidas, sem surpresas. Você cresce, nós crescemos juntos',
    icon: '💰',
    stats: {
      value: '0%',
      label: 'Taxa sobre vendas'
    },
    comparison: {
      others: 'Taxas de 5-10% sobre cada venda',
      glamo: 'Mensalidade fixa, sem taxas sobre transações'
    }
  }
];

export default function WhyDifferent() {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-gray-900 to-black text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold mb-4 border border-purple-500/30">
            POR QUE GLAMO?
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Não somos mais um sistema.
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Somos seu parceiro de crescimento.
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Enquanto outros oferecem ferramentas, nós oferecemos resultados
          </p>
        </motion.div>

        {/* Comparison Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {differentiators.map((diff, index) => (
            <DifferentiatorCard
              key={index}
              differentiator={diff}
              index={index}
              inView={inView}
            />
          ))}
        </div>

        {/* Interactive Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10"
        >
          <h3 className="text-3xl font-bold text-center mb-8">
            Comparação Lado a Lado
          </h3>

          {/* Tabs */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            {differentiators.map((diff, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeTab === index
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                <span className="mr-2">{diff.icon}</span>
                {diff.title}
              </button>
            ))}
          </div>

          {/* Comparison Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* Others */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-red-400">Outras Plataformas</h4>
              </div>
              <p className="text-gray-300 leading-relaxed">
                {differentiators[activeTab].comparison.others}
              </p>
            </div>

            {/* Glamo */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-purple-300">Glamo</h4>
              </div>
              <p className="text-white leading-relaxed">
                {differentiators[activeTab].comparison.glamo}
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Social Proof Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: '2.500+', label: 'Profissionais ativos' },
            { value: '98%', label: 'Satisfação' },
            { value: '50K+', label: 'Agendamentos/mês' },
            { value: '4.9/5', label: 'Avaliação média' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center mt-16"
        >
          <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105">
            Experimente a Diferença
          </button>
          <p className="text-sm text-gray-400 mt-4">
            ✨ 14 dias grátis • Cancele quando quiser
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function DifferentiatorCard({ differentiator, index, inView }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      whileHover={{ y: -8 }}
      className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300"
    >
      {/* Icon & Stats */}
      <div className="flex items-start justify-between mb-6">
        <div className="text-6xl">{differentiator.icon}</div>
        <div className="text-right">
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {differentiator.stats.value}
          </div>
          <div className="text-sm text-gray-400">{differentiator.stats.label}</div>
        </div>
      </div>

      {/* Content */}
      <h3 className="text-2xl font-bold mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-300">
        {differentiator.title}
      </h3>
      <p className="text-gray-400 leading-relaxed">
        {differentiator.description}
      </p>

      {/* Arrow indicator */}
      <div className="mt-6 flex items-center gap-2 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-sm font-semibold">Saiba mais</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </motion.div>
  );
}