// app/src/auth/LoginPage.tsx
import { useState } from 'react';
import { login } from 'wasp/client/auth';
import { Link, routes } from 'wasp/client/router';
import { AuthPageLayout } from './AuthPageLayout';
import { AuthInput } from './components/AuthInput';
import { PasswordInput } from './components/PasswordInput';
import { LoadingButton } from './components/LoadingButton';
import { GoogleButton } from './components/GoogleButton';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login({ email, password });
      // Manually redirect to dashboard after successful login
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Google auth is handled by Wasp's SignupForm/LoginForm
    // This is a placeholder for when we integrate it
    window.location.href = '/auth/google/login';
  };

  return (
    <AuthPageLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Bem-vindo de volta!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Entre na sua conta para continuar
          </p>
        </div>

        {/* Google Login */}
        <div className="space-y-4">
          <GoogleButton onClick={handleGoogleLogin} />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-900/95 text-gray-500 dark:text-gray-400 font-medium">
                Ou continue com email
              </span>
            </div>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleLogin} className="space-y-5">
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
                    Erro ao fazer login
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <AuthInput
            label="E-mail"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            autoComplete="email"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            }
          />

          <div className="space-y-2">
            <PasswordInput
              label="Senha"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            
            <div className="flex justify-end">
              <Link
                to={routes.RequestPasswordResetRoute.to}
                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
              >
                Esqueceu sua senha?
              </Link>
            </div>
          </div>

          <LoadingButton
            type="submit"
            loading={loading}
            loadingText="Entrando..."
            variant="primary"
          >
            Entrar
          </LoadingButton>
        </form>

        {/* Sign up link */}
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ainda não tem uma conta?{' '}
            <Link
              to={routes.SignupRoute.to}
              className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            >
              Criar conta grátis
            </Link>
          </p>
        </div>

        {/* Trust indicators */}
        <div className="grid grid-cols-3 gap-4 pt-6">
          {[
            { icon: '🔒', text: 'Seguro' },
            { icon: '⚡', text: 'Rápido' },
            { icon: '✨', text: 'Grátis' }
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                {item.text}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </AuthPageLayout>
  );
}

