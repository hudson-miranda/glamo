import { EmployeeFormData } from '../CreateEmployeePage';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Input } from '../../../../components/ui/input';
import { Scissors, Search, AlertCircle } from 'lucide-react';
import { useState } from 'react';

type ServicesStepProps = {
  formData: EmployeeFormData;
  updateFormData: (data: Partial<EmployeeFormData>) => void;
};

// Mockup de serviços - será substituído quando o módulo de Serviços estiver completo
const MOCKUP_SERVICES = [
  { id: '1', name: 'Corte Feminino', category: 'Cabelo', duration: 60, price: 80 },
  { id: '2', name: 'Corte Masculino', category: 'Cabelo', duration: 45, price: 50 },
  { id: '3', name: 'Corte Infantil', category: 'Cabelo', duration: 30, price: 40 },
  { id: '4', name: 'Escova', category: 'Cabelo', duration: 45, price: 60 },
  { id: '5', name: 'Hidratação', category: 'Tratamento Capilar', duration: 60, price: 100 },
  { id: '6', name: 'Coloração', category: 'Coloração', duration: 120, price: 180 },
  { id: '7', name: 'Luzes', category: 'Coloração', duration: 180, price: 250 },
  { id: '8', name: 'Mechas', category: 'Coloração', duration: 150, price: 200 },
  { id: '9', name: 'Manicure', category: 'Unhas', duration: 45, price: 35 },
  { id: '10', name: 'Pedicure', category: 'Unhas', duration: 60, price: 45 },
  { id: '11', name: 'Unha em Gel', category: 'Unhas', duration: 90, price: 80 },
  { id: '12', name: 'Alongamento de Unhas', category: 'Unhas', duration: 120, price: 120 },
  { id: '13', name: 'Design de Sobrancelhas', category: 'Estética', duration: 30, price: 40 },
  { id: '14', name: 'Aplicação de Cílios', category: 'Estética', duration: 90, price: 150 },
  { id: '15', name: 'Limpeza de Pele', category: 'Estética', duration: 60, price: 120 },
  { id: '16', name: 'Massagem Relaxante', category: 'Estética', duration: 60, price: 100 },
];

export function ServicesStep({ formData, updateFormData }: ServicesStepProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = MOCKUP_SERVICES.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedServices = filteredServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, typeof MOCKUP_SERVICES>);

  const toggleService = (serviceId: string) => {
    const newServiceIds = formData.serviceIds.includes(serviceId)
      ? formData.serviceIds.filter((id) => id !== serviceId)
      : [...formData.serviceIds, serviceId];
    updateFormData({ serviceIds: newServiceIds });
  };

  const toggleCategory = (category: string) => {
    const categoryServices = MOCKUP_SERVICES.filter((s) => s.category === category);
    const categoryServiceIds = categoryServices.map((s) => s.id);
    const allSelected = categoryServiceIds.every((id) =>
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
    updateFormData({ serviceIds: MOCKUP_SERVICES.map((s) => s.id) });
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

      {/* Alerta Mockup */}
      <div className='flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
        <AlertCircle className='h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5' />
        <div className='text-sm'>
          <p className='font-semibold text-blue-900 dark:text-blue-100'>
            Versão de Demonstração
          </p>
          <p className='text-blue-700 dark:text-blue-300 mt-1'>
            Esta é uma lista mockup de serviços. Quando o módulo de Serviços estiver completo,
            esta lista será automaticamente sincronizada com os serviços cadastrados no sistema.
          </p>
        </div>
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
          const allSelected = services.every((s) => formData.serviceIds.includes(s.id));
          const someSelected = services.some((s) => formData.serviceIds.includes(s.id));

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
                      {services.length} serviço{services.length > 1 ? 's' : ''} •{' '}
                      {services.filter((s) => formData.serviceIds.includes(s.id)).length}{' '}
                      selecionado{services.filter((s) => formData.serviceIds.includes(s.id)).length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Serviços da Categoria */}
              <div className='divide-y divide-gray-200 dark:divide-gray-700'>
                {services.map((service) => (
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
