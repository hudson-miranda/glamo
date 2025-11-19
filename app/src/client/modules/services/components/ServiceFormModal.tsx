import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { Badge } from '../../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Separator } from '../../../../components/ui/separator';
import { Switch } from '../../../../components/ui/switch';
import { Loader2, Plus, Trash2, Edit2 } from 'lucide-react';
import { useToast } from '../../../../components/ui/use-toast';
import { CategorySelect } from '../../../components/CategorySelect';
import { ValueTypeInput } from '../../../components/ValueTypeInput';
import { DurationSelect } from '../../../components/DurationSelect';
import { ImageUpload } from '../../../components/ImageUpload';
import { InfoTooltip } from '../../../components/InfoTooltip';
import { CareMessagesTab } from '../../../components/CareMessagesTab';
import { EmployeeCustomizationsTab } from '../../../components/EmployeeCustomizationsTab';
import { ProductConsumptionsTab } from '../../../components/ProductConsumptionsTab';
import { MessageVariableHelper } from '../../../components/MessageVariableHelper';

// Validation schema com todos os campos do Service
const serviceSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  description: z.string().max(500).optional(),
  categoryId: z.string().optional(),
  priceType: z.enum(['FIXED', 'FROM', 'CONSULTATION']).optional(),
  defaultPrice: z.number().min(0, 'Preço deve ser maior ou igual a 0'),
  defaultDuration: z.number().min(1, 'Duração deve ser pelo menos 1 minuto'),
  costValue: z.number().optional(),
  costValueType: z.enum(['FIXED', 'PERCENT']).optional(),
  commissionValue: z.number().optional(),
  commissionValueType: z.enum(['FIXED', 'PERCENT']).optional(),
  color: z.string().optional(),
  active: z.boolean(),
  isFavorite: z.boolean().optional(),
  isVisible: z.boolean().optional(),
  requiresDeposit: z.boolean(),
  depositAmount: z.number().min(0).optional(),
  allowOnlineBooking: z.boolean(),
  advanceBookingTime: z.number().optional(),
  imagePath: z.string().optional(),
  instructions: z.string().max(1000).optional(),
  // Cashback
  cashbackActive: z.boolean().optional(),
  cashbackValue: z.number().optional(),
  cashbackValueType: z.enum(['FIXED', 'PERCENT']).optional(),
  // Return policy
  returnActive: z.boolean().optional(),
  returnDays: z.number().optional(),
  returnMessage: z.string().max(1000).optional(),
  // Fiscal
  serviceListItem: z.string().optional(),
  cnae: z.string().optional(),
  municipalServiceCode: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface Service {
  id: string;
  name: string;
  description?: string | null;
  categoryId?: string | null;
  defaultPrice: number;
  defaultDuration: number;
  active: boolean;
  requiresDeposit?: boolean;
  depositAmount?: number | null;
  allowOnlineBooking?: boolean;
  color?: string | null;
  imagePath?: string | null;
  instructions?: string | null;
}

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  service?: Service | null;
  isLoading?: boolean;
  salonId: string;
  employees?: any[];
  products?: any[];
}

