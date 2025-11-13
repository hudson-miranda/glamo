import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from 'wasp/client/operations';
import { 
  listLoyaltyPrograms,
  getClientLoyaltyBalance,
  redeemLoyalty
} from 'wasp/client/operations';
import { useSalonContext } from '../../hooks/useSalonContext';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { EmptyState } from '../../../components/ui/empty-state';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import { 
  Gift,
  Zap,
  DollarSign,
  ShoppingBag,
  Sparkles,
  Crown,
  Star,
  Tag,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
  AlertCircle,
  Info,
  Award,
  Percent,
  Package
} from 'lucide-react';
import { formatDate, formatDateTime } from '../../lib/formatters';

type RewardCategory = 'all' | 'discounts' | 'services' | 'products' | 'cashback';

interface Reward {
  id: string;
  title: string;
  description: string;
  category: RewardCategory;
  pointsCost: number;
  cashValue?: number;
  availability: number;
  terms?: string;
  icon: React.ReactNode;
  gradient: string;
  available: boolean;
}

interface RedemptionHistory {
  id: string;
  rewardTitle: string;
  pointsSpent: number;
  redeemedAt: Date;
  status: 'completed' | 'pending' | 'expired';
}

const REWARD_CATEGORIES = [
  { value: 'all' as RewardCategory, label: 'Todas', icon: Gift },
  { value: 'discounts' as RewardCategory, label: 'Descontos', icon: Percent },
  { value: 'services' as RewardCategory, label: 'Serviços', icon: Sparkles },
  { value: 'products' as RewardCategory, label: 'Produtos', icon: Package },
  { value: 'cashback' as RewardCategory, label: 'Cashback', icon: DollarSign }
];

// Mock rewards catalog (in real app, would come from database or service catalog)
const MOCK_REWARDS: Reward[] = [
  {
    id: 'r1',
    title: '10% de Desconto',
    description: 'Ganhe 10% de desconto em qualquer serviço',
    category: 'discounts',
    pointsCost: 500,
    cashValue: 50,
    availability: 50,
    terms: 'Válido por 30 dias. Não cumulativo com outras promoções.',
    icon: <Percent className="h-6 w-6" />,
    gradient: 'from-blue-500 to-cyan-500',
    available: true
  },
  {
    id: 'r2',
    title: '20% de Desconto',
    description: 'Desconto especial de 20% para clientes VIP',
    category: 'discounts',
    pointsCost: 1000,
    cashValue: 100,
    availability: 25,
    terms: 'Válido por 60 dias. Exclusivo para serviços premium.',
    icon: <Crown className="h-6 w-6" />,
    gradient: 'from-purple-500 to-pink-500',
    available: true
  },
  {
    id: 'r3',
    title: 'Hidratação Capilar Grátis',
    description: 'Sessão completa de hidratação capilar por conta da casa',
    category: 'services',
    pointsCost: 2000,
    cashValue: 120,
    availability: 10,
    terms: 'Agendar com 7 dias de antecedência. Sujeito à disponibilidade.',
    icon: <Sparkles className="h-6 w-6" />,
    gradient: 'from-green-500 to-emerald-500',
    available: true
  },
  {
    id: 'r4',
    title: 'Corte + Coloração',
    description: 'Combo especial: corte de cabelo + coloração completa',
    category: 'services',
    pointsCost: 3500,
    cashValue: 250,
    availability: 5,
    terms: 'Inclui consulta de colorimetria. Produtos premium.',
    icon: <Award className="h-6 w-6" />,
    gradient: 'from-orange-500 to-red-500',
    available: true
  },
  {
    id: 'r5',
    title: 'Kit de Produtos Premium',
    description: 'Kit completo de cuidados capilares profissionais',
    category: 'products',
    pointsCost: 1500,
    cashValue: 180,
    availability: 15,
    terms: 'Shampoo, condicionador e máscara de tratamento.',
    icon: <Package className="h-6 w-6" />,
    gradient: 'from-pink-500 to-rose-500',
    available: true
  },
  {
    id: 'r6',
    title: 'R$ 50 em Cashback',
    description: 'Resgate R$ 50 em créditos para usar em qualquer serviço',
    category: 'cashback',
    pointsCost: 500,
    cashValue: 50,
    availability: 100,
    terms: 'Crédito válido por 90 dias. Pode ser usado parcialmente.',
    icon: <DollarSign className="h-6 w-6" />,
    gradient: 'from-yellow-500 to-amber-500',
    available: true
  },
  {
    id: 'r7',
    title: 'R$ 100 em Cashback',
    description: 'Resgate R$ 100 em créditos premium',
    category: 'cashback',
    pointsCost: 1000,
    cashValue: 100,
    availability: 50,
    terms: 'Crédito válido por 90 dias. Pode ser usado parcialmente.',
    icon: <DollarSign className="h-6 w-6" />,
    gradient: 'from-green-600 to-teal-600',
    available: true
  },
  {
    id: 'r8',
    title: 'R$ 200 em Cashback',
    description: 'Máximo resgate em créditos VIP',
    category: 'cashback',
    pointsCost: 2000,
    cashValue: 200,
    availability: 20,
    terms: 'Crédito válido por 120 dias. Exclusivo clientes VIP.',
    icon: <Star className="h-6 w-6" />,
    gradient: 'from-purple-600 to-indigo-600',
    available: true
  }
];

