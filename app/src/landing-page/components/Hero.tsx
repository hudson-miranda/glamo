// components/Hero.tsx - REFATORADO COM DESIGN SYSTEM NEON
import { motion } from 'framer-motion';
import { Button } from '../../client/components/ui/Button';
import { GradientText } from '../../client/components/ui/GradientText';
import { Badge } from '../../client/components/ui/Badge';
import { GlowEffect } from '../../client/components/ui/GlowEffect';
import { useRef, useState, useEffect } from 'react';
import { Link } from 'wasp/client/router';

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
      className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden pt-20"
    >
      {/* Glow Effects de fundo */}
      <GlowEffect position="top-left" size="xl" color="neon" animated />
      <GlowEffect position="bottom-right" size="xl" color="purple" animated />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="glow" className="mb-6">
              🚀 A Revolução do Agendamento
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Seamless solution
              <br />
              <GradientText variant="neon" as="span" className="text-5xl md:text-7xl font-bold">
                with magic!
              </GradientText>
            </h1>

            <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
              Let's be the project management platform that aims for teams to
              be structured and become aware of their projects.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {[
                { value: '⭐⭐⭐⭐⭐', label: '5 Stars Rating' },
                { value: '5.9M+', label: 'Total Users' },
                { value: '10+', label: 'Products' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <div className="text-xl md:text-2xl font-bold text-neon-500">
                    {stat.value}
                  </div>
                  <div className="text-sm text-zinc-400">{stat.label}</div>
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
                  Get Free Demo
                </Button>
              </Link>
              <Button variant="secondary" size="lg">
                Watch Demo
              </Button>
            </motion.div>

            <p className="text-sm text-zinc-400 mt-6">
              ✨ 14 days free trial • No credit card required • Cancel anytime
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
            <div className="relative glass-card p-8 border border-zinc-800/50">
              <div className="bg-gradient-to-br from-neon-500/10 to-purple-500/10 rounded-2xl p-6 border border-neon-500/30">
                {/* Mock stats cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="glass-card p-4 border border-zinc-800/50">
                    <div className="text-sm text-zinc-400 mb-1">My Balance</div>
                    <div className="text-2xl font-bold text-neon-500">$5476</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-green-400 text-xs">↑ 12%</span>
                      <span className="text-xs text-zinc-500">vs last month</span>
                    </div>
                  </div>
                  <div className="glass-card p-4 border border-zinc-800/50">
                    <div className="text-sm text-zinc-400 mb-1">Total Sales</div>
                    <div className="text-2xl font-bold text-white">$12,143</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-green-400 text-xs">↑ 8%</span>
                      <span className="text-xs text-zinc-500">this week</span>
                    </div>
                  </div>
                </div>

                {/* Mock chart area */}
                <div className="glass-card p-4 border border-zinc-800/50 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-white">My Progress</span>
                    <span className="text-xs text-zinc-400">Weekly</span>
                  </div>
                  <div className="flex items-end gap-1 h-24">
                    {[60, 80, 45, 90, 70, 85, 95].map((height, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-neon-500 to-neon-400 rounded-t" style={{ height: `${height}%` }}></div>
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
                      className="glass-card p-4 border border-zinc-800/50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-neon-500 to-purple-500 rounded-lg"></div>
                        <div>
                          <div className="font-semibold text-white text-sm">{tx.name}</div>
                          <div className="text-xs text-zinc-400">Description lorem...</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-neon-500">{tx.amount}</div>
                        <Badge variant="neon" className="text-xs px-2 py-0.5 mt-1">{tx.status}</Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-6 -right-6 glass-neon p-4 shadow-glow-lg"
              >
                <div className="text-2xl font-bold text-neon-500">+40%</div>
                <div className="text-xs text-zinc-400">Efficiency</div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute -bottom-6 -left-6 glass-card p-4 border border-neon-500/30"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-neon-500 to-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">AI Active</div>
                    <div className="text-xs text-zinc-400">Optimizing</div>
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
          className="w-6 h-10 border-2 border-zinc-700 rounded-full flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 bg-neon-500 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
