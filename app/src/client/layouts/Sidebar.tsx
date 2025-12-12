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
  UserCog,
  MessageSquare,
  Gift,
  UserPlus,
  Camera,
  FileText,
  TrendingUp,
  Wallet,
  Award,
  Video,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  Tag,
  Bookmark,
  Building2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
  badge?: string;
  subItems?: NavItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Principal',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: Home,
      },
      {
        title: 'Agenda',
        href: '/calendar',
        icon: Calendar,
        permission: 'can_view_appointments',
      },
      {
        title: 'PDV / Vendas',
        href: '/sales',
        icon: DollarSign,
        permission: 'can_view_sales',
      },
    ],
  },
  {
    title: 'Gestão',
    items: [
      {
        title: 'Clientes',
        href: '/clients',
        icon: Users,
        permission: 'can_view_clients',
      },
      {
        title: 'Colaboradores',
        href: '/employees',
        icon: UserCog,
        permission: 'can_view_staff',
      },
      {
        title: 'Serviços',
        href: '/services',
        icon: Scissors,
        permission: 'can_view_services',
      },
      {
        title: 'Categorias',
        href: '/categories',
        icon: Tag,
        permission: 'can_view_services',
      },
      {
        title: 'Produtos',
        href: '/products',
        icon: Package,
        permission: 'can_view_products',
      },
      {
        title: 'Marcas',
        href: '/brands',
        icon: Bookmark,
        permission: 'can_view_products',
      },
      {
        title: 'Fornecedores',
        href: '/suppliers',
        icon: Building2,
        permission: 'can_view_products',
      },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      {
        title: 'Caixa',
        href: '/cash-register',
        icon: CreditCard,
        permission: 'can_view_cash_sessions',
      },
      {
        title: 'Financeiro',
        href: '/financial/dashboard',
        icon: Wallet,
        permission: 'can_view_reports',
      },
    ],
  },
  {
    title: 'Clientes & Engajamento',
    items: [
      {
        title: 'Programa de Fidelidade',
        href: '/programs/loyalty',
        icon: Gift,
        permission: 'can_view_clients',
      },
      {
        title: 'Gamificação',
        href: '/gamification',
        icon: Award,
        permission: 'can_view_clients',
      },
      {
        title: 'Indicações',
        href: '/programs/referral',
        icon: UserPlus,
        permission: 'can_view_clients',
      },
      {
        title: 'Comunicação',
        href: '/communication',
        icon: MessageSquare,
        permission: 'can_view_clients',
      },
    ],
  },
  {
    title: 'Recursos Avançados',
    items: [
      {
        title: 'Anamnese',
        href: '/forms/anamnesis',
        icon: FileText,
        permission: 'can_view_clients',
      },
      {
        title: 'Documentos',
        href: '/documents',
        icon: FolderOpen,
        permission: 'can_view_clients',
      },
      {
        title: 'Galeria de Fotos',
        href: '/gallery/photos',
        icon: Camera,
        permission: 'can_view_clients',
      },
      {
        title: 'Telemedicina',
        href: '/telemedicine',
        icon: Video,
        permission: 'can_view_appointments',
      },
    ],
  },
  {
    title: 'Análises',
    items: [
      {
        title: 'Relatórios',
        href: '/reports',
        icon: BarChart3,
        permission: 'can_view_reports',
      },
      {
        title: 'Analytics Avançado',
        href: '/analytics/advanced',
        icon: TrendingUp,
        permission: 'can_view_reports',
      },
    ],
  },
];

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

export function Sidebar({ className, onClose }: SidebarProps) {
  const { data: user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // TODO: Filter navigation items based on user permissions
  const visibleSections = navSections;

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const handleLinkClick = () => {
    // Close mobile sidebar when link is clicked
    if (onClose) {
      onClose();
    }
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
      <nav className='flex-1 overflow-y-auto px-2 py-4 space-y-4'>
        {visibleSections.map((section) => {
          const isExpanded = expandedSections[section.title] ?? true;
          
          return (
            <div key={section.title} className='space-y-1'>
              {!isCollapsed && (
                <button
                  onClick={() => toggleSection(section.title)}
                  className='flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors'
                >
                  <span>{section.title}</span>
                  {isExpanded ? (
                    <ChevronUp className='h-3 w-3' />
                  ) : (
                    <ChevronDown className='h-3 w-3' />
                  )}
                </button>
              )}
              
              {(isCollapsed || isExpanded) && (
                <div className='space-y-0.5'>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    
                    return (
                      <Link
                        key={item.href}
                        to={item.href as any}
                        onClick={handleLinkClick}
                        className={cn(
                          'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                          isCollapsed ? 'justify-center' : 'space-x-3',
                          active
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                        title={isCollapsed ? item.title : undefined}
                      >
                        <Icon className='h-4 w-4 flex-shrink-0' />
                        {!isCollapsed && (
                          <span className='flex-1'>{item.title}</span>
                        )}
                        {!isCollapsed && item.badge && (
                          <span className='ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full'>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className='border-t p-2 space-y-2'>
        <Link
          to='/notifications'
          onClick={handleLinkClick}
          className={cn(
            'flex items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground',
            isCollapsed ? 'justify-center' : 'space-x-3',
            isActive('/notifications') && 'bg-primary text-primary-foreground'
          )}
          title={isCollapsed ? 'Notificações' : undefined}
        >
          <Bell className='h-5 w-5 flex-shrink-0' />
          {!isCollapsed && <span>Notificações</span>}
        </Link>
        
        <Link
          to='/account'
          onClick={handleLinkClick}
          className={cn(
            'flex items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground',
            isCollapsed ? 'justify-center' : 'space-x-3',
            isActive('/account') && 'bg-primary text-primary-foreground'
          )}
          title={isCollapsed ? 'Configurações' : undefined}
        >
          <Settings className='h-5 w-5 flex-shrink-0' />
          {!isCollapsed && <span>Configurações</span>}
        </Link>
        
        {/* Hide collapse button on mobile since we use overlay */}
        <Button
          variant='ghost'
          size='sm'
          className={cn(
            'w-full hidden lg:flex',
            isCollapsed ? 'px-0' : ''
          )}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className='h-4 w-4' />
          ) : (
            <>
              <ChevronLeft className='mr-2 h-4 w-4' />
              Recolher
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
