import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from 'wasp/client/auth';

/**
 * OnboardingGuard - Middleware component to enforce onboarding flow
 * 
 * Rules:
 * 1. If user is not authenticated → allow (auth pages will handle)
 * 2. If user has no salon (activeSalonId is null) → redirect to /onboarding
 * 3. If user is on /onboarding with a salon → redirect to /dashboard
 * 4. Protected pages require a salon, otherwise redirect to /onboarding
 */

interface OnboardingGuardProps {
  children: React.ReactNode;
}

// Pages that are always accessible (no salon required)
const PUBLIC_PATHS = [
  '/',
  '/pricing',
  '/blog',
  '/contact',
  '/about',
  '/demo-app',
];

// Auth pages (handled by Wasp)
const AUTH_PATHS = [
  '/login',
  '/signup',
  '/request-password-reset',
  '/password-reset',
  '/email-verification',
  '/signup-success',
];

// Onboarding flow pages (accessible without salon)
const ONBOARDING_PATHS = [
  '/onboarding',
  '/onboarding/create-salon',
  '/onboarding/waiting-invite',
];

// Pages that require a salon to access
const PROTECTED_PATHS = [
  '/dashboard',
  '/clients',
  '/services',
  '/appointments',
  '/sales',
  '/inventory',
  '/cash-register',
  '/reports',
  '/notifications',
  '/admin',
  '/account',
];

export default function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { data: user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) {
      return;
    }

    // If not authenticated, let auth pages handle it
    if (!user) {
      return;
    }

    const currentPath = location.pathname;
    const hasSalon = !!user.activeSalonId;

    // Check if current path matches any category
    const isPublicPath = PUBLIC_PATHS.some(path => 
      currentPath === path || currentPath.startsWith(path + '/')
    );
    const isAuthPath = AUTH_PATHS.some(path => currentPath.startsWith(path));
    const isOnboardingPath = ONBOARDING_PATHS.some(path => currentPath.startsWith(path));
    const isProtectedPath = PROTECTED_PATHS.some(path => currentPath.startsWith(path));

    // Rule 1: Public and auth pages are always accessible
    if (isPublicPath || isAuthPath) {
      return;
    }

    // Rule 2: User has salon but is on onboarding pages → redirect to dashboard
    if (hasSalon && isOnboardingPath) {
      console.log('[OnboardingGuard] User has salon, redirecting from onboarding to dashboard');
      navigate('/dashboard', { replace: true });
      return;
    }

    // Rule 3: User has no salon but trying to access protected pages → redirect to onboarding
    if (!hasSalon && isProtectedPath) {
      console.log('[OnboardingGuard] User has no salon, redirecting to onboarding');
      navigate('/onboarding', { replace: true });
      return;
    }

    // Rule 4: User has no salon and not on onboarding → redirect to onboarding
    // (catch-all for authenticated users without salon on unknown pages)
    if (!hasSalon && !isOnboardingPath) {
      console.log('[OnboardingGuard] User has no salon and not on onboarding, redirecting');
      navigate('/onboarding', { replace: true });
      return;
    }

  }, [user, isLoading, location.pathname, navigate]);

  // Show children (pages) after guard checks
  return <>{children}</>;
}
