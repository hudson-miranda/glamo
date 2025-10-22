import type { NavigationItem } from './NavBar';

export const marketingNavigationItems: NavigationItem[] = [
  { name: 'Features', to: '/#features' },
] as const;

// For authenticated users, we don't show top navigation items
// as they'll use the sidebar navigation instead
export const demoNavigationitems: NavigationItem[] = [] as const;