// Mock redemption history
const MOCK_HISTORY: RedemptionHistory[] = [
  { id: 'h1', rewardTitle: '10% de Desconto', pointsSpent: 500, redeemedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), status: 'completed' },
  { id: 'h2', rewardTitle: 'R$ 50 em Cashback', pointsSpent: 500, redeemedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), status: 'completed' },
  { id: 'h3', rewardTitle: 'Kit de Produtos Premium', pointsSpent: 1500, redeemedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), status: 'completed' }
];

export default function PointsRewardsPage() {
  const { activeSalonId } = useSalonContext();
  const [selectedCategory, setSelectedCategory] = useState<RewardCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);

  const { data: programs, isLoading: programsLoading } = useQuery(
    listLoyaltyPrograms,
    { salonId: activeSalonId || '' },
    { enabled: !!activeSalonId }
  );

  const redeemMutation = useMutation(redeemLoyalty);

  // Mock client balance (in real app, would use getClientLoyaltyBalance with clientId)
  const mockBalance = {
    availableBalance: 3500,
    pendingBalance: 500,
    lifetimeEarned: 8200,
    lifetimeRedeemed: 4700,
    expiringPoints: 200,
    expiringDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
  };

  // Get active program
  const activeProgram = useMemo(() => {
    if (!programs || programs.length === 0) return null;
    return programs.find((p: any) => p.isActive) || programs[0];
  }, [programs]);

  // Filter rewards
  const filteredRewards = useMemo(() => {
    let rewards = [...MOCK_REWARDS];

    // Category filter
    if (selectedCategory !== 'all') {
      rewards = rewards.filter(r => r.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      rewards = rewards.filter(r => 
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query)
      );
    }

    // Sort by points cost
    rewards.sort((a, b) => a.pointsCost - b.pointsCost);

    return rewards;
  }, [selectedCategory, searchQuery]);

  const handleRedeem = async () => {
    if (!selectedReward || !activeSalonId) return;

    // Check if user has enough points
    if (mockBalance.availableBalance < selectedReward.pointsCost) {
      alert('Pontos insuficientes para este resgate');
      return;
    }

    try {
      // In real app, would call redeemLoyalty with proper clientId
      // await redeemMutation.mutate({
      //   clientId: 'current-client-id',
      //   salonId: activeSalonId,
      //   amount: selectedReward.pointsCost,
      //   saleId: undefined
      // });

      alert(`Recompensa "${selectedReward.title}" resgatada com sucesso! ${selectedReward.pointsCost} pontos debitados.`);
      setShowRedeemDialog(false);
      setSelectedReward(null);
    } catch (error) {
      console.error('Error redeeming reward:', error);
      alert('Erro ao resgatar recompensa. Tente novamente.');
    }
  };

  if (!activeSalonId) {
    return (
      <div className="container mx-auto p-6">
        <EmptyState
          icon={AlertCircle}
          title="Nenhum salão selecionado"
          description="Por favor, selecione um salão para visualizar recompensas."
        />
      </div>
    );
  }

  if (programsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Carregando catálogo de recompensas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Gift className="h-8 w-8 text-pink-500" />
            Pontos & Recompensas
          </h1>
          <p className="text-muted-foreground mt-1">
            Resgate pontos por descontos, serviços e produtos exclusivos
          </p>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground">
                Saldo Disponível
              </div>
              <Zap className="h-4 w-4 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-yellow-600">
              {mockBalance.availableBalance.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              pontos para resgatar
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground">
                Saldo Pendente
              </div>
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {mockBalance.pendingBalance.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              processando
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground">
                Total Ganho
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {mockBalance.lifetimeEarned.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ao longo do tempo
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground">
                Total Resgatado
              </div>
              <ShoppingBag className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {mockBalance.lifetimeRedeemed.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              em recompensas
            </p>
          </div>
        </Card>
      </div>

      {/* Expiring Points Warning */}
      {mockBalance.expiringPoints > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-orange-900 dark:text-orange-100">
                  Pontos expirando em breve
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  Você tem <strong>{mockBalance.expiringPoints} pontos</strong> que expiram em{' '}
                  <strong>{formatDate(mockBalance.expiringDate)}</strong>. 
                  Resgate agora para não perder!
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* How to Earn Points */}
      {activeProgram && (
        <Card>
          <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <div className="flex items-start gap-3">
              <Info className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Como Ganhar Pontos
                </h4>
                <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                  {activeProgram.pointsEnabled && activeProgram.pointsPerReal && (
                    <p>• Ganhe <strong>{activeProgram.pointsPerReal} pontos</strong> a cada R$ 1,00 gasto</p>
                  )}
                  {activeProgram.cashbackEnabled && (
                    <p>
                      • Cashback de <strong>
                        {activeProgram.cashbackType === 'PERCENTAGE' 
                          ? `${activeProgram.cashbackValue}%` 
                          : `R$ ${activeProgram.cashbackValue}`}
                      </strong> em compras
                    </p>
                  )}
                  <p>• Ganhe pontos bônus ao alcançar novos tiers VIP</p>
                  <p>• Participe de campanhas especiais para multiplicar seus pontos</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar recompensas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {REWARD_CATEGORIES.map(category => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.value)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {category.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Rewards Catalog */}
      {filteredRewards.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRewards.map((reward) => {
            const canAfford = mockBalance.availableBalance >= reward.pointsCost;
            return (
              <Card 
                key={reward.id}
                className={`overflow-hidden transition-all hover:shadow-lg ${
                  !canAfford ? 'opacity-60' : ''
                }`}
              >
                {/* Header with gradient */}
                <div className={`p-4 bg-gradient-to-r ${reward.gradient} text-white`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        {reward.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{reward.title}</h3>
                        {reward.cashValue && (
                          <p className="text-sm opacity-90">
                            Valor: R$ {reward.cashValue.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    {reward.description}
                  </p>

                  {reward.terms && (
                    <div className="mb-4 p-3 bg-secondary rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <strong>Condições:</strong> {reward.terms}
                      </p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-2 bg-secondary rounded-lg">
                      <div className="text-xs text-muted-foreground">Custo</div>
                      <div className="font-bold flex items-center justify-center gap-1">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        {reward.pointsCost}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-secondary rounded-lg">
                      <div className="text-xs text-muted-foreground">Disponível</div>
                      <div className="font-bold">{reward.availability}</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    className="w-full"
                    disabled={!canAfford || !reward.available}
                    onClick={() => {
                      setSelectedReward(reward);
                      setShowRedeemDialog(true);
                    }}
                  >
                    {!canAfford ? (
                      <>Pontos insuficientes</>
                    ) : !reward.available ? (
                      <>Indisponível</>
                    ) : (
                      <>
                        <Gift className="h-4 w-4 mr-2" />
                        Resgatar
                      </>
                    )}
                  </Button>

                  {!canAfford && (
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Faltam {(reward.pointsCost - mockBalance.availableBalance).toLocaleString('pt-BR')} pontos
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Gift}
          title="Nenhuma recompensa encontrada"
          description={searchQuery ? "Tente ajustar os filtros de busca." : "Não há recompensas disponíveis no momento."}
        />
      )}

      {/* Redemption History */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            Histórico de Resgates
          </h3>

          {MOCK_HISTORY.length > 0 ? (
            <div className="space-y-3">
              {MOCK_HISTORY.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.status === 'completed' ? 'bg-green-100 dark:bg-green-950' :
                      item.status === 'pending' ? 'bg-blue-100 dark:bg-blue-950' :
                      'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {item.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : item.status === 'pending' ? (
                        <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{item.rewardTitle}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDateTime(item.redeemedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold flex items-center gap-1">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      {item.pointsSpent}
                    </div>
                    <Badge 
                      variant={item.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {item.status === 'completed' ? 'Concluído' :
                       item.status === 'pending' ? 'Pendente' :
                       'Expirado'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="Nenhum resgate ainda"
              description="Seu histórico de resgates aparecerá aqui."
            />
          )}
        </div>
      </Card>

      {/* Redeem Confirmation Dialog */}
      <Dialog open={showRedeemDialog} onOpenChange={setShowRedeemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Resgate</DialogTitle>
            <DialogDescription>
              Você está prestes a resgatar esta recompensa
            </DialogDescription>
          </DialogHeader>

          {selectedReward && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg bg-gradient-to-r ${selectedReward.gradient} text-white`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    {selectedReward.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{selectedReward.title}</h4>
                    <p className="text-sm opacity-90">{selectedReward.description}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 p-4 bg-secondary rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Custo:</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    {selectedReward.pointsCost} pontos
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Saldo atual:</span>
                  <span className="font-semibold">{mockBalance.availableBalance} pontos</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Saldo após resgate:</span>
                  <span className="font-bold text-green-600">
                    {(mockBalance.availableBalance - selectedReward.pointsCost).toLocaleString('pt-BR')} pontos
                  </span>
                </div>
              </div>

              {selectedReward.terms && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-900 dark:text-blue-100">
                    <strong>Termos e condições:</strong> {selectedReward.terms}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowRedeemDialog(false);
                    setSelectedReward(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleRedeem}
                  disabled={redeemMutation.isLoading}
                >
                  {redeemMutation.isLoading ? 'Resgatando...' : 'Confirmar Resgate'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
