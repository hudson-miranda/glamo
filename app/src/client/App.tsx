import { useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { routes } from 'wasp/client/router';
import './Main.css';
import NavBar from './components/NavBar/NavBar';
import { demoNavigationitems, marketingNavigationItems } from './components/NavBar/constants';
import CookieConsentBanner from './components/cookie-consent/Banner';
import { ErrorBoundary } from './providers/ErrorBoundary';

/**
 * use this component to wrap all child components
 * this is useful for templates, themes, and context
 */
export default function App() {
  const location = useLocation();
  const isMarketingPage = useMemo(() => {
    return location.pathname === '/' || location.pathname.startsWith('/pricing');
  }, [location]);

  const navigationItems = isMarketingPage ? marketingNavigationItems : demoNavigationitems;

  const shouldDisplayAppNavBar = useMemo(() => {
    return (
      location.pathname !== routes.LoginRoute.build() && location.pathname !== routes.SignupRoute.build()
    );
  }, [location]);

  const isAdminDashboard = useMemo(() => {
    return location.pathname.startsWith('/admin');
  }, [location]);

  const isDashboardPage = useMemo(() => {
    return location.pathname.startsWith('/dashboard') ||
           location.pathname.startsWith('/clients') ||
           location.pathname.startsWith('/services') ||
           location.pathname.startsWith('/appointments') ||
           location.pathname.startsWith('/sales') ||
           location.pathname.startsWith('/inventory') ||
           location.pathname.startsWith('/cash-register') ||
           location.pathname.startsWith('/reports') ||
           location.pathname.startsWith('/notifications');
  }, [location]);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView();
      }
    }
  }, [location]);

  return (
    <ErrorBoundary>
      <div className='min-h-screen bg-background text-foreground'>
        {isAdminDashboard || isDashboardPage ? (
          <Outlet />
        ) : (
          <>
            {shouldDisplayAppNavBar && <NavBar navigationItems={navigationItems} />}
            <div className='mx-auto max-w-screen-2xl'>
              <Outlet />
            </div>
          </>
        )}
      </div>
      <CookieConsentBanner />
    </ErrorBoundary>
  );
}
