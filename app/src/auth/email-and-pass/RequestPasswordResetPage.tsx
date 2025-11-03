import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import { ForgotPasswordForm } from 'wasp/client/auth';
import { AuthPageLayout } from '../AuthPageLayout';
import { authAppearance } from '../appearance';

export function RequestPasswordResetPage() {
  return (
    <AuthPageLayout>

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
