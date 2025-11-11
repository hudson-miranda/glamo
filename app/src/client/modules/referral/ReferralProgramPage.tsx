import React, { useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import { listReferralPrograms, getReferralStats, getReferralLeaderboard } from 'wasp/client/operations';
import { useSalonContext } from '../../hooks/useSalonContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { EmptyState } from '../../../components/ui/empty-state';
import { 
  UserPlus, 
  TrendingUp, 
  Award, 
  DollarSign, 
  Plus,
  Settings,
  Trophy,
  Target,
  AlertCircle,
  Share2
} from 'lucide-react';

export default function ReferralProgramPage() {
  const { activeSalonId } = useSalonContext();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');
  
  const { data: programs, isLoading: loadingPrograms } = useQuery(
    listReferralPrograms, 
    { salonId: activeSalonId || '' },
    { enabled: !!activeSalonId }
  );
  
  const { data: stats } = useQuery(
    getReferralStats, 
    { 
      salonId: activeSalonId || '',
      period: selectedPeriod 
    },
    { enabled: !!activeSalonId }
  );
  
  const { data: leaderboard } = useQuery(
    getReferralLeaderboard, 
    { 
      salonId: activeSalonId || '', 
      limit: 10 
    },
    { enabled: !!activeSalonId }
  );

  if (!activeSalonId) {
    return (
      <div className="container mx-auto p-6">
        <EmptyState
          icon={AlertCircle}
          title="Nenhum salão selecionado"
          description="Por favor, selecione um salão para gerenciar programas de indicação."
        />
      </div>
    );
  }

  if (loadingPrograms) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Carregando programas de indicação...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programa de Indicações</h1>
          <p className="text-muted-foreground mt-1">
            Transforme clientes em embaixadores da sua marca
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Programa
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {(['week', 'month', 'all'] as const).map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod(period)}
          >
            {period === 'week' ? 'Semana' : period === 'month' ? 'Mês' : 'Todo período'}
          </Button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Indicações</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReferrals || 0}</div>
            <p className="text-xs text-muted-foreground">
              Novos clientes indicados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualificadas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.qualifiedReferrals || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Indicações confirmadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.conversionRate?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Indicações → Clientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recompensas Pagas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              R$ {stats?.totalRewardsIssued?.toFixed(2) || '0,00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Total distribuído
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Programs List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Programas de Indicação
            </CardTitle>
          </CardHeader>
          <CardContent>
            {programs && programs.length > 0 ? (
              <div className="space-y-4">
                {programs.map((program: any) => (
                  <div 
                    key={program.id} 
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-1 h-12 rounded-full ${program.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <div>
                          <h3 className="font-semibold text-lg">{program.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {program.description || 'Programa de indicação'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 ml-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span>
                            <strong>Indicador:</strong> {program.referrerRewardType === 'DISCOUNT' ? 'Desconto' : 'Cashback'} de R$ {program.referrerRewardValue}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4 text-muted-foreground" />
                          <span>
                            <strong>Indicado:</strong> {program.refereeRewardType === 'DISCOUNT' ? 'Desconto' : 'Cashback'} de R$ {program.refereeRewardValue}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Badge variant={program.isActive ? 'default' : 'secondary'}>
                      {program.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Share2}
                title="Nenhum programa cadastrado"
                description="Crie programas de indicação para expandir sua base de clientes."
                action={
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Programa
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top 10 Indicadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard && leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.map((item: any, index: number) => (
                  <div 
                    key={item.client?.id || index} 
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{item.client?.name || 'Cliente'}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <UserPlus className="h-3 w-3" />
                          <span>{item.referralCount || 0} indicações</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        R$ {item.totalRewards?.toFixed(2) || '0,00'}
                      </p>
                      <p className="text-xs text-muted-foreground">ganhos</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Trophy}
                title="Nenhuma indicação ainda"
                description="O ranking aparecerá quando houver indicações registradas."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
