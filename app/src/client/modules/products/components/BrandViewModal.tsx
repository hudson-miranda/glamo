import { useQuery, listProducts } from 'wasp/client/operations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/Dialog';
import { Badge } from '../../../../components/ui/Badge';
import { Separator } from '../../../../components/ui/Separator';
import { Tag, Package, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BrandViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandId: string | null;
  salonId: string;
}

export function BrandViewModal({
  isOpen,
  onClose,
  brandId,
  salonId,
}: BrandViewModalProps) {
  const { data: productsData } = useQuery(
    listProducts,
    {
      salonId,
      brandId: brandId || undefined,
      page: 1,
      perPage: 100,
    },
    {
      enabled: isOpen && !!brandId && !!salonId,
    }
  );

  if (!brandId) return null;

  const brand = productsData?.products?.[0]?.brand;
  const products = productsData?.products || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Detalhes da Marca
          </DialogTitle>
          <DialogDescription>
            Visualize as informações detalhadas da marca
          </DialogDescription>
        </DialogHeader>

        {brand ? (
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Nome
                </h3>
                <p className="text-lg font-semibold">{brand.name}</p>
              </div>

              {brand.description && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Descrição
                  </h3>
                  <p className="text-sm">{brand.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Data de Cadastro
                  </h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(brand.createdAt), 'dd/MM/yyyy', {
                      locale: ptBR,
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Última Atualização
                  </h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(brand.updatedAt), 'dd/MM/yyyy', {
                      locale: ptBR,
                    })}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Produtos */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produtos ({products.length})
                </h3>
              </div>

              {products.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {products.map((product: any) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.category?.name || 'Sem categoria'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(product.salePrice)}
                        </p>
                        {product.controlStock && (
                          <p className="text-sm text-muted-foreground">
                            Estoque: {product.currentStock || 0}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum produto vinculado a esta marca</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
