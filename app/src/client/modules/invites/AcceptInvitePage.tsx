import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from 'wasp/client/auth';
import { acceptSalonInvite } from 'wasp/client/operations';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import DarkModeSwitcher from '../../components/DarkModeSwitcher';
import { Check, AlertCircle, Loader2, Building2 } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export default function AcceptInvitePage() {
  const navigate = useNavigate();
  const { data: user } = useAuth();
  const { inviteId } = useParams<{ inviteId: string }>();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    // Se não estiver autenticado, redirecionar para login com redirect
    if (!user) {
      navigate(`/login?redirectTo=/invite/accept/${inviteId}`);
      return;
    }

    // Aceitar convite automaticamente
    if (inviteId && status === 'idle') {
      handleAcceptInvite();
    }
  }, [user, inviteId, status]);

  const handleAcceptInvite = async () => {
    if (!inviteId) {
      setStatus('error');
      setErrorMessage('ID do convite inválido');
      return;
    }

    setStatus('processing');
    setIsProcessing(true);

    try {
      await acceptSalonInvite({ inviteId });
      setStatus('success');
      toast({
        title: 'Convite aceito! 🎉',
        description: 'Redirecionando para o dashboard...',
      });
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      setStatus('error');
      const message = error.message || 'Erro ao aceitar convite';
      setErrorMessage(message);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative overflow-hidden'>
      <div className='absolute top-4 right-4 z-10'>
        <DarkModeSwitcher />
      </div>

      {/* Background decorations */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob' />
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000' />
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000' />
      </div>

      <div className='relative z-10 flex items-center justify-center min-h-screen p-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='w-full max-w-md'
        >
          <Card className='border-purple-200 dark:border-purple-900 shadow-xl'>
            <CardHeader className='text-center space-y-2'>
              <div className='mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4'>
                {status === 'processing' && <Loader2 className='w-8 h-8 text-white animate-spin' />}
                {status === 'success' && <Check className='w-8 h-8 text-white' />}
                {status === 'error' && <AlertCircle className='w-8 h-8 text-white' />}
                {status === 'idle' && <Building2 className='w-8 h-8 text-white' />}
              </div>
              <CardTitle className='text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
                {status === 'processing' && 'Aceitando Convite...'}
                {status === 'success' && 'Convite Aceito!'}
                {status === 'error' && 'Erro ao Aceitar Convite'}
                {status === 'idle' && 'Processando...'}
              </CardTitle>
              <CardDescription>
                {status === 'processing' && 'Aguarde enquanto processamos seu convite'}
                {status === 'success' && 'Você foi adicionado ao salão com sucesso'}
                {status === 'error' && 'Ocorreu um erro ao processar seu convite'}
                {status === 'idle' && 'Verificando convite...'}
              </CardDescription>
            </CardHeader>

            <CardContent className='space-y-4'>
              {status === 'error' && (
                <>
                  <Alert variant='destructive'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                  <div className='space-y-2'>
                    <Button onClick={handleAcceptInvite} disabled={isProcessing} className='w-full'>
                      {isProcessing ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Tentando novamente...
                        </>
                      ) : (
                        'Tentar Novamente'
                      )}
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => navigate('/onboarding/waiting-invite')}
                      className='w-full'
                    >
                      Ver Todos os Convites
                    </Button>
                  </div>
                </>
              )}

              {status === 'success' && (
                <div className='text-center space-y-4'>
                  <div className='rounded-lg bg-green-50 dark:bg-green-950 p-4 border border-green-200 dark:border-green-900'>
                    <p className='text-sm text-green-800 dark:text-green-200'>
                      Redirecionando para o dashboard em 2 segundos...
                    </p>
                  </div>
                  <Button onClick={() => navigate('/dashboard')} className='w-full'>
                    Ir para Dashboard Agora
                  </Button>
                </div>
              )}

              {status === 'processing' && (
                <div className='flex justify-center py-8'>
                  <div className='flex flex-col items-center space-y-4'>
                    <Loader2 className='w-12 h-12 text-purple-600 animate-spin' />
                    <p className='text-sm text-gray-500 dark:text-gray-400'>Processando convite...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className='mt-4 text-center'>
            <Button variant='ghost' onClick={() => navigate('/')} className='text-sm'>
              Voltar para Início
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
