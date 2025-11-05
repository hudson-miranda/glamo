// app/src/auth/SignupPage.tsx
import { useState } from 'react';
import { signup, googleSignInUrl } from 'wasp/client/auth';
import { Link, routes } from 'wasp/client/router';
import { AuthPageLayout } from './AuthPageLayout';
import { AuthInput } from './components/AuthInput';
import { PasswordInput } from './components/PasswordInput';
import { LoadingButton } from './components/LoadingButton';
import { GoogleButton } from './components/GoogleButton';
import { motion } from 'framer-motion';

export function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Senha deve ter no mínimo 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Senha deve conter letras maiúsculas, minúsculas e números';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    // Terms validation
    if (!agreedToTerms) {
      newErrors.terms = 'Você deve aceitar os termos de serviço';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Pass email in the data object - userSignupFields will derive username and isAdmin from it
      await signup({ 
        email: formData.email, 
        password: formData.password,
        username: formData.email, // username defaults to email
        isAdmin: false, // isAdmin is determined by userSignupFields based on ADMIN_EMAILS env var
      });
      // Redirect to success page with email parameter
      window.location.href = `/signup-success?email=${encodeURIComponent(formData.email)}`;
    } catch (err: any) {
      console.error('Signup error:', err);
      setErrors({ 
        submit: err.message || 'Erro ao criar conta. Tente novamente.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // Redirect to Google OAuth using Wasp's built-in Google Auth
    window.location.href = googleSignInUrl;
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
            Comece gratuitamente
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Crie sua conta e transforme seu salão
          </p>
        </div>

        {/* Google Signup */}
        <div className="space-y-4">
          <GoogleButton onClick={handleGoogleSignup} text="Cadastrar com Google" />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-900/95 text-gray-500 dark:text-gray-400 font-medium">
                Ou crie com email
              </span>
            </div>
          </div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-5">
          {errors.submit && (
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
                    Erro ao criar conta
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    {errors.submit}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <AuthInput
            label="E-mail"
            type="email"
            required
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="seu@email.com"
            autoComplete="email"
            error={errors.email}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5A2.25 2.25 0 012.25 17.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.912l-7.5 4.5a2.25 2.25 0 01-2.36 0l-7.5-4.5a2.25 2.25 0 01-1.07-1.912V6.75"
                />
              </svg>
            }
          />

          <PasswordInput
            label="Senha"
            required
            value={formData.password}
            onChange={(e) => updateField('password', e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.password}
            showStrength={true}
          />

          <PasswordInput
            label="Confirme a senha"
            required
            value={formData.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.confirmPassword}
          />

          {/* Password Requirements */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Sua senha deve conter:
            </p>
            <div className="space-y-1.5">
              {[
                { text: 'Mínimo de 8 caracteres', valid: formData.password.length >= 8 },
                { text: 'Letras maiúsculas e minúsculas', valid: /(?=.*[a-z])(?=.*[A-Z])/.test(formData.password) },
                { text: 'Pelo menos um número', valid: /\d/.test(formData.password) },
              ].map((req, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  {req.valid ? (
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className={req.valid ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'}>
                    {req.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Terms & Privacy */}
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  if (errors.terms) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.terms;
                      return newErrors;
                    });
                  }
                }}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-brand-600 focus:ring-brand-500 focus:ring-offset-0"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                Eu concordo com os{' '}
                <a href="#" className="text-brand-600 dark:text-brand-600 hover:text-brand-700 dark:hover:text-brand-300 font-medium underline underline-offset-2">
                  Termos de Serviço
                </a>
                {' '}e a{' '}
                <a href="#" className="text-brand-600 dark:text-brand-600 hover:text-brand-700 dark:hover:text-brand-300 font-medium underline underline-offset-2">
                  Política de Privacidade
                </a>
              </span>
            </label>
            {errors.terms && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {errors.terms}
              </p>
            )}
          </div>

          <LoadingButton
            type="submit"
            loading={loading}
            loadingText="Criando sua conta..."
            variant="primary"
          >
            Criar conta grátis
          </LoadingButton>
        </form>

        {/* Login link */}
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Já tem uma conta?{' '}
            <Link
              to={routes.LoginRoute.to}
              className="font-semibold text-brand-600 dark:text-brand-600 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
            >
              Fazer login
            </Link>
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-4 pt-6">
          {[
            { icon: '🎯', text: 'Teste grátis' },
            { icon: '💳', text: 'Sem cartão' },
            { icon: '⚡', text: '2 min setup' }
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

