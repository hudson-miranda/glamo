import { useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { routes } from 'wasp/client/router';
import './Main.css';
import NavBar from './components/NavBar/NavBar';
import { demoNavigationitems, marketingNavigationItems } from './components/NavBar/constants';
import CookieConsentBanner from './components/cookie-consent/Banner';
import { ErrorBoundary } from './providers/ErrorBoundary';
import { Toaster } from '../components/ui/toaster';
import { DashboardLayout } from './layouts/DashboardLayout';
import OnboardingGuard from './components/OnboardingGuard';
import SubscriptionGuard from './components/SubscriptionGuard';

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
    // Hide NavBar on all auth pages and onboarding pages
    const authPages = [
      routes.LoginRoute.build(),
      routes.SignupRoute.build(),
      '/request-password-reset',
      '/password-reset',
      '/email-verification',
      '/signup-success'
    ];
    const onboardingPages = [
      '/onboarding',
      '/onboarding/create-salon',
      '/onboarding/waiting-invite'
    ];
    const hiddenPages = [...authPages, ...onboardingPages];
    return !hiddenPages.some(page => location.pathname.startsWith(page));
  }, [location]);

  const isAdminDashboard = useMemo(() => {
    return location.pathname.startsWith('/admin');
  }, [location]);

  const isDashboardPage = useMemo(() => {
    return location.pathname.startsWith('/dashboard') ||
           location.pathname.startsWith('/clients') ||
           location.pathname.startsWith('/services') ||
           location.pathname.startsWith('/categories') ||
           location.pathname.startsWith('/products') ||
           location.pathname.startsWith('/brands') ||
           location.pathname.startsWith('/suppliers') ||
           location.pathname.startsWith('/calendar') ||
           location.pathname.startsWith('/agenda') ||
           location.pathname.startsWith('/appointments') ||
           location.pathname.startsWith('/sales') ||
           location.pathname.startsWith('/inventory') ||
           location.pathname.startsWith('/cash-register') ||
           location.pathname.startsWith('/reports') ||
           location.pathname.startsWith('/notifications') ||
           location.pathname.startsWith('/employees') ||
           location.pathname.startsWith('/scheduling') ||
           location.pathname.startsWith('/programs') ||
           location.pathname.startsWith('/gallery') ||
           location.pathname.startsWith('/forms') ||
           location.pathname.startsWith('/analytics') ||
           location.pathname.startsWith('/financial') ||
           location.pathname.startsWith('/communication') ||
           location.pathname.startsWith('/campaigns') ||
           location.pathname.startsWith('/gamification') ||
           location.pathname.startsWith('/telemedicine') ||
           location.pathname.startsWith('/documents');
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
      <OnboardingGuard>
        <SubscriptionGuard>
          <div className='min-h-screen bg-white dark:bg-black text-foreground'>
            {isAdminDashboard || isDashboardPage ? (
              <DashboardLayout>
                <Outlet />
              </DashboardLayout>
            ) : (
              <>
                {shouldDisplayAppNavBar && <NavBar navigationItems={navigationItems} />}
                <div className='mx-auto max-w-screen-4xl'>
                  <Outlet />
                </div>
              </>
            )}
          </div>
          <CookieConsentBanner />
          <Toaster />
        </SubscriptionGuard>
      </OnboardingGuard>
    </ErrorBoundary>
  );
}
