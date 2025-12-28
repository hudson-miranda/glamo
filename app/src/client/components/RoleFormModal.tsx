import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createRole, updateRole } from 'wasp/client/operations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Loader2, Shield, Users, Calendar, FileText, DollarSign, BarChart3, MessageSquare } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (roleId: string) => void;
  salonId: string;
  role?: any; // Para edição
}

interface RoleFormData {
  name: string;
  description?: string;
  isOwner: boolean;
  [key: string]: any;
}

const PermissionSection = ({ 
  title, 
  permissions, 
  formData, 
  onChange 
}: { 
  title: string; 
  permissions: { key: string; label: string }[];
  formData: any;
  onChange: (key: string, value: boolean) => void;
}) => (
  <div className="space-y-3">
    <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">{title}</h4>
    <div className="grid grid-cols-2 gap-3">
      {permissions.map((perm) => (
        <div key={perm.key} className="flex items-center space-x-2">
          <Switch
            id={perm.key}
            checked={formData[perm.key] || false}
            onCheckedChange={(checked) => onChange(perm.key, checked)}
          />
          <Label htmlFor={perm.key} className="text-sm cursor-pointer font-normal">
            {perm.label}
          </Label>
        </div>
      ))}
    </div>
  </div>
);

export function RoleFormModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  salonId,
  role 
}: RoleFormModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<RoleFormData>({
    name: role?.name || '',
    description: role?.description || '',
    isOwner: role?.isOwner || false,
    ...role,
  });

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe o nome do cargo',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        salonId,
        ...formData,
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
      };

      const result = role 
        ? await updateRole({ id: role.id, ...data })
        : await createRole(data);

      toast({
        title: role ? 'Cargo atualizado' : 'Cargo criado',
        description: role ? 'Cargo atualizado com sucesso' : 'Novo cargo criado com sucesso',
      });

      onSuccess(result.id);
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar cargo',
        description: error.message || 'Ocorreu um erro ao salvar o cargo',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {role ? 'Editar Cargo' : 'Novo Cargo'}
          </DialogTitle>
          <DialogDescription>
            {role ? 'Atualize o cargo e suas permissões' : 'Crie um novo cargo e defina suas permissões'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nome do Cargo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ex: Gerente, Recepcionista, Cabeleireiro"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva as responsabilidades deste cargo..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                disabled={isSubmitting}
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <Switch
                id="isOwner"
                checked={formData.isOwner}
                onCheckedChange={(checked) => handleChange('isOwner', checked)}
              />
              <Label htmlFor="isOwner" className="cursor-pointer font-medium">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Administrador/Proprietário (Acesso Total)</span>
                </div>
                <p className="text-xs text-muted-foreground font-normal mt-1">
                  Esta permissão sobrescreve todas as outras e dá acesso completo ao sistema
                </p>
              </Label>
            </div>
          </div>

          {/* Tabs de Permissões */}
          <Tabs defaultValue="operational" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="operational" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                Operacional
              </TabsTrigger>
              <TabsTrigger value="financial" className="text-xs">
                <DollarSign className="h-3 w-3 mr-1" />
                Financeiro
              </TabsTrigger>
              <TabsTrigger value="reports" className="text-xs">
                <BarChart3 className="h-3 w-3 mr-1" />
                Relatórios
              </TabsTrigger>
              <TabsTrigger value="marketing" className="text-xs">
                <MessageSquare className="h-3 w-3 mr-1" />
                Marketing
              </TabsTrigger>
            </TabsList>

            {/* Tab: Operacional */}
            <TabsContent value="operational" className="space-y-4 mt-4">
              <PermissionSection
                title="Agenda"
                permissions={[
                  { key: 'scheduleAccess', label: 'Acessar' },
                  { key: 'scheduleCreate', label: 'Criar' },
                  { key: 'scheduleEdit', label: 'Editar' },
                  { key: 'scheduleDelete', label: 'Excluir' },
                  { key: 'scheduleViewAll', label: 'Visualizar Todos' },
                ]}
                formData={formData}
                onChange={handleChange}
              />

              <PermissionSection
                title="Clientes"
                permissions={[
                  { key: 'clientsAccess', label: 'Acessar' },
                  { key: 'clientsCreate', label: 'Criar' },
                  { key: 'clientsEdit', label: 'Editar' },
                  { key: 'clientsDelete', label: 'Excluir' },
                  { key: 'clientsViewPhones', label: 'Visualizar Telefones' },
                  { key: 'clientsNotes', label: 'Anotações' },
                  { key: 'clientsEditCredits', label: 'Editar Créditos' },
                ]}
                formData={formData}
                onChange={handleChange}
              />

              <PermissionSection
                title="Produtos/Serviços"
                permissions={[
                  { key: 'productsAccess', label: 'Acessar' },
                  { key: 'productsCreate', label: 'Criar' },
                  { key: 'productsEdit', label: 'Editar' },
                  { key: 'productsDelete', label: 'Excluir' },
                ]}
                formData={formData}
                onChange={handleChange}
              />

              <PermissionSection
                title="Profissionais"
                permissions={[
                  { key: 'professionalsAccess', label: 'Acessar' },
                  { key: 'professionalsCreate', label: 'Criar' },
                  { key: 'professionalsEdit', label: 'Editar' },
                  { key: 'professionalsDelete', label: 'Excluir' },
                ]}
                formData={formData}
                onChange={handleChange}
              />

              <PermissionSection
                title="Comandas"
                permissions={[
                  { key: 'commandsAccess', label: 'Acessar' },
                  { key: 'commandsCreate', label: 'Criar' },
                  { key: 'commandsEdit', label: 'Editar' },
                  { key: 'commandsDelete', label: 'Excluir' },
                  { key: 'commandsViewBilled', label: 'Exibir Faturadas' },
                  { key: 'commandsEditAssist', label: 'Editar Assistentes' },
                ]}
                formData={formData}
                onChange={handleChange}
              />

              <PermissionSection
                title="Pacotes"
                permissions={[
                  { key: 'packagesAccess', label: 'Acessar' },
                  { key: 'packagesCreate', label: 'Criar' },
                  { key: 'packagesEdit', label: 'Editar' },
                  { key: 'packagesDelete', label: 'Excluir' },
                ]}
                formData={formData}
                onChange={handleChange}
              />

              <PermissionSection
                title="Anamneses"
                permissions={[
                  { key: 'anamnesisAccess', label: 'Acessar' },
                  { key: 'anamnesisCreate', label: 'Criar' },
                  { key: 'anamnesisEdit', label: 'Editar' },
                  { key: 'anamnesisDelete', label: 'Excluir' },
                ]}
                formData={formData}
                onChange={handleChange}
              />

              <PermissionSection
                title="Avaliações (NPS)"
                permissions={[
                  { key: 'reviewsAccess', label: 'Acessar' },
                  { key: 'reviewsCreate', label: 'Criar' },
                  { key: 'reviewsEdit', label: 'Editar' },
                  { key: 'reviewsDelete', label: 'Excluir' },
                ]}
                formData={formData}
                onChange={handleChange}
              />
            </TabsContent>

            {/* Tab: Financeiro */}
            <TabsContent value="financial" className="space-y-4 mt-4">
              <PermissionSection
                title="Despesas"
                permissions={[
                  { key: 'expensesAccess', label: 'Acessar' },
                  { key: 'expensesCreate', label: 'Criar' },
                  { key: 'expensesEdit', label: 'Editar' },
                  { key: 'expensesDelete', label: 'Excluir' },
                ]}
                formData={formData}
                onChange={handleChange}
              />

              <PermissionSection
                title="Recebimentos"
                permissions={[
                  { key: 'receivablesAccess', label: 'Acessar' },
                  { key: 'receivablesCreate', label: 'Criar' },
                  { key: 'receivablesEdit', label: 'Editar' },
                  { key: 'receivablesDelete', label: 'Excluir' },
                ]}
                formData={formData}
                onChange={handleChange}
              />

              <PermissionSection
                title="Transferências"
                permissions={[
                  { key: 'transfersAccess', label: 'Acessar' },
                  { key: 'transfersCreate', label: 'Criar' },
                  { key: 'transfersEdit', label: 'Editar' },
                  { key: 'transfersDelete', label: 'Excluir' },
                ]}
                formData={formData}
                onChange={handleChange}
              />

              <PermissionSection
                title="Vales"
                permissions={[
                  { key: 'advancesAccess', label: 'Acessar' },
                  { key: 'advancesCreate', label: 'Criar' },
                  { key: 'advancesEdit', label: 'Editar' },
                  { key: 'advancesDelete', label: 'Excluir' },
                ]}
                formData={formData}
                onChange={handleChange}
              />

              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Outras Permissões Financeiras</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="cashClosureAccess"
                      checked={formData.cashClosureAccess || false}
                      onCheckedChange={(checked) => handleChange('cashClosureAccess', checked)}
                    />
                    <Label htmlFor="cashClosureAccess" className="text-sm cursor-pointer font-normal">
                      Fechamento de Caixa
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="financialPanelAccess"
                      checked={formData.financialPanelAccess || false}
                      onCheckedChange={(checked) => handleChange('financialPanelAccess', checked)}
                    />
                    <Label htmlFor="financialPanelAccess" className="text-sm cursor-pointer font-normal">
                      Painel Financeiro
                    </Label>
                  </div>
                </div>
              </div>

              <PermissionSection
                title="Comissões"
                permissions={[
                  { key: 'commissionsAccess', label: 'Acessar' },
                  { key: 'commissionsCreate', label: 'Criar' },
                  { key: 'commissionsEdit', label: 'Editar' },
                  { key: 'commissionsDelete', label: 'Excluir' },
                ]}
                formData={formData}
                onChange={handleChange}
              />

              <PermissionSection
                title="Salários"
                permissions={[
                  { key: 'salariesAccess', label: 'Acessar' },
                  { key: 'salariesCreate', label: 'Criar' },
                  { key: 'salariesEdit', label: 'Editar' },
                  { key: 'salariesDelete', label: 'Excluir' },
                ]}
                formData={formData}
                onChange={handleChange}
              />

              <PermissionSection
                title="Notas Fiscais"
                permissions={[
                  { key: 'invoicesAccess', label: 'Acessar' },
                  { key: 'invoicesCreate', label: 'Criar' },
                  { key: 'invoicesEdit', label: 'Editar' },
                  { key: 'invoicesDelete', label: 'Excluir' },
                ]}
                formData={formData}
                onChange={handleChange}
              />

              <PermissionSection
                title="Compras"
                permissions={[
                  { key: 'purchasesAccess', label: 'Acessar' },
                  { key: 'purchasesCreate', label: 'Criar' },
                  { key: 'purchasesEdit', label: 'Editar' },
                  { key: 'purchasesDelete', label: 'Excluir' },
                ]}
                formData={formData}
                onChange={handleChange}
              />

              <PermissionSection
                title="Fornecedores"
                permissions={[
                  { key: 'suppliersAccess', label: 'Acessar' },
                  { key: 'suppliersCreate', label: 'Criar' },
                  { key: 'suppliersEdit', label: 'Editar' },
                  { key: 'suppliersDelete', label: 'Excluir' },
                ]}
                formData={formData}
                onChange={handleChange}
              />
            </TabsContent>

            {/* Tab: Relatórios */}
            <TabsContent value="reports" className="space-y-4 mt-4">
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Acesso aos Relatórios</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="reportsFinancialAccess"
                      checked={formData.reportsFinancialAccess || false}
                      onCheckedChange={(checked) => handleChange('reportsFinancialAccess', checked)}
                    />
                    <Label htmlFor="reportsFinancialAccess" className="text-sm cursor-pointer font-normal">
                      Relatórios Financeiros
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="reportsScheduleAccess"
                      checked={formData.reportsScheduleAccess || false}
                      onCheckedChange={(checked) => handleChange('reportsScheduleAccess', checked)}
                    />
                    <Label htmlFor="reportsScheduleAccess" className="text-sm cursor-pointer font-normal">
                      Relatórios de Agendamentos
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="reportsClientsAccess"
                      checked={formData.reportsClientsAccess || false}
                      onCheckedChange={(checked) => handleChange('reportsClientsAccess', checked)}
                    />
                    <Label htmlFor="reportsClientsAccess" className="text-sm cursor-pointer font-normal">
                      Relatórios de Clientes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="reportsSalesAccess"
                      checked={formData.reportsSalesAccess || false}
                      onCheckedChange={(checked) => handleChange('reportsSalesAccess', checked)}
                    />
                    <Label htmlFor="reportsSalesAccess" className="text-sm cursor-pointer font-normal">
                      Relatórios de Vendas
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="reportsStockAccess"
                      checked={formData.reportsStockAccess || false}
                      onCheckedChange={(checked) => handleChange('reportsStockAccess', checked)}
                    />
                    <Label htmlFor="reportsStockAccess" className="text-sm cursor-pointer font-normal">
                      Relatórios de Estoque
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="reportsInvoicesAccess"
                      checked={formData.reportsInvoicesAccess || false}
                      onCheckedChange={(checked) => handleChange('reportsInvoicesAccess', checked)}
                    />
                    <Label htmlFor="reportsInvoicesAccess" className="text-sm cursor-pointer font-normal">
                      Relatórios de Notas Fiscais
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="reportsRankingAccess"
                      checked={formData.reportsRankingAccess || false}
                      onCheckedChange={(checked) => handleChange('reportsRankingAccess', checked)}
                    />
                    <Label htmlFor="reportsRankingAccess" className="text-sm cursor-pointer font-normal">
                      Relatórios de Ranking
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="reportsMessagesAccess"
                      checked={formData.reportsMessagesAccess || false}
                      onCheckedChange={(checked) => handleChange('reportsMessagesAccess', checked)}
                    />
                    <Label htmlFor="reportsMessagesAccess" className="text-sm cursor-pointer font-normal">
                      Relatórios de Mensagens
                    </Label>
                  </div>
                </div>
              </div>

              <PermissionSection
                title="Metas"
                permissions={[
                  { key: 'goalsAccess', label: 'Acessar' },
                  { key: 'goalsCreate', label: 'Criar' },
                  { key: 'goalsEdit', label: 'Editar' },
                  { key: 'goalsDelete', label: 'Excluir' },
                  { key: 'goalsViewAll', label: 'Ver Todas as Metas' },
                ]}
                formData={formData}
                onChange={handleChange}
              />

              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Notificações</h4>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="notificationsAll"
                    checked={formData.notificationsAll || false}
                    onCheckedChange={(checked) => handleChange('notificationsAll', checked)}
                  />
                  <Label htmlFor="notificationsAll" className="text-sm cursor-pointer font-normal">
                    Receber Todas as Notificações (caso contrário, apenas as suas)
                  </Label>
                </div>
              </div>
            </TabsContent>

            {/* Tab: Marketing */}
            <TabsContent value="marketing" className="space-y-4 mt-4">
              <PermissionSection
                title="Campanhas"
                permissions={[
                  { key: 'campaignsAccess', label: 'Acessar' },
                  { key: 'campaignsCreate', label: 'Criar' },
                  { key: 'campaignsEdit', label: 'Editar' },
                  { key: 'campaignsDelete', label: 'Excluir' },
                ]}
                formData={formData}
                onChange={handleChange}
              />

              <PermissionSection
                title="WhatsApp Marketing"
                permissions={[
                  { key: 'whatsappAccess', label: 'Acessar' },
                  { key: 'whatsappCreate', label: 'Criar' },
                  { key: 'whatsappEdit', label: 'Editar' },
                  { key: 'whatsappDelete', label: 'Excluir' },
                ]}
                formData={formData}
                onChange={handleChange}
              />

              <PermissionSection
                title="Promoções"
                permissions={[
                  { key: 'promotionsAccess', label: 'Acessar' },
                  { key: 'promotionsCreate', label: 'Criar' },
                  { key: 'promotionsEdit', label: 'Editar' },
                  { key: 'promotionsDelete', label: 'Excluir' },
                ]}
                formData={formData}
                onChange={handleChange}
              />

              <PermissionSection
                title="Venda por Assinatura"
                permissions={[
                  { key: 'subscriptionSalesAccess', label: 'Acessar' },
                  { key: 'subscriptionSalesCreate', label: 'Criar' },
                  { key: 'subscriptionSalesEdit', label: 'Editar' },
                  { key: 'subscriptionSalesDelete', label: 'Excluir' },
                ]}
                formData={formData}
                onChange={handleChange}
              />
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {role ? 'Atualizar' : 'Criar'} Cargo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
