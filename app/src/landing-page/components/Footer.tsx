import { motion } from 'framer-motion';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
}

export default function Footer({
  footerNavigation,
}: {
  footerNavigation: {
    app: NavigationItem[];
    company: NavigationItem[];
  };
}) {
  const socialLinks = [
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
  ];

  return (
    <footer className='relative border-t border-border bg-muted/30'>
      {/* Top gradient separator */}
      <div className='absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F5C542]/30 to-transparent' />

      <div className='mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8'>
          {/* Brand section */}
          <div className='lg:col-span-1'>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className='flex items-center gap-2 mb-4'>
                <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#F5C542] to-yellow-500 flex items-center justify-center'>
                  <span className='text-2xl'>✨</span>
                </div>
                <h3 className='text-xl font-bold bg-gradient-to-r from-[#F5C542] to-yellow-500 bg-clip-text text-transparent'>
                  Glamo
                </h3>
              </div>
              <p className='text-sm text-muted-foreground leading-relaxed'>
                Sistema de gestão inteligente para salões de beleza. Transforme seu negócio com tecnologia de ponta.
              </p>
              {/* Social links */}
              <div className='flex gap-4 mt-6'>
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className='w-10 h-10 rounded-lg bg-card border border-border hover:border-primary/50 flex items-center justify-center transition-all duration-300 hover:shadow-md group'
                    aria-label={social.name}
                  >
                    <social.icon className='h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors' />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* App links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className='text-sm font-semibold text-foreground mb-4'>Plataforma</h3>
            <ul className='space-y-3'>
              {footerNavigation.app.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className='text-sm text-muted-foreground hover:text-primary transition-colors duration-200 inline-block'
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className='text-sm font-semibold text-foreground mb-4'>Empresa</h3>
            <ul className='space-y-3'>
              {footerNavigation.company.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className='text-sm text-muted-foreground hover:text-primary transition-colors duration-200 inline-block'
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className='lg:col-span-1'
          >
            <h3 className='text-sm font-semibold text-foreground mb-4'>Comece agora</h3>
            <p className='text-sm text-muted-foreground mb-4'>
              Teste grátis por 14 dias. Sem cartão de crédito.
            </p>
            <a
              href='#demo'
              className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#F5C542] to-yellow-500 text-black text-sm font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105'
            >
              Solicitar Demo
              <span>→</span>
            </a>
          </motion.div>
        </div>

        {/* Bottom section */}
        <div className='mt-12 pt-8 border-t border-border'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
            <p className='text-sm text-muted-foreground text-center md:text-left'>
              © {new Date().getFullYear()} Glamo. Todos os direitos reservados.
            </p>
            <p className='text-sm text-muted-foreground text-center md:text-right'>
              Feito com ❤️ para profissionais da beleza
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
