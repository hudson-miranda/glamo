import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import { ResetPasswordForm } from 'wasp/client/auth';
import { AuthPageLayout } from '../AuthPageLayout';
import { authAppearance } from '../appearance';

export function PasswordResetPage() {
  return (
    <AuthPageLayout>
      {/* Título da Página */}
      <div className='mb-8'>
        <div className='flex justify-center mb-4'>
          <div className='w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center'>
            <svg className='w-8 h-8 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' />
            </svg>
          </div>
        </div>
        <h2 className='text-3xl font-bold text-gray-900 dark:text-white text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
          Redefinir senha
        </h2>
        <p className='mt-2 text-sm text-center text-gray-600 dark:text-gray-400'>
          Crie uma nova senha segura para sua conta
        </p>
      </div>

      {/* Formulário de Reset */}
      <ResetPasswordForm appearance={authAppearance} />

      {/* Links de Navegação */}
      <div className='mt-8'>
        <div className='text-center'>
          <span className='text-sm text-gray-600 dark:text-gray-400'>
            Senha redefinida com sucesso?{' '}
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
