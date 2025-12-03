import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, createProduct, updateProduct, createProductBrand, createProductCategory, createSupplier, listProductBrands, listProductCategories, listSuppliers } from 'wasp/client/operations';
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
import { Switch } from '../../../../components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Loader2, Plus } from 'lucide-react';
import { BrandFormModal } from './BrandFormModal';
import { ProductCategoryFormModal } from './ProductCategoryFormModal';
import { SupplierFormModal } from './SupplierFormModal';
import { toast } from 'react-hot-toast';

const UNIT_OF_MEASURE_OPTIONS = [
  { value: 'unidade', label: 'Unidade' },
  { value: 'mililitros', label: 'Mililitros (ml)' },
  { value: 'gramas', label: 'Gramas (g)' },
  { value: 'dosagem', label: 'Dosagem' },
  { value: 'litros', label: 'Litros (L)' },
  { value: 'caixa', label: 'Caixa' },
  { value: 'pacote', label: 'Pacote' },
  { value: 'miligramas', label: 'Miligramas (mg)' },
  { value: 'centimetros', label: 'Centímetros (cm)' },
  { value: 'horas', label: 'Horas' },
  { value: 'quilogramas', label: 'Quilogramas (kg)' },
  { value: 'pote', label: 'Pote' },
  { value: 'frasco', label: 'Frasco' },
  { value: 'peca', label: 'Peça' },
  { value: 'rolo', label: 'Rolo' },
  { value: 'aplicacao', label: 'Aplicação' },
  { value: 'folhas', label: 'Folhas' },
  { value: 'saco', label: 'Saco' },
  { value: 'ampola', label: 'Ampola' },
  { value: 'galao', label: 'Galão' },
  { value: 'bisnaga', label: 'Bisnaga' },
  { value: 'capsula', label: 'Cápsula' },
  { value: 'cartela', label: 'Cartela' },
  { value: 'comprimido', label: 'Comprimido' },
  { value: 'sache', label: 'Sachê' },
  { value: 'metros', label: 'Metros (m)' },
];

const productSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  supplierId: z.string().optional(),
  expirationDate: z.string().optional(),
  salePrice: z.string().min(1, 'Preço de venda obrigatório'),
  costPrice: z.string().min(1, 'Custo de compra obrigatório'),
  unitOfMeasure: z.string().min(1, 'Registro de saída obrigatório'),
  quantityPerPackage: z.string().min(1, 'Equivalência obrigatória'),
  minimumStock: z.string(),
  initialStock: z.string(),
  professionalPrice: z.string().optional(),
  additionalCostValue: z.string().optional(),
  additionalCostType: z.enum(['FIXED', 'PERCENT']),
  saleCommissionValue: z.string().optional(),
  saleCommissionType: z.enum(['FIXED', 'PERCENT']),
  sku: z.string().max(50).optional(),
  barcode: z.string().max(50).optional(),
  notes: z.string().max(1000).optional(),
  isActive: z.boolean(),
  isFavorite: z.boolean(),
  controlStock: z.boolean(),
  cashbackActive: z.boolean(),
  cashbackValue: z.string().optional(),
  cashbackType: z.enum(['FIXED', 'PERCENT']),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Product {
  id: string;
  name: string;
  categoryId?: string | null;
  brandId?: string | null;
  supplierId?: string | null;
  salePrice: number;
  costPrice: number;
  professionalPrice?: number | null;
  unitOfMeasure?: string | null;
  quantityPerPackage: number;
  minimumStock: number;
  initialStock: number;
  stockQuantity: number;
  additionalCostValue: number;
  additionalCostType: string;
  saleCommissionValue: number;
  saleCommissionType: string;
  sku?: string | null;
  barcode?: string | null;
  expirationDate?: Date | null;
  notes?: string | null;
  isActive: boolean;
  isFavorite: boolean;
  controlStock: boolean;
  cashbackActive: boolean;
  cashbackValue: number;
  cashbackType: string;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null;
  salonId: string;
}

