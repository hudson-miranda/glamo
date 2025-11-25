import { useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import {
  listServiceProductConsumptions,
  createServiceProductConsumption,
  updateServiceProductConsumption,
  deleteServiceProductConsumption,
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
import { Badge } from '../../components/ui/badge';
import { Loader2, Plus, Trash2, Edit2, Package, AlertTriangle } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import { InfoTooltip } from './InfoTooltip';

interface ProductConsumptionsTabProps {
  serviceId?: string;
  salonId: string;
  products: any[];
}

interface ConsumptionForm {
  id?: string;
  productId: string;
  quantity: number;
}

export function ProductConsumptionsTab({ 
  serviceId, 
  salonId, 
  products 
}: ProductConsumptionsTabProps) {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [editingConsumption, setEditingConsumption] = useState<any | null>(null);
  const [formData, setFormData] = useState<ConsumptionForm>({
    productId: '',
    quantity: 1,
  });

  const { data: consumptions, isLoading, refetch } = useQuery(
    listServiceProductConsumptions,
    { serviceId: serviceId || '', salonId },
    { enabled: !!serviceId }
  );

  const availableProducts = products.filter(
    (prod) => !consumptions?.some((c: any) => c.productId === prod.id && c.id !== editingConsumption?.id)
  );

  const handleStartAdd = () => {
    if (availableProducts.length === 0) {
      toast({
        title: 'Sem produtos disponíveis',
        description: 'Todos os produtos já foram vinculados a este serviço',
        variant: 'destructive',
      });
      return;
    }
    setFormData({
      productId: '',
      quantity: 1,
    });
    setEditingConsumption(null);
    setIsAdding(true);
  };

  const handleEdit = (consumption: any) => {
    setFormData({
      id: consumption.id,
      productId: consumption.productId,
      quantity: consumption.quantity,
    });
    setEditingConsumption(consumption);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingConsumption(null);
    setFormData({
      productId: '',
      quantity: 1,
    });
  };

  const handleSave = async () => {
    if (!serviceId) {
      toast({
        title: 'Erro',
        description: 'Salve o serviço antes de adicionar produtos',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.productId) {
      toast({
        title: 'Campo obrigatório',
        description: 'Selecione um produto',
        variant: 'destructive',
      });
      return;
    }

    if (formData.quantity <= 0) {
      toast({
        title: 'Quantidade inválida',
        description: 'A quantidade deve ser maior que zero',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingConsumption) {
        await updateServiceProductConsumption({
          consumptionId: formData.id!,
          salonId,
          quantity: formData.quantity,
        });
        toast({
          title: 'Produto atualizado',
          description: 'Consumo de produto atualizado com sucesso',
        });
      } else {
        await createServiceProductConsumption({
          serviceId,
          productId: formData.productId,
          salonId,
          quantity: formData.quantity,
        });
        toast({
          title: 'Produto vinculado',
          description: 'Produto adicionado ao serviço com sucesso',
        });
      }
      refetch();
      handleCancel();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar produto',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (consumptionId: string) => {
    if (!confirm('Tem certeza que deseja desvincular este produto?')) return;

    try {
      await deleteServiceProductConsumption({ consumptionId, salonId });
      toast({
        title: 'Produto desvinculado',
        description: 'Produto removido do serviço com sucesso',
      });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao desvincular produto',
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
            Para vincular produtos consumidos, você precisa salvar o serviço antes.
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
          Produtos Consumidos
          <InfoTooltip content="Vincule produtos que serão consumidos durante a execução deste serviço" />
        </h3>
        <p className="text-sm text-muted-foreground">
          Configure quais produtos são utilizados neste serviço
        </p>
      </div>

      {products.length === 0 && (
        <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
          <p className="text-sm text-amber-900 font-medium mb-2">
            ⚠️ Nenhum produto cadastrado
          </p>
          <p className="text-sm text-amber-800">
            Para vincular produtos, primeiro cadastre produtos no módulo de{' '}
            <span className="font-semibold">Estoque/Produtos</span>.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : consumptions && consumptions.length > 0 ? (
        <div className="space-y-2">
          {consumptions.map((consumption: any) => {
            const isLowStock = consumption.product.stockQuantity < consumption.product.minimumStock;
            const hasStock = consumption.product.stockQuantity >= consumption.quantity;
            
            return (
              <Card key={consumption.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span className="font-medium">{consumption.product.name}</span>
                        {isLowStock && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Estoque baixo
                          </Badge>
                        )}
                        {!hasStock && (
                          <Badge variant="destructive">Sem estoque suficiente</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Quantidade: </span>
                          <span className="font-medium">
                            {consumption.quantity} {consumption.product.unitOfMeasure || 'un'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Estoque atual: </span>
                          <span className={`font-medium ${isLowStock ? 'text-red-500' : ''}`}>
                            {consumption.product.stockQuantity} {consumption.product.unitOfMeasure || 'un'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Estoque mínimo: </span>
                          <span className="font-medium">
                            {consumption.product.minimumStock} {consumption.product.unitOfMeasure || 'un'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(consumption)}
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(consumption.id)}
                        title="Desvincular"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          <p>Nenhum produto vinculado</p>
          <p className="text-sm mt-1">Clique em "Vincular Produto" para começar</p>
        </div>
      )}

      {!isAdding && (
        <Button
          type="button"
          variant="outline"
          onClick={handleStartAdd}
          disabled={availableProducts.length === 0 || products.length === 0}
          className="w-full"
          title={products.length === 0 ? 'Cadastre produtos primeiro' : availableProducts.length === 0 ? 'Todos os produtos já foram vinculados' : 'Vincular novo produto'}
        >
          <Plus className="mr-2 h-4 w-4" />
          Vincular Produto
          {products.length === 0 && ' (Cadastre produtos primeiro)'}
        </Button>
      )}

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingConsumption ? 'Editar' : 'Vincular'} Produto
            </CardTitle>
            <CardDescription>
              Configure o produto e a quantidade consumida
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productId">
                Produto <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.productId}
                onValueChange={(v) => setFormData({ ...formData, productId: v })}
                disabled={!!editingConsumption}
              >
                <SelectTrigger id="productId">
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {(editingConsumption ? products : availableProducts).map((prod: any) => (
                    <SelectItem key={prod.id} value={prod.id}>
                      {prod.name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        (Estoque: {prod.stockQuantity} {prod.unitOfMeasure || 'un'})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity" className="flex items-center gap-1">
                Quantidade <span className="text-red-500">*</span>
                <InfoTooltip content="Quantidade do produto que será consumida a cada execução deste serviço" />
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                placeholder="Ex: 1"
              />
            </div>

            {formData.productId && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-medium">Informações do Produto</p>
                {(() => {
                  const selectedProduct = products.find((p) => p.id === formData.productId);
                  if (!selectedProduct) return null;
                  
                  const isLowStock = selectedProduct.stockQuantity < selectedProduct.minimumStock;
                  const hasStock = selectedProduct.stockQuantity >= formData.quantity;
                  
                  return (
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estoque atual:</span>
                        <span className={isLowStock ? 'text-red-500 font-medium' : ''}>
                          {selectedProduct.stockQuantity} {selectedProduct.unitOfMeasure || 'un'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estoque mínimo:</span>
                        <span>{selectedProduct.minimumStock} {selectedProduct.unitOfMeasure || 'un'}</span>
                      </div>
                      {!hasStock && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 text-red-700 rounded">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-xs">Estoque insuficiente para esta quantidade</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleSave}>
                {editingConsumption ? 'Atualizar' : 'Vincular'} Produto
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
