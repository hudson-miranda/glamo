import React, { useState, useMemo } from 'react';
import { useQuery } from 'wasp/client/operations';
import { 
  listLoyaltyPrograms, 
  getClientLoyaltyBalance,
  createLoyaltyTier,
  updateLoyaltyTier,
  deleteLoyaltyTier
} from 'wasp/client/operations';
import { useSalonContext } from '../../hooks/useSalonContext';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { EmptyState } from '../../../components/ui/empty-state';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import { 
  Award,
  Crown,
  Star,
  Lock,
  Unlock,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  CheckCircle,
  Circle,
  AlertCircle,
  Sparkles,
  Target,
  Zap,
  Gift,
  Settings
} from 'lucide-react';
import { formatDate } from '../../lib/formatters';

interface TierFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
  minTotalSpent: number;
  minVisits: number;
  minMonthlySpent: number;
  cashbackMultiplier: number;
  discountPercentage: number;
  priorityBooking: boolean;
  exclusiveServices: boolean;
  order: number;
}

const DEFAULT_TIER: TierFormData = {
  name: '',
  description: '',
  color: '#64748b',
  icon: '⭐',
  minTotalSpent: 0,
  minVisits: 0,
  minMonthlySpent: 0,
  cashbackMultiplier: 1.0,
  discountPercentage: 0,
  priorityBooking: false,
  exclusiveServices: false,
  order: 0
};

const PRESET_COLORS = [
  { name: 'Bronze', color: '#cd7f32', icon: '🥉' },
  { name: 'Prata', color: '#c0c0c0', icon: '🥈' },
  { name: 'Ouro', color: '#ffd700', icon: '🥇' },
  { name: 'Diamante', color: '#b9f2ff', icon: '💎' },
  { name: 'Platina', color: '#e5e4e2', icon: '⭐' },
  { name: 'Esmeralda', color: '#50c878', icon: '💚' },
  { name: 'Rubi', color: '#e0115f', icon: '❤️' },
  { name: 'Safira', color: '#0f52ba', icon: '💙' }
];

const CATEGORY_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'unlocked', label: 'Desbloqueadas' },
  { value: 'locked', label: 'Bloqueadas' },
  { value: 'vip', label: 'VIP' }
];