export function ProductFormModal({
  isOpen,
  onClose,
  onSuccess,
  product,
  salonId,
}: ProductFormModalProps) {
  const [activeTab, setActiveTab] = useState('cadastro');
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  const { data: brandsData, refetch: refetchBrands } = useQuery(listProductBrands, { salonId });
  const { data: categoriesData, refetch: refetchCategories } = useQuery(listProductCategories, { salonId });
  const { data: suppliersData, refetch: refetchSuppliers } = useQuery(listSuppliers, { salonId });

  const brands = brandsData || [];
  const categories = categoriesData || [];
  const suppliers = suppliersData || [];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      categoryId: '',
      brandId: '',
      supplierId: '',
      expirationDate: '',
      salePrice: '',
      costPrice: '',
      unitOfMeasure: 'unidade',
      quantityPerPackage: '1',
      minimumStock: '0',
      initialStock: '0',
      professionalPrice: '',
      additionalCostValue: '0',
      additionalCostType: 'FIXED',
      saleCommissionValue: '0',
      saleCommissionType: 'FIXED',
      sku: '',
      barcode: '',
      notes: '',
      isActive: true,
      isFavorite: false,
      controlStock: true,
      cashbackActive: false,
      cashbackValue: '0',
      cashbackType: 'FIXED',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (product) {
        reset({
          name: product.name,
          categoryId: product.categoryId || '',
          brandId: product.brandId || '',
          supplierId: product.supplierId || '',
          expirationDate: product.expirationDate ? new Date(product.expirationDate).toISOString().split('T')[0] : '',
          salePrice: product.salePrice.toString(),
          costPrice: product.costPrice.toString(),
          professionalPrice: product.professionalPrice?.toString() || '',
          unitOfMeasure: product.unitOfMeasure || 'unidade',
          quantityPerPackage: product.quantityPerPackage.toString(),
          minimumStock: product.minimumStock.toString(),
          initialStock: product.stockQuantity.toString(),
          additionalCostValue: product.additionalCostValue.toString(),
          additionalCostType: product.additionalCostType as any,
          saleCommissionValue: product.saleCommissionValue.toString(),
          saleCommissionType: product.saleCommissionType as any,
          sku: product.sku || '',
          barcode: product.barcode || '',
          notes: product.notes || '',
          isActive: product.isActive,
          isFavorite: product.isFavorite,
          controlStock: product.controlStock,
          cashbackActive: product.cashbackActive,
          cashbackValue: product.cashbackValue.toString(),
          cashbackType: product.cashbackType as any,
        });
      } else {
        reset({
          name: '',
          categoryId: '',
          brandId: '',
          supplierId: '',
          expirationDate: '',
          salePrice: '',
          costPrice: '',
          unitOfMeasure: 'unidade',
          quantityPerPackage: '1',
          minimumStock: '0',
          initialStock: '0',
          professionalPrice: '',
          additionalCostValue: '0',
          additionalCostType: 'FIXED',
          saleCommissionValue: '0',
          saleCommissionType: 'FIXED',
          sku: '',
          barcode: '',
          notes: '',
          isActive: true,
          isFavorite: false,
          controlStock: true,
          cashbackActive: false,
          cashbackValue: '0',
          cashbackType: 'FIXED',
        });
      }
      setActiveTab('cadastro');
    }
  }, [isOpen, reset, product]);

  const handleFormSubmit = async (data: ProductFormData) => {
    try {
      const payload = {
        salonId,
        name: data.name,
        categoryId: data.categoryId || undefined,
        brandId: data.brandId || undefined,
        supplierId: data.supplierId || undefined,
        salePrice: parseFloat(data.salePrice),
        costPrice: parseFloat(data.costPrice),
        professionalPrice: data.professionalPrice ? parseFloat(data.professionalPrice) : undefined,
        unitOfMeasure: data.unitOfMeasure,
        quantityPerPackage: parseInt(data.quantityPerPackage),
        minimumStock: parseInt(data.minimumStock),
        initialStock: parseInt(data.initialStock),
        additionalCostValue: parseFloat(data.additionalCostValue || '0'),
        additionalCostType: data.additionalCostType,
        saleCommissionValue: parseFloat(data.saleCommissionValue || '0'),
        saleCommissionType: data.saleCommissionType,
        sku: data.sku || undefined,
        barcode: data.barcode || undefined,
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
        notes: data.notes || undefined,
        isActive: data.isActive,
        isFavorite: data.isFavorite,
        controlStock: data.controlStock,
        cashbackActive: data.cashbackActive,
        cashbackValue: parseFloat(data.cashbackValue || '0'),
        cashbackType: data.cashbackType,
      };

      if (product) {
        await updateProduct({ productId: product.id, ...payload });
        toast.success('Produto atualizado com sucesso!');
      } else {
        await createProduct(payload);
        toast.success('Produto criado com sucesso!');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar produto');
    }
  };

  const handleCreateBrand = async (data: any) => {
    try {
      await createProductBrand({ salonId, ...data });
      toast.success('Marca criada com sucesso!');
      await refetchBrands();
      setIsBrandModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar marca');
    }
  };

  const handleCreateCategory = async (data: any) => {
    try {
      await createProductCategory({ salonId, ...data });
      toast.success('Categoria criada com sucesso!');
      await refetchCategories();
      setIsCategoryModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar categoria');
    }
  };

  const handleCreateSupplier = async (data: any) => {
    try {
      await createSupplier({ salonId, ...data });
      toast.success('Fornecedor criado com sucesso!');
      await refetchSuppliers();
      setIsSupplierModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar fornecedor');
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='max-w-4xl max-h-[95vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {product ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
            <DialogDescription>
              {product 
                ? 'Atualize as informações do produto'
                : 'Preencha os campos para criar um novo produto'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger value='cadastro'>Cadastro</TabsTrigger>
                <TabsTrigger value='configuracoes'>Configurações</TabsTrigger>
                <TabsTrigger value='cashback'>Cashback</TabsTrigger>
              </TabsList>

              {/* ABA CADASTRO */}
              <TabsContent value='cadastro' className='space-y-6 mt-4'>
                <div className='grid grid-cols-2 gap-4'>
                  {/* Nome */}
                  <div className='col-span-2'>
                    <Label htmlFor="name">
                      Nome <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="Nome do produto"
                      className={errors.name ? 'border-red-500' : ''}
                      maxLength={100}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Categoria */}
                  <div>
                    <Label htmlFor="categoryId">Categoria</Label>
                    <div className='flex gap-2'>
                      <Select
                        value={watch('categoryId')}
                        onValueChange={(value) => setValue('categoryId', value)}
                      >
                        <SelectTrigger id="categoryId" className='flex-1'>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setIsCategoryModalOpen(true)}
                      >
                        <Plus className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>

                  {/* Marca */}
                  <div>
                    <Label htmlFor="brandId">Marca</Label>
                    <div className='flex gap-2'>
                      <Select
                        value={watch('brandId')}
                        onValueChange={(value) => setValue('brandId', value)}
                      >
                        <SelectTrigger id="brandId" className='flex-1'>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((brand: any) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setIsBrandModalOpen(true)}
                      >
                        <Plus className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>

                  {/* Validade, Preço de Venda e Custo de Compra */}
                  <div className='col-span-2 grid grid-cols-12 gap-4'>
                    {/* Validade */}
                    <div className='col-span-3'>
                      <Label htmlFor="expirationDate">Validade</Label>
                      <Input
                        id="expirationDate"
                        type="date"
                        {...register('expirationDate')}
                      />
                    </div>

                    {/* Preço de venda */}
                    <div className='col-span-4'>
                      <Label htmlFor="salePrice">
                        Preço de Venda <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="salePrice"
                        type="number"
                        step="0.01"
                        {...register('salePrice')}
                        placeholder="0.00"
                        className={errors.salePrice ? 'border-red-500' : ''}
                      />
                      {errors.salePrice && (
                        <p className="text-sm text-red-500 mt-1">{errors.salePrice.message}</p>
                      )}
                    </div>

                    {/* Custo de compra */}
                    <div className='col-span-5'>
                      <Label htmlFor="costPrice">
                        Custo de Compra <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="costPrice"
                        type="number"
                        step="0.01"
                        {...register('costPrice')}
                        placeholder="0.00"
                        className={errors.costPrice ? 'border-red-500' : ''}
                      />
                      {errors.costPrice && (
                        <p className="text-sm text-red-500 mt-1">{errors.costPrice.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Registro de saída */}
                  <div>
                    <Label htmlFor="unitOfMeasure">
                      Registro de Saída <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={watch('unitOfMeasure')}
                      onValueChange={(value) => setValue('unitOfMeasure', value)}
                    >
                      <SelectTrigger id="unitOfMeasure">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UNIT_OF_MEASURE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.unitOfMeasure && (
                      <p className="text-sm text-red-500 mt-1">{errors.unitOfMeasure.message}</p>
                    )}
                  </div>

                  {/* Uma unidade equivale a */}
                  <div>
                    <Label htmlFor="quantityPerPackage">
                      Uma Unidade Equivale a <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="quantityPerPackage"
                      type="number"
                      {...register('quantityPerPackage')}
                      placeholder="1"
                      className={errors.quantityPerPackage ? 'border-red-500' : ''}
                    />
                    {errors.quantityPerPackage && (
                      <p className="text-sm text-red-500 mt-1">{errors.quantityPerPackage.message}</p>
                    )}
                  </div>

                  {/* Estoque mínimo */}
                  <div>
                    <Label htmlFor="minimumStock">Estoque Mínimo</Label>
                    <Input
                      id="minimumStock"
                      type="number"
                      {...register('minimumStock')}
                      placeholder="0"
                    />
                  </div>

                  {/* Estoque inicial */}
                  <div>
                    <Label htmlFor="initialStock">Estoque Inicial</Label>
                    <Input
                      id="initialStock"
                      type="number"
                      {...register('initialStock')}
                      placeholder="0"
                    />
                  </div>

                  {/* Fornecedor */}
                  <div className='col-span-2'>
                    <Label htmlFor="supplierId">Fornecedor</Label>
                    <div className='flex gap-2'>
                      <Select
                        value={watch('supplierId')}
                        onValueChange={(value) => setValue('supplierId', value)}
                      >
                        <SelectTrigger id="supplierId" className='flex-1'>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((supplier: any) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setIsSupplierModalOpen(true)}
                      >
                        <Plus className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>

                  {/* Preço para profissional */}
                  <div>
                    <Label htmlFor="professionalPrice">Preço para Profissional</Label>
                    <Input
                      id="professionalPrice"
                      type="number"
                      step="0.01"
                      {...register('professionalPrice')}
                      placeholder="0.00"
                    />
                  </div>

                  {/* Custo adicional */}
                  <div>
                    <Label htmlFor="additionalCostValue">Custo Adicional</Label>
                    <div className='flex gap-2'>
                      <Input
                        id="additionalCostValue"
                        type="number"
                        step="0.01"
                        {...register('additionalCostValue')}
                        placeholder="0.00"
                        className='flex-1'
                      />
                      <Select
                        value={watch('additionalCostType')}
                        onValueChange={(value) => setValue('additionalCostType', value as any)}
                      >
                        <SelectTrigger className='w-24'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FIXED">R$</SelectItem>
                          <SelectItem value="PERCENT">%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Comissão padrão */}
                  <div>
                    <Label htmlFor="saleCommissionValue">Comissão Padrão</Label>
                    <div className='flex gap-2'>
                      <Input
                        id="saleCommissionValue"
                        type="number"
                        step="0.01"
                        {...register('saleCommissionValue')}
                        placeholder="0.00"
                        className='flex-1'
                      />
                      <Select
                        value={watch('saleCommissionType')}
                        onValueChange={(value) => setValue('saleCommissionType', value as any)}
                      >
                        <SelectTrigger className='w-24'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FIXED">R$</SelectItem>
                          <SelectItem value="PERCENT">%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Código do item */}
                  <div>
                    <Label htmlFor="sku">Código do Item</Label>
                    <Input
                      id="sku"
                      {...register('sku')}
                      placeholder="SKU"
                      maxLength={50}
                    />
                  </div>

                  {/* Código de barras */}
                  <div>
                    <Label htmlFor="barcode">Código de Barras</Label>
                    <Input
                      id="barcode"
                      {...register('barcode')}
                      placeholder="Código de barras"
                      maxLength={50}
                    />
                  </div>

                  {/* Anotações */}
                  <div className='col-span-2'>
                    <Label htmlFor="notes">Anotações</Label>
                    <Textarea
                      id="notes"
                      {...register('notes')}
                      placeholder="Observações sobre o produto..."
                      rows={3}
                      maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {watch('notes')?.length || 0}/1000 caracteres
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* ABA CONFIGURAÇÕES */}
              <TabsContent value='configuracoes' className='space-y-4 mt-4'>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Produto Ativo</Label>
                    <p className="text-sm text-muted-foreground">
                      Produtos inativos não aparecem para seleção
                    </p>
                  </div>
                  <Switch
                    checked={watch('isActive')}
                    onCheckedChange={(checked) => setValue('isActive', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Marcar como Favorito</Label>
                    <p className="text-sm text-muted-foreground">
                      Produtos favoritos aparecem no topo das listas
                    </p>
                  </div>
                  <Switch
                    checked={watch('isFavorite')}
                    onCheckedChange={(checked) => setValue('isFavorite', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Controlar Estoque</Label>
                    <p className="text-sm text-muted-foreground">
                      O estoque será automaticamente ajustado conforme utilização
                    </p>
                  </div>
                  <Switch
                    checked={watch('controlStock')}
                    onCheckedChange={(checked) => setValue('controlStock', checked)}
                  />
                </div>
              </TabsContent>

              {/* ABA CASHBACK */}
              <TabsContent value='cashback' className='space-y-4 mt-4'>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Cashback Ativo</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativar cashback para este produto
                    </p>
                  </div>
                  <Switch
                    checked={watch('cashbackActive')}
                    onCheckedChange={(checked) => setValue('cashbackActive', checked)}
                  />
                </div>

                {watch('cashbackActive') && (
                  <div>
                    <Label htmlFor="cashbackValue">Valor Personalizado</Label>
                    <div className='flex gap-2'>
                      <Input
                        id="cashbackValue"
                        type="number"
                        step="0.01"
                        {...register('cashbackValue')}
                        placeholder="0.00"
                        className='flex-1'
                      />
                      <Select
                        value={watch('cashbackType')}
                        onValueChange={(value) => setValue('cashbackType', value as any)}
                      >
                        <SelectTrigger className='w-24'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FIXED">R$</SelectItem>
                          <SelectItem value="PERCENT">%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className='flex justify-end gap-3 mt-6 pt-6 border-t'>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {product ? 'Atualizar' : 'Criar'} Produto
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <BrandFormModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        onSubmit={handleCreateBrand}
      />

      <ProductCategoryFormModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleCreateCategory}
      />

      <SupplierFormModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        onSubmit={handleCreateSupplier}
      />
    </>
  );
}
