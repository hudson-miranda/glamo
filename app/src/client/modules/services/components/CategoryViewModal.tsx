import { useQuery, getCategory } from 'wasp/client/operations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Eye, Tag, Scissors } from 'lucide-react';
import { useSalonContext } from '../../../hooks/useSalonContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import { formatCurrency } from '../../../lib/formatters';

interface CategoryViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string | null;
}

export function CategoryViewModal({
  isOpen,
  onClose,
  categoryId,
}: CategoryViewModalProps) {
  const { activeSalonId } = useSalonContext();

  const { data: category, isLoading } = useQuery(
    getCategory,
    {
      categoryId: categoryId || '',
      salonId: activeSalonId || '',
    },
    {
      enabled: !!categoryId && !!activeSalonId && isOpen,
    }
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Eye className='h-5 w-5' />
            Visualizar Categoria
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
              <p className='mt-3 text-sm text-muted-foreground'>Carregando...</p>
            </div>
          </div>
        ) : category ? (
          <div className='space-y-6'>
            {/* Informações da Categoria */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Tag className='h-4 w-4' />
                  Informações da Categoria
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='text-sm font-medium text-muted-foreground'>
                      Nome
                    </label>
                    <p className='text-base font-semibold mt-1'>{category.name}</p>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-muted-foreground'>
                      Status
                    </label>
                    <div className='mt-1'>
                      <Badge variant={category.active ? 'default' : 'secondary'}>
                        {category.active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Descrição
                  </label>
                  {category.description ? (
                    <p className='text-base mt-1 whitespace-pre-wrap break-words'>{category.description}</p>
                  ) : (
                    <p className='text-sm text-muted-foreground italic mt-1'>
                      Sem descrição
                    </p>
                  )}
                </div>

                <div>
                  <label className='text-sm font-medium text-muted-foreground'>
                    Total de Serviços
                  </label>
                  <p className='text-base font-semibold mt-1'>
                    {category._count?.services || 0} serviço(s)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Serviços Associados */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Scissors className='h-4 w-4' />
                  Serviços Associados
                </CardTitle>
                <CardDescription>
                  Serviços vinculados a esta categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                {category.services && category.services.length > 0 ? (
                  <div className='border rounded-lg overflow-hidden'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead className='text-right'>Duração</TableHead>
                          <TableHead className='text-right'>Preço</TableHead>
                          <TableHead className='text-center'>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {category.services.map((service: any) => (
                          <TableRow key={service.id}>
                            <TableCell className='font-medium'>
                              {service.name}
                            </TableCell>
                            <TableCell>
                              {service.description ? (
                                <span className='text-sm text-muted-foreground line-clamp-2'>
                                  {service.description}
                                </span>
                              ) : (
                                <span className='text-sm text-muted-foreground italic'>
                                  Sem descrição
                                </span>
                              )}
                            </TableCell>
                            <TableCell className='text-right'>
                              {service.duration} min
                            </TableCell>
                            <TableCell className='text-right font-medium'>
                              {formatCurrency(service.price)}
                            </TableCell>
                            <TableCell className='text-center'>
                              <Badge variant={service.active ? 'default' : 'secondary'}>
                                {service.active ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className='text-center py-8 border rounded-lg bg-muted/20'>
                    <Scissors className='h-8 w-8 mx-auto text-muted-foreground mb-2' />
                    <p className='text-sm font-medium text-muted-foreground'>
                      Nenhum serviço associado
                    </p>
                    <p className='text-xs text-muted-foreground mt-1'>
                      Esta categoria ainda não possui serviços vinculados
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
