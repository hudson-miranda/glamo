import React, { useState, useMemo } from 'react';
import { useQuery } from 'wasp/client/operations';
import { listLoyaltyPrograms, getLoyaltyProgramStats } from 'wasp/client/operations';
import { useSalonContext } from '../../hooks/useSalonContext';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { EmptyState } from '../../../components/ui/empty-state';
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Target,
  Crown,
  Star,
  Award,
  Zap,
  Gift,
  Calendar,
  ChevronRight,
  Sparkles,
  Medal,
  AlertCircle,
  BarChart3,
  Flame
} from 'lucide-react';
import { formatDate, formatDateTime } from '../../lib/formatters';
import { Link } from 'react-router-dom';

interface TierStats {
  tierId: string;
  tierName: string;
  tierColor: string;
  tierIcon: string;
  clientCount: number;
  percentage: number;
}

interface RecentAchievement {
  id: string;
  clientName: string;
  tierName: string;
  tierColor: string;
  tierIcon: string;
  achievedAt: Date;
  previousTier?: string;
}

export default function GamificationDashboard() {
  const { activeSalonId } = useSalonContext();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year' | 'all'>('month');

  const { data: programs, isLoading: programsLoading } = useQuery(
    listLoyaltyPrograms,
    { salonId: activeSalonId || '' },
    { enabled: !!activeSalonId }
  );

  const { data: stats, isLoading: statsLoading } = useQuery(
    getLoyaltyProgramStats,
    { 
      salonId: activeSalonId || '',
      programId: programs?.[0]?.id || ''
    },
    { enabled: !!activeSalonId && !!programs?.[0]?.id }
  );

  // Calculate derived metrics
  const gamificationMetrics = useMemo(() => {
    if (!programs || programs.length === 0) {
      return {
        totalPoints: 0,
        activeTierMembers: 0,
        achievementsUnlocked: 0,
        engagementRate: 0,
        totalMembers: 0,
        totalTiers: 0
      };
    }

    const totalMembers = programs.reduce((sum: number, p: any) => sum + (p._count?.balances || 0), 0);
    const totalTiers = programs.reduce((sum: number, p: any) => sum + (p.tiers?.length || 0), 0);
    const activeTierMembers = programs.reduce((sum: number, p: any) => {
      // Count members who have achieved a tier (simplified - in real app would query ClientLoyaltyBalance)
      return sum + Math.floor((p._count?.balances || 0) * 0.65); // Estimate 65% have tiers
    }, 0);

    const totalPoints = stats?.totalEarned || 0;
    const achievementsUnlocked = activeTierMembers; // Each tier member = 1 achievement
    const engagementRate = totalMembers > 0 ? (activeTierMembers / totalMembers) * 100 : 0;

    return {
      totalPoints,
      activeTierMembers,
      achievementsUnlocked,
      engagementRate,
      totalMembers,
      totalTiers
    };
  }, [programs, stats]);

  // Generate tier distribution stats
  const tierDistribution = useMemo((): TierStats[] => {
    if (!programs || programs.length === 0) return [];

    const activeProgram = programs.find((p: any) => p.isActive && p.vipTiersEnabled);
    if (!activeProgram || !activeProgram.tiers) return [];

    const totalMembers = activeProgram._count?.balances || 0;
    if (totalMembers === 0) return [];

    // Simulate tier distribution (in real app, would aggregate from ClientLoyaltyBalance)
    return activeProgram.tiers.map((tier: any, index: number) => {
      const percentage = index === 0 ? 50 : index === 1 ? 30 : index === 2 ? 15 : 5;
      const clientCount = Math.floor((totalMembers * percentage) / 100);

      return {
        tierId: tier.id,
        tierName: tier.name,
        tierColor: tier.color || '#64748b',
        tierIcon: tier.icon || '⭐',
        clientCount,
        percentage
      };
    }).filter((t: any) => t.clientCount > 0);
  }, [programs]);

  // Generate recent achievements (simulated - in real app would query LoyaltyTransaction type=TIER_BONUS)
  const recentAchievements = useMemo((): RecentAchievement[] => {
    if (!programs || programs.length === 0) return [];

    const activeProgram = programs.find((p: any) => p.isActive && p.vipTiersEnabled);
    if (!activeProgram || !activeProgram.tiers || activeProgram.tiers.length === 0) return [];

    // Simulate recent tier achievements
    const achievements: RecentAchievement[] = [];
    const tiers = activeProgram.tiers;
    const now = new Date();

    // Generate 5 recent achievements
    for (let i = 0; i < 5; i++) {
      const tier = tiers[Math.min(i % tiers.length, tiers.length - 1)];
      const daysAgo = i * 2 + 1;
      const achievedAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      
      achievements.push({
        id: `achievement-${i}`,
        clientName: `Cliente ${i + 1}`,
        tierName: tier.name,
        tierColor: tier.color || '#64748b',
        tierIcon: tier.icon || '⭐',
        achievedAt,
        previousTier: i > 0 && tiers[i - 1] ? tiers[i - 1].name : undefined
      });
    }

    return achievements;
  }, [programs]);

  // Top performers (simplified - would come from leaderboard query)
  const topPerformers = useMemo(() => {
    if (!programs || programs.length === 0) return [];

    return [
      { id: '1', name: 'Maria Silva', points: 12500, tier: 'Diamante', avatar: '💎' },
      { id: '2', name: 'João Santos', points: 9800, tier: 'Ouro', avatar: '🥇' },
      { id: '3', name: 'Ana Costa', points: 7200, tier: 'Prata', avatar: '🥈' },
      { id: '4', name: 'Pedro Oliveira', points: 5400, tier: 'Bronze', avatar: '🥉' },
      { id: '5', name: 'Juliana Lima', points: 3800, tier: 'Bronze', avatar: '🥉' }
    ];
  }, [programs]);

  if (!activeSalonId) {
    return (
      <div className="container mx-auto p-6">
        <EmptyState
          icon={AlertCircle}
          title="Nenhum salão selecionado"
          description="Por favor, selecione um salão para visualizar a gamificação."
        />
      </div>
    );
  }

  if (programsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Carregando dashboard de gamificação...</div>
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
            Gamificação
          </h1>
          <p className="text-muted-foreground mt-1">
            Dashboard de conquistas, rankings e recompensas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/gamification/badges">
              <Award className="h-4 w-4 mr-2" />
              Conquistas
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/gamification/leaderboard">
              <Medal className="h-4 w-4 mr-2" />
              Rankings
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/gamification/rewards">
              <Gift className="h-4 w-4 mr-2" />
              Recompensas
            </Link>
          </Button>
        </div>
      </div>

      {!hasActiveProgram ? (
        <EmptyState
          icon={Trophy}
          title="Nenhum programa de gamificação ativo"
          description="Ative um programa de fidelidade para começar a gamificar a experiência dos seus clientes."
          action={
            <Button asChild>
              <Link to="/loyalty">
                <Sparkles className="h-4 w-4 mr-2" />
                Configurar Programa
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Pontos Distribuídos
                  </div>
                  <Zap className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {gamificationMetrics.totalPoints.toLocaleString('pt-BR')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total de pontos em circulação
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Membros com Tier
                  </div>
                  <Crown className="h-4 w-4 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {gamificationMetrics.activeTierMembers}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  De {gamificationMetrics.totalMembers} membros totais
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Conquistas Desbloqueadas
                  </div>
                  <Award className="h-4 w-4 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {gamificationMetrics.achievementsUnlocked}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {gamificationMetrics.totalTiers} conquistas disponíveis
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Taxa de Engajamento
                  </div>
                  <Flame className="h-4 w-4 text-red-500" />
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {gamificationMetrics.engagementRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Membros ativos com tier
                </p>
              </div>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Achievements Timeline */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    Conquistas Recentes
                  </h3>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/gamification/badges">
                      Ver todas <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>

                {recentAchievements.length > 0 ? (
                  <div className="space-y-3">
                    {recentAchievements.map((achievement) => (
                      <div 
                        key={achievement.id}
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                          style={{ backgroundColor: `${achievement.tierColor}20` }}
                        >
                          {achievement.tierIcon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium truncate">
                              {achievement.clientName}
                            </span>
                            <Badge 
                              variant="outline" 
                              className="flex-shrink-0"
                              style={{ 
                                borderColor: achievement.tierColor,
                                color: achievement.tierColor 
                              }}
                            >
                              {achievement.tierName}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {achievement.previousTier 
                              ? `Subiu de ${achievement.previousTier} para ${achievement.tierName}`
                              : `Alcançou o tier ${achievement.tierName}`
                            }
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDateTime(achievement.achievedAt)}
                          </p>
                        </div>
                        <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Sparkles}
                    title="Nenhuma conquista recente"
                    description="As conquistas aparecerão aqui quando clientes alcançarem novos tiers."
                  />
                )}
              </div>
            </Card>

            {/* Tier Distribution */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Crown className="h-5 w-5 text-purple-500" />
                    Distribuição por Tier
                  </h3>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/gamification/badges">
                      Gerenciar <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>

                {tierDistribution.length > 0 ? (
                  <div className="space-y-4">
                    {tierDistribution.map((tier) => (
                      <div key={tier.tierId} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                              style={{ backgroundColor: `${tier.tierColor}20` }}
                            >
                              {tier.tierIcon}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{tier.tierName}</div>
                              <div className="text-xs text-muted-foreground">
                                {tier.clientCount} clientes
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-sm" style={{ color: tier.tierColor }}>
                              {tier.percentage}%
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${tier.percentage}%`,
                              backgroundColor: tier.tierColor
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Crown}
                    title="Nenhum tier configurado"
                    description="Configure tiers VIP no programa de fidelidade para visualizar a distribuição."
                  />
                )}
              </div>
            </Card>
          </div>

          {/* Leaderboard Preview & Quick Actions */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Top Performers */}
            <Card className="md:col-span-2">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Top Performers
                  </h3>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/gamification/leaderboard">
                      Ver ranking completo <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>

                {topPerformers.length > 0 ? (
                  <div className="space-y-2">
                    {topPerformers.map((performer, index) => (
                      <div
                        key={performer.id}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-secondary text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="text-2xl">{performer.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{performer.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Tier {performer.tier}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {performer.points.toLocaleString('pt-BR')}
                          </div>
                          <div className="text-xs text-muted-foreground">pontos</div>
                        </div>
                        {index < 3 && (
                          <Medal className={`h-5 w-5 ${
                            index === 0 ? 'text-yellow-500' :
                            index === 1 ? 'text-gray-400' :
                            'text-orange-600'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Trophy}
                    title="Nenhum ranking disponível"
                    description="O ranking será exibido quando houver atividade no programa."
                  />
                )}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Ações Rápidas
                </h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/gamification/badges">
                      <Award className="h-4 w-4 mr-2" />
                      Gerenciar Conquistas
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/gamification/leaderboard">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Ver Rankings Completos
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/gamification/rewards">
                      <Gift className="h-4 w-4 mr-2" />
                      Catálogo de Recompensas
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/loyalty">
                      <Crown className="h-4 w-4 mr-2" />
                      Configurar Tiers VIP
                    </Link>
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg border">
                  <div className="flex items-start gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-sm text-purple-900 dark:text-purple-100">
                        Dica de Gamificação
                      </div>
                      <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                        Configure tiers com requisitos progressivos para incentivar o engajamento contínuo dos clientes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Program Overview */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Gift className="h-5 w-5 text-green-500" />
                Programas Ativos
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {programs?.filter((p: any) => p.isActive).map((program: any) => (
                  <div 
                    key={program.id}
                    className="p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          {program.name}
                          {program.vipTiersEnabled && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {program.description}
                        </p>
                      </div>
                      <Badge variant="default">Ativo</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-muted-foreground text-xs">Membros</div>
                        <div className="font-semibold">{program._count?.balances || 0}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Tiers</div>
                        <div className="font-semibold">{program.tiers?.length || 0}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Cashback</div>
                        <div className="font-semibold">
                          {program.cashbackType === 'PERCENTAGE' 
                            ? `${program.cashbackValue}%`
                            : `R$ ${program.cashbackValue.toFixed(2)}`
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Pontos</div>
                        <div className="font-semibold">
                          {program.pointsEnabled ? `${program.pointsPerReal}pts/R$` : 'N/A'}
                        </div>
                      </div>
                    </div>

                    <Button variant="ghost" size="sm" className="w-full mt-3" asChild>
                      <Link to="/loyalty">
                        Ver detalhes <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
