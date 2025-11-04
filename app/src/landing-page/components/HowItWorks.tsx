// components/HowItWorks.tsx - PADRONIZADO E OTIMIZADO
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface Step {
  number: string;
  title: string;
  description: string;
  icon: string;
  details: string[];
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Cadastro Rápido',
    description: 'Crie sua conta em menos de 2 minutos',
    icon: '🚀',
    details: [
      'Sem burocracia ou documentação complexa',
      'Configure seu perfil e serviços',
      'Personalize cores e logo da sua marca'
    ]
  },
  {
    number: '02',
    title: 'Configure Serviços',
    description: 'Adicione seus serviços, preços e horários',
    icon: '⚙️',
    details: [
      'Cadastre serviços ilimitados',
      'Defina duração e valores',
      'Configure horários de atendimento'
    ]
  },
  {
    number: '03',
    title: 'Compartilhe Link',
    description: 'Envie seu link personalizado para clientes',
    icon: '🔗',
    details: [
      'Link único e profissional',
      'Compartilhe no WhatsApp, Instagram',
      'QR Code para impressão'
    ]
  },
  {
    number: '04',
    title: 'Receba Agendamentos',
    description: 'Clientes agendam 24/7, você só confirma',
    icon: '📅',
    details: [
      'Notificações em tempo real',
      'Confirmação automática por WhatsApp',
      'Lembretes para reduzir faltas'
    ]
  }
];

export default function HowItWorks() {
  const [inView, setInView] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
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
      className="relative py-24 bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white overflow-hidden"
    >
      {/* Fundo animado (sem cortes) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-10 right-1/4 w-[28rem] h-[28rem] bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-10 left-1/4 w-[28rem] h-[28rem] bg-pink-500 rounded-full blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold mb-4 border border-purple-500/30">
            COMO FUNCIONA
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simples como deve ser.
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Poderoso como você precisa.
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Em 4 passos simples, você está pronto para receber agendamentos
          </p>
        </motion.div>

        {/* Grid de passos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <StepCard
              key={index}
              step={step}
              index={index}
              inView={inView}
              isActive={activeStep === index}
              onClick={() => setActiveStep(index)}
            />
          ))}
        </div>

        {/* Detalhes do passo ativo */}
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 max-w-4xl mx-auto"
          aria-live="polite"
        >
          <div className="flex items-start gap-6">
            <div className="text-6xl" aria-hidden="true">{steps[activeStep].icon}</div>
            <div className="flex-1">
              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {steps[activeStep].title}
              </h3>
              <p className="text-xl text-gray-400 mb-6">
                {steps[activeStep].description}
              </p>
              <ul className="space-y-3">
                {steps[activeStep].details.map((detail, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.06 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-300">{detail}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <button className="px-8 py-4 bg-gradient-to-r from-brand-400 to-brand-600 text-white rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105">
            Começar Agora
          </button>
          <p className="text-sm text-gray-400 mt-4">
            ✨ Configuração em menos de 5 minutos
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function StepCard({
  step,
  index,
  inView,
  isActive,
  onClick
}: {
  step: Step;
  index: number;
  inView: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={onClick}
      className={`group cursor-pointer bg-white/5 backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 ${
        isActive
          ? 'border-purple-500/50 shadow-xl shadow-purple-500/20 scale-[1.02]'
          : 'border-white/10 hover:border-purple-500/30 hover:scale-105'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      aria-pressed={isActive}
      aria-label={`Selecionar passo ${step.number}: ${step.title}`}
    >
      {/* Número */}
      <div className="text-6xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 opacity-50 select-none">
        {step.number}
      </div>

      {/* Ícone */}
      <div className="text-5xl mb-4 select-none" aria-hidden="true">
        {step.icon}
      </div>

      {/* Conteúdo */}
      <h3 className="text-xl font-bold mb-2 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-300">
        {step.title}
      </h3>
      <p className="text-gray-400 text-sm leading-relaxed">
        {step.description}
      </p>

      {/* Indicador */}
      <div
        className={`mt-4 flex items-center gap-2 text-purple-400 transition-opacity duration-300 ${
          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <span className="text-sm font-semibold">Ver detalhes</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </motion.div>
  );
}
