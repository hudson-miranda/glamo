import { useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';

const supplierSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  description: z.string().max(500).optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phoneType: z.enum(['MOBILE', 'LANDLINE', 'WHATSAPP']).optional(),
  phone: z.string().max(20).optional(),
  phoneType2: z.enum(['MOBILE', 'LANDLINE', 'WHATSAPP']).optional(),
  phone2: z.string().max(20).optional(),
  contactName: z.string().max(100).optional(),
  cnpj: z.string().max(18).optional(),
  address: z.string().max(200).optional(),
  addressNumber: z.string().max(10).optional(),
  complement: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(2).optional(),
  zipCode: z.string().max(9).optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface Supplier {
  id: string;
  name: string;
  description?: string | null;
  email?: string | null;
  phoneType?: string | null;
  phone?: string | null;
  phoneType2?: string | null;
  phone2?: string | null;
  contactName?: string | null;
  cnpj?: string | null;
  address?: string | null;
  addressNumber?: string | null;
  complement?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
}

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierFormData) => Promise<void>;
  supplier?: Supplier | null;
  isLoading?: boolean;
}

export function SupplierFormModal({
  isOpen,
  onClose,
  onSubmit,
  supplier,
  isLoading = false,
}: SupplierFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      description: '',
      email: '',
      phoneType: 'MOBILE',
      phone: '',
      phoneType2: 'MOBILE',
      phone2: '',
      contactName: '',
      cnpj: '',
      address: '',
      addressNumber: '',
      complement: '',
      city: '',
      state: '',
      zipCode: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (supplier) {
        reset({
          name: supplier.name,
          description: supplier.description || '',
          email: supplier.email || '',
          phoneType: (supplier.phoneType as any) || 'MOBILE',
          phone: supplier.phone || '',
          phoneType2: (supplier.phoneType2 as any) || 'MOBILE',
          phone2: supplier.phone2 || '',
          contactName: supplier.contactName || '',
          cnpj: supplier.cnpj || '',
          address: supplier.address || '',
          addressNumber: supplier.addressNumber || '',
          complement: supplier.complement || '',
          city: supplier.city || '',
          state: supplier.state || '',
          zipCode: supplier.zipCode || '',
        });
      } else {
        reset({
          name: '',
          description: '',
          email: '',
          phoneType: 'MOBILE',
          phone: '',
          phoneType2: 'MOBILE',
          phone2: '',
          contactName: '',
          cnpj: '',
          address: '',
          addressNumber: '',
          complement: '',
          city: '',
          state: '',
          zipCode: '',
        });
      }
    }
  }, [isOpen, reset, supplier]);

  const handleFormSubmit = async (data: SupplierFormData) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </DialogTitle>
          <DialogDescription>
            {supplier 
              ? 'Atualize as informações do fornecedor'
              : 'Preencha os campos para criar um novo fornecedor'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
          {/* Informações Básicas */}
          <div className='space-y-4'>
            <h3 className='text-sm font-medium'>Informações Básicas</h3>
            
            <div className='grid grid-cols-2 gap-4'>
              <div className='col-span-2'>
                <Label htmlFor="name">
                  Nome do Fornecedor <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Nome da empresa fornecedora"
                  className={errors.name ? 'border-red-500' : ''}
                  maxLength={100}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="contactName">Nome do Contato</Label>
                <Input
                  id="contactName"
                  {...register('contactName')}
                  placeholder="Pessoa de contato"
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  {...register('cnpj')}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
              </div>

              <div className='col-span-2'>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Informações adicionais sobre o fornecedor..."
                  rows={2}
                  maxLength={500}
                />
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className='space-y-4'>
            <h3 className='text-sm font-medium'>Contato</h3>
            
            <div className='grid grid-cols-2 gap-4'>
              <div className='col-span-2'>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="email@fornecedor.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className='flex gap-2'>
                <div className='w-1/3'>
                  <Label htmlFor="phoneType">Tipo</Label>
                  <Select
                    value={watch('phoneType')}
                    onValueChange={(value: string) => setValue('phoneType', value as any)}
                  >
                    <SelectTrigger id="phoneType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MOBILE">Celular</SelectItem>
                      <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                      <SelectItem value="LANDLINE">Fixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex-1'>
                  <Label htmlFor="phone">Telefone 1</Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    placeholder="(00) 00000-0000"
                    maxLength={20}
                  />
                </div>
              </div>

              <div className='flex gap-2'>
                <div className='w-1/3'>
                  <Label htmlFor="phoneType2">Tipo</Label>
                  <Select
                    value={watch('phoneType2')}
                    onValueChange={(value: string) => setValue('phoneType2', value as any)}
                  >
                    <SelectTrigger id="phoneType2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MOBILE">Celular</SelectItem>
                      <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                      <SelectItem value="LANDLINE">Fixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex-1'>
                  <Label htmlFor="phone2">Telefone 2</Label>
                  <Input
                    id="phone2"
                    {...register('phone2')}
                    placeholder="(00) 00000-0000"
                    maxLength={20}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className='space-y-4'>
            <h3 className='text-sm font-medium'>Endereço</h3>
            
            <div className='grid grid-cols-4 gap-4'>
              <div className='col-span-3'>
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  {...register('address')}
                  placeholder="Rua, Avenida..."
                  maxLength={200}
                />
              </div>

              <div>
                <Label htmlFor="addressNumber">Número</Label>
                <Input
                  id="addressNumber"
                  {...register('addressNumber')}
                  placeholder="Nº"
                  maxLength={10}
                />
              </div>

              <div className='col-span-2'>
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  {...register('complement')}
                  placeholder="Sala, bloco..."
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  {...register('city')}
                  placeholder="Cidade"
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="state">UF</Label>
                <Input
                  id="state"
                  {...register('state')}
                  placeholder="SP"
                  maxLength={2}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className='col-span-2'>
                <Label htmlFor="zipCode">CEP</Label>
                <Input
                  id="zipCode"
                  {...register('zipCode')}
                  placeholder="00000-000"
                  maxLength={9}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {(isSubmitting || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {supplier ? 'Atualizar' : 'Criar'} Fornecedor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
