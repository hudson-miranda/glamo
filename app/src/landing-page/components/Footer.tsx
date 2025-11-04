// components/Footer.tsx - PADRONIZADO E OTIMIZADO
import { motion } from 'framer-motion';

type NavItem = { label: string; href: string };
type NavSection = { title: string; items: NavItem[] };

interface FooterProps {
  footerNavigation?: {
    social?: { name: 'instagram' | 'facebook' | 'twitter' | 'linkedin'; href: string }[];
    sections?: NavSection[];
    badges?: string[];
  };
}

const defaultNavigation: Required<FooterProps>['footerNavigation'] = {
  social: [
    { name: 'instagram', href: '#' },
    { name: 'facebook', href: '#' },
    { name: 'twitter', href: '#' },
    { name: 'linkedin', href: '#' },
  ],
  sections: [
    {
      title: 'Produto',
      items: [
        { label: 'Funcionalidades', href: '/features' },
        { label: 'Preços', href: '/pricing' },
        { label: 'Integrações', href: '/integrations' },
        { label: 'API', href: '/api' },
        { label: 'Changelog', href: '/changelog' },
      ],
    },
    {
      title: 'Empresa',
      items: [
        { label: 'Sobre', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Carreiras', href: '/careers' },
        { label: 'Imprensa', href: '/press' },
        { label: 'Parceiros', href: '/partners' },
      ],
    },
    {
      title: 'Suporte',
      items: [
        { label: 'Central de Ajuda', href: '/help' },
        { label: 'Contato', href: '/contact' },
        { label: 'Status', href: '/status' },
        { label: 'Termos', href: '/terms' },
        { label: 'Privacidade', href: '/privacy' },
      ],
    },
  ],
  badges: ['🔒 LGPD Compliant', '⭐ 4.9/5 Rating', '🇧🇷 Made in Brazil'],
};

const colVariants = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.05 },
  }),
};

export default function Footer({ footerNavigation }: FooterProps = {}) {
  const social = footerNavigation?.social ?? defaultNavigation.social;
  const sections = footerNavigation?.sections ?? defaultNavigation.sections;
  const badges = footerNavigation?.badges ?? defaultNavigation.badges;

  return (
    <footer className="bg-white dark:bg-black text-gray-900 dark:text-white border-t border-gray-200 dark:border-white/10 relative overflow-hidden transition-colors duration-300">
      {/* sutil glow no topo para transição com a seção anterior */}
      <div className="pointer-events-none absolute inset-x-0 -top-12 h-24 bg-gradient-to-b from-brand-500/10 to-transparent blur-2xl" />

      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={colVariants} custom={0}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl">
                ✨
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Glamo
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              A plataforma completa com IA para transformar seu negócio de beleza.
            </p>
            <nav aria-label="Redes sociais" className="flex gap-3">
              {social!.map((s, i) => (
                <motion.a
                  key={s.name + i}
                  href={s.href}
                  aria-label={`Glamo no ${capitalize(s.name)}`}
                  className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/5 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  whileHover={{ y: -2 }}
                >
                  <SocialIcon name={s.name} />
                </motion.a>
              ))}
            </nav>
          </motion.div>

          {/* Sections */}
          {sections!.map((section, idx) => (
            <motion.div
              key={section.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={colVariants}
              custom={idx + 1}
            >
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">{section.title}</h3>
              <nav aria-label={`Links: ${section.title}`}>
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        className="text-gray-600 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/40 rounded-sm"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-200 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} Glamo. Todos os direitos reservados.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            {badges!.map((b, i) => (
              <span key={i} className="inline-flex items-center gap-2">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function SocialIcon({ name }: { name: 'instagram' | 'facebook' | 'twitter' | 'linkedin' }) {
  const common = 'w-5 h-5';
  switch (name) {
    case 'instagram':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm10 2a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3V7a3 3 0 013-3h10zM12 7a5 5 0 100 10 5 5 0 000-10zm0 2.2a2.8 2.8 0 110 5.6 2.8 2.8 0 010-5.6zM17.8 6.2a1 1 0 100 2 1 1 0 000-2z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M22 12.06C22 6.48 17.52 2 11.94 2 6.36 2 1.88 6.48 1.88 12.06c0 5 3.66 9.14 8.44 9.94v-7.03H7.9v-2.91h2.42V9.41c0-2.39 1.44-3.71 3.64-3.71 1.06 0 2.17.19 2.17.19v2.39h-1.22c-1.2 0-1.57.75-1.57 1.52v1.83h2.67l-.43 2.91h-2.24V22c4.78-.8 8.44-4.94 8.44-9.94z" />
        </svg>
      );
    case 'twitter':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M22.46 6c-.77.35-1.6.59-2.46.7a4.27 4.27 0 001.87-2.36 8.53 8.53 0 01-2.7 1.03 4.26 4.26 0 00-7.25 3.88A12.1 12.1 0 013 5.16a4.25 4.25 0 001.32 5.68 4.2 4.2 0 01-1.93-.53v.05a4.26 4.26 0 003.42 4.18 4.3 4.3 0 01-1.92.07 4.27 4.27 0 003.98 2.96A8.54 8.54 0 012 19.54a12.07 12.07 0 006.54 1.92c7.86 0 12.16-6.51 12.16-12.16 0-.19 0-.39-.01-.58A8.68 8.68 0 0022.46 6z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM0 8h5v15H0V8zm7 0h4.8v2.05h.07c.67-1.26 2.3-2.6 4.73-2.6C20.62 7.45 22 10 22 13.64V23H17V14.9c0-1.93-.03-4.42-2.7-4.42-2.7 0-3.12 2.11-3.12 4.29V23H7V8z" />
        </svg>
      );
  }
}
