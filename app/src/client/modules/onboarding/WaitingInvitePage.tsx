import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from 'wasp/client/auth';
import { getPendingInvites, acceptSalonInvite, rejectSalonInvite } from 'wasp/client/operations';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { GlowEffect } from '../../components/ui/GlowEffect';
import { GradientText } from '../../components/ui/GradientText';
import { Badge } from '../../../components/ui/badge';
import DarkModeSwitcher from '../../components/DarkModeSwitcher';
import { Scissors, Mail, Check, X, Clock, Building2, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

type PendingInvite = {
  id: string;
  salonName: string;
  roleName: string;
  inviterName: string | null;
  createdAt: Date;
  expiresAt: Date;
};

export default function WaitingInvitePage() {
  const navigate = useNavigate();
  const { data: user } = useAuth();
  const { toast } = useToast();
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingInviteId, setProcessingInviteId] = useState<string | null>(null);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInvites();
  }, []);

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

  const loadInvites = async () => {
    try {
      const data = await getPendingInvites();
      setInvites(data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao carregar convites',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (inviteId: string) => {
    setProcessingInviteId(inviteId);
    try {
      await acceptSalonInvite({ inviteId });
      toast({
        title: 'Convite aceito! 🎉',
        description: 'Você agora faz parte do negócio',
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao aceitar convite',
      });
    } finally {
      setProcessingInviteId(null);
    }
  };

  const handleReject = async (inviteId: string) => {
    setProcessingInviteId(inviteId);
    try {
      await rejectSalonInvite({ inviteId });
      toast({
        title: 'Convite recusado',
        description: 'O convite foi recusado',
      });
      await loadInvites();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao recusar convite',
      });
    } finally {
      setProcessingInviteId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-purple-50/20 to-white dark:from-black dark:via-purple-950/20 dark:to-black transition-colors duration-300">
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
      <div className="relative flex-1 p-4 overflow-hidden">
        {/* Glow Effects */}
        <GlowEffect position="top-right" size="xl" color="purple" animated />
        <GlowEffect position="bottom-left" size="xl" color="brand" animated />

        <div ref={ref} className="max-w-4xl mx-auto py-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge variant="default" className="mb-6 bg-gradient-to-r from-purple-400 to-purple-600 text-white border-0 px-4 py-2 text-sm shadow-lg">
            <Mail className="h-4 w-4 mr-2 inline" />
            Gestão de Convites
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <GradientText variant="brand" as="span" className="text-5xl md:text-6xl font-bold">
              Convites Pendentes
            </GradientText>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400">
            Você tem <strong className="text-purple-600 dark:text-purple-400">{invites.length}</strong>{' '}
            {invites.length === 1 ? 'convite pendente' : 'convites pendentes'}
          </p>
        </motion.div>

        {/* Invites List */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="relative inline-flex">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
              <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl animate-pulse"></div>
            </div>
            <p className="mt-6 text-gray-600 dark:text-gray-400 font-medium">Carregando convites...</p>
          </motion.div>
        ) : invites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-2 border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-xl">
              <CardContent className="py-16">
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 ring-8 ring-gray-50 dark:ring-gray-900">
                      <AlertCircle className="h-10 w-10 text-gray-400 dark:text-gray-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Nenhum convite pendente</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                    Quando você receber convites de proprietários de salões, eles aparecerão aqui.
                  </p>
                  <Button
                    onClick={() => navigate('/onboarding/create-salon')}
                    className="bg-gradient-to-r from-brand-400 to-brand-600 hover:from-brand-500 hover:to-brand-700 text-white shadow-xl shadow-brand-500/30 hover:shadow-2xl hover:shadow-brand-500/40 transition-all duration-300 hover:scale-[1.02] px-8 py-6 rounded-xl font-semibold"
                  >
                    <Building2 className="mr-2 h-5 w-5" />
                    Ou crie seu próprio negócio
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {invites.map((invite, index) => (
              <motion.div
                key={invite.id}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              >
                <Card className="border-2 border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-2xl hover:shadow-purple-500/20 dark:hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-3 bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                          {invite.salonName}
                        </CardTitle>
                        <CardDescription className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Função:</span>
                            <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/30 px-3 py-1.5 text-xs font-semibold text-purple-800 dark:text-purple-400 capitalize border border-purple-200 dark:border-purple-800">
                              {invite.roleName}
                            </span>
                          </div>
                          {invite.inviterName && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Convidado por: <strong className="text-gray-900 dark:text-white">{invite.inviterName}</strong>
                            </div>
                          )}
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-500">
                            <Clock className="mr-2 h-4 w-4" />
                            Expira em {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <Button
                        onClick={() => handleAccept(invite.id)}
                        disabled={processingInviteId === invite.id}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] py-6 rounded-xl font-semibold"
                      >
                        {processingInviteId === invite.id ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Processando...
                          </span>
                        ) : (
                          <>
                            <Check className="mr-2 h-5 w-5" />
                            Aceitar Convite
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleReject(invite.id)}
                        disabled={processingInviteId === invite.id}
                        className="flex-1 bg-white dark:bg-gray-800 border-2 border-red-300 dark:border-red-700 text-gray-900 dark:text-white hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-400 dark:hover:border-red-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] py-6 rounded-xl font-semibold"
                      >
                        <X className="mr-2 h-5 w-5" />
                        Recusar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Salon Option */}
        {invites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8"
          >
            <Alert className="border-2 border-brand-200 dark:border-brand-800 bg-gradient-to-r from-brand-50/50 to-purple-50/50 dark:from-brand-950/20 dark:to-purple-950/20 backdrop-blur-sm shadow-lg">
              <Building2 className="h-5 w-5 text-brand-500" />
              <AlertDescription className="ml-2 text-gray-700 dark:text-gray-300">
                <strong className="text-brand-600 dark:text-brand-400">Ou crie seu próprio negócio:</strong> Comece com 14 dias grátis do plano Profissional.{' '}
                <Button
                  onClick={() => navigate('/onboarding/create-salon')}
                  variant="link"
                  className="p-0 h-auto text-brand-600 dark:text-brand-400 font-semibold hover:text-brand-700 dark:hover:text-brand-300 underline underline-offset-4"
                >
                  Criar agora →
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 text-center"
        >
          <Button
            onClick={() => navigate('/onboarding')}
            variant="ghost"
            className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors"
          >
            ← Voltar
          </Button>
        </motion.div>
      </div>
      </div>
    </div>
  );
}
