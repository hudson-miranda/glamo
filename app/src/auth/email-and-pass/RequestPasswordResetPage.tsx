import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import { ForgotPasswordForm } from 'wasp/client/auth';
import { AuthPageLayout } from '../AuthPageLayout';
import { authAppearance } from '../appearance';

export function RequestPasswordResetPage() {
  return (
    <AuthPageLayout>
      {/* Título da Página */}
      <div className='mb-8'>
        <div className='flex justify-center mb-4'>
          <div className='w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center'>
            <svg className='w-8 h-8 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' />
            </svg>
          </div>
        </div>
        <h2 className='text-3xl font-bold text-gray-900 dark:text-white text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
          Recuperar senha
        </h2>
        <p className='mt-2 text-sm text-center text-gray-600 dark:text-gray-400'>
          Enviaremos um link de recuperação para seu email
        </p>
      </div>

      {/* Formulário de Recuperação */}
      <ForgotPasswordForm appearance={authAppearance} />

      {/* Links de Navegação */}
      <div className='mt-8'>
        <div className='text-center'>
          <span className='text-sm text-gray-600 dark:text-gray-400'>
            Lembrou sua senha?{' '}
            <WaspRouterLink 
              to={routes.LoginRoute.to} 
              className='font-semibold text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors underline underline-offset-4'
            >
              Fazer login
            </WaspRouterLink>
          </span>
        </div>
      </div>
    </AuthPageLayout>
  );
}
