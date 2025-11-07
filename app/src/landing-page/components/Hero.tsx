// components/Hero.tsx - REFATORADO COM DESIGN SYSTEM BRAND (Soft Purple)
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Button } from '../../client/components/ui/Button';
import { Badge } from '../../client/components/ui/Badge';
import { GlowEffect } from '../../client/components/ui/GlowEffect';
import { GradientText } from '../../client/components/ui/GradientText';

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
    <section 
      ref={ref} 
      className="relative min-h-screen flex items-center justify-center bg-white dark:bg-black text-gray-900 dark:text-white overflow-hidden pt-20 transition-colors duration-300"
    >
      {/* Efeitos de fundo */}
      <GlowEffect position="top-left" size="xl" color="brand" animated />
      <GlowEffect position="bottom-right" size="xl" color="brand" animated />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="glow" className="mb-6">
              ✨ Sistema de Gestão Completo para Salões
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Gestão Inteligente
              <br />
              <GradientText variant="brand" as="span" className="text-5xl md:text-7xl font-bold">
                para seu Negócio!
              </GradientText>
            </h1>

            <p className="text-xl text-gray-600 dark:text-zinc-400 mb-8 leading-relaxed">
              Agendamentos, controle financeiro, gestão de estoque e clientes.
              Tudo em um só lugar, simples e automático.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {[
                { value: '⭐⭐⭐⭐⭐', label: 'Avaliação 5 Estrelas' },
                { value: '1000+', label: 'Salões Ativos' },
                { value: '9', label: 'Módulos Integrados' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <div className="text-xl md:text-2xl font-bold text-brand-500">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-zinc-400">{stat.label}</div>
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
              <Link to="/signup">
                <Button variant="primary-glow" size="lg">
                  Começar Teste Grátis
                </Button>
              </Link>
              <Button variant="secondary" size="lg">
                Ver Demonstração
              </Button>
            </motion.div>

            <p className="text-sm text-gray-600 dark:text-zinc-400 mt-6">
              ✨ 14 dias grátis • Sem cartão de crédito • Cancele quando quiser
            </p>
          </motion.div>

          {/* Right side - Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Dashboard mockup */}
            <div className="relative p-8 border border-gray-200/50 dark:border-zinc-800/50 bg-transparent dark:bg-transparent">
              <div className="bg-gradient-to-br from-brand-500/10 to-brand-500/10 rounded-2xl p-6 border border-brand-500/30">
                {/* Mock stats cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 border border-gray-200/50 dark:border-zinc-800/50 bg-transparent dark:bg-transparent">
                    <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">Faturamento Hoje</div>
                    <div className="text-2xl font-bold text-brand-500">R$ 2.847</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-green-400 text-xs">↑ 18%</span>
                      <span className="text-xs text-gray-500 dark:text-zinc-500">vs mês passado</span>
                    </div>
                  </div>
                  <div className="p-4 border border-gray-200/50 dark:border-zinc-800/50 bg-transparent dark:bg-transparent">
                    <div className="text-sm text-gray-600 dark:text-zinc-400 mb-1">Agendamentos</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">24</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-green-400 text-xs">↑ 12%</span>
                      <span className="text-xs text-gray-500 dark:text-zinc-500">esta semana</span>
                    </div>
                  </div>
                </div>

                {/* Mock chart area */}
                <div className="p-4 border border-gray-200/50 dark:border-zinc-800/50 mb-4 bg-transparent dark:bg-transparent">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Faturamento Semanal</span>
                    <span className="text-xs text-gray-600 dark:text-zinc-400">Últimos 7 dias</span>
                  </div>
                  <div className="flex items-end gap-1 h-24">
                    {[60, 80, 45, 90, 70, 85, 95].map((height, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-brand-500 to-brand-400 rounded-t" style={{ height: `${height}%` }}></div>
                    ))}
                  </div>
                </div>

                {/* Mock transactions */}
                <div className="space-y-3">
                  {[
                    { name: 'Product ttile', amount: '+$230', status: 'New' },
                    { name: 'Product ttile', amount: '+$180', status: 'Sold' },
                  ].map((tx, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, delay: 1 + i * 0.1 }}
                      className="p-4 border border-gray-200/50 dark:border-zinc-800/50 flex items-center justify-between bg-transparent dark:bg-transparent"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-500 rounded-lg"></div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">{tx.name}</div>
                          <div className="text-xs text-gray-600 dark:text-zinc-400">Description lorem...</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-brand-500">{tx.amount}</div>
                        <Badge variant="brand" className="text-xs px-2 py-0.5 mt-1">{tx.status}</Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-6 -right-6 border border-brand-500/30 p-4 bg-transparent dark:bg-transparent rounded-2xl"
              >
                <div className="text-2xl font-bold text-brand-500">+40%</div>
                <div className="text-xs text-gray-600 dark:text-zinc-400">Efficiency</div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute -bottom-6 -left-6 p-4 border border-brand-500/30 bg-transparent dark:bg-transparent rounded-2xl"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white dark:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">AI Active</div>
                    <div className="text-xs text-gray-600 dark:text-zinc-400">Optimizing</div>
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
          className="w-6 h-10 border-2 border-gray-300 dark:border-zinc-700 rounded-full flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 bg-brand-500 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
