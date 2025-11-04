// app/src/auth/SignupSuccessPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthPageLayout } from './AuthPageLayout';
import { motion } from 'framer-motion';

export function SignupSuccessPage() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Get email from URL params (passed from signup)
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, []);

  return (
    <AuthPageLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Success Icon */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 mb-4"
          >
            <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              Conta criada com sucesso!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Bem-vindo ao Glamo 🎉
            </p>
          </div>
        </div>

        {/* Email Sent Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  📧 Verifique seu e-mail
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  Enviamos um link de verificação para:
                </p>
                {email && (
                  <p className="text-base font-semibold text-blue-900 dark:text-blue-200 mt-2">
                    {email}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-blue-200 dark:border-blue-800">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  Próximos passos:
                </p>
                <ol className="text-sm text-blue-800 dark:text-blue-400 space-y-2 list-decimal list-inside">
                  <li>Abra sua caixa de entrada de e-mail</li>
                  <li>Procure pelo e-mail do Glamo</li>
                  <li>Clique no link de verificação</li>
                  <li>Faça login e comece a usar!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">
                💡 Dicas importantes
              </p>
              <ul className="text-sm text-purple-800 dark:text-purple-400 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                  <span>O link de verificação é válido por <strong>24 horas</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                  <span>Não encontrou o e-mail? Verifique sua pasta de <strong>spam/lixo eletrônico</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                  <span>Você pode fazer login após verificar seu e-mail</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 text-center">
            ✨ O que você pode fazer no Glamo
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '📅', text: 'Agenda online' },
              { icon: '💰', text: 'Controle financeiro' },
              { icon: '👥', text: 'Gestão de clientes' },
              { icon: '📊', text: 'Relatórios' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <span className="text-2xl">{feature.icon}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {feature.text}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {/* Go to Login */}
          <Link
            to="/login"
            className="block w-full px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-brand-400 to-brand-600 hover:from-brand-400 hover:to-brand-600 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 text-center"
          >
            Ir para o login
          </Link>

          {/* Resend email */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Não recebeu o e-mail?{' '}
              <Link
                to="/email-verification"
                className="font-semibold text-brand-600 dark:text-brand-600 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
              >
                Reenviar
              </Link>
            </p>
          </div>
        </div>

        {/* Support */}
        <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Problemas com o cadastro?{' '}
            <a href="#" className="text-brand-600 dark:text-brand-600 hover:text-brand-700 dark:hover:text-brand-300 font-medium underline underline-offset-2">
              Entre em contato
            </a>
          </p>
        </div>
      </motion.div>
    </AuthPageLayout>
  );
}
