import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import { createEmployee, updateEmployee } from 'wasp/client/operations';
import { PersonalDataStep } from './PersonalDataStep';
import { ScheduleStep } from './ScheduleStep';
import { ServicesStep } from './ServicesStep';
import { CommissionStep } from './CommissionStep';

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
  
  // Serviços
  serviceIds: string[];
  
  // Comissões
  commissionType: string;
  commissionValue: number;
  tipRule: string;
  canReceiveTips: boolean;
  tipsOnlyFromAppointments: boolean;
  
  // Controle
  sendInvite: boolean;
};

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employee?: any;
  salonId: string;
}

export function EmployeeFormModal({
  isOpen,
  onClose,
  onSuccess,
  employee,
  salonId,
}: EmployeeFormModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dados');
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

  useEffect(() => {
    if (isOpen) {
      if (employee) {
        // Carregar dados do funcionário para edição
        setFormData({
          name: employee.name || '',
          email: employee.email || '',
          phone: employee.phone || '',
          phone2: employee.phone2 || '',
          instagram: employee.instagram || '',
          birthDate: employee.birthDate || '',
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
          schedules: employee.schedules || [],
          serviceIds: employee.serviceIds || [],
          commissionType: employee.commissionType || 'Não gerar comissão',
          commissionValue: employee.commissionValue || 0,
          tipRule: employee.tipRule || 'Regra padrão do sistema',
          canReceiveTips: employee.canReceiveTips !== undefined ? employee.canReceiveTips : true,
          tipsOnlyFromAppointments: employee.tipsOnlyFromAppointments !== undefined ? employee.tipsOnlyFromAppointments : true,
          sendInvite: false,
        });
      } else {
        // Reset para novo funcionário
        setFormData({
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
      }
      setActiveTab('dados');
    }
  }, [isOpen, employee]);

  const updateFormData = (data: Partial<EmployeeFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const validateForm = (): boolean => {
    if (!formData.name || formData.name.trim().length < 3) {
      toast({
        variant: 'destructive',
        title: 'Nome inválido',
        description: 'O nome deve ter no mínimo 3 caracteres',
      });
      setActiveTab('dados');
      return false;
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        variant: 'destructive',
        title: 'E-mail inválido',
        description: 'Por favor, insira um e-mail válido',
      });
      setActiveTab('dados');
      return false;
    }
    
    if (formData.cpf && formData.cpf.replace(/\D/g, '').length !== 11) {
      toast({
        variant: 'destructive',
        title: 'CPF inválido',
        description: 'O CPF deve conter 11 dígitos',
      });
      setActiveTab('dados');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      if (employee) {
        // Atualizar funcionário existente
        await updateEmployee({
          id: employee.id,
          salonId,
          ...formData,
        });
        toast({
          title: 'Funcionário atualizado!',
          description: 'As informações foram atualizadas com sucesso.',
        });
      } else {
        // Criar novo funcionário
        await createEmployee({
          salonId,
          ...formData,
        });
        toast({
          title: 'Funcionário cadastrado!',
          description: formData.sendInvite 
            ? 'Um e-mail de convite foi enviado para o colaborador.'
            : 'O colaborador foi cadastrado com sucesso.',
        });
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao salvar funcionário:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: error.message || 'Ocorreu um erro ao salvar o funcionário. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employee ? 'Editar Colaborador' : 'Novo Colaborador'}
          </DialogTitle>
          <DialogDescription>
            {employee
              ? 'Atualize as informações do colaborador'
              : 'Preencha os dados do novo colaborador'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="horarios">Horários</TabsTrigger>
            <TabsTrigger value="servicos">Serviços</TabsTrigger>
            <TabsTrigger value="comissoes">Comissões</TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="space-y-4 mt-6">
            <PersonalDataStep
              formData={formData}
              updateFormData={updateFormData}
            />
          </TabsContent>

          <TabsContent value="horarios" className="space-y-4 mt-6">
            <ScheduleStep
              formData={formData}
              updateFormData={updateFormData}
            />
          </TabsContent>

          <TabsContent value="servicos" className="space-y-4 mt-6">
            <ServicesStep
              formData={formData}
              updateFormData={updateFormData}
            />
          </TabsContent>

          <TabsContent value="comissoes" className="space-y-4 mt-6">
            <CommissionStep
              formData={formData}
              updateFormData={updateFormData}
            />
          </TabsContent>
        </Tabs>

        {/* Footer com botões de ação */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                {employee ? 'Atualizar' : 'Cadastrar'} Colaborador
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
