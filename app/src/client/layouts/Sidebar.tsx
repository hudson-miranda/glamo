import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  ChevronLeft,
  ChevronRight,
  LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';

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
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // TODO: Filter navigation items based on user permissions
  const visibleNavItems = navItems;

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div
      className={cn(
        'flex h-full flex-col bg-card border-r transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header */}
      <div className='flex h-16 items-center justify-between border-b px-4'>
        <Link 
          to='/dashboard' 
          className={cn(
            'flex items-center space-x-2 transition-opacity',
            isCollapsed && 'opacity-0 pointer-events-none'
          )}
        >
          <Scissors className='h-6 w-6 text-primary' />
          <span className='text-xl font-bold'>Glamo</span>
        </Link>
        
        {isCollapsed && (
          <Link to='/dashboard' className='flex items-center justify-center w-full'>
            <Scissors className='h-6 w-6 text-primary' />
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className='flex-1 space-y-1 px-2 py-4'>
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              to={item.href as any}
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                isCollapsed ? 'justify-center' : 'space-x-3',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
              title={isCollapsed ? item.title : undefined}
            >
              <Icon className='h-5 w-5 flex-shrink-0' />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className='border-t p-2 space-y-2'>
        <Link
          to='/account'
          className={cn(
            'flex items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground',
            isCollapsed ? 'justify-center' : 'space-x-3'
          )}
          title={isCollapsed ? 'Settings' : undefined}
        >
          <Settings className='h-5 w-5 flex-shrink-0' />
          {!isCollapsed && <span>Settings</span>}
        </Link>
        
        <Button
          variant='ghost'
          size='sm'
          className={cn(
            'w-full',
            isCollapsed ? 'px-0' : ''
          )}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className='h-4 w-4' />
          ) : (
            <>
              <ChevronLeft className='mr-2 h-4 w-4' />
              Collapse
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
