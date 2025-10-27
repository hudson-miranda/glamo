// app/src/landing-page/components/Header.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white py-2.5 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/50 via-pink-600/50 to-orange-500/50 animate-pulse" />
        <div className="relative z-10 flex items-center justify-center gap-3 text-sm font-bold tracking-wide">
          <span className="hidden sm:inline">✨</span>
          <span>Comece Agora</span>
          <span className="text-yellow-300 font-extrabold">|</span>
          <span>14 Dias Grátis</span>
          <span className="hidden sm:inline">🚀</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                <span className="text-2xl">✨</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Glamo
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <NavLink href="#features">Funcionalidades</NavLink>
              <NavLink href="#how-it-works">Como Funciona</NavLink>
              <NavLink href="#why-different">Por Que Glamo?</NavLink>
              <NavLink href="#testimonials">Depoimentos</NavLink>
              <NavLink href="#faq">FAQ</NavLink>
              <NavLink href="#contact">Contato</NavLink>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/login"
                className="px-6 py-2.5 text-gray-700 font-semibold hover:text-purple-600 transition-colors duration-300"
              >
                Entrar
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
              >
                Começar Grátis
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-purple-600 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4 space-y-3 animate-fadeIn">
              <MobileNavLink href="#features" onClick={() => setMobileMenuOpen(false)}>
                Funcionalidades
              </MobileNavLink>
              <MobileNavLink href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>
                Como Funciona
              </MobileNavLink>
              <MobileNavLink href="#why-different" onClick={() => setMobileMenuOpen(false)}>
                Por Que Glamo?
              </MobileNavLink>
              <MobileNavLink href="#testimonials" onClick={() => setMobileMenuOpen(false)}>
                Depoimentos
              </MobileNavLink>
              <MobileNavLink href="#faq" onClick={() => setMobileMenuOpen(false)}>
                FAQ
              </MobileNavLink>
              <MobileNavLink href="#contact" onClick={() => setMobileMenuOpen(false)}>
                Contato
              </MobileNavLink>
              <div className="pt-4 space-y-3">
                <Link
                  to="/login"
                  className="block w-full px-6 py-3 text-center text-gray-700 font-semibold border-2 border-gray-300 rounded-full hover:border-purple-600 hover:text-purple-600 transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Entrar
                </Link>
                <Link
                  to="/signup"
                  className="block w-full px-6 py-3 text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Começar Grátis
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-gray-700 font-medium hover:text-purple-600 transition-colors duration-300 relative group"
    >
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300" />
    </a>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="block px-4 py-2 text-gray-700 font-medium hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-300"
    >
      {children}
    </a>
  );
}