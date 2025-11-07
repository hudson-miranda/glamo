import { EmployeeFormData } from '../CreateEmployeePage';
import { Label } from '../../../../components/ui/label';
import { Input } from '../../../../components/ui/input';
import { Checkbox } from '../../../../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { DollarSign, Percent, AlertCircle, Info } from 'lucide-react';

type CommissionStepProps = {
  formData: EmployeeFormData;
  updateFormData: (data: Partial<EmployeeFormData>) => void;
};

const COMMISSION_TYPES = [
  { value: 'Não gerar comissão', label: 'Não gerar comissão' },
  { value: 'Porcentagem', label: 'Porcentagem sobre o valor do serviço' },
  { value: 'Valor fixo', label: 'Valor fixo por serviço' },
  { value: 'Por serviço', label: 'Configuração individual por serviço' },
];

const TIP_RULES = [
  { value: 'Regra padrão do sistema', label: 'Regra padrão do sistema' },
  { value: 'Regra personalizada', label: 'Regra personalizada' },
];

export function CommissionStep({ formData, updateFormData }: CommissionStepProps) {
  const handleChange = (field: keyof EmployeeFormData, value: any) => {
    updateFormData({ [field]: value });
  };

  const showCommissionValue =
    formData.commissionType === 'Porcentagem' || formData.commissionType === 'Valor fixo';

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white flex items-center'>
          <DollarSign className='mr-2 h-5 w-5 text-brand-600' />
          Comissões e Gorjetas
        </h3>
        <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
          Configure como este colaborador receberá comissões e gorjetas
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
            Esta é uma versão mockup da configuração de comissões. A implementação completa
            incluirá cálculos automáticos, relatórios e integração com o módulo financeiro.
          </p>
        </div>
      </div>

      {/* Configuração de Comissões */}
      <div className='space-y-4'>
        <div className='p-6 bg-white dark:bg-gray-900/80 rounded-lg border-2 border-gray-200 dark:border-gray-700'>
          <h4 className='font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
            <Percent className='mr-2 h-4 w-4 text-brand-600' />
            Comissões sobre Serviços
          </h4>

          <div className='space-y-4'>
            <div>
              <Label htmlFor='commissionType'>Tipo de Comissão</Label>
              <Select
                value={formData.commissionType}
                onValueChange={(value) => handleChange('commissionType', value)}
              >
                <SelectTrigger className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMISSION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {showCommissionValue && (
              <div className='p-4 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-200 dark:border-brand-800'>
                <Label htmlFor='commissionValue'>
                  {formData.commissionType === 'Porcentagem'
                    ? 'Porcentagem (%)'
                    : 'Valor Fixo (R$)'}
                </Label>
                <div className='relative mt-2'>
                  <Input
                    id='commissionValue'
                    type='number'
                    min='0'
                    step={formData.commissionType === 'Porcentagem' ? '0.01' : '1'}
                    max={formData.commissionType === 'Porcentagem' ? '100' : undefined}
                    value={formData.commissionValue}
                    onChange={(e) =>
                      handleChange('commissionValue', parseFloat(e.target.value) || 0)
                    }
                    className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  />
                  <div className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400'>
                    {formData.commissionType === 'Porcentagem' ? '%' : 'R$'}
                  </div>
                </div>
                {formData.commissionType === 'Porcentagem' && (
                  <p className='text-xs text-gray-600 dark:text-gray-400 mt-2'>
                    💡 Exemplo: Em um serviço de R$ 100,00 com {formData.commissionValue}% de
                    comissão, o colaborador receberá R${' '}
                    {((100 * formData.commissionValue) / 100).toFixed(2)}
                  </p>
                )}
                {formData.commissionType === 'Valor fixo' && (
                  <p className='text-xs text-gray-600 dark:text-gray-400 mt-2'>
                    💡 O colaborador receberá R$ {formData.commissionValue.toFixed(2)} fixos por
                    cada serviço executado
                  </p>
                )}
              </div>
            )}

            {formData.commissionType === 'Por serviço' && (
              <div className='p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800'>
                <div className='flex items-start gap-2'>
                  <Info className='h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5' />
                  <div className='text-sm text-yellow-800 dark:text-yellow-200'>
                    <p className='font-semibold mb-1'>Configuração Individual</p>
                    <p>
                      Com esta opção, você poderá configurar uma comissão diferente para cada
                      serviço que o colaborador executa. Esta configuração será feita no módulo de
                      Serviços.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {formData.commissionType === 'Não gerar comissão' && (
              <div className='p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700'>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  ℹ️ Este colaborador não receberá comissões sobre os serviços executados. Ideal
                  para funcionários com salário fixo.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Configuração de Gorjetas */}
        <div className='p-6 bg-white dark:bg-gray-900/80 rounded-lg border-2 border-gray-200 dark:border-gray-700'>
          <h4 className='font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
            <DollarSign className='mr-2 h-4 w-4 text-green-600' />
            Gorjetas
          </h4>

          <div className='space-y-4'>
            <div className='flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg'>
              <Checkbox
                id='canReceiveTips'
                checked={formData.canReceiveTips}
                onCheckedChange={(checked) => handleChange('canReceiveTips', checked)}
              />
              <label
                htmlFor='canReceiveTips'
                className='text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer'
              >
                Este colaborador pode receber gorjetas
              </label>
            </div>

            {formData.canReceiveTips && (
              <>
                <div>
                  <Label htmlFor='tipRule'>Regra de Gorjetas</Label>
                  <Select
                    value={formData.tipRule}
                    onValueChange={(value) => handleChange('tipRule', value)}
                  >
                    <SelectTrigger className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIP_RULES.map((rule) => (
                        <SelectItem key={rule.value} value={rule.value}>
                          {rule.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.tipRule === 'Regra padrão do sistema' && (
                    <p className='text-xs text-gray-600 dark:text-gray-400 mt-2'>
                      A gorjeta será distribuída de acordo com a regra padrão configurada no
                      sistema (normalmente distribuição igualitária entre todos os colaboradores
                      do agendamento)
                    </p>
                  )}
                </div>

                <div className='flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
                  <Checkbox
                    id='tipsOnlyFromAppointments'
                    checked={formData.tipsOnlyFromAppointments}
                    onCheckedChange={(checked) =>
                      handleChange('tipsOnlyFromAppointments', checked)
                    }
                  />
                  <label
                    htmlFor='tipsOnlyFromAppointments'
                    className='text-sm text-gray-700 dark:text-gray-300 cursor-pointer'
                  >
                    Receber gorjetas apenas de agendamentos onde participou
                  </label>
                </div>

                {formData.tipRule === 'Regra personalizada' && (
                  <div className='p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800'>
                    <div className='flex items-start gap-2'>
                      <Info className='h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5' />
                      <div className='text-sm text-yellow-800 dark:text-yellow-200'>
                        <p className='font-semibold mb-1'>Regra Personalizada</p>
                        <p>
                          Com esta opção, você poderá definir regras específicas de distribuição
                          de gorjetas para este colaborador. Esta configuração será feita no módulo
                          de Configurações.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Resumo */}
      <div className='p-4 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-200 dark:border-brand-800'>
        <p className='text-sm font-semibold text-gray-900 dark:text-white mb-2'>
          📊 Resumo da Configuração
        </p>
        <div className='space-y-1 text-sm text-gray-700 dark:text-gray-300'>
          <p>
            <strong>Comissão:</strong> {formData.commissionType}
            {showCommissionValue &&
              ` - ${formData.commissionValue}${formData.commissionType === 'Porcentagem' ? '%' : ' reais'}`}
          </p>
          <p>
            <strong>Gorjetas:</strong>{' '}
            {formData.canReceiveTips ? `Habilitado (${formData.tipRule})` : 'Desabilitado'}
          </p>
          {formData.canReceiveTips && formData.tipsOnlyFromAppointments && (
            <p className='text-xs text-gray-600 dark:text-gray-400'>
              • Apenas de agendamentos onde participou
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
