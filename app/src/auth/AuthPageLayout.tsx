import { ReactNode } from 'react';
import { Link } from 'wasp/client/router';
import './auth-overrides.css';

export function AuthPageLayout({children} : {children: ReactNode }) {
  return (
    <div className='min-h-screen flex flex-col justify-center bg-gradient-to-b from-white via-white to-white dark:from-black dark:via-purple-950/20 dark:to-black py-12 sm:px-6 lg:px-8'>
      {/* Logo e Header */}
      <div className='sm:mx-auto sm:w-full sm:max-w-md mb-8'>
        <Link to="/" className='flex items-center justify-center gap-3 group'>
          <div className='w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6'>
            <span className='text-3xl'>✨</span>
          </div>
          <span className='text-3xl font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent'>
            Glamo
          </span>
        </Link>
      </div>

      {/* Card Principal */}
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white dark:bg-gray-900/95 backdrop-blur-md py-10 px-6 shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800 sm:rounded-2xl sm:px-12 border border-gray-200 dark:border-gray-800'>
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className='mt-8 text-center'>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          © 2025 Glamo. Transforme seu salão com tecnologia.
        </p>
      </div>

      {/* Efeitos decorativos de fundo */}
      <div className='fixed inset-0 pointer-events-none -z-10 overflow-hidden'>
        <div className='absolute top-1/4 -left-32 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-10 dark:opacity-5 animate-pulse' />
        <div className='absolute bottom-1/4 -right-32 w-96 h-96 bg-pink-500 rounded-full blur-3xl opacity-10 dark:opacity-5 animate-pulse' />
      </div>
    </div>
  );
}
