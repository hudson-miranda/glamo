import React, { useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import { listLoyaltyPrograms, getLoyaltyProgramStats } from 'wasp/client/operations';
import { useSalonContext } from '../../hooks/useSalonContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { EmptyState } from '../../../components/ui/empty-state';
import { 
  Gift, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Plus,
  Settings,
  Crown,
  Percent,
  AlertCircle
} from 'lucide-react';

export default function LoyaltyProgramPage() {
  const { activeSalonId } = useSalonContext();
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  
  const { data: programs, isLoading } = useQuery(
    listLoyaltyPrograms, 
    { salonId: activeSalonId || '' },
    { enabled: !!activeSalonId }
  );

  const { data: stats, isLoading: statsLoading } = useQuery(
    getLoyaltyProgramStats,
    { 
      salonId: activeSalonId || '',
      programId: selectedProgram || ''
    },
    { enabled: !!activeSalonId && !!selectedProgram }
  );

  if (!activeSalonId) {
    return (
      <div className="container mx-auto p-6">
        <EmptyState
          icon={AlertCircle}
          title="Nenhum salão selecionado"
          description="Por favor, selecione um salão para gerenciar programas de fidelidade."
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Carregando programas de fidelidade...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programa de Fidelidade</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie programas de cashback, pontos e benefícios VIP
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalMembers || programs?.reduce((sum: any, p: any) => sum + (p._count?.balances || 0), 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Clientes no programa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cashback Emitido</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {stats?.totalCashbackIssued?.toFixed(2) || '0,00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Total concedido
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Resgate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.redemptionRate?.toFixed(1) || '0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              Clientes que resgataram
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programas Ativos</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {programs?.filter((p: any) => p.isActive).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              De {programs?.length || 0} totais
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Programs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Programas de Fidelidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          {programs && programs.length > 0 ? (
            <div className="space-y-4">
              {programs.map((program: any) => (
                <div 
                  key={program.id} 
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => setSelectedProgram(program.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-1 h-12 rounded-full ${program.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          {program.name}
                          {program.vipTiersEnabled && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {program.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-6 text-sm ml-4">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Cashback: {program.cashbackType === 'PERCENTAGE' 
                            ? `${program.cashbackValue}%` 
                            : `R$ ${program.cashbackValue}`}
                        </span>
                      </div>
                      
                      {program.pointsEnabled && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span>Pontos: {program.pointsPerReal}pts/R$</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{program._count?.balances || 0} membros</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={program.isActive ? 'default' : 'secondary'}>
                      {program.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                    {program.vipTiersEnabled && (
                      <Badge variant="outline" className="text-yellow-600">
                        VIP Tiers
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Gift}
              title="Nenhum programa cadastrado"
              description="Crie programas de fidelidade para recompensar seus clientes."
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
    </div>
  );
}
