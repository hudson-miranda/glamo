import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import {
  Calendar,
  Receipt,
  Package,
  Bookmark,
  Users,
  Scissors,
  Tag,
  UserCog,
  Building2,
  ShoppingCart,
  DollarSign,
  TrendingDown,
  CreditCard,
  ArrowRightLeft,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface ActionItem {
  title: string;
  icon: React.ElementType;
  href?: string;
  onClick?: () => void;
  permission?: string;
}

interface ActionSection {
  title: string;
  items: ActionItem[];
}

interface NewActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewActionDialog({ open, onOpenChange }: NewActionDialogProps) {
  const navigate = useNavigate();

  const sections: ActionSection[] = [
    {
      title: 'PRINCIPAL',
      items: [
        {
          title: 'Agendamento',
          icon: Calendar,
          onClick: () => {
            navigate('/calendar');
            onOpenChange(false);
          },
          permission: 'can_create_appointments',
        },
        {
          title: 'Comanda',
          icon: Receipt,
          onClick: () => {
            navigate('/sales');
            onOpenChange(false);
          },
          permission: 'can_create_sales',
        },
        {
          title: 'Pacote',
          icon: Package,
          onClick: () => {
            navigate('/packages');
            onOpenChange(false);
          },
          permission: 'can_create_packages',
        },
        {
          title: 'Pacote Predef.',
          icon: Bookmark,
          onClick: () => {
            navigate('/packages/predefined');
            onOpenChange(false);
          },
          permission: 'can_create_packages',
        },
      ],
    },
    {
      title: 'CADASTROS',
      items: [
        {
          title: 'Cliente',
          icon: Users,
          onClick: () => {
            navigate('/clients');
            onOpenChange(false);
          },
          permission: 'can_create_clients',
        },
        {
          title: 'Serviço',
          icon: Scissors,
          onClick: () => {
            navigate('/services');
            onOpenChange(false);
          },
          permission: 'can_create_services',
        },
        {
          title: 'Produto',
          icon: Package,
          onClick: () => {
            navigate('/products');
            onOpenChange(false);
          },
          permission: 'can_create_products',
        },
        {
          title: 'Categoria',
          icon: Tag,
          onClick: () => {
            navigate('/categories');
            onOpenChange(false);
          },
          permission: 'can_create_services',
        },
        {
          title: 'Profissional',
          icon: UserCog,
          onClick: () => {
            navigate('/employees');
            onOpenChange(false);
          },
          permission: 'can_create_staff',
        },
        {
          title: 'Fornecedor',
          icon: Building2,
          onClick: () => {
            navigate('/suppliers');
            onOpenChange(false);
          },
          permission: 'can_create_products',
        },
        {
          title: 'Compra',
          icon: ShoppingCart,
          onClick: () => {
            navigate('/purchases');
            onOpenChange(false);
          },
          permission: 'can_create_purchases',
        },
        {
          title: 'Marca',
          icon: Bookmark,
          onClick: () => {
            navigate('/brands');
            onOpenChange(false);
          },
          permission: 'can_create_products',
        },
      ],
    },
    {
      title: 'FINANCEIRO',
      items: [
        {
          title: 'Recebimento',
          icon: DollarSign,
          onClick: () => {
            navigate('/financial/receivables');
            onOpenChange(false);
          },
          permission: 'can_create_receivables',
        },
        {
          title: 'Despesa',
          icon: TrendingDown,
          onClick: () => {
            navigate('/financial/expenses');
            onOpenChange(false);
          },
          permission: 'can_create_expenses',
        },
        {
          title: 'Vale',
          icon: CreditCard,
          onClick: () => {
            navigate('/financial/vouchers');
            onOpenChange(false);
          },
          permission: 'can_create_vouchers',
        },
        {
          title: 'Transferência',
          icon: ArrowRightLeft,
          onClick: () => {
            navigate('/financial/transfers');
            onOpenChange(false);
          },
          permission: 'can_create_transfers',
        },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-[600px] max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl font-bold'>Nova Ação</DialogTitle>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {sections.map((section) => (
            <div key={section.title} className='space-y-3'>
              <h3 className='text-xs font-semibold text-muted-foreground tracking-wider'>
                {section.title}
              </h3>
              <div className='grid grid-cols-4 gap-3'>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.title}
                      variant='outline'
                      className={cn(
                        'h-24 flex flex-col items-center justify-center gap-2 p-3',
                        'hover:bg-primary/10 hover:border-primary transition-all',
                        'text-sm font-medium'
                      )}
                      onClick={item.onClick}
                    >
                      <div className='h-10 w-10 rounded-lg bg-muted flex items-center justify-center'>
                        <Icon className='h-5 w-5' />
                      </div>
                      <span className='text-xs text-center leading-tight'>
                        {item.title}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
