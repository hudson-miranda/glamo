import { EmployeeFormData } from '../CreateEmployeePage';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Switch } from '../../../../components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { User, Mail, Phone, Instagram, Calendar, FileText, CreditCard, MapPin, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

type PersonalDataStepProps = {
  formData: EmployeeFormData;
  updateFormData: (data: Partial<EmployeeFormData>) => void;
};

// 15 cores predefinidas (5 colunas x 3 linhas)
const EMPLOYEE_COLORS = [
  { name: 'Vermelho', value: '#EF4444' },
  { name: 'Laranja', value: '#F97316' },
  { name: 'Amarelo', value: '#EAB308' },
  { name: 'Lima', value: '#84CC16' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Esmeralda', value: '#059669' },
  { name: 'Ciano', value: '#06B6D4' },
  { name: 'Azul Claro', value: '#0EA5E9' },
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Índigo', value: '#6366F1' },
  { name: 'Violeta', value: '#8B5CF6' },
  { name: 'Roxo', value: '#A855F7' },
  { name: 'Fúcsia', value: '#D946EF' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Cinza', value: '#6B7280' },
];

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export function PersonalDataStep({ formData, updateFormData }: PersonalDataStepProps) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const handleChange = (field: keyof EmployeeFormData, value: any) => {
    updateFormData({ [field]: value });
  };

  // Fechar o color picker ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setIsColorPickerOpen(false);
      }
    };

    if (isColorPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isColorPickerOpen]);

  const selectedColor = EMPLOYEE_COLORS.find((c) => c.value === formData.color) || EMPLOYEE_COLORS[0];

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value;
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
    }
    return value;
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
    }
    return value;
  };

  return (
    <div className='space-y-8'>
      {/* Informações Básicas */}
      <div>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
          <User className='mr-2 h-5 w-5 text-brand-600' />
          Informações Básicas
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <Label htmlFor='name'>
              Nome Completo <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='name'
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder='Nome completo do colaborador'
              className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            />
          </div>

          <div>
            <Label htmlFor='color'>Cor para Agenda</Label>
            <div className='relative mt-2' ref={colorPickerRef}>
              <button
                type='button'
                onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                className='flex items-center gap-3 px-4 py-3 w-full md:w-auto border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all bg-white dark:bg-gray-800'
              >
                <div
                  className='w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 shadow-sm'
                  style={{ backgroundColor: formData.color || '#6B7280' }}
                />
                <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  {selectedColor.name}
                </span>
                <svg
                  className={`w-4 h-4 ml-auto text-gray-400 transition-transform ${isColorPickerOpen ? 'rotate-180' : ''}`}
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                </svg>
              </button>

              {/* Color Picker Popover */}
              {isColorPickerOpen && (
                <div className='absolute z-50 mt-2 p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-xl w-full md:w-80 animate-in fade-in-0 zoom-in-95'>
                  <p className='text-xs font-medium text-gray-500 dark:text-gray-400 mb-3'>
                    Selecione uma cor
                  </p>
                  <div className='grid grid-cols-5 gap-2'>
                    {EMPLOYEE_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type='button'
                        onClick={() => {
                          handleChange('color', color.value);
                          setIsColorPickerOpen(false);
                        }}
                        className='group relative h-10 rounded-lg hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        {formData.color === color.value && (
                          <div className='absolute inset-0 flex items-center justify-center'>
                            <Check className='h-5 w-5 text-white drop-shadow-lg' strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor='email'>
              <Mail className='inline mr-1 h-4 w-4' />
              E-mail
            </Label>
            <Input
              id='email'
              type='email'
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder='email@exemplo.com'
              className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            />
            <div className='flex items-center space-x-2 mt-3'>
              <Switch
                id='sendInvite'
                checked={formData.sendInvite}
                onCheckedChange={(checked) => handleChange('sendInvite', checked)}
              />
              <Label htmlFor='sendInvite' className='text-sm text-gray-600 dark:text-gray-400 cursor-pointer font-normal'>
                Enviar convite por e-mail
              </Label>
            </div>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
              {formData.sendInvite ? 'Um convite será enviado para o e-mail informado' : 'Nenhum e-mail será enviado'}
            </p>
          </div>

          <div>
            <Label htmlFor='position'>Cargo/Função</Label>
            <Input
              id='position'
              value={formData.position}
              onChange={(e) => handleChange('position', e.target.value)}
              placeholder='Ex: Cabeleireiro, Manicure, Gerente'
              className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            />
          </div>

          <div className='md:col-span-2'>
            <Label>Permissões no Sistema (mockup)</Label>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-3 mt-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg'>
              {['Gerenciar Clientes', 'Gerenciar Serviços', 'Gerenciar Agendamentos', 'Ver Relatórios', 'Gerenciar Estoque', 'Gerenciar Financeiro'].map((permission) => (
                <div key={permission} className='flex items-center space-x-2'>
                  <Checkbox
                    id={permission}
                    checked={formData.permissions.includes(permission)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleChange('permissions', [...formData.permissions, permission]);
                      } else {
                        handleChange('permissions', formData.permissions.filter((p) => p !== permission));
                      }
                    }}
                  />
                  <label
                    htmlFor={permission}
                    className='text-sm text-gray-700 dark:text-gray-300 cursor-pointer'
                  >
                    {permission}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contato */}
      <div>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
          <Phone className='mr-2 h-5 w-5 text-brand-600' />
          Contato
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <Label htmlFor='phone'>Celular 1</Label>
            <Input
              id='phone'
              value={formData.phone}
              onChange={(e) => handleChange('phone', formatPhone(e.target.value))}
              placeholder='(00) 00000-0000'
              className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            />
          </div>

          <div>
            <Label htmlFor='phone2'>Celular 2</Label>
            <Input
              id='phone2'
              value={formData.phone2}
              onChange={(e) => handleChange('phone2', formatPhone(e.target.value))}
              placeholder='(00) 00000-0000'
              className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            />
          </div>

          <div>
            <Label htmlFor='instagram'>
              <Instagram className='inline mr-1 h-4 w-4' />
              Instagram
            </Label>
            <Input
              id='instagram'
              value={formData.instagram}
              onChange={(e) => handleChange('instagram', e.target.value)}
              placeholder='@usuario'
              className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            />
          </div>

          <div>
            <Label htmlFor='birthDate'>
              <Calendar className='inline mr-1 h-4 w-4' />
              Data de Nascimento
            </Label>
            <Input
              id='birthDate'
              type='date'
              value={formData.birthDate}
              onChange={(e) => handleChange('birthDate', e.target.value)}
              className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            />
          </div>
        </div>
      </div>

      {/* Documentos */}
      <div>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
          <FileText className='mr-2 h-5 w-5 text-brand-600' />
          Documentos
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <Label htmlFor='cpf'>CPF</Label>
            <Input
              id='cpf'
              value={formData.cpf}
              onChange={(e) => handleChange('cpf', formatCPF(e.target.value))}
              placeholder='000.000.000-00'
              className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            />
          </div>

          <div>
            <Label htmlFor='rg'>RG</Label>
            <Input
              id='rg'
              value={formData.rg}
              onChange={(e) => handleChange('rg', e.target.value)}
              placeholder='00.000.000-0'
              className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            />
          </div>

          <div>
            <Label htmlFor='rgIssuingBody'>Órgão Expedidor</Label>
            <Input
              id='rgIssuingBody'
              value={formData.rgIssuingBody}
              onChange={(e) => handleChange('rgIssuingBody', e.target.value)}
              placeholder='SSP/SP'
              className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            />
          </div>
        </div>
      </div>

      {/* Dados Bancários */}
      <div>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
          <CreditCard className='mr-2 h-5 w-5 text-brand-600' />
          Dados Bancários
        </h3>
        <div className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='personType'>Tipo de Pessoa</Label>
              <Select
                value={formData.personType}
                onValueChange={(value) => handleChange('personType', value)}
              >
                <SelectTrigger className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Pessoa Física'>Pessoa Física</SelectItem>
                  <SelectItem value='Pessoa Jurídica'>Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor='pixKey'>Chave PIX</Label>
              <Input
                id='pixKey'
                value={formData.pixKey}
                onChange={(e) => handleChange('pixKey', e.target.value)}
                placeholder='CPF, e-mail, telefone ou chave aleatória'
                className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              />
            </div>
          </div>

          {formData.personType === 'Pessoa Jurídica' && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
              <div className='md:col-span-2'>
                <Label htmlFor='companyName'>Razão Social</Label>
                <Input
                  id='companyName'
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  placeholder='Nome da empresa'
                  className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                />
              </div>
              <div>
                <Label htmlFor='cnpj'>CNPJ</Label>
                <Input
                  id='cnpj'
                  value={formData.cnpj}
                  onChange={(e) => handleChange('cnpj', formatCNPJ(e.target.value))}
                  placeholder='00.000.000/0000-00'
                  className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                />
              </div>
            </div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
            <div className='lg:col-span-2'>
              <Label htmlFor='bankName'>Banco</Label>
              <Input
                id='bankName'
                value={formData.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                placeholder='Nome do banco'
                className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              />
            </div>

            <div>
              <Label htmlFor='bankAgency'>Agência</Label>
              <Input
                id='bankAgency'
                value={formData.bankAgency}
                onChange={(e) => handleChange('bankAgency', e.target.value)}
                placeholder='0000'
                className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              />
            </div>

            <div>
              <Label htmlFor='bankAccount'>Conta</Label>
              <Input
                id='bankAccount'
                value={formData.bankAccount}
                onChange={(e) => handleChange('bankAccount', e.target.value)}
                placeholder='00000'
                className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              />
            </div>

            <div>
              <Label htmlFor='bankDigit'>Dígito</Label>
              <Input
                id='bankDigit'
                value={formData.bankDigit}
                onChange={(e) => handleChange('bankDigit', e.target.value)}
                placeholder='0'
                maxLength={1}
                className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              />
            </div>
          </div>

          <div>
            <Label htmlFor='accountType'>Tipo de Conta</Label>
            <Select
              value={formData.accountType}
              onValueChange={(value) => handleChange('accountType', value)}
            >
              <SelectTrigger className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'>
                <SelectValue placeholder='Selecione o tipo de conta' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Corrente'>Corrente</SelectItem>
                <SelectItem value='Poupança'>Poupança</SelectItem>
                <SelectItem value='Salário'>Salário</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
          <MapPin className='mr-2 h-5 w-5 text-brand-600' />
          Endereço
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <div className='lg:col-span-2'>
            <Label htmlFor='address'>Logradouro</Label>
            <Input
              id='address'
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder='Rua, Avenida, etc.'
              className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            />
          </div>

          <div>
            <Label htmlFor='addressNumber'>Número</Label>
            <Input
              id='addressNumber'
              value={formData.addressNumber}
              onChange={(e) => handleChange('addressNumber', e.target.value)}
              placeholder='000'
              className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            />
          </div>

          <div>
            <Label htmlFor='complement'>Complemento</Label>
            <Input
              id='complement'
              value={formData.complement}
              onChange={(e) => handleChange('complement', e.target.value)}
              placeholder='Apto, Bloco, etc.'
              className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            />
          </div>

          <div className='lg:col-span-2'>
            <Label htmlFor='neighborhood'>Bairro</Label>
            <Input
              id='neighborhood'
              value={formData.neighborhood}
              onChange={(e) => handleChange('neighborhood', e.target.value)}
              placeholder='Nome do bairro'
              className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            />
          </div>

          <div>
            <Label htmlFor='city'>Cidade</Label>
            <Input
              id='city'
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder='Nome da cidade'
              className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            />
          </div>

          <div>
            <Label htmlFor='state'>Estado</Label>
            <Select
              value={formData.state}
              onValueChange={(value) => handleChange('state', value)}
            >
              <SelectTrigger className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'>
                <SelectValue placeholder='UF' />
              </SelectTrigger>
              <SelectContent>
                {BRAZILIAN_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor='zipCode'>CEP</Label>
            <Input
              id='zipCode'
              value={formData.zipCode}
              onChange={(e) => handleChange('zipCode', formatCEP(e.target.value))}
              placeholder='00000-000'
              className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            />
          </div>
        </div>
      </div>

      {/* Enviar Convite */}
      {formData.email && (
        <div className='flex items-center space-x-2 p-4 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-200 dark:border-brand-800'>
          <Checkbox
            id='sendInvite'
            checked={formData.sendInvite}
            onCheckedChange={(checked) => handleChange('sendInvite', checked)}
          />
          <label
            htmlFor='sendInvite'
            className='text-sm text-gray-700 dark:text-gray-300 cursor-pointer'
          >
            Enviar convite por e-mail para <strong>{formData.email}</strong> acessar o sistema
          </label>
        </div>
      )}
    </div>
  );
}
