// app/src/landing-page/components/NavBar.tsx - PADRONIZADO E OTIMIZADO
import { LogIn, Menu } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { useAuth } from 'wasp/client/auth';
import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../../components/ui/sheet';
import { cn } from '../../../lib/utils';
import { throttleWithTrailingInvocation } from '../../../shared/utils';
import { UserDropdown } from '../../../user/UserDropdown';
import { UserMenuItems } from '../../../user/UserMenuItems';
import { useIsLandingPage } from '../../hooks/useIsLandingPage';
import logo from '../../static/logo.webp';
import DarkModeSwitcher from '../DarkModeSwitcher';
import { Announcement } from './Announcement';

export interface NavigationItem {
  name: string;
  to: string;
  external?: boolean; // opcional: força target _blank
}

export default function NavBar({ navigationItems }: { navigationItems: NavigationItem[] }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const isLandingPage = useIsLandingPage();

  useEffect(() => {
    const throttledHandler = throttleWithTrailingInvocation(() => {
      setIsScrolled(window.scrollY > 2);
    }, 50);

    window.addEventListener('scroll', throttledHandler, { passive: true });
    return () => {
      window.removeEventListener('scroll', throttledHandler);
      throttledHandler.cancel();
    };
  }, []);

  return (
    <>
      {isLandingPage && <Announcement />}
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-300',
          isScrolled ? 'top-4' : 'top-0'
        )}
        aria-label="Cabeçalho principal"
      >
        <div
          className={cn(
            'transition-all duration-300',
            isScrolled
              ? 'mx-4 md:mx-20 pr-2 lg:pr-0 rounded-full shadow-lg bg-background/85 backdrop-blur-lg border border-border'
              : 'mx-0 bg-background/80 backdrop-blur-lg border-b border-border'
          )}
        >
          <nav
            className={cn(
              'flex items-center justify-between transition-all duration-300',
              isScrolled ? 'p-3 lg:px-6' : 'p-6 lg:px-8'
            )}
            aria-label="Navegação global"
          >
            <div className="flex items-center gap-6">
              <WaspRouterLink
                to={routes.LandingPageRoute.to}
                className="flex items-center text-foreground duration-300 ease-in-out hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-md"
                aria-label="Ir para a página inicial"
              >
                <NavLogo isScrolled={isScrolled} />
                <span
                  className={cn(
                    'font-bold leading-6 bg-gradient-to-r from-[#A78BFA] to-[#EC4899] bg-clip-text text-transparent transition-all duration-300',
                    isScrolled ? 'ml-2 text-lg' : 'ml-2 text-xl'
                  )}
                >
                  Glamo
                </span>
              </WaspRouterLink>

              <ul className="hidden lg:flex items-center gap-6 ml-4">
                {renderNavigationItems(navigationItems)}
              </ul>
            </div>

            <NavBarMobileMenu isScrolled={isScrolled} navigationItems={navigationItems} />
            <NavBarDesktopUserDropdown isScrolled={isScrolled} />
          </nav>
        </div>
      </header>
    </>
  );
}

function NavBarDesktopUserDropdown({ isScrolled }: { isScrolled: boolean }) {
  const { data: user, isLoading: isUserLoading } = useAuth();

  return (
    <div className="hidden lg:flex lg:flex-1 gap-3 justify-end items-center">
      <ul className="flex justify-center items-center gap-2 sm:gap-4">
        <DarkModeSwitcher />
      </ul>
      {isUserLoading ? null : !user ? (
        <WaspRouterLink
          to={routes.LoginRoute.to}
          className={cn('font-semibold leading-6 ml-3 transition-all duration-300 text-foreground hover:text-primary', {
            'text-sm': !isScrolled,
            'text-xs': isScrolled,
          })}
          aria-label="Fazer login"
        >
          <div className="flex items-center">
            Entrar
            <LogIn
              size={isScrolled ? '1rem' : '1.1rem'}
              className={cn('ml-1 transition-all duration-300', {
                'mt-[0.1rem]': !isScrolled,
              })}
              aria-hidden="true"
            />
          </div>
        </WaspRouterLink>
      ) : (
        <div className="ml-3">
          <UserDropdown user={user} />
        </div>
      )}
    </div>
  );
}

function NavBarMobileMenu({
  isScrolled,
  navigationItems,
}: {
  isScrolled: boolean;
  navigationItems: NavigationItem[];
}) {
  const { data: user, isLoading: isUserLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex lg:hidden">
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-muted hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40'
            )}
            aria-label="Abrir menu principal"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <Menu
              className={cn('transition-all duration-300', {
                'size-8 p-1': !isScrolled,
                'size-6 p-0.5': isScrolled,
              })}
              aria-hidden="true"
            />
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px]" id="mobile-menu" aria-label="Menu móvel">
          <SheetHeader>
            <SheetTitle className="flex items-center">
              <WaspRouterLink to={routes.LandingPageRoute.to} aria-label="Página inicial">
                <span className="sr-only">Glamo</span>
                <NavLogo isScrolled={false} />
              </WaspRouterLink>
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-border">
              <ul className="space-y-2 py-6">
                {renderNavigationItems(navigationItems, setMobileMenuOpen)}
              </ul>
              <div className="py-6">
                {isUserLoading ? null : !user ? (
                  <WaspRouterLink to={routes.LoginRoute.to} aria-label="Fazer login">
                    <div className="flex justify-end items-center text-foreground hover:text-primary transition-colors">
                      Entrar <LogIn size="1.1rem" className="ml-1" />
                    </div>
                  </WaspRouterLink>
                ) : (
                  <ul className="space-y-2">
                    <UserMenuItems user={user} onItemClick={() => setMobileMenuOpen(false)} />
                  </ul>
                )}
              </div>
              <div className="py-6">
                <DarkModeSwitcher />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function renderNavigationItems(
  navigationItems: NavigationItem[],
  setMobileMenuOpen?: Dispatch<SetStateAction<boolean>>
) {
  const menuStyles = cn({
    'block rounded-lg px-3 py-2 text-sm font-medium leading-7 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40':
      !!setMobileMenuOpen,
    'text-sm font-semibold leading-6 text-foreground duration-300 ease-in-out hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-sm':
      !setMobileMenuOpen,
  });

  return navigationItems.map((item) => {
    const isExternal = item.external ?? item.to.startsWith('http');
    return (
      <li key={item.name}>
        <ReactRouterLink
          to={item.to}
          className={menuStyles}
          onClick={setMobileMenuOpen && (() => setMobileMenuOpen(false))}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          aria-label={`Ir para ${item.name}`}
        >
          {item.name}
        </ReactRouterLink>
      </li>
    );
  });
}

const NavLogo = ({ isScrolled }: { isScrolled: boolean }) => (
  <img
    className={cn('transition-all duration-500', {
      'size-8': !isScrolled,
      'size-7': isScrolled,
    })}
    src={logo}
    alt="Logotipo Glamo"
    width={32}
    height={32}
    decoding="async"
  />
);