export default function BadgesAchievementsPage() {
  const { activeSalonId } = useSalonContext();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTier, setEditingTier] = useState<any | null>(null);
  const [tierFormData, setTierFormData] = useState<TierFormData>(DEFAULT_TIER);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');

  const { data: programs, isLoading: programsLoading, refetch: refetchPrograms } = useQuery(
    listLoyaltyPrograms,
    { salonId: activeSalonId || '' },
    { enabled: !!activeSalonId }
  );

  const createTierFn = createLoyaltyTier;
  const updateTierFn = updateLoyaltyTier;
  const deleteTierFn = deleteLoyaltyTier;
  const [creatingTier, setCreatingTier] = useState(false);
  const [updatingTier, setUpdatingTier] = useState(false);

  // Get active program with tiers
  const activeProgram = useMemo(() => {
    if (!programs || programs.length === 0) return null;
    return selectedProgramId 
      ? programs.find((p: any) => p.id === selectedProgramId)
      : programs.find((p: any) => p.isActive && p.vipTiersEnabled) || programs[0];
  }, [programs, selectedProgramId]);

  // Calculate achievement stats
  const achievementStats = useMemo(() => {
    if (!activeProgram || !activeProgram.tiers) {
      return {
        totalAchievements: 0,
        unlockedCount: 0,
        lockedCount: 0,
        completionRate: 0
      };
    }

    const totalAchievements = activeProgram.tiers.length;
    const totalMembers = activeProgram._count?.balances || 0;
    // Simulate unlocked count (in real app would aggregate ClientLoyaltyBalance with currentTierId)
    const unlockedCount = Math.floor(totalMembers * 0.65);
    const lockedCount = totalAchievements - unlockedCount;
    const completionRate = totalAchievements > 0 ? (unlockedCount / totalAchievements) * 100 : 0;

    return {
      totalAchievements,
      unlockedCount,
      lockedCount,
      completionRate
    };
  }, [activeProgram]);

  // Filter tiers
  const filteredTiers = useMemo(() => {
    if (!activeProgram || !activeProgram.tiers) return [];

    let tiers = [...activeProgram.tiers].sort((a, b) => a.order - b.order);

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      tiers = tiers.filter(tier => 
        tier.name.toLowerCase().includes(query) ||
        tier.description?.toLowerCase().includes(query)
      );
    }

    // Apply category filter (simplified - in real app would check ClientLoyaltyBalance)
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'vip') {
        tiers = tiers.filter(tier => tier.cashbackMultiplier > 1.0 || tier.discountPercentage > 0);
      }
      // 'unlocked' and 'locked' would require client context
    }

    return tiers;
  }, [activeProgram, searchQuery, selectedCategory]);

  const handleCreateTier = async () => {
    if (!activeProgram || !activeSalonId) return;

    try {
      setCreatingTier(true);
      await createTierFn({
        programId: activeProgram.id,
        salonId: activeSalonId,
        name: tierFormData.name,
        description: tierFormData.description,
        color: tierFormData.color,
        icon: tierFormData.icon,
        minTotalSpent: tierFormData.minTotalSpent,
        minVisits: tierFormData.minVisits,
        minMonthlySpent: tierFormData.minMonthlySpent,
        cashbackMultiplier: tierFormData.cashbackMultiplier,
        discountPercentage: tierFormData.discountPercentage,
        priorityBooking: tierFormData.priorityBooking,
        exclusiveServices: tierFormData.exclusiveServices,
        order: tierFormData.order
      });
      
      setShowCreateDialog(false);
      setTierFormData(DEFAULT_TIER);
      refetchPrograms();
    } catch (error) {
      console.error('Error creating tier:', error);
    } finally {
      setCreatingTier(false);
    }
  };

  const handleUpdateTier = async () => {
    if (!editingTier || !activeSalonId) return;

    try {
      setUpdatingTier(true);
      await updateTierFn({
        tierId: editingTier.id,
        salonId: activeSalonId,
        programId: activeProgram?.id || '',
        name: tierFormData.name,
        description: tierFormData.description,
        color: tierFormData.color,
        icon: tierFormData.icon,
        minTotalSpent: tierFormData.minTotalSpent,
        minVisits: tierFormData.minVisits,
        minMonthlySpent: tierFormData.minMonthlySpent,
        cashbackMultiplier: tierFormData.cashbackMultiplier,
        discountPercentage: tierFormData.discountPercentage,
        priorityBooking: tierFormData.priorityBooking,
        exclusiveServices: tierFormData.exclusiveServices,
        order: tierFormData.order
      });
      
      setEditingTier(null);
      setTierFormData(DEFAULT_TIER);
      refetchPrograms();
    } catch (error) {
      console.error('Error updating tier:', error);
    } finally {
      setUpdatingTier(false);
    }
  };

  const handleDeleteTier = async (tierId: string) => {
    if (!activeSalonId || !confirm('Tem certeza que deseja excluir esta conquista?')) return;

    try {
      await deleteTierFn({
        tierId,
        salonId: activeSalonId
      });
      refetchPrograms();
    } catch (error) {
      console.error('Error deleting tier:', error);
    }
  };

  const openEditDialog = (tier: any) => {
    setEditingTier(tier);
    setTierFormData({
      name: tier.name,
      description: tier.description || '',
      color: tier.color || '#64748b',
      icon: tier.icon || '⭐',
      minTotalSpent: tier.minTotalSpent || 0,
      minVisits: tier.minVisits || 0,
      minMonthlySpent: tier.minMonthlySpent || 0,
      cashbackMultiplier: tier.cashbackMultiplier || 1.0,
      discountPercentage: tier.discountPercentage || 0,
      priorityBooking: tier.priorityBooking || false,
      exclusiveServices: tier.exclusiveServices || false,
      order: tier.order || 0
    });
  };

  const applyPreset = (preset: typeof PRESET_COLORS[0]) => {
    setTierFormData(prev => ({
      ...prev,
      name: preset.name,
      color: preset.color,
      icon: preset.icon
    }));
  };

  if (!activeSalonId) {
    return (
      <div className="container mx-auto p-6">
        <EmptyState
          icon={AlertCircle}
          title="Nenhum salão selecionado"
          description="Por favor, selecione um salão para gerenciar conquistas."
        />
      </div>
    );
  }

  if (programsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Carregando conquistas...</div>
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
            <Award className="h-8 w-8 text-orange-500" />
            Conquistas & Badges
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie tiers VIP, requisitos e benefícios exclusivos
          </p>
        </div>
        <div className="flex gap-2">
          {programs && programs.length > 1 && (
            <select
              value={selectedProgramId || activeProgram?.id || ''}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              {programs.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Conquista
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Nova Conquista</DialogTitle>
                <DialogDescription>
                  Configure uma nova conquista/tier VIP para seus clientes
                </DialogDescription>
              </DialogHeader>
              <TierForm 
                data={tierFormData}
                onChange={setTierFormData}
                onApplyPreset={applyPreset}
                onSubmit={handleCreateTier}
                onCancel={() => {
                  setShowCreateDialog(false);
                  setTierFormData(DEFAULT_TIER);
                }}
                isLoading={creatingTier}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!activeProgram ? (
        <EmptyState
          icon={Award}
          title="Nenhum programa de fidelidade encontrado"
          description="Crie um programa de fidelidade para configurar conquistas e tiers VIP."
        />
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Total de Conquistas
                  </div>
                  <Award className="h-4 w-4 text-orange-500" />
                </div>
                <div className="text-2xl font-bold">
                  {achievementStats.totalAchievements}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tiers disponíveis
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Desbloqueadas
                  </div>
                  <Unlock className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {achievementStats.unlockedCount}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Por clientes
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Bloqueadas
                  </div>
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-gray-600">
                  {achievementStats.lockedCount}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  A conquistar
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Taxa de Conclusão
                  </div>
                  <Target className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {achievementStats.completionRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Média de progresso
                </p>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <div className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar conquistas por nome ou descrição..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  {CATEGORY_FILTERS.map(category => (
                    <Button
                      key={category.value}
                      variant={selectedCategory === category.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.value)}
                    >
                      {category.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Achievements Grid */}
          {filteredTiers.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTiers.map((tier) => (
                <Card key={tier.id} className="relative overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 w-1 h-full"
                    style={{ backgroundColor: tier.color }}
                  />
                  <div className="p-6 pl-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                          style={{ backgroundColor: `${tier.color}20` }}
                        >
                          {tier.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{tier.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            Nível {tier.order + 1}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(tier)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTier(tier.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {tier.description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {tier.description}
                      </p>
                    )}

                    {/* Requirements */}
                    <div className="space-y-2 mb-4">
                      <div className="text-xs font-semibold text-muted-foreground uppercase">
                        Requisitos
                      </div>
                      {tier.minTotalSpent > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span>Gastar R$ {tier.minTotalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      {tier.minVisits > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span>{tier.minVisits} visitas</span>
                        </div>
                      )}
                      {tier.minMonthlySpent > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-purple-500" />
                          <span>R$ {tier.minMonthlySpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês</span>
                        </div>
                      )}
                      {tier.minTotalSpent === 0 && tier.minVisits === 0 && tier.minMonthlySpent === 0 && (
                        <div className="text-sm text-muted-foreground">
                          Sem requisitos específicos
                        </div>
                      )}
                    </div>

                    {/* Benefits */}
                    <div className="space-y-2 pt-4 border-t">
                      <div className="text-xs font-semibold text-muted-foreground uppercase">
                        Benefícios
                      </div>
                      <div className="space-y-1">
                        {tier.cashbackMultiplier > 1.0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span>{((tier.cashbackMultiplier - 1) * 100).toFixed(0)}% bônus em cashback</span>
                          </div>
                        )}
                        {tier.discountPercentage > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <Gift className="h-4 w-4 text-red-500" />
                            <span>{tier.discountPercentage}% de desconto</span>
                          </div>
                        )}
                        {tier.priorityBooking && (
                          <div className="flex items-center gap-2 text-sm">
                            <Star className="h-4 w-4 text-orange-500" />
                            <span>Agendamento prioritário</span>
                          </div>
                        )}
                        {tier.exclusiveServices && (
                          <div className="flex items-center gap-2 text-sm">
                            <Crown className="h-4 w-4 text-purple-500" />
                            <span>Serviços exclusivos</span>
                          </div>
                        )}
                        {tier.cashbackMultiplier <= 1.0 && 
                         tier.discountPercentage === 0 && 
                         !tier.priorityBooking && 
                         !tier.exclusiveServices && (
                          <div className="text-sm text-muted-foreground">
                            Acesso ao programa
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Award}
              title="Nenhuma conquista encontrada"
              description={searchQuery ? "Tente ajustar os filtros de busca." : "Crie conquistas para recompensar seus clientes mais fiéis."}
              action={
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Conquista
                </Button>
              }
            />
          )}

          {/* Edit Dialog */}
          <Dialog open={!!editingTier} onOpenChange={(open) => !open && setEditingTier(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Conquista</DialogTitle>
                <DialogDescription>
                  Modifique os requisitos e benefícios desta conquista
                </DialogDescription>
              </DialogHeader>
              <TierForm 
                data={tierFormData}
                onChange={setTierFormData}
                onApplyPreset={applyPreset}
                onSubmit={handleUpdateTier}
                onCancel={() => {
                  setEditingTier(null);
                  setTierFormData(DEFAULT_TIER);
                }}
                isLoading={updatingTier}
                submitLabel="Salvar Alterações"
              />
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

// Tier Form Component
function TierForm({ 
  data, 
  onChange, 
  onApplyPreset,
  onSubmit, 
  onCancel, 
  isLoading,
  submitLabel = "Criar Conquista"
}: {
  data: TierFormData;
  onChange: (data: TierFormData) => void;
  onApplyPreset: (preset: typeof PRESET_COLORS[0]) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}) {
  return (
    <div className="space-y-6">
      {/* Presets */}
      <div>
        <Label className="text-sm font-semibold mb-2 block">Modelos Rápidos</Label>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_COLORS.map(preset => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
              onClick={() => onApplyPreset(preset)}
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              <span className="text-xl">{preset.icon}</span>
              <span className="text-xs">{preset.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Conquista *</Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder="Ex: Bronze, Prata, Ouro..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="order">Ordem/Nível</Label>
          <Input
            id="order"
            type="number"
            value={data.order}
            onChange={(e) => onChange({ ...data, order: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="Descreva esta conquista..."
          rows={2}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="color">Cor</Label>
          <div className="flex gap-2">
            <Input
              id="color"
              type="color"
              value={data.color}
              onChange={(e) => onChange({ ...data, color: e.target.value })}
              className="w-20"
            />
            <Input
              value={data.color}
              onChange={(e) => onChange({ ...data, color: e.target.value })}
              placeholder="#000000"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="icon">Ícone (Emoji)</Label>
          <Input
            id="icon"
            value={data.icon}
            onChange={(e) => onChange({ ...data, icon: e.target.value })}
            placeholder="⭐"
          />
        </div>
      </div>

      {/* Requirements */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Target className="h-4 w-4" />
          Requisitos para Desbloquear
        </h4>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="minTotalSpent">Gasto Total Mínimo (R$)</Label>
            <Input
              id="minTotalSpent"
              type="number"
              step="0.01"
              value={data.minTotalSpent}
              onChange={(e) => onChange({ ...data, minTotalSpent: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minVisits">Visitas Mínimas</Label>
            <Input
              id="minVisits"
              type="number"
              value={data.minVisits}
              onChange={(e) => onChange({ ...data, minVisits: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minMonthlySpent">Gasto Mensal Mínimo (R$)</Label>
            <Input
              id="minMonthlySpent"
              type="number"
              step="0.01"
              value={data.minMonthlySpent}
              onChange={(e) => onChange({ ...data, minMonthlySpent: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-600" />
          Benefícios Exclusivos
        </h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cashbackMultiplier">Multiplicador de Cashback</Label>
            <Input
              id="cashbackMultiplier"
              type="number"
              step="0.1"
              value={data.cashbackMultiplier}
              onChange={(e) => onChange({ ...data, cashbackMultiplier: parseFloat(e.target.value) || 1.0 })}
              placeholder="1.0"
            />
            <p className="text-xs text-muted-foreground">1.5 = 50% de bônus no cashback</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="discountPercentage">Desconto Exclusivo (%)</Label>
            <Input
              id="discountPercentage"
              type="number"
              step="1"
              value={data.discountPercentage}
              onChange={(e) => onChange({ ...data, discountPercentage: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.priorityBooking}
              onChange={(e) => onChange({ ...data, priorityBooking: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Agendamento Prioritário</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.exclusiveServices}
              onChange={(e) => onChange({ ...data, exclusiveServices: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Serviços Exclusivos</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={onSubmit} disabled={isLoading || !data.name}>
          {isLoading ? 'Salvando...' : submitLabel}
        </Button>
      </div>
    </div>
  );
}
