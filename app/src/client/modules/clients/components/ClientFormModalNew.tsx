import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Switch } from '../../../../components/ui/switch';
import { Card, CardContent } from '../../../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu';
import { Loader2, Plus, X, Trash2, Eye, Edit } from 'lucide-react';
import { useToast } from '../../../../components/ui/use-toast';
import { ImageUpload } from '../../../components/ImageUpload';
import { InfoTooltip } from '../../../components/InfoTooltip';

// Validation schema
const clientSchema = z.object({
  // Cadastro - Informações Básicas
  photoPath: z.string().optional(),
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  nickname: z.string().max(50).optional(),
  
  // Contatos
  cellPhone: z.string().min(10, 'Celular inválido'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  
  // Documentos
  birthDate: z.string().optional(),
  cnpj: z.string().optional(),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  
  // Relacionamentos
  dependents: z.array(z.object({
    clientId: z.string(),
    relationship: z.string(),
  })).optional(),
  referredById: z.string().optional(),
  
  // Tags e Observações
  hashtags: z.array(z.string()).optional(),
  notes: z.string().max(1000).optional(),
  
  // Endereço
  zipCode: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  
  // Redes Sociais
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  
  // Configurações
  defaultDiscount: z.number().min(0).optional(),
  defaultDiscountType: z.enum(['FIXED', 'PERCENT']).optional(),
  defaultDiscountTarget: z.enum(['ITEM', 'BILL']).optional(),
  
  // Status
  active: z.boolean(),
  notificationsEnabled: z.boolean(),
  onlineBookingBlocked: z.boolean(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface Dependent {
  clientId: string;
  clientName: string;
  relationship: string;
}

interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  cellPhone?: string | null;
  photoPath?: string | null;
  active?: boolean;
  [key: string]: any;
}

interface ClientFormModalNewProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => Promise<void>;
  client?: Client | null;
  isLoading?: boolean;
  salonId: string;
  allClients?: Client[];
}

export function ClientFormModalNew({
  isOpen,
  onClose,
  onSubmit,
  client,
  isLoading = false,
  salonId,
  allClients = [],
}: ClientFormModalNewProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('cadastro');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState('');
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [showDependentModal, setShowDependentModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      photoPath: '',
      name: '',
      nickname: '',
      cellPhone: '',
      phone: '',
      email: '',
      birthDate: '',
      cnpj: '',
      cpf: '',
      rg: '',
      dependents: [],
      referredById: '',
      hashtags: [],
      notes: '',
      zipCode: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      state: '',
      city: '',
      instagram: '',
      facebook: '',
      defaultDiscount: 0,
      defaultDiscountType: 'PERCENT',
      defaultDiscountTarget: 'ITEM',
      active: true,
      notificationsEnabled: true,
      onlineBookingBlocked: false,
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (client) {
        reset({
          photoPath: client.photoPath || '',
          name: client.name || '',
          nickname: (client as any).nickname || '',
          cellPhone: client.cellPhone || client.phone || '',
          phone: (client as any).phone || '',
          email: client.email || '',
          birthDate: (client as any).birthDate ? new Date((client as any).birthDate).toISOString().split('T')[0] : '',
          cnpj: (client as any).cnpj || '',
          cpf: (client as any).cpf || '',
          rg: (client as any).rg || '',
          dependents: (client as any).dependents || [],
          referredById: (client as any).referredById || '',
          hashtags: (client as any).hashtags || [],
          notes: (client as any).notes || '',
          zipCode: (client as any).zipCode || '',
          street: (client as any).street || '',
          number: (client as any).number || '',
          complement: (client as any).complement || '',
          neighborhood: (client as any).neighborhood || '',
          state: (client as any).state || '',
          city: (client as any).city || '',
          instagram: (client as any).instagram || '',
          facebook: (client as any).facebook || '',
          defaultDiscount: (client as any).defaultDiscount || 0,
          defaultDiscountType: (client as any).defaultDiscountType || 'PERCENT',
          defaultDiscountTarget: (client as any).defaultDiscountTarget || 'ITEM',
          active: client.active !== undefined ? client.active : true,
          notificationsEnabled: (client as any).notificationsEnabled !== undefined ? (client as any).notificationsEnabled : true,
          onlineBookingBlocked: (client as any).onlineBookingBlocked || false,
        });
        setHashtags((client as any).hashtags || []);
        setDependents((client as any).dependents || []);
      } else {
        reset({
          photoPath: '',
          name: '',
          nickname: '',
          cellPhone: '',
          phone: '',
          email: '',
          birthDate: '',
          cnpj: '',
          cpf: '',
          rg: '',
          dependents: [],
          referredById: '',
          hashtags: [],
          notes: '',
          zipCode: '',
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          state: '',
          city: '',
          instagram: '',
          facebook: '',
          defaultDiscount: 0,
          defaultDiscountType: 'PERCENT',
          defaultDiscountTarget: 'ITEM',
          active: true,
          notificationsEnabled: true,
          onlineBookingBlocked: false,
        });
        setHashtags([]);
        setDependents([]);
      }
      setActiveTab('cadastro');
    }
  }, [isOpen, reset, client]);

  const handleFormSubmit = async (data: ClientFormData) => {
    try {
      await onSubmit({
        ...data,
        hashtags,
        dependents: dependents.map(d => ({
          clientId: d.clientId,
          relationship: d.relationship,
        })),
      });
      toast({
        title: client ? 'Cliente atualizado' : 'Cliente criado',
        description: client 
          ? 'Cliente atualizado com sucesso' 
          : 'Novo cliente adicionado',
      });
      onClose();
      reset();
      setHashtags([]);
      setDependents([]);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar cliente',
        variant: 'destructive',
      });
    }
  };

  const addHashtag = () => {
    if (newHashtag.trim() && !hashtags.includes(newHashtag.trim())) {
      const updatedHashtags = [...hashtags, newHashtag.trim()];
      setHashtags(updatedHashtags);
      setValue('hashtags', updatedHashtags);
      setNewHashtag('');
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    const updatedHashtags = hashtags.filter((tag) => tag !== tagToRemove);
    setHashtags(updatedHashtags);
    setValue('hashtags', updatedHashtags);
  };

  const addDependent = (clientId: string, clientName: string, relationship: string) => {
    if (!dependents.find(d => d.clientId === clientId)) {
      const updatedDependents = [...dependents, { clientId, clientName, relationship }];
      setDependents(updatedDependents);
      setValue('dependents', updatedDependents.map(d => ({
        clientId: d.clientId,
        relationship: d.relationship,
      })));
    }
  };

  const removeDependent = (clientId: string) => {
    const updatedDependents = dependents.filter(d => d.clientId !== clientId);
    setDependents(updatedDependents);
    setValue('dependents', updatedDependents.map(d => ({
      clientId: d.clientId,
      relationship: d.relationship,
    })));
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const availableClients = allClients.filter(c => 
    c.id !== client?.id && !dependents.find(d => d.clientId === c.id)
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{client ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
            <DialogDescription>
              {client
                ? 'Atualize as informações do cliente'
                : 'Preencha os dados do novo cliente'}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
              <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
              <TabsTrigger value="painel">Painel</TabsTrigger>
              <TabsTrigger value="debitos">Débitos</TabsTrigger>
              <TabsTrigger value="creditos">Créditos</TabsTrigger>
              <TabsTrigger value="pacotes">Pacotes</TabsTrigger>
              <TabsTrigger value="vendas">Vendas</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
              <TabsTrigger value="anamnese">Anamnese</TabsTrigger>
            </TabsList>

            {/* ABA 1: CADASTRO */}
            <TabsContent value="cadastro" className="space-y-6 mt-6">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubmit(handleFormSubmit)(e);
                }} 
                id="client-form" 
                className="space-y-6"
              >
                {/* Foto do Cliente */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Foto do Cliente</h3>
                  <div className="flex justify-center">
                    <div className="w-full max-w-xs">
                      <ImageUpload
                        label=""
                        value={watch('photoPath')}
                        onChange={(path) => setValue('photoPath', path)}
                        onFileSelect={async (file) => {
                          // TODO: Implementar upload real para S3
                          const tempPath = `/uploads/clients/${file.name}`;
                          return tempPath;
                        }}
                        tooltip={<InfoTooltip content="Foto de perfil do cliente" />}
                      />
                    </div>
                  </div>
                </div>

                {/* Informações Básicas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informações Básicas</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Nome */}
                    <div>
                      <Label htmlFor="name">
                        Nome <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        {...register('name')}
                        placeholder="Nome completo do cliente"
                        className={errors.name ? 'border-red-500' : ''}
                        maxLength={100}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Apelido */}
                    <div>
                      <Label htmlFor="nickname">Apelido</Label>
                      <Input
                        id="nickname"
                        {...register('nickname')}
                        placeholder="Como prefere ser chamado"
                        maxLength={50}
                      />
                    </div>
                  </div>

                  {/* Contatos */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="cellPhone">
                        Celular <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="cellPhone"
                        {...register('cellPhone')}
                        placeholder="(00) 00000-0000"
                        className={errors.cellPhone ? 'border-red-500' : ''}
                      />
                      {errors.cellPhone && (
                        <p className="text-sm text-red-500 mt-1">{errors.cellPhone.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        {...register('phone')}
                        placeholder="(00) 0000-0000"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="cliente@email.com"
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Documentos */}
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="birthDate">Aniversário</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        {...register('birthDate')}
                      />
                    </div>

                    <div>
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        {...register('cnpj')}
                        placeholder="00.000.000/0000-00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        {...register('cpf')}
                        placeholder="000.000.000-00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="rg">RG</Label>
                      <Input
                        id="rg"
                        {...register('rg')}
                        placeholder="00.000.000-0"
                      />
                    </div>
                  </div>
                </div>

                {/* Dependentes */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Dependentes</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDependentModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Dependente
                    </Button>
                  </div>

                  {dependents.length > 0 && (
                    <div className="space-y-2">
                      {dependents.map((dep) => (
                        <div
                          key={dep.clientId}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{dep.clientName}</p>
                            <p className="text-sm text-muted-foreground">{dep.relationship}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDependent(dep.clientId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Indicado Por */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Indicação</h3>
                  <div>
                    <Label htmlFor="referredById" className="flex items-center gap-1">
                      Indicado por
                      <InfoTooltip content="Cliente que fez a indicação pode ganhar benefícios como descontos e promoções" />
                    </Label>
                    <Select
                      value={watch('referredById')}
                      onValueChange={(value) => setValue('referredById', value === 'none' ? '' : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cliente que indicou" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {availableClients.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Hashtags */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Hashtags</h3>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      Tags para identificação e categorização
                      <InfoTooltip content="Use hashtags para categorizar e encontrar clientes facilmente" />
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={newHashtag}
                        onChange={(e) => setNewHashtag(e.target.value)}
                        placeholder="Digite uma hashtag"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addHashtag();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addHashtag}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {hashtags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="gap-1">
                            #{tag}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => removeHashtag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Observações */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Observações</h3>
                  <div>
                    <Textarea
                      id="notes"
                      {...register('notes')}
                      placeholder="Observações sobre o cliente..."
                      rows={4}
                      maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {watch('notes')?.length || 0}/1000 caracteres
                    </p>
                  </div>
                </div>

                {/* Endereço */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Endereço</h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="zipCode">CEP</Label>
                      <Input
                        id="zipCode"
                        {...register('zipCode')}
                        placeholder="00000-000"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="street">Logradouro</Label>
                      <Input
                        id="street"
                        {...register('street')}
                        placeholder="Rua, Avenida, Travessa..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="number">Número</Label>
                      <Input
                        id="number"
                        {...register('number')}
                        placeholder="123"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        {...register('complement')}
                        placeholder="Apto, Bloco, Casa..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input
                        id="neighborhood"
                        {...register('neighborhood')}
                        placeholder="Centro"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="state">Estado</Label>
                      <Select
                        value={watch('state')}
                        onValueChange={(value) => setValue('state', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AC">AC</SelectItem>
                          <SelectItem value="AL">AL</SelectItem>
                          <SelectItem value="AP">AP</SelectItem>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="BA">BA</SelectItem>
                          <SelectItem value="CE">CE</SelectItem>
                          <SelectItem value="DF">DF</SelectItem>
                          <SelectItem value="ES">ES</SelectItem>
                          <SelectItem value="GO">GO</SelectItem>
                          <SelectItem value="MA">MA</SelectItem>
                          <SelectItem value="MT">MT</SelectItem>
                          <SelectItem value="MS">MS</SelectItem>
                          <SelectItem value="MG">MG</SelectItem>
                          <SelectItem value="PA">PA</SelectItem>
                          <SelectItem value="PB">PB</SelectItem>
                          <SelectItem value="PR">PR</SelectItem>
                          <SelectItem value="PE">PE</SelectItem>
                          <SelectItem value="PI">PI</SelectItem>
                          <SelectItem value="RJ">RJ</SelectItem>
                          <SelectItem value="RN">RN</SelectItem>
                          <SelectItem value="RS">RS</SelectItem>
                          <SelectItem value="RO">RO</SelectItem>
                          <SelectItem value="RR">RR</SelectItem>
                          <SelectItem value="SC">SC</SelectItem>
                          <SelectItem value="SP">SP</SelectItem>
                          <SelectItem value="SE">SE</SelectItem>
                          <SelectItem value="TO">TO</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        {...register('city')}
                        placeholder="Nome da cidade"
                      />
                    </div>
                  </div>
                </div>

                {/* Redes Sociais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Redes Sociais</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="instagram">Instagram</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">@</span>
                        <Input
                          id="instagram"
                          {...register('instagram')}
                          placeholder="instagram.com/"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="facebook">Facebook</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">@</span>
                        <Input
                          id="facebook"
                          {...register('facebook')}
                          placeholder="facebook.com/"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Configurações */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Configurações</h3>
                  
                  {/* Desconto Padrão */}
                  <div>
                    <Label className="flex items-center gap-1 mb-2">
                      Desconto Padrão
                      <InfoTooltip content="Desconto aplicado automaticamente para este cliente" />
                    </Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Input
                          type="number"
                          {...register('defaultDiscount', { valueAsNumber: true })}
                          placeholder="0,00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <Select
                          value={watch('defaultDiscountType')}
                          onValueChange={(value: any) => setValue('defaultDiscountType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FIXED">R$</SelectItem>
                            <SelectItem value="PERCENT">%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Select
                          value={watch('defaultDiscountTarget')}
                          onValueChange={(value: any) => setValue('defaultDiscountTarget', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ITEM">No Item</SelectItem>
                            <SelectItem value="BILL">Na Comanda</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switches */}
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Ativo</Label>
                        <p className="text-sm text-muted-foreground">
                          Desative um cliente para que ele não apareça mais em agendamentos, comandas etc.
                        </p>
                      </div>
                      <Switch
                        checked={watch('active')}
                        onCheckedChange={(checked) => setValue('active', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificações</Label>
                        <p className="text-sm text-muted-foreground">
                          O cliente irá receber notificações (Whatsapp e SMS) sobre novos agendamentos, lembretes etc.
                        </p>
                      </div>
                      <Switch
                        checked={watch('notificationsEnabled')}
                        onCheckedChange={(checked) => setValue('notificationsEnabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Bloquear acesso</Label>
                        <p className="text-sm text-muted-foreground">
                          Ao bloquear o cliente não terá acesso ao Agendamento Online ou Aplicativo Personalizado.
                        </p>
                      </div>
                      <Switch
                        checked={watch('onlineBookingBlocked')}
                        onCheckedChange={(checked) => setValue('onlineBookingBlocked', checked)}
                      />
                    </div>
                  </div>
                </div>
              </form>
            </TabsContent>

            {/* ABA 2: PAINEL */}
            <TabsContent value="painel" className="space-y-6 mt-6">
              {!client ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Salve o cliente primeiro para visualizar o painel de informações</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* KPIs Cards - Linha 1 */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Dias sem vir */}
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-500 rounded-lg">
                              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-3xl font-bold text-purple-700">
                                {(client as any)?.daysSinceLastVisit || 0}
                              </p>
                              <p className="text-sm text-purple-600 font-medium">dia sem vir</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Última avaliação NPS */}
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-500 rounded-lg">
                              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-3xl font-bold text-blue-700">
                                {(client as any)?.lastNpsScore !== undefined ? (client as any).lastNpsScore : 'Sem avaliação'}
                              </p>
                              <p className="text-sm text-blue-600 font-medium">Última avaliação</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Faturamento */}
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-500 rounded-lg">
                              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-3xl font-bold text-green-700">
                                R$ {((client as any)?.totalRevenue || 0).toFixed(2)}
                              </p>
                              <p className="text-sm text-green-600 font-medium">Faturamento</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* KPIs Cards - Linha 2 */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Débitos */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              R$ {((client as any)?.debts || 0).toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">Débitos</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Pacotes em aberto */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              {(client as any)?.openPackages || 0}
                            </p>
                            <p className="text-xs text-muted-foreground">Pacotes em aberto</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Crédito */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              R$ {((client as any)?.credits || 0).toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">Crédito</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Cashback */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              R$ {((client as any)?.cashback || 0).toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">Cashback</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* KPIs Cards - Linha 3 */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Taxa de cancelamento */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              {((client as any)?.cancellationRate || 0)}%
                            </p>
                            <p className="text-xs text-muted-foreground">Taxa de cancelamento</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tempo como cliente */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              {(client as any)?.daysAsClient || 24} Dias
                            </p>
                            <p className="text-xs text-muted-foreground">Tempo como cliente</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Taxa de retorno */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-teal-100 rounded-lg">
                            <svg className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              {(client as any)?.returnRate !== undefined ? (client as any).returnRate : 'Sem retorno'}
                            </p>
                            <p className="text-xs text-muted-foreground">Taxa de retorno</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Listas de Serviços e Produtos */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Últimos Serviços */}
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Últimos serviços</h3>
                        <div className="space-y-3">
                          {((client as any)?.recentServices || []).length > 0 ? (
                            ((client as any).recentServices || []).map((service: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{service.description || 'Serviço'}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {service.professional || 'Profissional'} • {service.date || 'Data'}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                              <div className="p-4 bg-muted rounded-full mb-3">
                                <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                              </div>
                              <p className="text-sm text-muted-foreground">Não há dados</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Últimos Produtos */}
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Últimos produtos</h3>
                        <div className="space-y-3">
                          {((client as any)?.recentProducts || []).length > 0 ? (
                            ((client as any).recentProducts || []).map((product: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{product.name || 'Produto'}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Qtd: {product.quantity || 0} • {product.date || 'Data'}
                                  </p>
                                </div>
                                <p className="text-sm font-semibold">
                                  R$ {(product.price || 0).toFixed(2)}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                              <div className="p-4 bg-muted rounded-full mb-3">
                                <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              </div>
                              <p className="text-sm text-muted-foreground">Não há dados</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Gráfico de Faturamento ao longo do tempo */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Faturamento ao longo do tempo</h3>
                      <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                        <div className="text-center">
                          <svg className="h-12 w-12 text-muted-foreground mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <p className="text-sm text-muted-foreground">
                            Gráfico em desenvolvimento
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Aqui será exibido o histórico de faturamento
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* ABA 3: DÉBITOS */}
            <TabsContent value="debitos" className="space-y-6 mt-6">
              {!client ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Salve o cliente primeiro para visualizar os débitos</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Débitos */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-red-100 rounded-lg">
                            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">Débitos</h3>
                            <p className="text-sm text-muted-foreground">
                              Valores pendentes de pagamento
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-2xl font-bold text-red-600">
                            Total R$ {((client as any)?.totalDebts || 0).toFixed(2)}
                          </span>
                          <Button variant="outline" size="sm" className="ml-2">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                          </Button>
                        </div>
                      </div>

                      {/* Tabela de Débitos */}
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead>Descrição</TableHead>
                              <TableHead>Vencimento</TableHead>
                              <TableHead className="text-right">Valor</TableHead>
                              <TableHead className="text-center">Status</TableHead>
                              <TableHead className="text-center">Pagar</TableHead>
                              <TableHead className="text-center">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {((client as any)?.debts || []).length > 0 ? (
                              ((client as any).debts || []).map((debt: any, index: number) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{debt.description || 'Débito'}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {debt.reference || 'Sem referência'}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      {debt.dueDate ? new Date(debt.dueDate).toLocaleDateString('pt-BR') : '-'}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <span className="font-semibold text-red-600">
                                      R$ {(debt.amount || 0).toFixed(2)}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge 
                                      variant={debt.status === 'overdue' ? 'destructive' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {debt.status === 'overdue' ? 'Vencido' : 'Pendente'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Button size="sm" variant="default">
                                      Pagar
                                    </Button>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                          </svg>
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                          <Eye className="h-4 w-4 mr-2" />
                                          Ver detalhes
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          <Edit className="h-4 w-4 mr-2" />
                                          Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive">
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Excluir
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={6} className="h-32">
                                  <div className="flex flex-col items-center justify-center text-center">
                                    <div className="p-4 bg-muted rounded-full mb-3">
                                      <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Nenhum item encontrado</p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Comandas em Aberto */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-orange-100 rounded-lg">
                            <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">Comandas em aberto</h3>
                            <p className="text-sm text-muted-foreground">
                              Atendimentos em andamento ou pendentes
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-2xl font-bold text-orange-600">
                            Total R$ {((client as any)?.totalOpenBills || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Tabela de Comandas */}
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead>Comanda</TableHead>
                              <TableHead>Data</TableHead>
                              <TableHead className="text-right">Valor</TableHead>
                              <TableHead className="text-center">Status</TableHead>
                              <TableHead className="text-center">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {((client as any)?.openBills || []).length > 0 ? (
                              ((client as any).openBills || []).map((bill: any, index: number) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">
                                        Comanda #{bill.number || index + 1}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {bill.services?.length || 0} serviço(s) • {bill.products?.length || 0} produto(s)
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      {bill.date ? new Date(bill.date).toLocaleDateString('pt-BR') : '-'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {bill.date ? new Date(bill.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <span className="font-semibold text-orange-600">
                                      R$ {(bill.total || 0).toFixed(2)}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge 
                                      variant={bill.status === 'open' ? 'default' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {bill.status === 'open' ? 'Aberta' : bill.status === 'in_progress' ? 'Em andamento' : 'Pendente'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <Button size="sm" variant="outline">
                                        <Eye className="h-4 w-4 mr-1" />
                                        Ver
                                      </Button>
                                      <Button size="sm" variant="default">
                                        Fechar
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={5} className="h-32">
                                  <div className="flex flex-col items-center justify-center text-center">
                                    <div className="p-4 bg-muted rounded-full mb-3">
                                      <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Nenhum item encontrado</p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* ABA 4: CRÉDITOS */}
            <TabsContent value="creditos" className="space-y-6 mt-6">
              {!client ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Salve o cliente primeiro para visualizar os créditos</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Créditos Disponíveis */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-green-100 rounded-lg">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">Créditos</h3>
                            <p className="text-sm text-muted-foreground">
                              Saldo disponível para uso
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-2xl font-bold text-green-600">
                            Total R$ {((client as any)?.totalCredits || 0).toFixed(2)}
                          </span>
                          <Button variant="outline" size="sm" className="ml-2">
                            <Plus className="h-4 w-4 mr-1" />
                            Adicionar
                          </Button>
                        </div>
                      </div>

                      {/* Tabela de Créditos */}
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead>Descrição</TableHead>
                              <TableHead>Data</TableHead>
                              <TableHead>Tipo</TableHead>
                              <TableHead className="text-right">Valor Original</TableHead>
                              <TableHead className="text-right">Valor Usado</TableHead>
                              <TableHead className="text-right">Saldo</TableHead>
                              <TableHead className="text-center">Validade</TableHead>
                              <TableHead className="text-center">Status</TableHead>
                              <TableHead className="text-center">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {((client as any)?.credits || []).length > 0 ? (
                              ((client as any).credits || []).map((credit: any, index: number) => {
                                const balance = (credit.originalAmount || 0) - (credit.usedAmount || 0);
                                const isExpired = credit.expiryDate && new Date(credit.expiryDate) < new Date();
                                const isExpiringSoon = credit.expiryDate && 
                                  new Date(credit.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && 
                                  !isExpired;

                                return (
                                  <TableRow key={index}>
                                    <TableCell>
                                      <div>
                                        <p className="font-medium">{credit.description || 'Crédito'}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {credit.reference || credit.origin || 'Crédito manual'}
                                        </p>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="text-sm">
                                        {credit.date ? new Date(credit.date).toLocaleDateString('pt-BR') : '-'}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className="text-xs">
                                        {credit.type === 'refund' ? 'Reembolso' : 
                                         credit.type === 'promotion' ? 'Promoção' :
                                         credit.type === 'cashback' ? 'Cashback' :
                                         credit.type === 'loyalty' ? 'Fidelidade' :
                                         'Manual'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <span className="text-sm font-medium">
                                        R$ {(credit.originalAmount || 0).toFixed(2)}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <span className="text-sm text-muted-foreground">
                                        R$ {(credit.usedAmount || 0).toFixed(2)}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <span className="text-sm font-semibold text-green-600">
                                        R$ {balance.toFixed(2)}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <div className="text-sm">
                                        {credit.expiryDate ? (
                                          <span className={isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : ''}>
                                            {new Date(credit.expiryDate).toLocaleDateString('pt-BR')}
                                          </span>
                                        ) : (
                                          <span className="text-muted-foreground">Sem validade</span>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <Badge 
                                        variant={
                                          isExpired ? 'destructive' : 
                                          balance <= 0 ? 'secondary' : 
                                          isExpiringSoon ? 'default' : 
                                          'default'
                                        }
                                        className={
                                          isExpired ? '' : 
                                          balance <= 0 ? '' : 
                                          isExpiringSoon ? 'bg-orange-500' : 
                                          'bg-green-500'
                                        }
                                      >
                                        {isExpired ? 'Expirado' : 
                                         balance <= 0 ? 'Usado' : 
                                         isExpiringSoon ? 'Expira em breve' : 
                                         'Disponível'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                            </svg>
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem>
                                            <Eye className="h-4 w-4 mr-2" />
                                            Ver histórico
                                          </DropdownMenuItem>
                                          <DropdownMenuItem>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Editar
                                          </DropdownMenuItem>
                                          {balance > 0 && !isExpired && (
                                            <DropdownMenuItem>
                                              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                              </svg>
                                              Usar crédito
                                            </DropdownMenuItem>
                                          )}
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem className="text-destructive">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Excluir
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            ) : (
                              <TableRow>
                                <TableCell colSpan={9} className="h-32">
                                  <div className="flex flex-col items-center justify-center text-center">
                                    <div className="p-4 bg-muted rounded-full mb-3">
                                      <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Nenhum crédito encontrado</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Clique em "Adicionar" para criar um novo crédito
                                    </p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Resumo de Créditos */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              R$ {((client as any)?.availableCredits || 0).toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">Créditos disponíveis</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              R$ {((client as any)?.usedCredits || 0).toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">Créditos utilizados</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              R$ {((client as any)?.expiringCredits || 0).toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">Expirando em breve</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              R$ {((client as any)?.expiredCredits || 0).toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">Créditos expirados</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Outras abas - Placeholder por enquanto */}
            <TabsContent value="historico" className="space-y-6 mt-6">
              <div className="text-center py-12 text-muted-foreground">
                Aba Histórico - Em desenvolvimento
              </div>
            </TabsContent>

            <TabsContent value="pacotes" className="space-y-6 mt-6">
              <div className="text-center py-12 text-muted-foreground">
                Aba Pacotes - Em desenvolvimento
              </div>
            </TabsContent>

            <TabsContent value="vendas" className="space-y-6 mt-6">
              <div className="text-center py-12 text-muted-foreground">
                Aba Créditos - Em desenvolvimento
              </div>
            </TabsContent>

            <TabsContent value="vendas" className="space-y-6 mt-6">
              <div className="text-center py-12 text-muted-foreground">
                Aba Vendas - Em desenvolvimento
              </div>
            </TabsContent>

            <TabsContent value="anamnese" className="space-y-6 mt-6">
              <div className="text-center py-12 text-muted-foreground">
                Aba Anamnese - Em desenvolvimento
              </div>
            </TabsContent>

            <TabsContent value="avaliacoes" className="space-y-6 mt-6">
              <div className="text-center py-12 text-muted-foreground">
                Aba Avaliações - Em desenvolvimento
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer com botões de ação */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="client-form"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para adicionar dependente */}
      <DependentSelectorModal
        isOpen={showDependentModal}
        onClose={() => setShowDependentModal(false)}
        onSelect={addDependent}
        availableClients={availableClients}
      />
    </>
  );
}

// Modal para selecionar dependente
interface DependentSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (clientId: string, clientName: string, relationship: string) => void;
  availableClients: Client[];
}

function DependentSelectorModal({
  isOpen,
  onClose,
  onSelect,
  availableClients,
}: DependentSelectorModalProps) {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [relationship, setRelationship] = useState('');

  const handleSubmit = () => {
    if (selectedClientId && relationship) {
      const client = availableClients.find(c => c.id === selectedClientId);
      if (client) {
        onSelect(client.id, client.name, relationship);
        setSelectedClientId('');
        setRelationship('');
        onClose();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Dependente</DialogTitle>
          <DialogDescription>
            Selecione um cliente existente como dependente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Cliente Dependente</Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {availableClients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Relação Familiar</Label>
            <Select value={relationship} onValueChange={setRelationship}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o parentesco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="filho">Filho(a)</SelectItem>
                <SelectItem value="pai">Pai</SelectItem>
                <SelectItem value="mae">Mãe</SelectItem>
                <SelectItem value="irmao">Irmão(ã)</SelectItem>
                <SelectItem value="conjuge">Cônjuge</SelectItem>
                <SelectItem value="avo">Avô(ó)</SelectItem>
                <SelectItem value="neto">Neto(a)</SelectItem>
                <SelectItem value="tio">Tio(a)</SelectItem>
                <SelectItem value="sobrinho">Sobrinho(a)</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedClientId || !relationship}
          >
            Adicionar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
