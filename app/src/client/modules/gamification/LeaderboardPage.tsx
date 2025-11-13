import React, { useState, useMemo } from 'react';
import { useQuery } from 'wasp/client/operations';
import { listLoyaltyPrograms } from 'wasp/client/operations';
import { useSalonContext } from '../../hooks/useSalonContext';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { EmptyState } from '../../../components/ui/empty-state';
import { 
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  DollarSign,
  Calendar,
  Star,
  Award,
  Zap,
  Target,
  AlertCircle,
  Filter,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

type LeaderboardType = 'spending' | 'visits' | 'points' | 'tier';
type TimePeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';
type TopCount = 10 | 25 | 50 | 100;

interface LeaderboardEntry {
  id: string;
  rank: number;
  clientName: string;
  clientAvatar?: string;
  value: number;
  tierName?: string;
  tierColor?: string;
  tierIcon?: string;
  trend?: 'up' | 'down' | 'same';
  previousRank?: number;
  percentile: number;
}

const LEADERBOARD_TYPES = [
  { value: 'spending' as LeaderboardType, label: 'Gastos', icon: DollarSign, color: 'text-green-500' },
  { value: 'visits' as LeaderboardType, label: 'Visitas', icon: Calendar, color: 'text-blue-500' },
  { value: 'points' as LeaderboardType, label: 'Pontos', icon: Zap, color: 'text-yellow-500' },
  { value: 'tier' as LeaderboardType, label: 'Tier', icon: Crown, color: 'text-purple-500' }
];

const TIME_PERIODS = [
  { value: 'week' as TimePeriod, label: 'Esta Semana' },
  { value: 'month' as TimePeriod, label: 'Este Mês' },
  { value: 'quarter' as TimePeriod, label: 'Este Trimestre' },
  { value: 'year' as TimePeriod, label: 'Este Ano' },
  { value: 'all' as TimePeriod, label: 'Todo Período' }
];

const TOP_COUNTS = [10, 25, 50, 100] as TopCount[];

export default function LeaderboardPage() {
  const { activeSalonId } = useSalonContext();
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('spending');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [topCount, setTopCount] = useState<TopCount>(10);

  const { data: programs, isLoading: programsLoading } = useQuery(
    listLoyaltyPrograms,
    { salonId: activeSalonId || '' },
    { enabled: !!activeSalonId }
  );

  // Generate mock leaderboard data (in real app, would query ClientLoyaltyBalance with aggregations)
  const leaderboardData = useMemo((): LeaderboardEntry[] => {
    if (!programs || programs.length === 0) return [];

    const activeProgram = programs.find((p: any) => p.isActive && p.vipTiersEnabled) || programs[0];
    if (!activeProgram) return [];

    const tiers = activeProgram.tiers || [];
    const entries: LeaderboardEntry[] = [];

    // Generate mock data based on topCount
    for (let i = 0; i < topCount; i++) {
      const rank = i + 1;
      const tier = tiers[Math.min(Math.floor(i / (topCount / Math.max(tiers.length, 1))), tiers.length - 1)] || null;
      
      let value = 0;
      let formatValue = '';
      
      switch (leaderboardType) {
        case 'spending':
          value = Math.max(1000, 50000 - (i * 1500) - Math.random() * 500);
          formatValue = `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
          break;
        case 'visits':
          value = Math.max(5, 100 - (i * 3) - Math.floor(Math.random() * 2));
          formatValue = `${value} visitas`;
          break;
        case 'points':
          value = Math.max(500, 25000 - (i * 750) - Math.random() * 250);
          formatValue = `${Math.floor(value)} pts`;
          break;
        case 'tier':
          value = tiers.length > 0 ? (tiers.length - Math.floor(i / (topCount / tiers.length))) : 0;
          formatValue = tier?.name || 'Sem tier';
          break;
      }

      const previousRank = rank + (Math.random() > 0.5 ? Math.floor(Math.random() * 3) : -Math.floor(Math.random() * 3));
      const trend: 'up' | 'down' | 'same' = 
        previousRank > rank ? 'up' : 
        previousRank < rank ? 'down' : 
        'same';

      entries.push({
        id: `entry-${i}`,
        rank,
        clientName: `Cliente ${i + 1}`,
        clientAvatar: ['👤', '👨', '👩', '🧑', '👴', '👵'][i % 6],
        value,
        tierName: tier?.name,
        tierColor: tier?.color,
        tierIcon: tier?.icon,
        trend,
        previousRank,
        percentile: ((topCount - rank) / topCount) * 100
      });
    }

    return entries;
  }, [programs, topCount, leaderboardType]);

  // Calculate leaderboard stats
  const leaderboardStats = useMemo(() => {
    if (leaderboardData.length === 0) {
      return {
        topValue: 0,
        averageValue: 0,
        totalParticipants: 0,
        improvingCount: 0
      };
    }

    const topValue = leaderboardData[0]?.value || 0;
    const totalValue = leaderboardData.reduce((sum, entry) => sum + entry.value, 0);
    const averageValue = totalValue / leaderboardData.length;
    const improvingCount = leaderboardData.filter(e => e.trend === 'up').length;

    return {
      topValue,
      averageValue,
      totalParticipants: leaderboardData.length,
      improvingCount
    };
  }, [leaderboardData]);

  const getValueLabel = (type: LeaderboardType, value: number): string => {
    switch (type) {
      case 'spending':
        return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      case 'visits':
        return `${Math.floor(value)} visitas`;
      case 'points':
        return `${Math.floor(value)} pts`;
      case 'tier':
        return `Nível ${Math.floor(value)}`;
      default:
        return value.toString();
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return { icon: <Medal className="h-6 w-6 text-yellow-500" />, color: 'bg-yellow-100 dark:bg-yellow-950', text: 'text-yellow-700 dark:text-yellow-300' };
    } else if (rank === 2) {
      return { icon: <Medal className="h-6 w-6 text-gray-400" />, color: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300' };
    } else if (rank === 3) {
      return { icon: <Medal className="h-6 w-6 text-orange-600" />, color: 'bg-orange-100 dark:bg-orange-950', text: 'text-orange-700 dark:text-orange-300' };
    }
    return { icon: null, color: 'bg-secondary', text: 'text-muted-foreground' };
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'same', previousRank?: number, currentRank?: number) => {
    if (!trend || !previousRank || !currentRank) return null;
    
    const change = Math.abs(previousRank - currentRank);
    if (change === 0) return <Minus className="h-4 w-4 text-gray-400" />;
    
    return trend === 'up' ? (
      <div className="flex items-center gap-1 text-green-600">
        <ChevronUp className="h-4 w-4" />
        <span className="text-xs">+{change}</span>
      </div>
    ) : (
      <div className="flex items-center gap-1 text-red-600">
        <ChevronDown className="h-4 w-4" />
        <span className="text-xs">-{change}</span>
      </div>
    );
  };

  if (!activeSalonId) {
    return (
      <div className="container mx-auto p-6">
        <EmptyState
          icon={AlertCircle}
          title="Nenhum salão selecionado"
          description="Por favor, selecione um salão para visualizar rankings."
        />
      </div>
    );
  }

  if (programsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Carregando rankings...</div>
        </div>
      </div>
    );
  }

  const hasActiveProgram = programs && programs.some((p: any) => p.isActive);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Rankings & Leaderboards
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualize os clientes mais engajados e suas conquistas
          </p>
        </div>
      </div>

      {!hasActiveProgram ? (
        <EmptyState
          icon={Trophy}
          title="Nenhum programa ativo"
          description="Ative um programa de fidelidade para visualizar rankings de clientes."
        />
      ) : (
        <>
          {/* Filters */}
          <Card>
            <div className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Leaderboard Type */}
                <div className="flex-1">
                  <Label className="text-sm font-medium mb-2 block">Tipo de Ranking</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {LEADERBOARD_TYPES.map(type => {
                      const Icon = type.icon;
                      return (
                        <Button
                          key={type.value}
                          variant={leaderboardType === type.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setLeaderboardType(type.value)}
                          className="justify-start"
                        >
                          <Icon className={`h-4 w-4 mr-2 ${leaderboardType === type.value ? '' : type.color}`} />
                          {type.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Period */}
                <div className="lg:w-48">
                  <Label className="text-sm font-medium mb-2 block">Período</Label>
                  <select
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    {TIME_PERIODS.map(period => (
                      <option key={period.value} value={period.value}>
                        {period.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Top Count */}
                <div className="lg:w-32">
                  <Label className="text-sm font-medium mb-2 block">Top</Label>
                  <select
                    value={topCount}
                    onChange={(e) => setTopCount(parseInt(e.target.value) as TopCount)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    {TOP_COUNTS.map(count => (
                      <option key={count} value={count}>
                        Top {count}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    1º Lugar
                  </div>
                  <Medal className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {getValueLabel(leaderboardType, leaderboardStats.topValue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Maior {LEADERBOARD_TYPES.find(t => t.value === leaderboardType)?.label.toLowerCase()}
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Média
                  </div>
                  <Target className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {getValueLabel(leaderboardType, leaderboardStats.averageValue)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Média do top {topCount}
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Participantes
                  </div>
                  <Users className="h-4 w-4 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {leaderboardStats.totalParticipants}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  No ranking {timePeriod === 'all' ? 'geral' : TIME_PERIODS.find(p => p.value === timePeriod)?.label.toLowerCase()}
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Em Crescimento
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {leaderboardStats.improvingCount}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Subindo no ranking
                </p>
              </div>
            </Card>
          </div>

          {/* Podium (Top 3) */}
          {leaderboardData.length >= 3 && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Award className="h-5 w-5 text-orange-500" />
                  Pódio
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {/* 2nd Place */}
                  {leaderboardData[1] && (
                    <div className="flex flex-col items-center">
                      <div className="w-full h-32 bg-gradient-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-t-lg flex items-end justify-center pb-4">
                        <Medal className="h-12 w-12 text-gray-400" />
                      </div>
                      <div className="w-full p-4 bg-gradient-to-b from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 rounded-b-lg border border-t-0 text-center">
                        <div className="text-4xl mb-2">{leaderboardData[1].clientAvatar}</div>
                        <div className="font-bold">{leaderboardData[1].clientName}</div>
                        <div className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-2">
                          {getValueLabel(leaderboardType, leaderboardData[1].value)}
                        </div>
                        {leaderboardData[1].tierName && (
                          <Badge 
                            variant="outline" 
                            className="mt-2"
                            style={{ borderColor: leaderboardData[1].tierColor, color: leaderboardData[1].tierColor }}
                          >
                            {leaderboardData[1].tierIcon} {leaderboardData[1].tierName}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 1st Place */}
                  {leaderboardData[0] && (
                    <div className="flex flex-col items-center md:-mt-6">
                      <div className="w-full h-40 bg-gradient-to-b from-yellow-300 to-yellow-400 dark:from-yellow-600 dark:to-yellow-700 rounded-t-lg flex items-end justify-center pb-4">
                        <Medal className="h-16 w-16 text-yellow-600 dark:text-yellow-200" />
                      </div>
                      <div className="w-full p-4 bg-gradient-to-b from-yellow-100 to-white dark:from-yellow-900 dark:to-gray-900 rounded-b-lg border border-t-0 text-center">
                        <div className="text-5xl mb-2">{leaderboardData[0].clientAvatar}</div>
                        <div className="font-bold text-lg">{leaderboardData[0].clientName}</div>
                        <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                          {getValueLabel(leaderboardType, leaderboardData[0].value)}
                        </div>
                        {leaderboardData[0].tierName && (
                          <Badge 
                            variant="outline" 
                            className="mt-2"
                            style={{ borderColor: leaderboardData[0].tierColor, color: leaderboardData[0].tierColor }}
                          >
                            {leaderboardData[0].tierIcon} {leaderboardData[0].tierName}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {leaderboardData[2] && (
                    <div className="flex flex-col items-center">
                      <div className="w-full h-24 bg-gradient-to-b from-orange-300 to-orange-400 dark:from-orange-700 dark:to-orange-800 rounded-t-lg flex items-end justify-center pb-4">
                        <Medal className="h-10 w-10 text-orange-700 dark:text-orange-200" />
                      </div>
                      <div className="w-full p-4 bg-gradient-to-b from-orange-100 to-white dark:from-orange-900 dark:to-gray-900 rounded-b-lg border border-t-0 text-center">
                        <div className="text-3xl mb-2">{leaderboardData[2].clientAvatar}</div>
                        <div className="font-bold">{leaderboardData[2].clientName}</div>
                        <div className="text-xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                          {getValueLabel(leaderboardType, leaderboardData[2].value)}
                        </div>
                        {leaderboardData[2].tierName && (
                          <Badge 
                            variant="outline" 
                            className="mt-2"
                            style={{ borderColor: leaderboardData[2].tierColor, color: leaderboardData[2].tierColor }}
                          >
                            {leaderboardData[2].tierIcon} {leaderboardData[2].tierName}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Full Leaderboard */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Ranking Completo
              </h3>

              {leaderboardData.length > 0 ? (
                <div className="space-y-2">
                  {leaderboardData.map((entry, index) => {
                    const rankBadge = getRankBadge(entry.rank);
                    return (
                      <div
                        key={entry.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border transition-colors hover:bg-accent ${
                          index < 3 ? 'bg-gradient-to-r from-accent/50 to-transparent' : ''
                        }`}
                      >
                        {/* Rank */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${rankBadge.color} ${rankBadge.text}`}>
                          {rankBadge.icon || entry.rank}
                        </div>

                        {/* Avatar */}
                        <div className="text-3xl flex-shrink-0">{entry.clientAvatar}</div>

                        {/* Client Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{entry.clientName}</div>
                          {entry.tierName && (
                            <Badge 
                              variant="outline" 
                              className="mt-1 text-xs"
                              style={{ borderColor: entry.tierColor, color: entry.tierColor }}
                            >
                              {entry.tierIcon} {entry.tierName}
                            </Badge>
                          )}
                        </div>

                        {/* Value */}
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-lg">
                            {getValueLabel(leaderboardType, entry.value)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Top {entry.percentile.toFixed(0)}%
                          </div>
                        </div>

                        {/* Trend */}
                        <div className="w-16 flex justify-center flex-shrink-0">
                          {getTrendIcon(entry.trend, entry.previousRank, entry.rank)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  icon={Trophy}
                  title="Nenhum dado de ranking"
                  description="O ranking será exibido quando houver atividade no programa de fidelidade."
                />
              )}
            </div>
          </Card>

          {/* Competition Period Info */}
          <Card>
            <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
              <div className="flex items-start gap-3">
                <Star className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Período de Competição: {TIME_PERIODS.find(p => p.value === timePeriod)?.label}
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Os rankings são atualizados em tempo real com base na atividade dos clientes. 
                    Configure períodos de competição especiais para incentivar o engajamento e premiar os melhores performers.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

// Label component (simplified)
function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`text-sm font-medium ${className || ''}`} {...props}>
      {children}
    </label>
  );
}
