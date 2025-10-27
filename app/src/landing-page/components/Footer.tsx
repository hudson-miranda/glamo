// components/Footer.tsx - PADRONIZADO
import { motion } from 'framer-motion';

interface FooterProps {
  footerNavigation?: any;
}

export default function Footer({ footerNavigation }: FooterProps = {}) {
  return (
    <footer className="bg-black text-white border-t border-white/10">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl">
                ✨
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Glamo
              </span>
            </div>
            <p className="text-gray-400 mb-6">
              A plataforma completa com IA para transformar seu negócio de beleza.
            </p>
            <div className="flex gap-4">
              {['instagram', 'facebook', 'twitter', 'linkedin'].map((social, i) => (
                <a
                  key={i}
                  href={`#${social}`}
                  className="w-10 h-10 bg-white/5 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <span className="text-sm">📱</span>
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-bold text-lg mb-4">Produto</h3>
            <ul className="space-y-3">
              {['Funcionalidades', 'Preços', 'Integrações', 'API', 'Changelog'].map((item, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors duration-300">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-lg mb-4">Empresa</h3>
            <ul className="space-y-3">
              {['Sobre', 'Blog', 'Carreiras', 'Imprensa', 'Parceiros'].map((item, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors duration-300">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-lg mb-4">Suporte</h3>
            <ul className="space-y-3">
              {['Central de Ajuda', 'Contato', 'Status', 'Termos', 'Privacidade'].map((item, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors duration-300">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2025 Glamo. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <span>🔒 LGPD Compliant</span>
            <span>⭐ 4.9/5 Rating</span>
            <span>🇧🇷 Made in Brazil</span>
          </div>
        </div>
      </div>
    </footer>
  );
}