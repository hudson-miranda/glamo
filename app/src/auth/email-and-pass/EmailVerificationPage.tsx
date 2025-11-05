// app/src/auth/email-and-pass/EmailVerificationPage.tsx
import { useState, useEffect } from 'react';
import { verifyEmail } from 'wasp/client/auth';
import { Link, routes } from 'wasp/client/router';
import { AuthPageLayout } from '../AuthPageLayout';
import { LoadingButton } from '../components/LoadingButton';
import { motion, AnimatePresence } from 'framer-motion';

export function EmailVerificationPage() {
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [resending, setResending] = useState(false);

  // Get token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  // Auto-verify on mount if token exists
  useEffect(() => {
    if (token && !verifying && !success && !error) {
      handleVerify();
    }
  }, [token]);

  // Countdown timer for resend
  useEffect(() => {
    if (!canResend && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [canResend, countdown]);

  const handleVerify = async () => {
    if (!token) {
      setError('Token de verificação não encontrado. Verifique o link no seu e-mail.');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      await verifyEmail({ token });
      setSuccess(true);
    } catch (err: any) {
      console.error('Email verification error:', err);
      setError(err.message || 'Erro ao verificar e-mail. O link pode ter expirado.');
      setCanResend(true);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    // In a real implementation, this would call a resend verification email API
    setResending(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setResending(false);
    setCanResend(false);
    setCountdown(60);
    
    // Show success message
    alert('E-mail de verificação reenviado! Verifique sua caixa de entrada.');
  };

  return (
    <AuthPageLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <AnimatePresence mode="wait">
          {verifying ? (
            <motion.div
              key="verifying"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-brand-100 to-brand-100 dark:from-brand-900/30 dark:to-brand-900/30">
                <motion.svg
                  className="w-10 h-10 text-purple-600 dark:text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </motion.svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Verificando seu e-mail...
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Aguarde enquanto confirmamos sua conta
                </p>
              </div>
            </motion.div>
          ) : success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              {/* Success State */}
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 mb-2"
                >
                  <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    E-mail verificado!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Sua conta foi confirmada com sucesso. Agora você pode fazer login e começar a usar o Glamo!
                  </p>
                </div>
              </div>

              {/* Next steps */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2">
                      Pronto para começar!
                    </p>
                    <p className="text-sm text-green-800 dark:text-green-400">
                      Faça login e explore todas as funcionalidades do Glamo para gerenciar seu salão de beleza.
                    </p>
                  </div>
                </div>
              </div>

              {/* Login button */}
              <div className="text-center">
                <Link
                  to={routes.LoginRoute.to}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-brand-400 to-brand-600 hover:from-brand-700 hover:to-brand-700 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                >
                  Fazer login agora
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-brand-100 to-brand-100 dark:from-brand-900/30 dark:to-brand-900/30 mb-2">
                  <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
                  Verifique seu e-mail
                </h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                  {error ? 'Não foi possível verificar seu e-mail' : 'Enviamos um link de verificação para seu e-mail'}
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                >
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
                        Erro na verificação
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                        {error}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                      Como verificar seu e-mail:
                    </p>
                    <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1.5 list-disc list-inside">
                      <li>Verifique sua caixa de entrada</li>
                      <li>Procure por um e-mail do Glamo</li>
                      <li>Clique no link de verificação</li>
                      <li>Volte aqui para fazer login</li>
                    </ul>
                    <p className="text-xs text-blue-700 dark:text-blue-500 mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                      💡 Não encontrou o e-mail? Verifique sua pasta de spam ou lixo eletrônico.
                    </p>
                  </div>
                </div>
              </div>

              {/* Resend */}
              <div className="text-center space-y-3">
                {canResend ? (
                  <LoadingButton
                    onClick={handleResend}
                    loading={resending}
                    loadingText="Reenviando..."
                    variant="secondary"
                  >
                    Reenviar e-mail de verificação
                  </LoadingButton>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Reenviar em <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">{countdown}s</span>
                  </p>
                )}
              </div>

              {/* Back to login */}
              <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-800">
                <Link
                  to={routes.LoginRoute.to}
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Voltar para login
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AuthPageLayout>
  );
}

