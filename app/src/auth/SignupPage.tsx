import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import { SignupForm } from 'wasp/client/auth';
import { AuthPageLayout } from './AuthPageLayout';
import { authAppearance } from './appearance';

export function Signup() {
  return (
    <AuthPageLayout>

      {/* Formulário de Cadastro */}
      <SignupForm appearance={authAppearance} />

      {/* Links de Navegação */}
      <div className='mt-8'>
        <div className='text-center'>
          <span className='text-sm text-gray-600 dark:text-gray-400'>
            Já tem uma conta?{' '}
            <WaspRouterLink 
              to={routes.LoginRoute.to} 
              className='font-semibold text-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors underline underline-offset-4'
            >
              Fazer login
            </WaspRouterLink>
          </span>
        </div>
      </div>

      {/* Termos e Política */}
      <div className='mt-6'>
        <p className='text-xs text-center text-gray-500 dark:text-gray-500'>
          Ao criar uma conta, você concorda com nossos{' '}
          <a href='#' className='text-brand-500 hover:text-brand-600 underline'>
            Termos de Serviço
          </a>{' '}
          e{' '}
          <a href='#' className='text-brand-500 hover:text-brand-600 underline'>
            Política de Privacidade
          </a>
        </p>
      </div>
    </AuthPageLayout>
  );
}
