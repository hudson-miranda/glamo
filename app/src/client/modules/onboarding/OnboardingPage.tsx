import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from 'wasp/client/auth';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { GlowEffect } from '../../components/ui/GlowEffect';
import { GradientText } from '../../components/ui/GradientText';
import { Badge } from '../../../components/ui/badge';
import DarkModeSwitcher from '../../components/DarkModeSwitcher';
import { Scissors, Users, ArrowRight, Building2, Sparkles } from 'lucide-react';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { data: user } = useAuth();
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If user already has active salon, redirect to dashboard
    if (user?.activeSalonId) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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

  const handleCreateSalon = () => {
    navigate('/onboarding/create-salon');
  };

  const handleWaitForInvite = () => {
    navigate('/onboarding/waiting-invite');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-brand-50/20 to-white dark:from-black dark:via-brand-950/20 dark:to-black transition-colors duration-300">
      {/* NavBar */}
      <header className='sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            {/* Logo */}
            <Link to="/" className='flex items-center gap-3 group'>
              {/*<div className='w-10 h-10 bg-gradient-to-r from-brand-400 to-brand-600 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6'>
                <span className='text-2xl'>✨</span>
              </div>*/}
              <span className='text-2xl font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent'>
                Glamo
              </span>
            </Link>

            {/* Dark Mode Toggle */}
            <div className='flex items-center'>
              <DarkModeSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
        {/* Glow Effects */}
        <GlowEffect position="top-left" size="xl" color="brand" animated />
        <GlowEffect position="bottom-right" size="xl" color="brand" animated />

      <div ref={ref} className="w-full max-w-5xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge variant="default" className="mb-6 bg-gradient-to-r from-brand-400 to-brand-600 text-white border-0 px-4 py-2 text-sm shadow-lg">
            <Sparkles className="h-4 w-4 mr-2 inline" />
            Sistema de Gestão Completo
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <GradientText variant="brand" as="span" className="text-5xl md:text-6xl font-bold">
              Bem-vindo ao Glamo!
            </GradientText>{' '}
            🎉
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Para começar a usar o sistema, escolha uma das opções abaixo
          </p>
        </motion.div>

        {/* Options Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Create Salon Option */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="group h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md hover:shadow-2xl hover:shadow-brand-500/20 dark:hover:shadow-brand-500/10 transition-all duration-500 border-2 border-gray-200 dark:border-gray-800 hover:border-brand-400 dark:hover:border-brand-600 cursor-pointer hover:-translate-y-2">
              <CardHeader className="space-y-4 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-xl shadow-brand-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Building2 className="h-7 w-7" />
                  </div>
                  <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1.5 text-xs font-semibold text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800">
                    ⚡ Trial 14 dias
                  </span>
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold mt-4 bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
                  Criar Meu Negócio
                </CardTitle>
                <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                  Comece agora mesmo e crie seu negócio com acesso ao plano <strong className="text-brand-600 dark:text-brand-400">Profissional</strong> grátis por 14 dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-start text-gray-700 dark:text-gray-300">
                    <span className="mr-3 mt-0.5 text-brand-500 text-lg">✓</span>
                    <span>Agendamentos ilimitados</span>
                  </li>
                  <li className="flex items-start text-gray-700 dark:text-gray-300">
                    <span className="mr-3 mt-0.5 text-brand-500 text-lg">✓</span>
                    <span>Até 5 profissionais</span>
                  </li>
                  <li className="flex items-start text-gray-700 dark:text-gray-300">
                    <span className="mr-3 mt-0.5 text-brand-500 text-lg">✓</span>
                    <span>Gestão completa de estoque</span>
                  </li>
                  <li className="flex items-start text-gray-700 dark:text-gray-300">
                    <span className="mr-3 mt-0.5 text-brand-500 text-lg">✓</span>
                    <span>Relatórios avançados e comissões</span>
                  </li>
                  <li className="flex items-start text-gray-700 dark:text-gray-300">
                    <span className="mr-3 mt-0.5 text-brand-500 text-lg">✓</span>
                    <span>Integração WhatsApp</span>
                  </li>
                </ul>

                <Button
                  onClick={handleCreateSalon}
                  className="w-full bg-gradient-to-r from-brand-400 to-brand-600 hover:from-brand-500 hover:to-brand-700 text-white shadow-xl shadow-brand-500/30 hover:shadow-2xl hover:shadow-brand-500/40 transition-all duration-300 hover:scale-[1.02] text-base py-6 rounded-xl font-semibold"
                >
                  Começar Agora
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Wait for Invite Option */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="group h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md hover:shadow-2xl hover:shadow-brand-500/20 dark:hover:shadow-brand-500/10 transition-all duration-500 border-2 border-gray-200 dark:border-gray-800 hover:border-brand-400 dark:hover:border-brand-600 hover:-translate-y-2">
              <CardHeader className="space-y-4 pb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-xl shadow-brand-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Users className="h-7 w-7" />
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold mt-4 bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
                  Aguardar Convite
                </CardTitle>
                <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                  Você foi convidado para trabalhar em um negócio? Aguarde ou aceite convites pendentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-start text-gray-700 dark:text-gray-300">
                    <span className="mr-3 mt-0.5 text-brand-500 text-lg">✓</span>
                    <span>Receba convites de proprietários</span>
                  </li>
                  <li className="flex items-start text-gray-700 dark:text-gray-300">
                    <span className="mr-3 mt-0.5 text-brand-500 text-lg">✓</span>
                    <span>Aceite ou recuse convites</span>
                  </li>
                  <li className="flex items-start text-gray-700 dark:text-gray-300">
                    <span className="mr-3 mt-0.5 text-brand-500 text-lg">✓</span>
                    <span>Trabalhe em múltiplos salões</span>
                  </li>
                  <li className="flex items-start text-gray-700 dark:text-gray-300">
                    <span className="mr-3 mt-0.5 text-brand-500 text-lg">✓</span>
                    <span>Gerencie suas permissões</span>
                  </li>
                  <li className="flex items-start text-gray-700 dark:text-gray-300">
                    <span className="mr-3 mt-0.5 text-brand-500 text-lg">✓</span>
                    <span>Visualize convites pendentes</span>
                  </li>
                </ul>

                <Button
                  onClick={handleWaitForInvite}
                  className="w-full bg-transparent dark:bg-transparent border-2 border-brand-500 dark:border-brand-500 text-brand-500 dark:text-brand-500 hover:bg-brand-100 dark:hover:bg-brand-950/30 hover:border-brand-500 dark:hover:border-brand-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] text-base py-6 rounded-xl font-semibold"
                >
                  Ver Convites
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Precisa de ajuda?{' '}
            <a
              href="mailto:suporte@glamo.com.br"
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 underline underline-offset-4 font-medium transition-colors"
            >
              Entre em contato com nosso suporte
            </a>
          </p>
        </motion.div>
      </div>
      </div>
    </div>
  );
}
