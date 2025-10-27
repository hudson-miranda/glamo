// components/Hero.tsx - PADRONIZADO
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

export default function Hero() {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

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
    <section ref={ref} className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold mb-6 border border-purple-500/30">
              🚀 A Revolução do Agendamento
            </span>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Transforme seu
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Negócio de Beleza
              </span>
            </h1>

            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              A plataforma completa com IA que automatiza agendamentos, 
              pagamentos e marketing. Mais tempo para você, mais resultados 
              para seu negócio.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {[
                { value: '2.500+', label: 'Profissionais' },
                { value: '50K+', label: 'Agendamentos/mês' },
                { value: '4.9/5', label: 'Avaliação' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105">
                Começar Grátis
              </button>
              <button className="px-8 py-4 bg-white/10 text-white rounded-full font-semibold text-lg border border-white/30 hover:bg-white/20 transition-all duration-300">
                Ver Demo
              </button>
            </motion.div>

            <p className="text-sm text-gray-400 mt-6">
              ✨ 14 dias grátis • Sem cartão de crédito • Cancele quando quiser
            </p>
          </motion.div>

          {/* Right side - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Dashboard mockup */}
            <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30">
                {/* Mock calendar */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-xs text-gray-400 font-semibold">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg flex items-center justify-center text-sm ${
                        i % 7 === 3 || i % 7 === 5
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold'
                          : 'bg-white/10 text-gray-400'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>

                {/* Mock appointments */}
                <div className="space-y-3">
                  {[
                    { time: '09:00', service: 'Corte + Barba', client: 'João Silva' },
                    { time: '11:30', service: 'Coloração', client: 'Maria Santos' },
                    { time: '14:00', service: 'Manicure', client: 'Ana Costa' }
                  ].map((apt, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, delay: 1 + i * 0.1 }}
                      className="bg-white/10 rounded-xl p-4 border border-white/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {apt.time.split(':')[0]}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white">{apt.service}</div>
                          <div className="text-sm text-gray-400">{apt.client}</div>
                        </div>
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-6 -right-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 shadow-xl"
              >
                <div className="text-2xl font-bold text-white">+40%</div>
                <div className="text-xs text-white/80">Eficiência</div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">IA Ativa</div>
                    <div className="text-xs text-gray-400">Otimizando agenda</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 bg-white rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}