import { Link } from 'wasp/client/router';
import { useAuth } from 'wasp/client/auth';
import {
  Home,
  Users,
  Bell,
  Scissors,
  Calendar,
  DollarSign,
  Package,
  CreditCard,
  BarChart3,
  Settings,
  LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Clients',
    href: '/clients',
    icon: Users,
    permission: 'can_view_clients',
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
  {
    title: 'Services',
    href: '/services',
    icon: Scissors,
    permission: 'can_view_services',
  },
  {
    title: 'Appointments',
    href: '/appointments',
    icon: Calendar,
    permission: 'can_view_appointments',
  },
  {
    title: 'Sales',
    href: '/sales',
    icon: DollarSign,
    permission: 'can_view_sales',
  },
  {
    title: 'Inventory',
    href: '/inventory',
    icon: Package,
    permission: 'can_view_products',
  },
  {
    title: 'Cash Register',
    href: '/cash-register',
    icon: CreditCard,
    permission: 'can_view_cash_sessions',
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
    permission: 'can_view_reports',
  },
];

export function Sidebar({ className }: { className?: string }) {
  const { data: user } = useAuth();

  // TODO: Filter navigation items based on user permissions
  const visibleNavItems = navItems;

  return (
    <div
      className={cn(
        'flex h-full w-64 flex-col bg-card border-r',
        className
      )}
    >
      <div className='flex h-16 items-center border-b px-6'>
        <Link to='/dashboard' className='flex items-center space-x-2'>
          <Scissors className='h-6 w-6 text-primary' />
          <span className='text-xl font-bold'>Glamo</span>
        </Link>
      </div>

      <nav className='flex-1 space-y-1 px-3 py-4'>
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href as any}
              className='flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
            >
              <Icon className='h-5 w-5' />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className='border-t p-4'>
        <Link
          to='/account'
          className='flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground'
        >
          <Settings className='h-5 w-5' />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );
}
