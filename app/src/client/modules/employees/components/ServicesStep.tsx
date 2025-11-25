import { EmployeeFormData } from '../CreateEmployeePage';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Input } from '../../../../components/ui/input';
import { Scissors, Search, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useQuery, listServices } from 'wasp/client/operations';
import { useSalonContext } from '../../../hooks/useSalonContext';
import { Badge } from '../../../../components/ui/badge';

type ServicesStepProps = {
  formData: EmployeeFormData;
  updateFormData: (data: Partial<EmployeeFormData>) => void;
};

export function ServicesStep({ formData, updateFormData }: ServicesStepProps) {
  const { activeSalonId } = useSalonContext();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: servicesData, isLoading } = useQuery(
    listServices,
    {
      salonId: activeSalonId || '',
      search: '',
      page: 1,
      perPage: 1000,
    },
    {
      enabled: !!activeSalonId,
    }
  );

  const services = servicesData?.services?.filter((s: any) => s.active && !s.deletedAt) || [];

  const filteredServices = services.filter((service: any) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedServices = filteredServices.reduce((acc: any, service: any) => {
    const categoryName = service.category?.name || 'Sem Categoria';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(service);
    return acc;
  }, {} as Record<string, any[]>);

  const toggleService = (serviceId: string) => {
    const newServiceIds = formData.serviceIds.includes(serviceId)
      ? formData.serviceIds.filter((id) => id !== serviceId)
      : [...formData.serviceIds, serviceId];
    updateFormData({ serviceIds: newServiceIds });
  };

  const toggleCategory = (category: string) => {
    const categoryServices = services.filter(
      (s: any) => (s.category?.name || 'Sem Categoria') === category
    );
    const categoryServiceIds = categoryServices.map((s: any) => s.id);
    const allSelected = categoryServiceIds.every((id: string) =>
      formData.serviceIds.includes(id)
    );

    if (allSelected) {
      // Desmarcar todos da categoria
      const newServiceIds = formData.serviceIds.filter(
        (id) => !categoryServiceIds.includes(id)
      );
      updateFormData({ serviceIds: newServiceIds });
    } else {
      // Marcar todos da categoria
      const newServiceIds = [
        ...formData.serviceIds.filter((id) => !categoryServiceIds.includes(id)),
        ...categoryServiceIds,
      ];
      updateFormData({ serviceIds: newServiceIds });
    }
  };

  const selectAll = () => {
    const allServiceIds = (services as any[]).map((s: any) => s.id);
    updateFormData({ serviceIds: allServiceIds });
  };

  const clearAll = () => {
    updateFormData({ serviceIds: [] });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    }
    return `${mins}min`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-center'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto text-brand-600' />
          <p className='mt-3 text-sm text-gray-600 dark:text-gray-400'>
            Carregando serviços...
          </p>
        </div>
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <div className='text-center py-12'>
        <Scissors className='h-12 w-12 mx-auto mb-3 text-gray-400' />
        <p className='text-gray-600 dark:text-gray-400 mb-4'>
          Nenhum serviço cadastrado ainda
        </p>
        <p className='text-sm text-gray-500 dark:text-gray-500'>
          Cadastre serviços primeiro para associá-los aos colaboradores
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white flex items-center'>
          <Scissors className='mr-2 h-5 w-5 text-brand-600' />
          Serviços que Pode Executar
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
          Selecione os serviços que este colaborador está habilitado a executar
        </p>
      </div>

      {/* Barra de Pesquisa e Ações */}
      <div className='flex flex-col sm:flex-row gap-3'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
          <Input
            placeholder='Buscar serviços...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          />
        </div>
        <div className='flex gap-2'>
          <button
            onClick={selectAll}
            className='px-4 py-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg border border-brand-200 dark:border-brand-800 transition-colors'
          >
            Selecionar Todos
          </button>
          <button
            onClick={clearAll}
            className='px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors'
          >
            Limpar
          </button>
        </div>
      </div>

      {/* Lista de Serviços Agrupados por Categoria */}
      <div className='space-y-4'>
        {Object.entries(groupedServices).map(([category, services]) => {
          const servicesList = services as any[];
          const allSelected = servicesList.every((s) => formData.serviceIds.includes(s.id));
          const someSelected = servicesList.some((s) => formData.serviceIds.includes(s.id));

          return (
            <div
              key={category}
              className='border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden'
            >
              {/* Cabeçalho da Categoria */}
              <div
                className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                  allSelected
                    ? 'bg-brand-100 dark:bg-brand-900/30'
                    : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => toggleCategory(category)}
              >
                <div className='flex items-center gap-3'>
                  <Checkbox
                    checked={allSelected}
                    className={someSelected && !allSelected ? 'opacity-50' : ''}
                  />
                  <div>
                    <p className='font-semibold text-gray-900 dark:text-white'>{category}</p>
                    <p className='text-xs text-gray-600 dark:text-gray-400'>
                      {servicesList.length} serviço{servicesList.length > 1 ? 's' : ''} •{' '}
                      {servicesList.filter((s) => formData.serviceIds.includes(s.id)).length}{' '}
                      selecionado{servicesList.filter((s) => formData.serviceIds.includes(s.id)).length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Serviços da Categoria */}
              <div className='divide-y divide-gray-200 dark:divide-gray-700'>
                {servicesList.map((service) => (
                  <div
                    key={service.id}
                    className={`p-4 flex items-center gap-4 cursor-pointer transition-colors ${
                      formData.serviceIds.includes(service.id)
                        ? 'bg-brand-50/50 dark:bg-brand-900/10'
                        : 'bg-white dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                    onClick={() => toggleService(service.id)}
                  >
                    <Checkbox checked={formData.serviceIds.includes(service.id)} />
                    <div className='flex-1'>
                      <p className='font-medium text-gray-900 dark:text-white'>
                        {service.name}
                      </p>
                      <div className='flex items-center gap-4 mt-1 text-xs text-gray-600 dark:text-gray-400'>
                        <span>⏱️ {formatDuration(service.duration)}</span>
                        <span>💰 {formatPrice(service.price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumo */}
      {formData.serviceIds.length > 0 && (
        <div className='p-4 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-200 dark:border-brand-800'>
          <p className='text-sm font-semibold text-gray-900 dark:text-white mb-2'>
            ✅ Serviços Selecionados
          </p>
          <p className='text-sm text-gray-700 dark:text-gray-300'>
            Este colaborador poderá executar <strong>{formData.serviceIds.length}</strong>{' '}
            serviço{formData.serviceIds.length > 1 ? 's' : ''}.
          </p>
        </div>
      )}

      {filteredServices.length === 0 && (
        <div className='text-center py-12 text-gray-500 dark:text-gray-400'>
          <Scissors className='h-12 w-12 mx-auto mb-3 opacity-50' />
          <p>Nenhum serviço encontrado</p>
        </div>
      )}
    </div>
  );
}
