import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import { LoginForm } from 'wasp/client/auth';
import { AuthPageLayout } from './AuthPageLayout';
import { authAppearance } from './appearance';

export default function Login() {
  return (
    <AuthPageLayout>

      {/* Formulário de Login */}
      <LoginForm appearance={authAppearance} />

      {/* Links de Navegação */}
      <div className='mt-8 space-y-4'>
        <div className='text-center'>
          <span className='text-sm text-gray-600 dark:text-gray-400'>
            Não tem uma conta?{' '}
            <WaspRouterLink 
              to={routes.SignupRoute.to} 
              className='font-semibold text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors underline underline-offset-4'
            >
              Criar conta
            </WaspRouterLink>
          </span>
        </div>
        
        <div className='text-center'>
          <span className='text-sm text-gray-600 dark:text-gray-400'>
            Esqueceu sua senha?{' '}
            <WaspRouterLink 
              to={routes.RequestPasswordResetRoute.to} 
              className='font-semibold text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors underline underline-offset-4'
            >
              Recuperar senha
            </WaspRouterLink>
          </span>
        </div>
      </div>
    </AuthPageLayout>
  );
}
