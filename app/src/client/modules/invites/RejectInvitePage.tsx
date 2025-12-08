import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from 'wasp/client/auth';
import { rejectSalonInvite } from 'wasp/client/operations';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import DarkModeSwitcher from '../../components/DarkModeSwitcher';
import { X, AlertCircle, Loader2, Building2 } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export default function RejectInvitePage() {
  const navigate = useNavigate();
  const { data: user } = useAuth();
  const { inviteId } = useParams<{ inviteId: string }>();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(true);

  useEffect(() => {
    // Se não estiver autenticado, redirecionar para login com redirect
    if (!user) {
      navigate(`/login?redirectTo=/invite/reject/${inviteId}`);
      return;
    }
  }, [user, inviteId]);

  const handleRejectInvite = async () => {
    if (!inviteId) {
      setStatus('error');
      setErrorMessage('ID do convite inválido');
      return;
    }

    setStatus('processing');
    setIsProcessing(true);
    setShowConfirmation(false);

    try {
      await rejectSalonInvite({ inviteId });
      setStatus('success');
      toast({
        title: 'Convite recusado',
        description: 'Você recusou o convite com sucesso',
      });
    } catch (error: any) {
      setStatus('error');
      const message = error.message || 'Erro ao recusar convite';
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
    <div className='min-h-screen bg-gradient-to-b from-red-50 via-white to-red-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative overflow-hidden'>
      <div className='absolute top-4 right-4 z-10'>
        <DarkModeSwitcher />
      </div>

      {/* Background decorations */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-red-300 dark:bg-red-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob' />
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 dark:bg-orange-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000' />
      </div>

      <div className='relative z-10 flex items-center justify-center min-h-screen p-4'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='w-full max-w-md'
        >
          <Card className='border-red-200 dark:border-red-900 shadow-xl'>
            <CardHeader className='text-center space-y-2'>
              <div className='mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-4'>
                {status === 'processing' && <Loader2 className='w-8 h-8 text-white animate-spin' />}
                {status === 'success' && <X className='w-8 h-8 text-white' />}
                {status === 'error' && <AlertCircle className='w-8 h-8 text-white' />}
                {status === 'idle' && <Building2 className='w-8 h-8 text-white' />}
              </div>
              <CardTitle className='text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent'>
                {showConfirmation && 'Recusar Convite?'}
                {status === 'processing' && 'Recusando Convite...'}
                {status === 'success' && 'Convite Recusado'}
                {status === 'error' && 'Erro ao Recusar Convite'}
              </CardTitle>
              <CardDescription>
                {showConfirmation && 'Tem certeza que deseja recusar este convite?'}
                {status === 'processing' && 'Aguarde enquanto processamos sua resposta'}
                {status === 'success' && 'Você recusou o convite com sucesso'}
                {status === 'error' && 'Ocorreu um erro ao processar sua resposta'}
              </CardDescription>
            </CardHeader>

            <CardContent className='space-y-4'>
              {showConfirmation && status === 'idle' && (
                <div className='space-y-3'>
                  <Alert variant='default' className='border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950'>
                    <AlertCircle className='h-4 w-4 text-amber-600 dark:text-amber-400' />
                    <AlertDescription className='text-amber-800 dark:text-amber-200'>
                      Esta ação não pode ser desfeita. O dono do salão será notificado.
                    </AlertDescription>
                  </Alert>
                  <div className='space-y-2'>
                    <Button
                      onClick={handleRejectInvite}
                      disabled={isProcessing}
                      variant='destructive'
                      className='w-full'
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Recusando...
                        </>
                      ) : (
                        <>
                          <X className='mr-2 h-4 w-4' />
                          Sim, Recusar Convite
                        </>
                      )}
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => navigate('/onboarding/waiting-invite')}
                      className='w-full'
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <>
                  <Alert variant='destructive'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                  <div className='space-y-2'>
                    <Button onClick={handleRejectInvite} disabled={isProcessing} variant='destructive' className='w-full'>
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
                  <div className='rounded-lg bg-red-50 dark:bg-red-950 p-4 border border-red-200 dark:border-red-900'>
                    <p className='text-sm text-red-800 dark:text-red-200'>O convite foi recusado com sucesso.</p>
                  </div>
                  <Button onClick={() => navigate('/')} className='w-full'>
                    Ir para Início
                  </Button>
                </div>
              )}

              {status === 'processing' && (
                <div className='flex justify-center py-8'>
                  <div className='flex flex-col items-center space-y-4'>
                    <Loader2 className='w-12 h-12 text-red-600 animate-spin' />
                    <p className='text-sm text-gray-500 dark:text-gray-400'>Processando resposta...</p>
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
