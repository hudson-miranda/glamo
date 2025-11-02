import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import { VerifyEmailForm } from 'wasp/client/auth';
import { AuthPageLayout } from '../AuthPageLayout';
import { authAppearance } from '../appearance';

export function EmailVerificationPage() {
  return (
    <AuthPageLayout>
      {/* Título da Página */}
      <div className='mb-8'>
        <div className='flex justify-center mb-4'>
          <div className='w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center'>
            <svg className='w-8 h-8 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
            </svg>
          </div>
        </div>
        <h2 className='text-3xl font-bold text-gray-900 dark:text-white text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
          Verifique seu email
        </h2>
        <p className='mt-2 text-sm text-center text-gray-600 dark:text-gray-400'>
          Enviamos um link de verificação para seu email
        </p>
      </div>

      {/* Formulário de Verificação */}
      <VerifyEmailForm appearance={authAppearance} />

      {/* Links de Navegação */}
      <div className='mt-8'>
        <div className='text-center'>
          <span className='text-sm text-gray-600 dark:text-gray-400'>
            Email verificado?{' '}
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
