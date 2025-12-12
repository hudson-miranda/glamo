import { CollapsibleStats } from '../../../../components/ui/collapsible-stats';
import { Users, UserCheck, UserX, Globe } from 'lucide-react';

type EmployeeStats = {
  total: number;
  active: number;
  inactive: number;
  withSystemAccess: number;
};

type EmployeeStatsCardsProps = {
  stats: EmployeeStats;
  isLoading?: boolean;
};

export function EmployeeStatsCards({ stats, isLoading = false }: EmployeeStatsCardsProps) {
  const cards = [
    {
      title: 'Total de Colaboradores',
      value: stats.total,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Ativos',
      value: stats.active,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Inativos',
      value: stats.inactive,
      icon: UserX,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Agendamento Online',
      value: stats.withSystemAccess,
      icon: Globe,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <CollapsibleStats 
      cards={cards} 
      isLoading={isLoading}
      title="Estatísticas de Colaboradores"
    />
  );
}
