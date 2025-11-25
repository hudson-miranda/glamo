import { useState, useEffect } from 'react';
import { useQuery } from 'wasp/client/operations';
import {
  listServiceEmployeeCustomizations,
  createServiceEmployeeCustomization,
  updateServiceEmployeeCustomization,
  deleteServiceEmployeeCustomization,
} from 'wasp/client/operations';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import { Loader2, Plus, Trash2, Edit2, User } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import { ValueTypeInput } from './ValueTypeInput';
import { DurationSelect } from './DurationSelect';
import { InfoTooltip } from './InfoTooltip';

interface EmployeeCustomizationsTabProps {
  serviceId?: string;
  salonId: string;
  employees: any[];
}

interface CustomizationForm {
  id?: string;
  employeeId: string;
  customPrice?: number;
  customPriceType: 'FIXED' | 'PERCENT';
  customDuration?: number;
  costValue?: number;
  costValueType: 'FIXED' | 'PERCENT';
  allowOnlineBooking: boolean;
}

export function EmployeeCustomizationsTab({ 
  serviceId, 
  salonId, 
  employees 
}: EmployeeCustomizationsTabProps) {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [editingCustomization, setEditingCustomization] = useState<any | null>(null);
  const [formData, setFormData] = useState<CustomizationForm>({
    employeeId: '',
    customPriceType: 'FIXED',
    costValueType: 'FIXED',
    allowOnlineBooking: true,
  });

  const { data: customizations, isLoading, refetch } = useQuery(
    listServiceEmployeeCustomizations,
    { serviceId: serviceId || '', salonId },
    { enabled: !!serviceId }
  );

  const availableEmployees = employees.filter(
    (emp) => !customizations?.some((c: any) => c.employeeId === emp.id && c.id !== editingCustomization?.id)
  );

  const handleStartAdd = () => {
    if (availableEmployees.length === 0) {
      toast({
        title: 'Sem funcionários disponíveis',
        description: 'Todos os funcionários já possuem personalização para este serviço',
        variant: 'destructive',
      });
      return;
    }
    setFormData({
      employeeId: '',
      customPriceType: 'FIXED',
      costValueType: 'FIXED',
      allowOnlineBooking: true,
    });
    setEditingCustomization(null);
    setIsAdding(true);
  };

  const handleEdit = (customization: any) => {
    setFormData({
      id: customization.id,
      employeeId: customization.employeeId,
      customPrice: customization.customPrice || undefined,
      customPriceType: customization.customPriceType || 'FIXED',
      customDuration: customization.customDuration || undefined,
      costValue: customization.costValue || undefined,
      costValueType: customization.costValueType || 'FIXED',
      allowOnlineBooking: customization.allowOnlineBooking !== false,
    });
    setEditingCustomization(customization);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingCustomization(null);
    setFormData({
      employeeId: '',
      customPriceType: 'FIXED',
      costValueType: 'FIXED',
      allowOnlineBooking: true,
    });
  };

  const handleSave = async () => {
    if (!serviceId) {
      toast({
        title: 'Erro',
        description: 'Salve o serviço antes de adicionar personalizações',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.employeeId) {
      toast({
        title: 'Campo obrigatório',
        description: 'Selecione um funcionário',
        variant: 'destructive',
      });
      return;
    }

    // Validate percentages
    if (formData.customPriceType === 'PERCENT' && formData.customPrice && formData.customPrice > 100) {
      toast({
        title: 'Valor inválido',
        description: 'Percentual não pode ser maior que 100%',
        variant: 'destructive',
      });
      return;
    }

    if (formData.costValueType === 'PERCENT' && formData.costValue && formData.costValue > 100) {
      toast({
        title: 'Valor inválido',
        description: 'Percentual de custo não pode ser maior que 100%',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingCustomization) {
        await updateServiceEmployeeCustomization({
          customizationId: formData.id!,
          salonId,
          price: formData.customPrice,
          duration: formData.customDuration,
          costValue: formData.costValue,
          costValueType: formData.costValueType,
          allowOnlineBooking: formData.allowOnlineBooking,
        });
        toast({
          title: 'Personalização atualizada',
          description: 'Personalização do funcionário atualizada com sucesso',
        });
      } else {
        await createServiceEmployeeCustomization({
          serviceId,
          employeeId: formData.employeeId,
          salonId,
          price: formData.customPrice,
          duration: formData.customDuration,
          costValue: formData.costValue,
          costValueType: formData.costValueType,
          allowOnlineBooking: formData.allowOnlineBooking,
        });
        toast({
          title: 'Personalização criada',
          description: 'Nova personalização adicionada com sucesso',
        });
      }
      refetch();
      handleCancel();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar personalização',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (customizationId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta personalização?')) return;

    try {
      await deleteServiceEmployeeCustomization({ customizationId, salonId });
      toast({
        title: 'Personalização excluída',
        description: 'Personalização removida com sucesso',
      });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir personalização',
        variant: 'destructive',
      });
    }
  };

  if (!serviceId) {
    return (
      <div className="text-center py-8 border-2 border-dashed rounded-lg">
        <div className="space-y-2">
          <p className="text-muted-foreground font-medium">💡 Salve o serviço primeiro</p>
          <p className="text-sm text-muted-foreground">
            Para adicionar personalizações por profissional, você precisa salvar o serviço antes.
          </p>
          <p className="text-sm text-muted-foreground">
            Clique no botão <span className="font-semibold">"Criar Serviço"</span> no rodapé do modal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium flex items-center gap-2">
          Personalização por Funcionário
          <InfoTooltip content="Configure preços, durações e custos personalizados para cada funcionário" />
        </h3>
        <p className="text-sm text-muted-foreground">
          Defina valores específicos para cada profissional
        </p>
      </div>

      {employees.length === 0 && (
        <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
          <p className="text-sm text-amber-900 font-medium mb-2">
            ⚠️ Nenhum funcionário cadastrado
          </p>
          <p className="text-sm text-amber-800">
            Para adicionar personalizações, primeiro cadastre funcionários no módulo de{' '}
            <span className="font-semibold">Funcionários</span>.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : customizations && customizations.length > 0 ? (
        <div className="space-y-2">
          {customizations.map((customization: any) => (
            <Card key={customization.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{customization.employee.name}</span>
                      {!customization.allowOnlineBooking && (
                        <Badge variant="secondary">Agendamento online desabilitado</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {customization.customPrice !== null && (
                        <div>
                          <span className="text-muted-foreground">Preço: </span>
                          <span className="font-medium">
                            {customization.customPriceType === 'PERCENT' 
                              ? `${customization.customPrice}%`
                              : `R$ ${customization.customPrice.toFixed(2)}`}
                          </span>
                        </div>
                      )}
                      {customization.customDuration !== null && (
                        <div>
                          <span className="text-muted-foreground">Duração: </span>
                          <span className="font-medium">{customization.customDuration} min</span>
                        </div>
                      )}
                      {customization.costValue !== null && (
                        <div>
                          <span className="text-muted-foreground">Custo: </span>
                          <span className="font-medium">
                            {customization.costValueType === 'PERCENT'
                              ? `${customization.costValue}%`
                              : `R$ ${customization.costValue.toFixed(2)}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(customization)}
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(customization.id)}
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          <p>Nenhuma personalização configurada</p>
          <p className="text-sm mt-1">Clique em "Adicionar Personalização" para começar</p>
        </div>
      )}

      {!isAdding && (
        <Button
          type="button"
          variant="outline"
          onClick={handleStartAdd}
          disabled={availableEmployees.length === 0 || employees.length === 0}
          className="w-full"
          title={employees.length === 0 ? 'Cadastre funcionários primeiro' : availableEmployees.length === 0 ? 'Todos os funcionários já possuem personalização' : 'Adicionar nova personalização'}
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Personalização
          {employees.length === 0 && ' (Cadastre funcionários primeiro)'}
        </Button>
      )}

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingCustomization ? 'Editar' : 'Nova'} Personalização
            </CardTitle>
            <CardDescription>
              Configure valores personalizados para o funcionário
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">
                Funcionário <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.employeeId}
                onValueChange={(v) => setFormData({ ...formData, employeeId: v })}
                disabled={!!editingCustomization}
              >
                <SelectTrigger id="employeeId">
                  <SelectValue placeholder="Selecione um funcionário" />
                </SelectTrigger>
                <SelectContent>
                  {(editingCustomization ? employees : availableEmployees).map((emp: any) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                Preço Personalizado
                <InfoTooltip content="Deixe vazio para usar o preço padrão do serviço" />
              </Label>
              <ValueTypeInput
                label=""
                value={formData.customPrice || 0}
                valueType={formData.customPriceType}
                onValueChange={(v) => setFormData({ ...formData, customPrice: v })}
                onValueTypeChange={(t) => setFormData({ ...formData, customPriceType: t })}
                placeholder="Preço personalizado"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customDuration" className="flex items-center gap-1">
                Duração Personalizada
                <InfoTooltip content="Deixe vazio para usar a duração padrão do serviço" />
              </Label>
              <DurationSelect
                label=""
                value={formData.customDuration || 60}
                onChange={(v) => setFormData({ ...formData, customDuration: v })}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                Custo Personalizado
                <InfoTooltip content="Custo específico deste funcionário para realizar o serviço" />
              </Label>
              <ValueTypeInput
                label=""
                value={formData.costValue || 0}
                valueType={formData.costValueType}
                onValueChange={(v) => setFormData({ ...formData, costValue: v })}
                onValueTypeChange={(t) => setFormData({ ...formData, costValueType: t })}
                placeholder="Custo personalizado"
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="allowOnlineBooking" className="flex items-center gap-1">
                  Permitir agendamento online
                  <InfoTooltip content="Se desabilitado, este funcionário não poderá realizar este serviço via agendamento online" />
                </Label>
                <p className="text-sm text-muted-foreground">
                  Habilitar para agendamentos online
                </p>
              </div>
              <Switch
                id="allowOnlineBooking"
                checked={formData.allowOnlineBooking}
                onCheckedChange={(checked) => setFormData({ ...formData, allowOnlineBooking: checked })}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleSave}>
                {editingCustomization ? 'Atualizar' : 'Adicionar'} Personalização
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
