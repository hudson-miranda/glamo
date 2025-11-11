
import React from 'react';
import { useQuery } from 'wasp/client/operations';
import { listAnamnesisForms } from 'wasp/client/operations';
import { useSalonContext } from '../../hooks/useSalonContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { EmptyState } from '../../../components/ui/empty-state';
import { FileText, Plus, AlertCircle } from 'lucide-react';

export default function AnamnesisFormsPage() {
  const { activeSalonId } = useSalonContext();
  
  const { data: forms, isLoading } = useQuery(
    listAnamnesisForms, 
    {
      salonId: activeSalonId || '',
      isActive: true
    },
    { enabled: !!activeSalonId }
  );

  if (!activeSalonId) {
    return (
      <div className="container mx-auto p-6">
        <EmptyState
          icon={AlertCircle}
          title="Nenhum salão selecionado"
          description="Por favor, selecione um salão para gerenciar formulários de anamnese."
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Carregando formulários...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Formulários de Anamnese</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie formulários e anamneses de clientes
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Formulário
        </Button>
      </div>

      {/* Forms List */}
      {forms && forms.length > 0 ? (
        <div className="grid gap-4">
          {forms.map((form: any) => (
            <Card key={form.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{form.name}</h3>
                      {form.isDefault && (
                        <Badge variant="secondary">Padrão</Badge>
                      )}
                      <Badge variant={form.isActive ? "default" : "outline"}>
                        {form.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    
                    {form.description && (
                      <p className="text-muted-foreground text-sm mb-3">{form.description}</p>
                    )}
                    
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>📝 {form._count?.submissions || 0} preenchimentos</span>
                      <span>✍️ {form.requireSignature ? 'Requer assinatura' : 'Sem assinatura'}</span>
                      <span>📋 Versão {form.version}</span>
                    </div>
                    
                    {form.serviceCategories && form.serviceCategories.length > 0 && (
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {form.serviceCategories.map((cat: any) => (
                          <Badge key={cat} variant="outline" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <Button variant="ghost" size="icon">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="Nenhum formulário cadastrado"
          description="Crie seu primeiro formulário de anamnese para começar a coletar informações dos clientes."
          action={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Formulário
            </Button>
          }
        />
      )}
    </div>
  );
}
