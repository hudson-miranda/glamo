import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEmployee } from 'wasp/client/operations';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { useToast } from '../../hooks/useToast';
import { PersonalDataStep } from './components/PersonalDataStep';
import { ScheduleStep } from './components/ScheduleStep';
import { ServicesStep } from './components/ServicesStep';
import { CommissionStep } from './components/CommissionStep';

export type EmployeeFormData = {
  // Dados Pessoais
  name: string;
  email: string;
  phone: string;
  phone2: string;
  instagram: string;
  birthDate: string;
  color: string;
  position: string;
  permissions: string[];
  
  // Documentos
  cpf: string;
  rg: string;
  rgIssuingBody: string;
  
  // Dados Bancários
  pixKey: string;
  bankName: string;
  bankAgency: string;
  bankAccount: string;
  bankDigit: string;
  accountType: string;
  personType: string;
  companyName: string;
  cnpj: string;
  
  // Endereço
  address: string;
  addressNumber: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Horários
  schedules: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
  
  // Serviços (mockup)
  serviceIds: string[];
  
  // Comissões (mockup)
  commissionType: string;
  commissionValue: number;
  tipRule: string;
  canReceiveTips: boolean;
  tipsOnlyFromAppointments: boolean;
  
  // Controle
  sendInvite: boolean;
};

const STEPS = [
  { id: 1, name: 'Dados Pessoais', description: 'Informações básicas do colaborador' },
  { id: 2, name: 'Horários', description: 'Configuração de horários de trabalho' },
  { id: 3, name: 'Serviços', description: 'Serviços que pode executar' },
  { id: 4, name: 'Comissões', description: 'Configuração de comissões e gorjetas' },
];

export default function CreateEmployeePage() {
  const navigate = useNavigate();
  const { activeSalonId } = useSalonContext();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    sendInvite: true,
  });

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
        // Horários são opcionais
        return true;
      case 3:
        // Serviços são opcionais (mockup)
        return true;
      case 4:
        // Comissões são opcionais (mockup)
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
    if (!activeSalonId) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Nenhum salão ativo selecionado',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createEmployee({
        salonId: activeSalonId,
        ...formData,
      });

      toast({
        title: 'Colaborador cadastrado!',
        description: formData.email && formData.sendInvite
          ? `${formData.name} foi cadastrado e receberá um convite por e-mail.`
          : `${formData.name} foi cadastrado com sucesso.`,
      });

      navigate('/employees');
    } catch (error: any) {
      console.error('Erro ao criar colaborador:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao cadastrar',
        description: error.message || 'Ocorreu um erro ao cadastrar o colaborador',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='space-y-6 pb-16'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white'>
            {currentStep === 1 ? 'Cadastrar Colaborador' : STEPS[currentStep - 1].name}
          </h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            {STEPS[currentStep - 1].description}
          </p>
        </div>
        <Button
          variant='outline'
          onClick={() => navigate('/employees')}
          className='border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
        >
          <ChevronLeft className='mr-2 h-4 w-4' />
          Voltar
        </Button>
      </div>

      {/* Progress Steps */}
      <div className='flex items-center justify-between'>
        {STEPS.map((step, index) => (
          <div key={step.id} className='flex items-center flex-1'>
            <div className='flex items-center'>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                  currentStep > step.id
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : currentStep === step.id
                    ? 'border-brand-600 bg-white dark:bg-gray-900 text-brand-600'
                    : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-500'
                }`}
              >
                {currentStep > step.id ? (
                  <Check className='h-5 w-5' />
                ) : (
                  <span className='text-sm font-semibold'>{step.id}</span>
                )}
              </div>
              <div className='ml-3'>
                <p
                  className={`text-sm font-medium ${
                    currentStep >= step.id
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-500'
                  }`}
                >
                  {step.name}
                </p>
              </div>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`mx-4 h-0.5 flex-1 transition-all ${
                  currentStep > step.id
                    ? 'bg-brand-600'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className='bg-white dark:bg-gray-900/80 backdrop-blur-md border-gray-200 dark:border-gray-800'>
        <CardContent className='pt-6'>
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
          variant='outline'
          onClick={handleBack}
          disabled={currentStep === 1}
          className='border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
        >
          <ChevronLeft className='mr-2 h-4 w-4' />
          Anterior
        </Button>

        <Button
          onClick={handleNext}
          disabled={isSubmitting}
          className='bg-gradient-to-r from-brand-400 to-brand-600 hover:from-brand-500 hover:to-brand-700 text-white shadow-lg shadow-brand-500/30'
        >
          {isSubmitting ? (
            <>
              <div className='mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
              Salvando...
            </>
          ) : currentStep === STEPS.length ? (
            <>
              <Check className='mr-2 h-4 w-4' />
              Finalizar Cadastro
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
  );
}
