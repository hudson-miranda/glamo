import { ReactNode } from 'react';
import { Link } from 'wasp/client/router';
import DarkModeSwitcher from '../client/components/DarkModeSwitcher';
import './auth-overrides.css';

export function AuthPageLayout({children} : {children: ReactNode }) {
  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-b from-white via-white to-white dark:from-black dark:via-purple-950/20 dark:to-black'>
      {/* Simplified NavBar for Auth Pages */}
      <header className='sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            {/* Logo */}
            <Link to="/" className='flex items-center gap-3 group'>
              <div className='w-10 h-10 bg-gradient-to-r from-brand-400 to-brand-600 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6'>
                <span className='text-2xl'>✨</span>
              </div>
              <span className='text-2xl font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent'>
                Glamo
              </span>
            </Link>

            {/* Dark Mode Toggle */}
            <div className='flex items-center'>
              <DarkModeSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className='flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
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
      </div>

      {/* Efeitos decorativos de fundo */}
      <div className='fixed inset-0 pointer-events-none -z-10 overflow-hidden'>
        <div className='absolute top-1/4 -left-32 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-10 dark:opacity-5 animate-pulse' />
        <div className='absolute bottom-1/4 -right-32 w-96 h-96 bg-brand-500 rounded-full blur-3xl opacity-10 dark:opacity-5 animate-pulse' />
      </div>
    </div>
  );
}
