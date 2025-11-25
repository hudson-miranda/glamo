import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, getEmployee, updateEmployee, updateEmployeeSchedules, updateEmployeeServices } from 'wasp/client/operations';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { useToast } from '../../hooks/useToast';
import { PersonalDataStep } from './components/PersonalDataStep';
import { ScheduleStep } from './components/ScheduleStep';
import { ServicesStep } from './components/ServicesStep';
import { CommissionStep } from './components/CommissionStep';
import { EmployeeFormData } from './CreateEmployeePage';

const STEPS = [
  { id: 1, name: 'Dados Pessoais', description: 'Informações básicas do colaborador' },
  { id: 2, name: 'Horários', description: 'Configuração de horários de trabalho' },
  { id: 3, name: 'Serviços', description: 'Serviços que pode executar' },
  { id: 4, name: 'Comissões', description: 'Configuração de comissões e gorjetas' },
];

export default function EditEmployeePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeSalonId } = useSalonContext();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: employee,
    isLoading,
    error,
  } = useQuery(getEmployee, { id: id! }, { enabled: !!id });

  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    phone: '',
    phone2: '',
    instagram: '',
    birthDate: '',
    color: '',
    position: '',
    permissions: [],
    cpf: '',
    rg: '',
    rgIssuingBody: '',
    pixKey: '',
    bankName: '',
    bankAgency: '',
    bankAccount: '',
    bankDigit: '',
    accountType: '',
    personType: 'Pessoa Física',
    companyName: '',
    cnpj: '',
    address: '',
    addressNumber: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    schedules: [],
    serviceIds: [],
    commissionType: 'Não gerar comissão',
    commissionValue: 0,
    tipRule: 'Regra padrão do sistema',
    canReceiveTips: true,
    tipsOnlyFromAppointments: true,
    sendInvite: false, // Não enviar convite na edição
  });

  // Preencher formData quando employee carregar
  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        phone2: employee.phone2 || '',
        instagram: employee.instagram || '',
        birthDate: employee.birthDate ? new Date(employee.birthDate).toISOString().split('T')[0] : '',
        color: employee.color || '',
        position: employee.position || '',
        permissions: employee.permissions || [],
        cpf: employee.cpf || '',
        rg: employee.rg || '',
        rgIssuingBody: employee.rgIssuingBody || '',
        pixKey: employee.pixKey || '',
        bankName: employee.bankName || '',
        bankAgency: employee.bankAgency || '',
        bankAccount: employee.bankAccount || '',
        bankDigit: employee.bankDigit || '',
        accountType: employee.accountType || '',
        personType: employee.personType || 'Pessoa Física',
        companyName: employee.companyName || '',
        cnpj: employee.cnpj || '',
        address: employee.address || '',
        addressNumber: employee.addressNumber || '',
        complement: employee.complement || '',
        neighborhood: employee.neighborhood || '',
        city: employee.city || '',
        state: employee.state || '',
        zipCode: employee.zipCode || '',
        schedules: employee.schedules?.map((s: any) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
        })) || [],
        serviceIds: employee.serviceAssignments?.map((sa: any) => sa.service?.id).filter(Boolean) || [],
        commissionType: employee.commissionType || 'Não gerar comissão',
        commissionValue: employee.commissionValue || 0,
        tipRule: employee.tipRule || 'Regra padrão do sistema',
        canReceiveTips: employee.canReceiveTips ?? true,
        tipsOnlyFromAppointments: employee.tipsOnlyFromAppointments ?? true,
        sendInvite: false,
      });
    }
  }, [employee]);

  const updateFormData = (data: Partial<EmployeeFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name || formData.name.trim().length < 3) {
          toast({
            variant: 'destructive',
            title: 'Nome inválido',
            description: 'O nome deve ter no mínimo 3 caracteres',
          });
          return false;
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          toast({
            variant: 'destructive',
            title: 'E-mail inválido',
            description: 'Por favor, insira um e-mail válido',
          });
          return false;
        }
        if (formData.cpf && formData.cpf.replace(/\D/g, '').length !== 11) {
          toast({
            variant: 'destructive',
            title: 'CPF inválido',
            description: 'O CPF deve ter 11 dígitos',
          });
          return false;
        }
        if (formData.personType === 'Pessoa Jurídica') {
          if (!formData.companyName) {
            toast({
              variant: 'destructive',
              title: 'Razão Social obrigatória',
              description: 'Informe a razão social da empresa',
            });
            return false;
          }
          if (!formData.cnpj || formData.cnpj.replace(/\D/g, '').length !== 14) {
            toast({
              variant: 'destructive',
              title: 'CNPJ inválido',
              description: 'O CNPJ deve ter 14 dígitos',
            });
            return false;
          }
        }
        return true;
      case 2:
      case 3:
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!activeSalonId || !employee) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Dados insuficientes para atualizar o colaborador',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Atualizar dados do colaborador
      await updateEmployee({
        id: employee.id,
        salonId: activeSalonId,
        ...formData,
      });

      // Atualizar horários
      await updateEmployeeSchedules({
        employeeId: employee.id,
        schedules: formData.schedules,
      });

      // Atualizar serviços
      await updateEmployeeServices({
        employeeId: employee.id,
        serviceIds: formData.serviceIds,
      });

      toast({
        title: 'Colaborador atualizado!',
        description: `${formData.name} foi atualizado com sucesso.`,
      });

      navigate('/employees');
    } catch (error: any) {
      console.error('Erro ao atualizar colaborador:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar',
        description: error.message || 'Ocorreu um erro ao atualizar o colaborador',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <Loader2 className='h-8 w-8 animate-spin text-brand-600' />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className='space-y-6'>
        <Button
          variant='outline'
          onClick={() => navigate('/employees')}
          className='border-gray-200 dark:border-gray-700'
        >
          <ChevronLeft className='mr-2 h-4 w-4' />
          Voltar
        </Button>
        <div className='text-center py-12'>
          <p className='text-red-600 dark:text-red-400'>
            {error?.message || 'Colaborador não encontrado'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6 pb-16'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white'>
            {currentStep === 1 ? 'Editar Colaborador' : STEPS[currentStep - 1].name}
          </h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            {currentStep === 1 ? employee.name : STEPS[currentStep - 1].description}
          </p>
        </div>
        <Button
          variant='outline'
          onClick={() => navigate('/employees')}
          className='border-gray-200 dark:border-gray-700'
        >
          <ChevronLeft className='mr-2 h-4 w-4' />
          Voltar
        </Button>
      </div>

      {/* Progress Steps */}
      <div className='flex items-center justify-between'>
        {STEPS.map((step, index) => (
          <div key={step.id} className='flex items-center flex-1'>
            <button
              type='button'
              onClick={() => setCurrentStep(step.id)}
              disabled={isSubmitting}
              className='flex flex-col items-center flex-1 group disabled:cursor-not-allowed'
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors cursor-pointer ${
                  currentStep > step.id
                    ? 'bg-brand-600 border-brand-600 text-white group-hover:bg-brand-700'
                    : currentStep === step.id
                    ? 'bg-brand-600 border-brand-600 text-white'
                    : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 group-hover:border-brand-400 group-hover:text-brand-600'
                }`}
              >
                {currentStep > step.id ? (
                  <Check className='h-5 w-5' />
                ) : (
                  <span className='text-sm font-semibold'>{step.id}</span>
                )}
              </div>
              <p
                className={`text-xs mt-2 text-center ${
                  currentStep >= step.id
                    ? 'text-gray-900 dark:text-white font-medium'
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-brand-600'
                }`}
              >
                {step.name}
              </p>
            </button>
            {index < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-2 transition-colors ${
                  currentStep > step.id
                    ? 'bg-brand-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className='border-gray-200 dark:border-gray-700'>
        <CardContent className='p-6'>
          {currentStep === 1 && (
            <PersonalDataStep formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 2 && (
            <ScheduleStep formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 3 && (
            <ServicesStep formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 4 && (
            <CommissionStep formData={formData} updateFormData={updateFormData} />
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className='flex items-center justify-between'>
        <Button
          type='button'
          variant='outline'
          onClick={handleBack}
          disabled={currentStep === 1 || isSubmitting}
          className='border-gray-200 dark:border-gray-700'
        >
          <ChevronLeft className='mr-2 h-4 w-4' />
          Anterior
        </Button>
        <div className='flex gap-3'>
          {currentStep < STEPS.length && (
            <Button
              type='button'
              onClick={handleSubmit}
              disabled={isSubmitting}
              variant='outline'
              className='border-brand-600 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className='mr-2 h-4 w-4' />
                  Salvar Alterações
                </>
              )}
            </Button>
          )}
          <Button
            type='button'
            onClick={handleNext}
            disabled={isSubmitting}
            className='bg-brand-600 hover:bg-brand-700 text-white'
          >
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Salvando...
              </>
            ) : currentStep === STEPS.length ? (
              <>
                <Check className='mr-2 h-4 w-4' />
                Salvar Alterações
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className='ml-2 h-4 w-4' />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
