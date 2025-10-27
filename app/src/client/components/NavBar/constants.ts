// app/src/landing-page/components/constants.ts
import type { NavigationItem } from './NavBar';

export const marketingNavigationItems: NavigationItem[] = [
  { name: 'Recursos', to: '/#features' },
  { name: 'Como funciona', to: '/#como-funciona' },
  { name: 'Por que diferente', to: '/#por-que-diferente' },
  { name: 'Depoimentos', to: '/#depoimentos' },
  { name: 'FAQ', to: '/#faq' },
  { name: 'Contato', to: '/#contato' },
] as const;

// Usuários autenticados usam a navegação lateral
export const demoNavigationitems: NavigationItem[] = [] as const;