export function ServiceFormModal({
  isOpen,
  onClose,
  onSubmit,
  service,
  isLoading = false,
  salonId,
  employees = [],
  products = [],
}: ServiceFormModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('service');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      categoryId: '',
      priceType: 'FIXED',
      defaultPrice: 0,
      defaultDuration: 30,
      costValue: 0,
      costValueType: 'FIXED',
      commissionValue: 0,
      commissionValueType: 'PERCENT',
      color: '#8B5CF6',
      active: true,
      isFavorite: false,
      isVisible: true,
      requiresDeposit: false,
      depositAmount: 0,
      allowOnlineBooking: true,
      advanceBookingTime: 0,
      imagePath: '',
      instructions: '',
      cashbackActive: false,
      cashbackValue: 0,
      cashbackValueType: 'FIXED',
      returnActive: false,
      returnDays: 0,
      returnMessage: '',
      serviceListItem: '',
      cnae: '',
      municipalServiceCode: '',
    },
  });

  const requiresDeposit = watch('requiresDeposit');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (service) {
        reset({
          name: service.name,
          description: service.description || '',
          categoryId: service.categoryId || '',
          defaultPrice: (service as any).price || 0,
          defaultDuration: (service as any).duration || 30,
          color: (service as any).cardColor || '#8B5CF6',
          active: (service as any).active !== undefined ? (service as any).active : true,
          requiresDeposit: service.requiresDeposit || false,
          depositAmount: service.depositAmount || 0,
          allowOnlineBooking: service.allowOnlineBooking !== undefined ? service.allowOnlineBooking : true,
          imagePath: service.imagePath || '',
          instructions: service.instructions || '',
        });
      } else {
        reset();
      }
      setActiveTab('service'); // Sempre volta para aba de serviço ao abrir
    }
  }, [isOpen, reset]);



  const handleFormSubmit = async (data: ServiceFormData) => {
    try {
      await onSubmit(data);
      toast({
        title: service ? 'Serviço atualizado' : 'Serviço criado',
        description: service 
          ? 'Serviço atualizado com sucesso' 
          : 'Novo serviço adicionado',
      });
      onClose();
      reset();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar serviço',
        variant: 'destructive',
      });
    }
  };



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{service ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
          <DialogDescription>
            {service
              ? 'Atualize as informações do serviço'
              : 'Preencha os dados do novo serviço'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-9">
            <TabsTrigger value="service">Cadastro</TabsTrigger>
            <TabsTrigger value="config">Configurações</TabsTrigger>
            <TabsTrigger value="cashback">Cashback</TabsTrigger>
            <TabsTrigger value="care">Cuidados</TabsTrigger>
            <TabsTrigger value="return">Retorno</TabsTrigger>
            <TabsTrigger value="commission">Comissões</TabsTrigger>
            <TabsTrigger value="employee">Profissionais</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="fiscal">Nota Fiscal</TabsTrigger>
          </TabsList>

          <TabsContent value="service" className="space-y-6 mt-6">
            <form onSubmit={handleSubmit(handleFormSubmit)} id="service-form" className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações Básicas</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">
                      Nome do Serviço <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="Ex: Corte de Cabelo Masculino"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      {...register('description')}
                      placeholder="Descrição detalhada do serviço..."
                      rows={3}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label className="flex items-center gap-1">
                      Categoria
                      <InfoTooltip content="Organize seus serviços em categorias para melhor visualização" />
                    </Label>
                    <CategorySelect
                      value={watch('categoryId')}
                      onChange={(value) => setValue('categoryId', value === 'none' ? undefined : value)}
                      salonId={salonId}
                      error={errors.categoryId?.message}
                    />
                  </div>

                  <div>
                    <Label htmlFor="color" className="flex items-center gap-1">
                      Cor (Agenda)
                      <InfoTooltip content="Cor de exibição do serviço na agenda" />
                    </Label>
                    <Input
                      id="color"
                      type="color"
                      {...register('color')}
                      className="h-10"
                    />
                  </div>

                  <div>
                    <ImageUpload
                      label="Imagem do Serviço"
                      value={watch('imagePath')}
                      onChange={(path) => setValue('imagePath', path)}
                      onFileSelect={async (file) => {
                        // TODO: Implementar upload real para S3
                        const tempPath = `/uploads/${file.name}`;
                        return tempPath;
                      }}
                      tooltip={<InfoTooltip content="Imagem de destaque do serviço para agendamento online" />}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Duration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Preço e Duração</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label className="flex items-center gap-1">
                      Tipo de Preço
                      <InfoTooltip content="FIXO: preço único | A PARTIR DE: preço inicial | CONSULTAR: preço sob consulta" />
                    </Label>
                    <Select
                      value={watch('priceType') || 'FIXED'}
                      onValueChange={(v) => setValue('priceType', v as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIXED">Preço Fixo</SelectItem>
                        <SelectItem value="FROM">A partir de</SelectItem>
                        <SelectItem value="CONSULTATION">Sob Consulta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="defaultPrice">
                      Preço <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="defaultPrice"
                      type="number"
                      step="0.01"
                      {...register('defaultPrice', { valueAsNumber: true })}
                      placeholder="0.00"
                      className={errors.defaultPrice ? 'border-red-500' : ''}
                    />
                    {errors.defaultPrice && (
                      <p className="text-sm text-red-500 mt-1">{errors.defaultPrice.message}</p>
                    )}
                  </div>

                  <div>
                    <DurationSelect
                      label="Duração"
                      value={watch('defaultDuration')}
                      onChange={(v) => setValue('defaultDuration', v)}
                      error={errors.defaultDuration?.message}
                      required
                      tooltip={<InfoTooltip content="Tempo estimado de execução do serviço" />}
                    />
                  </div>

                  <div>
                    <ValueTypeInput
                      label="Custo do Serviço"
                      value={watch('costValue') || 0}
                      valueType={watch('costValueType') || 'FIXED'}
                      onValueChange={(v) => setValue('costValue', v)}
                      onValueTypeChange={(t) => setValue('costValueType', t)}
                      placeholder="Custo"
                      tooltip={<InfoTooltip content="Custo de execução (produtos, energia, etc.)" />}
                    />
                  </div>

                  <div>
                    <ValueTypeInput
                      label="Comissão Padrão"
                      value={watch('commissionValue') || 0}
                      valueType={watch('commissionValueType') || 'PERCENT'}
                      onValueChange={(v) => setValue('commissionValue', v)}
                      onValueTypeChange={(t) => setValue('commissionValueType', t)}
                      placeholder="Comissão"
                      tooltip={<InfoTooltip content="Comissão padrão do profissional que executa o serviço" />}
                    />
                  </div>
                </div>
              </div>

              {/* Deposit */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Sinal/Depósito</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="requiresDeposit"
                      {...register('requiresDeposit')}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="requiresDeposit" className="cursor-pointer flex items-center gap-1">
                      Requer sinal/depósito
                      <InfoTooltip content="Exigir pagamento antecipado para confirmar agendamento" />
                    </Label>
                  </div>

                  {requiresDeposit && (
                    <div className="ml-6">
                      <Label htmlFor="depositAmount">Valor do Sinal (R$)</Label>
                      <Input
                        id="depositAmount"
                        type="number"
                        step="0.01"
                        {...register('depositAmount', { valueAsNumber: true })}
                        placeholder="0.00"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações Adicionais</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="instructions">Instruções/Preparação</Label>
                    <Textarea
                      id="instructions"
                      {...register('instructions')}
                      placeholder="Ex: Lavar o cabelo antes, trazer fotos de referência..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="imagePath">Caminho da Imagem</Label>
                    <Input
                      id="imagePath"
                      {...register('imagePath')}
                      placeholder="caminho/para/imagem.jpg"
                      className={errors.imagePath ? 'border-red-500' : ''}
                    />
                    {errors.imagePath && (
                      <p className="text-sm text-red-500 mt-1">{errors.imagePath.message}</p>
                    )}
                  </div>
                </div>
              </div>

            </form>
          </TabsContent>

          {/* Aba Configurações */}
          <TabsContent value="config" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Configurações do Serviço</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="active-switch" className="flex items-center gap-1">
                      Serviço Ativo
                      <InfoTooltip content="Se desabilitado, o serviço não estará disponível para agendamento" />
                    </Label>
                    <p className="text-sm text-muted-foreground">Disponível para agendamento</p>
                  </div>
                  <Switch
                    id="active-switch"
                    checked={watch('active')}
                    onCheckedChange={(checked) => setValue('active', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="favorite-switch" className="flex items-center gap-1">
                      Serviço Favorito
                      <InfoTooltip content="Destacar este serviço como favorito no agendamento online" />
                    </Label>
                    <p className="text-sm text-muted-foreground">Marcar como favorito</p>
                  </div>
                  <Switch
                    id="favorite-switch"
                    checked={watch('isFavorite')}
                    onCheckedChange={(checked) => setValue('isFavorite', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="visible-switch" className="flex items-center gap-1">
                      Visível
                      <InfoTooltip content="Se desabilitado, o serviço ficará oculto mas continuará disponível internamente" />
                    </Label>
                    <p className="text-sm text-muted-foreground">Visível no sistema</p>
                  </div>
                  <Switch
                    id="visible-switch"
                    checked={watch('isVisible')}
                    onCheckedChange={(checked) => setValue('isVisible', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="online-booking-switch" className="flex items-center gap-1">
                      Agendamento Online
                      <InfoTooltip content="Permitir que clientes agendem este serviço online" />
                    </Label>
                    <p className="text-sm text-muted-foreground">Disponível para agendamento online</p>
                  </div>
                  <Switch
                    id="online-booking-switch"
                    checked={watch('allowOnlineBooking')}
                    onCheckedChange={(checked) => setValue('allowOnlineBooking', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="advanceBookingTime" className="flex items-center gap-1">
                    Tempo Mínimo de Antecedência
                    <InfoTooltip content="Tempo mínimo (em horas) de antecedência necessário para agendar online" />
                  </Label>
                  <Input
                    id="advanceBookingTime"
                    type="number"
                    min="0"
                    {...register('advanceBookingTime', { valueAsNumber: true })}
                    placeholder="Ex: 24 (horas)"
                  />
                  <p className="text-xs text-muted-foreground">
                    0 = sem restrição | Ex: 24 = cliente deve agendar com 24h de antecedência
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Aba Cashback */}
          <TabsContent value="cashback" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  Programa de Cashback
                  <InfoTooltip content="Configure cashback para fidelizar seus clientes" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  Devolva parte do valor para o cliente usar em futuros serviços
                </p>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="cashback-active" className="flex items-center gap-1">
                    Cashback Ativo
                    <InfoTooltip content="Ativar programa de cashback para este serviço" />
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Oferecer cashback neste serviço
                  </p>
                </div>
                <Switch
                  id="cashback-active"
                  checked={watch('cashbackActive')}
                  onCheckedChange={(checked) => setValue('cashbackActive', checked)}
                />
              </div>

              {watch('cashbackActive') && (
                <div className="space-y-4 p-4 border rounded-lg bg-accent/50">
                  <div className="space-y-2">
                    <ValueTypeInput
                      label="Valor do Cashback"
                      value={watch('cashbackValue') || 0}
                      valueType={watch('cashbackValueType') || 'FIXED'}
                      onValueChange={(v) => setValue('cashbackValue', v)}
                      onValueTypeChange={(t) => setValue('cashbackValueType', t)}
                      placeholder="Valor do cashback"
                      tooltip={<InfoTooltip content="Valor ou percentual que o cliente receberá de volta" />}
                    />
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900 font-medium">Como funciona:</p>
                    <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                      <li>Cliente paga pelo serviço normalmente</li>
                      <li>Após conclusão, recebe cashback em sua conta</li>
                      <li>Cashback pode ser usado em futuros agendamentos</li>
                      <li>Ajuda a fidelizar e manter clientes retornando</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Aba Cuidados */}
          <TabsContent value="care" className="space-y-6 mt-6">
            <CareMessagesTab 
              serviceId={service?.id}
              salonId={salonId}
            />
          </TabsContent>

          {/* Aba Retorno */}
          <TabsContent value="return" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  Política de Retorno
                  <InfoTooltip content="Configure garantia de retorno gratuito para este serviço" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ofereça garantia de satisfação com retorno gratuito
                </p>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="return-active" className="flex items-center gap-1">
                    Permitir Retorno
                    <InfoTooltip content="Ativar política de retorno gratuito" />
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Cliente pode retornar gratuitamente
                  </p>
                </div>
                <Switch
                  id="return-active"
                  checked={watch('returnActive')}
                  onCheckedChange={(checked) => setValue('returnActive', checked)}
                />
              </div>

              {watch('returnActive') && (
                <div className="space-y-4 p-4 border rounded-lg bg-accent/50">
                  <div className="space-y-2">
                    <Label htmlFor="returnDays" className="flex items-center gap-1">
                      Prazo de Retorno (dias)
                      <InfoTooltip content="Quantos dias após o atendimento o cliente pode retornar" />
                    </Label>
                    <Input
                      id="returnDays"
                      type="number"
                      min="1"
                      {...register('returnDays', { valueAsNumber: true })}
                      placeholder="Ex: 7"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="returnMessage" className="flex items-center gap-1">
                        Mensagem de Retorno
                        <InfoTooltip content="Mensagem explicando as condições de retorno" />
                      </Label>
                      <MessageVariableHelper 
                        onInsert={(variable) => {
                          const currentValue = watch('returnMessage') || '';
                          setValue('returnMessage', currentValue + variable);
                        }}
                      />
                    </div>
                    <Textarea
                      id="returnMessage"
                      {...register('returnMessage')}
                      placeholder="Ex: Você tem {returnDays} dias para retornar gratuitamente caso não fique satisfeito..."
                      rows={4}
                      maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {(watch('returnMessage') || '').length}/1000 caracteres
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-900 font-medium">Benefícios:</p>
                    <ul className="text-sm text-green-800 mt-2 space-y-1 list-disc list-inside">
                      <li>Aumenta confiança do cliente</li>
                      <li>Reduz objeções na hora da compra</li>
                      <li>Demonstra qualidade e compromisso</li>
                      <li>Diferencial competitivo</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Aba Comissões */}
          <TabsContent value="commission" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  Comissões e Auxiliares
                  <InfoTooltip content="Configure regras de comissão para profissionais e auxiliares" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  A comissão padrão já foi configurada na aba Cadastro
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Comissão Padrão Configurada:</p>
                <div className="text-sm">
                  {watch('commissionValueType') === 'PERCENT' 
                    ? `${watch('commissionValue') || 0}% do valor do serviço`
                    : `R$ ${(watch('commissionValue') || 0).toFixed(2)}`}
                </div>
              </div>

              <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  📋 Configurações Avançadas
                </p>
                <p className="text-sm text-blue-800">
                  Para configurar comissões específicas por profissional, utilize a aba 
                  <span className="font-semibold"> Profissionais</span>.
                </p>
                <p className="text-sm text-blue-800 mt-2">
                  Para configurar comissões de auxiliares e regras mais complexas, 
                  acesse o módulo de <span className="font-semibold">Gestão Financeira</span>.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Aba Personalização por Profissional */}
          <TabsContent value="employee" className="space-y-6 mt-6">
            <EmployeeCustomizationsTab
              serviceId={service?.id}
              salonId={salonId}
              employees={employees}
            />
          </TabsContent>

          {/* Aba Produtos Consumidos */}
          <TabsContent value="products" className="space-y-6 mt-6">
            <ProductConsumptionsTab
              serviceId={service?.id}
              salonId={salonId}
              products={products}
            />
          </TabsContent>

          {/* Aba Nota Fiscal */}
          <TabsContent value="fiscal" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  Configurações Fiscais
                  <InfoTooltip content="Informações necessárias para emissão de nota fiscal" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  Configure os dados fiscais deste serviço
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceListItem" className="flex items-center gap-1">
                    Item da Lista de Serviços
                    <InfoTooltip content="Código do serviço na lista municipal de serviços" />
                  </Label>
                  <Input
                    id="serviceListItem"
                    {...register('serviceListItem')}
                    placeholder="Ex: 06.02"
                    maxLength={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    Código da LC 116/2003 (Lista de Serviços)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnae" className="flex items-center gap-1">
                    CNAE
                    <InfoTooltip content="Classificação Nacional de Atividades Econômicas" />
                  </Label>
                  <Input
                    id="cnae"
                    {...register('cnae')}
                    placeholder="Ex: 9602-5/01"
                    maxLength={15}
                  />
                  <p className="text-xs text-muted-foreground">
                    Código CNAE relacionado ao serviço
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="municipalServiceCode" className="flex items-center gap-1">
                    Código Municipal
                    <InfoTooltip content="Código do serviço específico do município" />
                  </Label>
                  <Input
                    id="municipalServiceCode"
                    {...register('municipalServiceCode')}
                    placeholder="Código municipal"
                    maxLength={20}
                  />
                  <p className="text-xs text-muted-foreground">
                    Código específico do município (se aplicável)
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-900 font-medium mb-2">
                    ⚠️ Importante
                  </p>
                  <p className="text-sm text-yellow-800">
                    Consulte seu contador para preencher corretamente estes campos.
                    Informações incorretas podem causar problemas fiscais.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>


        </Tabs>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || isLoading}>
            Cancelar
          </Button>
          <Button 
            type={activeTab === 'service' ? 'submit' : 'button'} 
            form={activeTab === 'service' ? 'service-form' : undefined}
            disabled={isSubmitting || isLoading}
          >
            {(isSubmitting || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {service ? 'Atualizar' : 'Criar'} Serviço
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
