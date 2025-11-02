import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import { SignupForm } from 'wasp/client/auth';
import { AuthPageLayout } from './AuthPageLayout';
import { authAppearance } from './appearance';

export function Signup() {
  return (
    <AuthPageLayout>
      {/* Título da Página */}
      <div className='mb-8'>
        <h2 className='text-3xl font-bold text-gray-900 dark:text-white text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
          Crie sua conta
        </h2>
        <p className='mt-2 text-sm text-center text-gray-600 dark:text-gray-400'>
          Comece a transformar seu salão hoje mesmo
        </p>
      </div>

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
