import { CollapsibleStats } from '../../../../components/ui/collapsible-stats';
import { Building2, Package, Mail, Phone } from 'lucide-react';

type SupplierStats = {
  total: number;
  withProducts: number;
  withEmail: number;
  withPhone: number;
};

interface SupplierStatsCardsProps {
  stats: SupplierStats;
  isLoading?: boolean;
}

export function SupplierStatsCards({ stats, isLoading }: SupplierStatsCardsProps) {
  const cards = [
    {
      title: 'Total',
      value: stats.total,
      icon: Building2,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Com Produtos',
      value: stats.withProducts,
      icon: Package,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Com Email',
      value: stats.withEmail,
      icon: Mail,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Com Telefone',
      value: stats.withPhone,
      icon: Phone,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <CollapsibleStats 
      cards={cards} 
      isLoading={isLoading}
      title="Estatísticas de Fornecedores"
    />
  );
}
