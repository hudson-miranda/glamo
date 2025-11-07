// app/src/landing-page/components/constants.ts
import type { NavigationItem } from './NavBar';

export const marketingNavigationItems: NavigationItem[] = [
  { name: 'Funcionalidades', to: '/#funcionalidades' },
  { name: 'Planos e Preços', to: '/#planos-precos' },
  { name: 'Depoimentos', to: '/#depoimentos' },
  { name: 'Integrações', to: '/#integracoes' },
  { name: 'FAQ', to: '/#faq' },
  { name: 'Contato', to: '/#contato' },
] as const;

// Usuários autenticados usam a navegação lateral
export const demoNavigationitems: NavigationItem[] = [] as const;