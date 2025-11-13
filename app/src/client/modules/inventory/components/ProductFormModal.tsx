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
import { Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '../../../../components/ui/use-toast';
import { Alert, AlertDescription } from '../../../../components/ui/alert';

// Validation schema
const productSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  description: z.string().max(500).optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  supplierId: z.string().optional(),
  costPrice: z.number().min(0, 'Preço de custo deve ser maior ou igual a 0'),
  salePrice: z.number().min(0, 'Preço de venda deve ser maior ou igual a 0'),
  stockQuantity: z.number().min(0, 'Quantidade deve ser maior ou igual a 0'),
  minimumStock: z.number().min(0, 'Estoque mínimo deve ser maior ou igual a 0'),
  unit: z.enum(['UNIT', 'ML', 'G', 'L', 'KG']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']).optional(),
  storageLocation: z.string().max(100).optional(),
  expirationDate: z.string().optional(),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Product {
  id: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  description?: string | null;
  categoryId?: string | null;
  brandId?: string | null;
  supplierId?: string | null;
  costPrice: number;
  salePrice: number;
  stockQuantity: number;
  minimumStock: number;
  unit: string;
  status: string;
  storageLocation?: string | null;
  expirationDate?: Date | null;
  imageUrl?: string | null;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  product?: Product | null;
  isLoading?: boolean;
  categories?: any[];
  brands?: any[];
  suppliers?: any[];
}

export function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  product,
  isLoading = false,
  categories = [],
  brands = [],
  suppliers = [],
}: ProductFormModalProps) {
  const { toast } = useToast();

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
      sku: '',
      barcode: '',
      description: '',
      categoryId: '',
      brandId: '',
      supplierId: '',
      costPrice: 0,
      salePrice: 0,
      stockQuantity: 0,
      minimumStock: 5,
      unit: 'UNIT',
      status: 'ACTIVE',
      storageLocation: '',
      expirationDate: '',
      imageUrl: '',
    },
  });

  const stockQuantity = watch('stockQuantity');
  const minimumStock = watch('minimumStock');
  const isLowStock = stockQuantity <= minimumStock;

  // Reset form when product changes or modal opens
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku || '',
        barcode: product.barcode || '',
        description: product.description || '',
        categoryId: product.categoryId || '',
        brandId: product.brandId || '',
        supplierId: product.supplierId || '',
        costPrice: product.costPrice,
        salePrice: product.salePrice,
        stockQuantity: product.stockQuantity,
        minimumStock: product.minimumStock,
        unit: product.unit as any,
        status: product.status as any,
        storageLocation: product.storageLocation || '',
        expirationDate: product.expirationDate 
          ? new Date(product.expirationDate).toISOString().split('T')[0] 
          : '',
        imageUrl: product.imageUrl || '',
      });
    } else {
      reset();
    }
  }, [product, reset, isOpen]);

  const handleFormSubmit = async (data: ProductFormData) => {
    try {
      await onSubmit(data);
      toast({
        title: product ? 'Produto atualizado' : 'Produto criado',
        description: product 
          ? 'Produto atualizado com sucesso' 
          : 'Novo produto adicionado ao estoque',
      });
      onClose();
      reset();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar produto',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          <DialogDescription>
            {product
              ? 'Atualize as informações do produto'
              : 'Preencha os dados do novo produto'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Low Stock Warning */}
          {isLowStock && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Atenção! Estoque baixo ({stockQuantity} unidades) - Mínimo recomendado: {minimumStock}
              </AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Básicas</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Ex: Shampoo Revitalizante"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="sku">SKU (Código Interno)</Label>
                <Input
                  id="sku"
                  {...register('sku')}
                  placeholder="Ex: SHP-001"
                />
              </div>

              <div>
                <Label htmlFor="barcode">Código de Barras</Label>
                <Input
                  id="barcode"
                  {...register('barcode')}
                  placeholder="Ex: 7891234567890"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Descrição detalhada do produto..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="categoryId">Categoria</Label>
                <Select
                  value={watch('categoryId')}
                  onValueChange={(value) => setValue('categoryId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="brandId">Marca</Label>
                <Select
                  value={watch('brandId')}
                  onValueChange={(value) => setValue('brandId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand: any) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preços</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="costPrice">Preço de Custo *</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  {...register('costPrice', { valueAsNumber: true })}
                  placeholder="0.00"
                  className={errors.costPrice ? 'border-red-500' : ''}
                />
                {errors.costPrice && (
                  <p className="text-sm text-red-500 mt-1">{errors.costPrice.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="salePrice">Preço de Venda *</Label>
                <Input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  {...register('salePrice', { valueAsNumber: true })}
                  placeholder="0.00"
                  className={errors.salePrice ? 'border-red-500' : ''}
                />
                {errors.salePrice && (
                  <p className="text-sm text-red-500 mt-1">{errors.salePrice.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Stock */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Estoque</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stockQuantity">Quantidade em Estoque *</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  {...register('stockQuantity', { valueAsNumber: true })}
                  placeholder="0"
                  className={errors.stockQuantity ? 'border-red-500' : ''}
                />
                {errors.stockQuantity && (
                  <p className="text-sm text-red-500 mt-1">{errors.stockQuantity.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="minimumStock">Estoque Mínimo *</Label>
                <Input
                  id="minimumStock"
                  type="number"
                  {...register('minimumStock', { valueAsNumber: true })}
                  placeholder="5"
                  className={errors.minimumStock ? 'border-red-500' : ''}
                />
                {errors.minimumStock && (
                  <p className="text-sm text-red-500 mt-1">{errors.minimumStock.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="unit">Unidade</Label>
                <Select
                  value={watch('unit')}
                  onValueChange={(value) => setValue('unit', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNIT">Unidade</SelectItem>
                    <SelectItem value="ML">Mililitro (ml)</SelectItem>
                    <SelectItem value="L">Litro (L)</SelectItem>
                    <SelectItem value="G">Grama (g)</SelectItem>
                    <SelectItem value="KG">Quilograma (kg)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={watch('status')}
                  onValueChange={(value) => setValue('status', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Ativo</SelectItem>
                    <SelectItem value="INACTIVE">Inativo</SelectItem>
                    <SelectItem value="OUT_OF_STOCK">Fora de Estoque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Adicionais</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplierId">Fornecedor</Label>
                <Select
                  value={watch('supplierId')}
                  onValueChange={(value) => setValue('supplierId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier: any) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="expirationDate">Data de Validade</Label>
                <Input
                  id="expirationDate"
                  type="date"
                  {...register('expirationDate')}
                />
              </div>

              <div>
                <Label htmlFor="storageLocation">Local de Armazenamento</Label>
                <Input
                  id="storageLocation"
                  {...register('storageLocation')}
                  placeholder="Ex: Prateleira A2"
                />
              </div>

              <div>
                <Label htmlFor="imageUrl">URL da Imagem</Label>
                <Input
                  id="imageUrl"
                  {...register('imageUrl')}
                  placeholder="https://..."
                  className={errors.imageUrl ? 'border-red-500' : ''}
                />
                {errors.imageUrl && (
                  <p className="text-sm text-red-500 mt-1">{errors.imageUrl.message}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {(isSubmitting || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {product ? 'Atualizar' : 'Criar'} Produto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
