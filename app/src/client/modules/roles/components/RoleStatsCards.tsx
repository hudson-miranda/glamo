import { CollapsibleStats } from '../../../../components/ui/collapsible-stats';
import { Shield, ShieldCheck, Users, Lock } from 'lucide-react';

type RoleStats = {
  total: number;
  admin: number;
  standard: number;
  employeesWithRoles: number;
};

type RoleStatsCardsProps = {
  stats: RoleStats;
  isLoading?: boolean;
};

export function RoleStatsCards({ stats, isLoading = false }: RoleStatsCardsProps) {
  const cards = [
    {
      title: 'Total de Cargos',
      value: stats.total,
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Administradores',
      value: stats.admin,
      icon: ShieldCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Cargos Padrão',
      value: stats.standard,
      icon: Lock,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Colaboradores',
      value: stats.employeesWithRoles,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <CollapsibleStats 
      cards={cards} 
      isLoading={isLoading}
    />
  );
}
