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
  
  // Estados para a aba Mensagens
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  // Estados para a aba Anotações
  const [newNote, setNewNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [notesList, setNotesList] = useState<Array<{
    id: string;
    content: string;
    createdAt: string;
    createdBy: string;
  }>>([]);
  
  // Estados para a aba Anamneses
  const [showAnamnesisModal, setShowAnamnesisModal] = useState(false);
  const [anamnesisTab, setAnamnesisTab] = useState('dados');
  const [selectedAnamnesisTemplate, setSelectedAnamnesisTemplate] = useState('');
  const [anamnesisStatus, setAnamnesisStatus] = useState<'OPEN' | 'CLOSED'>('OPEN');
  const [anamnesisSignature, setAnamnesisSignature] = useState('');
  const [anamnesisLink, setAnamnesisLink] = useState('');
  const [isSavingAnamnesis, setIsSavingAnamnesis] = useState(false);

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
        setNotesList((client as any).notes_list || []);
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
        setNotesList([]);
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
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
              <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
              <TabsTrigger value="painel">Painel</TabsTrigger>
              <TabsTrigger value="debitos">Débitos</TabsTrigger>
              <TabsTrigger value="creditos">Créditos</TabsTrigger>
              <TabsTrigger value="pacotes">Pacotes</TabsTrigger>
              <TabsTrigger value="vendas">Vendas</TabsTrigger>
              <TabsTrigger value="agendamentos">Agendamentos</TabsTrigger>
              <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
              <TabsTrigger value="anotacoes">Anotações</TabsTrigger>
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

            {/* ABA 5: PACOTES */}
            <TabsContent value="pacotes" className="space-y-6 mt-6">
              {!client ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Salve o cliente primeiro para visualizar os pacotes</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-purple-100 rounded-lg">
                            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">Pacotes</h3>
                            <p className="text-sm text-muted-foreground">
                              Pacotes contratados pelo cliente
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select defaultValue="all-balance">
                            <SelectTrigger className="w-[160px]">
                              <SelectValue placeholder="Saldo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all-balance">Todos</SelectItem>
                              <SelectItem value="with-balance">Com saldo</SelectItem>
                              <SelectItem value="no-balance">Sem saldo</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select defaultValue="all-status">
                            <SelectTrigger className="w-[160px]">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all-status">Todos</SelectItem>
                              <SelectItem value="billed">Faturados</SelectItem>
                              <SelectItem value="open">Em aberto</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Tabela de Pacotes */}
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead>Pacote</TableHead>
                              <TableHead>Data</TableHead>
                              <TableHead>Descrição</TableHead>
                              <TableHead className="text-center">Qtde.</TableHead>
                              <TableHead className="text-center">Saldo</TableHead>
                              <TableHead className="text-center">Status</TableHead>
                              <TableHead className="text-center">Disponibilidade</TableHead>
                              <TableHead className="text-center">Comandas</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {((client as any)?.packages || []).length > 0 ? (
                              ((client as any).packages || []).map((pkg: any, index: number) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{pkg.name || `Pacote #${index + 1}`}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {pkg.code || 'Sem código'}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      {pkg.date ? new Date(pkg.date).toLocaleDateString('pt-BR') : '-'}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm max-w-xs truncate">
                                      {pkg.description || 'Sem descrição'}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span className="text-sm font-medium">
                                      {pkg.quantity || 0}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span className={`text-sm font-semibold ${(pkg.balance || 0) > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                      {pkg.balance || 0}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge 
                                      variant={pkg.status === 'billed' ? 'default' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {pkg.status === 'billed' ? 'Faturado' : 'Em aberto'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge 
                                      variant={(pkg.balance || 0) > 0 ? 'default' : 'secondary'}
                                      className={`text-xs ${(pkg.balance || 0) > 0 ? 'bg-green-500' : ''}`}
                                    >
                                      {(pkg.balance || 0) > 0 ? 'Disponível' : 'Esgotado'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Button size="sm" variant="outline">
                                      <Eye className="h-4 w-4 mr-1" />
                                      Ver
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={8} className="h-32">
                                  <div className="flex flex-col items-center justify-center text-center">
                                    <div className="p-4 bg-muted rounded-full mb-3">
                                      <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
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

            {/* ABA 6: VENDAS */}
            <TabsContent value="vendas" className="space-y-6 mt-6">
              {!client ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Salve o cliente primeiro para visualizar as vendas</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">Vendas</h3>
                            <p className="text-sm text-muted-foreground">
                              Histórico de vendas e produtos
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="date"
                            placeholder="Data inicial"
                            className="w-[140px]"
                          />
                          <span className="text-sm text-muted-foreground">até</span>
                          <Input
                            type="date"
                            placeholder="Data final"
                            className="w-[140px]"
                          />
                        </div>
                      </div>

                      {/* Tabela de Vendas */}
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead>Comanda</TableHead>
                              <TableHead>Data</TableHead>
                              <TableHead>Descrição</TableHead>
                              <TableHead className="text-right">Valor</TableHead>
                              <TableHead className="text-center">Profissional</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {((client as any)?.sales || []).length > 0 ? (
                              ((client as any).sales || []).map((sale: any, index: number) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">
                                        {sale.billNumber ? `#${sale.billNumber}` : '-'}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {sale.type === 'product' ? 'Produto' : 'Serviço'}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      {sale.date ? new Date(sale.date).toLocaleDateString('pt-BR') : '-'}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <p className="text-sm font-medium">{sale.description || 'Venda'}</p>
                                      {sale.quantity && (
                                        <p className="text-xs text-muted-foreground">
                                          Qtd: {sale.quantity}
                                        </p>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <span className="font-semibold text-green-600">
                                      R$ {(sale.amount || 0).toFixed(2)}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span className="text-sm">
                                      {sale.professional || '-'}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={5} className="h-32">
                                  <div className="flex flex-col items-center justify-center text-center">
                                    <div className="p-4 bg-muted rounded-full mb-3">
                                      <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
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

            {/* ABA 7: AGENDAMENTOS - Needs to be added to TabsList */}
            <TabsContent value="agendamentos" className="space-y-6 mt-6">
              {!client ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Salve o cliente primeiro para visualizar os agendamentos</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-indigo-100 rounded-lg">
                            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">Agendamentos</h3>
                            <p className="text-sm text-muted-foreground">
                              Histórico de agendamentos do cliente
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="date"
                            placeholder="Data inicial"
                            className="w-[140px]"
                          />
                          <span className="text-sm text-muted-foreground">até</span>
                          <Input
                            type="date"
                            placeholder="Data final"
                            className="w-[140px]"
                          />
                        </div>
                      </div>

                      {/* Tabela de Agendamentos */}
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead>Data</TableHead>
                              <TableHead>Serviço</TableHead>
                              <TableHead className="text-center">Status</TableHead>
                              <TableHead className="text-center">Profissional</TableHead>
                              <TableHead className="text-center">Comanda</TableHead>
                              <TableHead className="text-center">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {((client as any)?.appointments || []).length > 0 ? (
                              ((client as any).appointments || []).map((appointment: any, index: number) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <div>
                                      <p className="text-sm font-medium">
                                        {appointment.date ? new Date(appointment.date).toLocaleDateString('pt-BR') : '-'}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {appointment.time || '-'}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <p className="text-sm font-medium">{appointment.service || 'Serviço'}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {appointment.duration ? `${appointment.duration} min` : '-'}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge 
                                      variant={
                                        appointment.status === 'completed' ? 'default' :
                                        appointment.status === 'confirmed' ? 'default' :
                                        appointment.status === 'cancelled' ? 'destructive' :
                                        'secondary'
                                      }
                                      className={
                                        appointment.status === 'completed' ? 'bg-green-500' :
                                        appointment.status === 'confirmed' ? 'bg-blue-500' :
                                        appointment.status === 'cancelled' ? '' :
                                        ''
                                      }
                                    >
                                      {appointment.status === 'completed' ? 'Concluído' :
                                       appointment.status === 'confirmed' ? 'Confirmado' :
                                       appointment.status === 'cancelled' ? 'Cancelado' :
                                       'Pendente'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span className="text-sm">
                                      {appointment.professional || '-'}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span className="text-sm">
                                      {appointment.billNumber ? `#${appointment.billNumber}` : '-'}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Button size="sm" variant="outline">
                                      <Eye className="h-4 w-4 mr-1" />
                                      Ver
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={6} className="h-32">
                                  <div className="flex flex-col items-center justify-center text-center">
                                    <div className="p-4 bg-muted rounded-full mb-3">
                                      <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

            {/* ABA 8: MENSAGENS */}
            <TabsContent value="mensagens" className="space-y-6 mt-6">
              {!client ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Salve o cliente primeiro para enviar mensagens</p>
                </div>
              ) : !client.cellPhone ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-orange-100 rounded-full">
                      <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium">Número de celular não cadastrado</p>
                    <p className="text-xs text-muted-foreground">Adicione um número de celular na aba Cadastro para enviar mensagens</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Seção de Envio de Mensagens */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-green-100 rounded-lg">
                          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Enviar Mensagem WhatsApp</h3>
                          <p className="text-sm text-muted-foreground">
                            Envie mensagens personalizadas para o cliente
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Número de Celular */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Número de Celular</Label>
                          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
                            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span className="font-mono text-base font-medium">{client.cellPhone}</span>
                            <Badge variant="default" className="ml-auto bg-green-500">
                              WhatsApp
                            </Badge>
                          </div>
                        </div>

                        {/* Seleção de Mensagem Pré-definida */}
                        <div className="space-y-2">
                          <Label htmlFor="template" className="text-sm font-medium">
                            Mensagem Pré-definida
                            <span className="text-xs text-muted-foreground ml-2">(Opcional)</span>
                          </Label>
                          <Select
                            value={selectedTemplate}
                            onValueChange={(value) => {
                              setSelectedTemplate(value);
                              if (value && value !== 'custom') {
                                // Quando houver integração com o módulo de WhatsApp,
                                // aqui será carregado o conteúdo do template
                                const templates: Record<string, string> = {
                                  'welcome': `Olá ${client.name}! 👋\n\nSeja bem-vindo(a) ao nosso salão! Estamos felizes em tê-lo(a) como nosso cliente.\n\nQualquer dúvida, estamos à disposição!`,
                                  'appointment': `Olá ${client.name}! 😊\n\nGostaríamos de lembrá-lo(a) sobre seu agendamento.\n\nAguardamos você!`,
                                  'birthday': `Parabéns ${client.name}! 🎉🎂\n\nDesejamos um feliz aniversário! Preparamos um presente especial para você.\n\nVenha nos visitar!`,
                                  'promotion': `Olá ${client.name}! ✨\n\nTemos uma promoção especial para você!\n\nNão perca essa oportunidade!`,
                                  'thanks': `Olá ${client.name}! 💚\n\nObrigado por sua visita! Foi um prazer atendê-lo(a).\n\nEsperamos vê-lo(a) em breve!`,
                                };
                                setCustomMessage(templates[value] || '');
                              } else if (value === 'custom') {
                                setCustomMessage('');
                              }
                            }}
                          >
                            <SelectTrigger id="template">
                              <SelectValue placeholder="Selecione uma mensagem ou crie uma personalizada" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="custom">
                                <div className="flex items-center gap-2">
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  <span>Mensagem personalizada</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="welcome">
                                <div className="flex items-center gap-2">
                                  <span>👋</span>
                                  <span>Boas-vindas</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="appointment">
                                <div className="flex items-center gap-2">
                                  <span>📅</span>
                                  <span>Lembrete de agendamento</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="birthday">
                                <div className="flex items-center gap-2">
                                  <span>🎂</span>
                                  <span>Feliz aniversário</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="promotion">
                                <div className="flex items-center gap-2">
                                  <span>✨</span>
                                  <span>Promoção especial</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="thanks">
                                <div className="flex items-center gap-2">
                                  <span>💚</span>
                                  <span>Agradecimento</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Campo de Mensagem Personalizada */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="message" className="text-sm font-medium">
                              Mensagem
                            </Label>
                            <span className="text-xs text-muted-foreground">
                              {customMessage.length} caracteres
                            </span>
                          </div>
                          <Textarea
                            id="message"
                            placeholder="Digite sua mensagem aqui..."
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            className="min-h-[150px] resize-none"
                            maxLength={1000}
                          />
                          <p className="text-xs text-muted-foreground">
                            Dica: Use emojis para tornar suas mensagens mais amigáveis! 😊
                          </p>
                        </div>

                        {/* Botão de Envio */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>A mensagem será enviada via WhatsApp</span>
                          </div>
                          <Button
                            type="button"
                            disabled={!customMessage.trim() || isSendingMessage}
                            onClick={async () => {
                              setIsSendingMessage(true);
                              try {
                                // Aqui será integrado com a API do WhatsApp
                                // Por enquanto, apenas simula o envio
                                await new Promise(resolve => setTimeout(resolve, 1500));
                                
                                // Abrir WhatsApp Web com a mensagem
                                const phoneNumber = client.cellPhone?.replace(/\D/g, '');
                                const encodedMessage = encodeURIComponent(customMessage);
                                window.open(`https://wa.me/55${phoneNumber}?text=${encodedMessage}`, '_blank');
                                
                                toast({
                                  title: 'Mensagem preparada!',
                                  description: 'O WhatsApp foi aberto. Clique em enviar para confirmar.',
                                });
                                
                                // Limpar campos após "envio"
                                setCustomMessage('');
                                setSelectedTemplate('');
                              } catch (error) {
                                toast({
                                  title: 'Erro ao enviar mensagem',
                                  description: 'Tente novamente mais tarde.',
                                  variant: 'destructive',
                                });
                              } finally {
                                setIsSendingMessage(false);
                              }
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white gap-2"
                          >
                            {isSendingMessage ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Enviando...
                              </>
                            ) : (
                              <>
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                Enviar no WhatsApp
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Histórico de Mensagens */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">Histórico de Mensagens</h3>
                            <p className="text-sm text-muted-foreground">
                              Mensagens enviadas para o cliente
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Atualizar
                        </Button>
                      </div>

                      {/* Timeline de Mensagens */}
                      <div className="space-y-4">
                        {((client as any)?.messages || []).length > 0 ? (
                          <div className="space-y-3">
                            {((client as any).messages || []).map((message: any, index: number) => (
                              <div key={index} className="flex gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                                <div className="flex-shrink-0">
                                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                  </div>
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">
                                        {message.type === 'template' ? message.templateName : 'Mensagem personalizada'}
                                      </span>
                                      {message.type === 'template' && (
                                        <Badge variant="secondary" className="text-xs">
                                          Template
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">
                                        {message.date ? new Date(message.date).toLocaleDateString('pt-BR') : '-'}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {message.time || '-'}
                                      </span>
                                      <Badge 
                                        variant={
                                          message.status === 'sent' ? 'default' :
                                          message.status === 'delivered' ? 'default' :
                                          message.status === 'read' ? 'default' :
                                          'secondary'
                                        }
                                        className={`text-xs ${
                                          message.status === 'sent' ? 'bg-blue-500' :
                                          message.status === 'delivered' ? 'bg-green-500' :
                                          message.status === 'read' ? 'bg-purple-500' :
                                          ''
                                        }`}
                                      >
                                        {message.status === 'sent' ? 'Enviada' :
                                         message.status === 'delivered' ? 'Entregue' :
                                         message.status === 'read' ? 'Lida' :
                                         'Pendente'}
                                      </Badge>
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {message.content || 'Sem conteúdo'}
                                  </p>
                                  {message.sentBy && (
                                    <p className="text-xs text-muted-foreground">
                                      Enviada por: {message.sentBy}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="p-4 bg-muted rounded-full mb-3">
                              <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                            </div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Nenhuma mensagem enviada ainda
                            </p>
                            <p className="text-xs text-muted-foreground">
                              As mensagens enviadas aparecerão aqui
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* ABA 9: ANOTAÇÕES */}
            <TabsContent value="anotacoes" className="space-y-6 mt-6">
              {!client ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Salve o cliente primeiro para adicionar anotações</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Seção de Nova Anotação */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-amber-100 rounded-lg">
                          <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">Nova Anotação</h3>
                          <p className="text-sm text-muted-foreground">
                            Adicione observações importantes sobre o cliente
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Campo de Nova Anotação */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="new-note" className="text-sm font-medium">
                              Conteúdo da Anotação
                            </Label>
                            <span className="text-xs text-muted-foreground">
                              {newNote.length} / 2000 caracteres
                            </span>
                          </div>
                          <Textarea
                            id="new-note"
                            placeholder="Digite aqui suas observações sobre o cliente...&#10;&#10;Exemplos:&#10;• Preferências de serviços&#10;• Alergias ou restrições&#10;• Feedback de atendimentos anteriores&#10;• Lembretes importantes"
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            className="min-h-[180px] resize-none"
                            maxLength={2000}
                          />
                          <div className="flex items-start gap-2 text-xs text-muted-foreground">
                            <svg className="h-4 w-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>
                              As anotações são privadas e visíveis apenas para a equipe do salão. 
                              Use este espaço para registrar informações relevantes que ajudem a melhorar o atendimento.
                            </span>
                          </div>
                        </div>

                        {/* Botão de Salvar */}
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            disabled={!newNote.trim() || isSavingNote}
                            onClick={async () => {
                              setIsSavingNote(true);
                              try {
                                // Simula salvamento
                                await new Promise(resolve => setTimeout(resolve, 800));
                                
                                // Adiciona a nova anotação ao histórico
                                const newNoteItem = {
                                  id: `note-${Date.now()}`,
                                  content: newNote,
                                  createdAt: new Date().toISOString(),
                                  createdBy: 'Usuário Atual', // Substituir pelo nome do usuário logado
                                };
                                
                                setNotesList([newNoteItem, ...notesList]);
                                
                                toast({
                                  title: 'Anotação salva!',
                                  description: 'A anotação foi adicionada com sucesso.',
                                });
                                
                                // Limpar campo
                                setNewNote('');
                              } catch (error) {
                                toast({
                                  title: 'Erro ao salvar anotação',
                                  description: 'Tente novamente mais tarde.',
                                  variant: 'destructive',
                                });
                              } finally {
                                setIsSavingNote(false);
                              }
                            }}
                            className="gap-2"
                          >
                            {isSavingNote ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Salvando...
                              </>
                            ) : (
                              <>
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Salvar Anotação
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Histórico de Anotações */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-slate-100 rounded-lg">
                            <svg className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">Histórico de Anotações</h3>
                            <p className="text-sm text-muted-foreground">
                              {notesList.length > 0 
                                ? `${notesList.length} anotaç${notesList.length === 1 ? 'ão' : 'ões'} registrada${notesList.length === 1 ? '' : 's'}`
                                : 'Nenhuma anotação ainda'}
                            </p>
                          </div>
                        </div>
                        {notesList.length > 0 && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              // Aqui poderia ter uma função de exportar ou filtrar
                              toast({
                                title: 'Em desenvolvimento',
                                description: 'Funcionalidade de filtros em breve.',
                              });
                            }}
                          >
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Filtrar
                          </Button>
                        )}
                      </div>

                      {/* Lista de Anotações */}
                      <div className="space-y-4">
                        {/* Combina anotações do cliente existente com as novas */}
                        {[...notesList, ...((client as any)?.notes_list || [])].length > 0 ? (
                          <div className="space-y-3">
                            {[...notesList, ...((client as any)?.notes_list || [])].map((note: any, index: number) => (
                              <div 
                                key={note.id || index} 
                                className="group relative p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                              >
                                {/* Header da Anotação */}
                                <div className="flex items-start justify-between gap-3 mb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                      <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">{note.createdBy || 'Usuário'}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {note.createdAt 
                                          ? new Date(note.createdAt).toLocaleDateString('pt-BR', {
                                              day: '2-digit',
                                              month: '2-digit',
                                              year: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })
                                          : '-'}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {/* Ações */}
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                      onClick={() => {
                                        setNewNote(note.content);
                                        toast({
                                          title: 'Anotação copiada',
                                          description: 'O conteúdo foi copiado para edição.',
                                        });
                                      }}
                                    >
                                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                      onClick={() => {
                                        if (confirm('Deseja realmente excluir esta anotação?')) {
                                          setNotesList(notesList.filter(n => n.id !== note.id));
                                          toast({
                                            title: 'Anotação excluída',
                                            description: 'A anotação foi removida com sucesso.',
                                          });
                                        }
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Conteúdo da Anotação */}
                                <div className="pl-10">
                                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                                    {note.content}
                                  </p>
                                </div>

                                {/* Tags/Categorias (futuro) */}
                                {note.tags && note.tags.length > 0 && (
                                  <div className="pl-10 mt-3 flex flex-wrap gap-1">
                                    {note.tags.map((tag: string, tagIndex: number) => (
                                      <Badge key={tagIndex} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="p-4 bg-muted rounded-full mb-4">
                              <svg className="h-10 w-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Nenhuma anotação registrada ainda
                            </p>
                            <p className="text-xs text-muted-foreground max-w-sm">
                              Comece adicionando observações importantes sobre este cliente no campo acima
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* ABA 10: ANAMNESES */}
            <TabsContent value="anamnese" className="space-y-6 mt-6">
              {!client ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Salve o cliente primeiro para gerenciar anamneses</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Header com botão de nova anamnese */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-teal-100 rounded-lg">
                            <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">Fichas de Anamnese</h3>
                            <p className="text-sm text-muted-foreground">
                              {((client as any)?.anamneses || []).length} ficha{((client as any)?.anamneses || []).length !== 1 ? 's' : ''} cadastrada{((client as any)?.anamneses || []).length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => {
                            setShowAnamnesisModal(true);
                            setAnamnesisTab('dados');
                            setSelectedAnamnesisTemplate('');
                            setAnamnesisStatus('OPEN');
                            setAnamnesisSignature('');
                            setAnamnesisLink('');
                          }}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Nova Ficha de Anamnese
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Lista de Anamneses */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {((client as any)?.anamneses || []).length > 0 ? (
                          <div className="space-y-3">
                            {((client as any).anamneses || []).map((anamnesis: any, index: number) => (
                              <div 
                                key={anamnesis.id || index}
                                className="group p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  {/* Info Principal */}
                                  <div className="flex-1 space-y-3">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          <h4 className="font-semibold text-base">
                                            {anamnesis.templateName || 'Anamnese Padrão'}
                                          </h4>
                                          <Badge 
                                            variant={anamnesis.status === 'CLOSED' ? 'default' : 'secondary'}
                                            className={anamnesis.status === 'CLOSED' ? 'bg-green-500' : ''}
                                          >
                                            {anamnesis.status === 'CLOSED' ? 'Fechado' : 'Aberto'}
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                          Criado em: {anamnesis.createdAt 
                                            ? new Date(anamnesis.createdAt).toLocaleDateString('pt-BR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              })
                                            : '-'}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Detalhes em Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t">
                                      <div>
                                        <p className="text-xs text-muted-foreground mb-1">Cliente</p>
                                        <p className="text-sm font-medium">{client.name}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-muted-foreground mb-1">CPF</p>
                                        <p className="text-sm font-mono">{(client as any).cpf || '-'}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-muted-foreground mb-1">Celular</p>
                                        <p className="text-sm font-mono">{client.cellPhone || '-'}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-muted-foreground mb-1">Criado por</p>
                                        <p className="text-sm">{anamnesis.createdBy || 'Sistema'}</p>
                                      </div>
                                    </div>

                                    {/* Ações e informações adicionais */}
                                    <div className="flex items-center justify-between pt-2">
                                      <div className="flex items-center gap-3">
                                        {anamnesis.signature && (
                                          <div className="flex items-center gap-1 text-xs text-green-600">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>Assinado</span>
                                          </div>
                                        )}
                                        {anamnesis.link && (
                                          <div className="flex items-center gap-1 text-xs text-blue-600">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                            <span>Link disponível</span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Botões de Ação */}
                                      <div className="flex items-center gap-1">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-8"
                                          onClick={() => {
                                            toast({
                                              title: 'Visualização em desenvolvimento',
                                              description: 'Em breve você poderá visualizar a ficha completa.',
                                            });
                                          }}
                                        >
                                          <Eye className="h-4 w-4 mr-1" />
                                          Visualizar
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-8"
                                          onClick={() => {
                                            toast({
                                              title: 'Edição em desenvolvimento',
                                              description: 'Em breve você poderá editar a ficha.',
                                            });
                                          }}
                                        >
                                          <Edit className="h-4 w-4 mr-1" />
                                          Editar
                                        </Button>
                                        {anamnesis.link && (
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8"
                                            onClick={() => {
                                              navigator.clipboard.writeText(anamnesis.link);
                                              toast({
                                                title: 'Link copiado!',
                                                description: 'O link foi copiado para a área de transferência.',
                                              });
                                            }}
                                          >
                                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            Copiar Link
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="p-4 bg-muted rounded-full mb-4">
                              <svg className="h-10 w-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Nenhuma ficha de anamnese cadastrada
                            </p>
                            <p className="text-xs text-muted-foreground max-w-sm mb-4">
                              Crie uma ficha de anamnese para registrar informações detalhadas sobre o cliente
                            </p>
                            <Button
                              onClick={() => setShowAnamnesisModal(true)}
                              variant="outline"
                              className="gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              Criar Primeira Ficha
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
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

      {/* Modal para criar anamnese */}
      <Dialog open={showAnamnesisModal} onOpenChange={setShowAnamnesisModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Ficha de Anamnese</DialogTitle>
            <DialogDescription>
              Preencha as informações da ficha de anamnese do cliente
            </DialogDescription>
          </DialogHeader>

          <Tabs value={anamnesisTab} onValueChange={setAnamnesisTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dados">Dados</TabsTrigger>
              <TabsTrigger value="assinatura">Assinatura Eletrônica</TabsTrigger>
              <TabsTrigger value="link">Link</TabsTrigger>
            </TabsList>

            {/* Aba Dados */}
            <TabsContent value="dados" className="space-y-4 mt-6">
              <div className="space-y-4">
                {/* Seleção do Modelo */}
                <div className="space-y-2">
                  <Label htmlFor="anamnesis-template" className="text-sm font-medium">
                    Modelo de Anamnese *
                  </Label>
                  <Select
                    value={selectedAnamnesisTemplate}
                    onValueChange={setSelectedAnamnesisTemplate}
                  >
                    <SelectTrigger id="anamnesis-template">
                      <SelectValue placeholder="Selecione um modelo de anamnese" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facial">
                        <div className="flex items-center gap-2">
                          <span>✨</span>
                          <span>Anamnese Facial</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="corporal">
                        <div className="flex items-center gap-2">
                          <span>💆</span>
                          <span>Anamnese Corporal</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="capilar">
                        <div className="flex items-center gap-2">
                          <span>💇</span>
                          <span>Anamnese Capilar</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="estetica">
                        <div className="flex items-center gap-2">
                          <span>💅</span>
                          <span>Anamnese Estética Completa</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="manicure">
                        <div className="flex items-center gap-2">
                          <span>💅</span>
                          <span>Anamnese Manicure/Pedicure</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="massagem">
                        <div className="flex items-center gap-2">
                          <span>🙌</span>
                          <span>Anamnese Massagem</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="custom">
                        <div className="flex items-center gap-2">
                          <span>📋</span>
                          <span>Modelo Personalizado</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Escolha o tipo de anamnese adequado para o atendimento
                  </p>
                </div>

                {/* Dados do Cliente (Preenchidos Automaticamente) */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg border">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Nome do Cliente
                    </Label>
                    <div className="flex items-center gap-2 p-2 bg-background rounded border">
                      <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm font-medium">{client?.name || '-'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      CPF
                    </Label>
                    <div className="flex items-center gap-2 p-2 bg-background rounded border">
                      <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      <span className="text-sm font-mono">{(client as any)?.cpf || 'Não informado'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Celular
                    </Label>
                    <div className="flex items-center gap-2 p-2 bg-background rounded border">
                      <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm font-mono">{client?.cellPhone || 'Não informado'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Data de Criação
                    </Label>
                    <div className="flex items-center gap-2 p-2 bg-background rounded border">
                      <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">
                        {new Date().toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="anamnesis-status" className="text-sm font-medium">
                    Status da Ficha *
                  </Label>
                  <Select
                    value={anamnesisStatus}
                    onValueChange={(value: 'OPEN' | 'CLOSED') => setAnamnesisStatus(value)}
                  >
                    <SelectTrigger id="anamnesis-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                          <span>Aberto - Em preenchimento</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="CLOSED">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span>Fechado - Finalizado</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Defina se a ficha está aberta para edição ou já foi finalizada
                  </p>
                </div>

                {/* Observações */}
                <div className="space-y-2">
                  <Label htmlFor="anamnesis-notes" className="text-sm font-medium">
                    Observações Gerais
                    <span className="text-xs text-muted-foreground ml-2">(Opcional)</span>
                  </Label>
                  <Textarea
                    id="anamnesis-notes"
                    placeholder="Adicione observações importantes sobre esta anamnese..."
                    className="min-h-[100px] resize-none"
                    maxLength={500}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Aba Assinatura Eletrônica */}
            <TabsContent value="assinatura" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Sobre a Assinatura Eletrônica</p>
                      <p>
                        A assinatura eletrônica garante a autenticidade e concordância do cliente com as informações da anamnese. 
                        O cliente poderá assinar digitalmente através de link enviado ou presencialmente em um tablet.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signature-field" className="text-sm font-medium">
                    Área de Assinatura
                  </Label>
                  <div className="border-2 border-dashed rounded-lg p-8 bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center text-center space-y-3">
                      <div className="p-4 bg-background rounded-full">
                        <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Funcionalidade em desenvolvimento</p>
                        <p className="text-xs text-muted-foreground">
                          Em breve você poderá capturar assinaturas digitais dos clientes
                        </p>
                      </div>
                      <Button variant="outline" disabled>
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Capturar Assinatura
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status da Assinatura</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span className="text-sm">Pendente</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Data/Hora da Assinatura</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <span className="text-sm text-muted-foreground">Aguardando assinatura</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Aba Link */}
            <TabsContent value="link" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <div className="text-sm text-purple-800">
                      <p className="font-medium mb-1">Compartilhamento via Link</p>
                      <p>
                        Gere um link único para compartilhar a anamnese com o cliente. 
                        O cliente poderá preencher as informações online e assinar digitalmente.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Link da Anamnese</Label>
                  <div className="flex gap-2">
                    <Input
                      value={anamnesisLink}
                      readOnly
                      placeholder="O link será gerado após salvar a ficha"
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      disabled={!anamnesisLink}
                      onClick={() => {
                        if (anamnesisLink) {
                          navigator.clipboard.writeText(anamnesisLink);
                          toast({
                            title: 'Link copiado!',
                            description: 'O link foi copiado para a área de transferência.',
                          });
                        }
                      }}
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copiar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Link único e seguro para preenchimento online da anamnese
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Opções de Compartilhamento</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      disabled={!anamnesisLink}
                      className="justify-start gap-3 h-auto p-4"
                      onClick={() => {
                        if (anamnesisLink && client?.cellPhone) {
                          const message = `Olá ${client.name}! Acesse o link abaixo para preencher sua ficha de anamnese:\n\n${anamnesisLink}`;
                          const phoneNumber = client.cellPhone.replace(/\D/g, '');
                          window.open(`https://wa.me/55${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
                        }
                      }}
                    >
                      <div className="p-2 bg-green-100 rounded">
                        <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm">WhatsApp</p>
                        <p className="text-xs text-muted-foreground">Enviar via WhatsApp</p>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      disabled={!anamnesisLink}
                      className="justify-start gap-3 h-auto p-4"
                      onClick={() => {
                        if (anamnesisLink && client?.email) {
                          const subject = 'Ficha de Anamnese - Preenchimento Online';
                          const body = `Olá ${client.name},\n\nPor favor, acesse o link abaixo para preencher sua ficha de anamnese:\n\n${anamnesisLink}\n\nQualquer dúvida, estamos à disposição.`;
                          window.open(`mailto:${client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                        }
                      }}
                    >
                      <div className="p-2 bg-blue-100 rounded">
                        <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm">E-mail</p>
                        <p className="text-xs text-muted-foreground">Enviar por e-mail</p>
                      </div>
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Validade do Link</span>
                    <span className="font-medium">30 dias</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Acessos</span>
                    <span className="font-medium">0 visualizações</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="secondary">Aguardando preenchimento</Badge>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer do Modal */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAnamnesisModal(false)}
              disabled={isSavingAnamnesis}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={!selectedAnamnesisTemplate || isSavingAnamnesis}
              onClick={async () => {
                setIsSavingAnamnesis(true);
                try {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  
                  // Gerar link único
                  const uniqueId = `anm-${Date.now()}`;
                  const generatedLink = `${window.location.origin}/anamnese/${uniqueId}`;
                  setAnamnesisLink(generatedLink);
                  
                  toast({
                    title: 'Anamnese criada com sucesso!',
                    description: 'A ficha foi criada e está disponível para preenchimento.',
                  });
                  
                  // Aqui seria feita a integração com o backend
                  // para salvar a anamnese no banco de dados
                  
                  setShowAnamnesisModal(false);
                } catch (error) {
                  toast({
                    title: 'Erro ao criar anamnese',
                    description: 'Tente novamente mais tarde.',
                    variant: 'destructive',
                  });
                } finally {
                  setIsSavingAnamnesis(false);
                }
              }}
            >
              {isSavingAnamnesis ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Salvar Ficha de Anamnese
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
