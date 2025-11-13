import { useState } from 'react';
import { useQuery, listServices, createService, updateService, deleteService, createServiceVariant, updateServiceVariant, deleteServiceVariant } from 'wasp/client/operations';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { EmptyState } from '../../../components/ui/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Plus, Search, Scissors, Edit, Trash2 } from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { ServiceFormModal } from './components/ServiceFormModal';
import { useToast } from '../../../components/ui/use-toast';

export default function ServicesListPage() {
  const { activeSalonId } = useSalonContext();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const { data, isLoading, error, refetch } = useQuery(listServices, {
    salonId: activeSalonId || '',
    search,
    page,
    perPage: 20,
  }, {
    enabled: !!activeSalonId,
  });

  const handleOpenModal = (service: any = null) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  const handleSubmitService = async (formData: any, variants: any[]) => {
    if (!activeSalonId) {
      throw new Error('No active salon');
    }

    if (selectedService) {
      // Update existing service
      await updateService({
        id: selectedService.id,
        salonId: activeSalonId,
        ...formData,
      });

      // Handle variants
      for (const variant of variants) {
        if (!variant.id || variant.id.startsWith('temp-')) {
          // Create new variant
          await createServiceVariant({
            serviceId: selectedService.id,
            salonId: activeSalonId,
            name: variant.name,
            description: variant.description,
            price: variant.price,
            duration: variant.duration,
          });
        }
      }
    } else {
      // Create new service
      const newService = await createService({
        salonId: activeSalonId,
        ...formData,
      });

      // Create variants
      for (const variant of variants) {
        await createServiceVariant({
          serviceId: newService.id,
          salonId: activeSalonId,
          name: variant.name,
          description: variant.description,
          price: variant.price,
          duration: variant.duration,
        });
      }
    }

    await refetch();
  };

  const handleSubmitVariant = async (serviceId: string, variant: any) => {
    if (!activeSalonId) {
      throw new Error('No active salon');
    }

    if (variant.id && !variant.id.startsWith('temp-')) {
      // Update existing variant
      await updateServiceVariant({
          variantId: variant.id,
        salonId: activeSalonId,
        name: variant.name,
        description: variant.description,
        price: variant.price,
        duration: variant.duration,
      });
    } else {
      // Create new variant
      await createServiceVariant({
        serviceId,
        salonId: activeSalonId,
        name: variant.name,
        description: variant.description,
        price: variant.price,
        duration: variant.duration,
      });
    }

    await refetch();
  };

  const handleDeleteVariant = async (serviceId: string, variantId: string) => {
    if (!activeSalonId) {
      throw new Error('No active salon');
    }

    await deleteServiceVariant({
        variantId: variantId,
      salonId: activeSalonId,
    });

    await refetch();
  };

  const handleDeleteService = async (service: any) => {
    if (!activeSalonId) {
      toast({
        title: 'Erro',
        description: 'Nenhum salão ativo',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm('Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await deleteService({
        serviceId: service.id,
        salonId: activeSalonId,
      });

      toast({
        title: 'Serviço excluído',
        description: 'Serviço removido com sucesso',
      });

      await refetch();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir serviço',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
      <div className='space-y-6'>
        <ServiceFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitService}
          onSubmitVariant={handleSubmitVariant}
          onDeleteVariant={handleDeleteVariant}
          service={selectedService}
        />

        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Services</h1>
            <p className='text-muted-foreground'>
              Manage your salon services and pricing
            </p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className='mr-2 h-4 w-4' />
            New Service
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Search Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search by service name...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='pl-10'
              />
            </div>
          </CardContent>
        </Card>

        {/* Services Table */}
        <Card>
          <CardContent className='p-0'>
            {isLoading ? (
              <div className='flex items-center justify-center p-8'>
                <p className='text-sm text-muted-foreground'>Loading services...</p>
              </div>
            ) : error ? (
              <div className='flex items-center justify-center p-8'>
                <p className='text-sm text-destructive'>
                  Error loading services: {error.message}
                </p>
              </div>
            ) : !data?.services || data.services.length === 0 ? (
              <EmptyState
                icon={Scissors}
                title='No services found'
                description={
                  search
                    ? 'Try adjusting your search filters'
                    : 'Get started by creating your first service'
                }
                action={
                  !search && (
                    <Button onClick={() => handleOpenModal()}>
                      <Plus className='mr-2 h-4 w-4' />
                      New Service
                    </Button>
                  )
                }
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Variants</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.services.map((service: any) => (
                      <TableRow key={service.id}>
                        <TableCell className='font-medium'>
                          {service.name}
                        </TableCell>
                        <TableCell>
                          {service.category?.name || '-'}
                        </TableCell>
                        <TableCell>
                          {service.defaultPrice
                            ? formatCurrency(service.defaultPrice)
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {service.defaultDuration
                            ? `${service.defaultDuration} min`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {service.variants?.length || 0}
                        </TableCell>
                        <TableCell>
                          <Badge variant={service.active ? 'success' : 'secondary'}>
                            {service.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex items-center justify-end space-x-2'>
                            <Button 
                              variant='ghost' 
                              size='sm'
                              onClick={() => handleOpenModal(service)}
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button 
                              variant='ghost' 
                              size='sm'
                              onClick={() => handleDeleteService(service)}
                            >
                              <Trash2 className='h-4 w-4 text-destructive' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className='flex items-center justify-between border-t px-6 py-4'>
                  <div className='text-sm text-muted-foreground'>
                    Showing {data.services.length} of {data.total} services
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setPage(page + 1)}
                      disabled={
                        !data.total || page * data.perPage >= data.total
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
