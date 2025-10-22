import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SalonProvider } from '../hooks/useSalonContext';
import { Toaster } from '../components/Toaster';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SalonProvider>
      <div className='flex h-screen overflow-hidden'>
        <Sidebar />
        <div className='flex flex-1 flex-col overflow-hidden'>
          <Header />
          <main className='flex-1 overflow-y-auto bg-background p-6'>
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </SalonProvider>
  );
}
