import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SalonProvider } from '../hooks/useSalonContext';
import { Toaster } from '../components/Toaster';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <SalonProvider>
      <div className='flex h-screen overflow-hidden'>
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar - Overlay */}
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
              <Sidebar onClose={() => setIsMobileSidebarOpen(false)} />
            </div>
          </>
        )}

        <div className='flex flex-1 flex-col overflow-hidden'>
          <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
          <main className='flex-1 overflow-y-auto bg-background p-3 sm:p-4 md:p-6'>
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </SalonProvider>
  );
}
