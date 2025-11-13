import React, { useState } from 'react';
import { Link } from 'wasp/client/router';
import { useQuery, createCampaign, listSegments, listCampaignTemplates } from 'wasp/client/operations';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Target,
  Calendar,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';

const CAMPAIGN_TYPES = [
  { value: 'BIRTHDAY', label: 'Aniversário', icon: '🎂', description: 'Mensagens automáticas de aniversário' },
  { value: 'REACTIVATION', label: 'Reativação', icon: '🔄', description: 'Reconquistar clientes inativos' },
  { value: 'PROMOTIONAL', label: 'Promocional', icon: '🎁', description: 'Ofertas e promoções especiais' },
  { value: 'ANNOUNCEMENT', label: 'Anúncio', icon: '📢', description: 'Novidades e comunicados' },
  { value: 'FEEDBACK_REQUEST', label: 'Feedback', icon: '⭐', description: 'Solicitar avaliações' },
  { value: 'APPOINTMENT_REMINDER', label: 'Lembrete', icon: '⏰', description: 'Lembretes de agendamento' },
  { value: 'FOLLOW_UP', label: 'Follow-up', icon: '📞', description: 'Acompanhamento pós-atendimento' },
  { value: 'CUSTOM', label: 'Personalizada', icon: '✨', description: 'Campanha customizada' },
];

const CHANNELS = [
  { value: 'EMAIL', label: 'E-mail', icon: Mail, description: 'Envio por correio eletrônico' },
  { value: 'SMS', label: 'SMS', icon: MessageSquare, description: 'Mensagem de texto' },
  { value: 'WHATSAPP', label: 'WhatsApp', icon: Phone, description: 'Mensagem pelo WhatsApp' },
  { value: 'PUSH', label: 'Push', icon: Send, description: 'Notificação push no app' },
];

const PLACEHOLDERS = [
  { value: '{{NOME_CLIENTE}}', label: 'Nome do Cliente' },
  { value: '{{NOME_SALAO}}', label: 'Nome do Salão' },
  { value: '{{DATA_AGENDAMENTO}}', label: 'Data do Agendamento' },
  { value: '{{HORA_AGENDAMENTO}}', label: 'Hora do Agendamento' },
  { value: '{{SERVICO}}', label: 'Nome do Serviço' },
  { value: '{{PROFISSIONAL}}', label: 'Nome do Profissional' },
  { value: '{{LINK_CONFIRMACAO}}', label: 'Link de Confirmação' },
  { value: '{{LINK_CANCELAMENTO}}', label: 'Link de Cancelamento' },
];

export default function CreateCampaignPage() {
  const { activeSalonId } = useSalonContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    channel: '',
    segmentId: '',
    targetClientIds: [] as string[],
    subject: '',
    messageTemplate: '',
    scheduledAt: '',
    useSchedule: false,
  });

  // Load segments
  const { data: segmentsData } = useQuery(
    listSegments,
    { salonId: activeSalonId || '', isActive: true },
    { enabled: !!activeSalonId }
  );

  // Load templates
  const { data: templates } = useQuery(
    listCampaignTemplates,
    { salonId: activeSalonId || '', type: formData.type || undefined },
    { enabled: !!activeSalonId && !!formData.type }
  );

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const scheduledAt = formData.useSchedule && formData.scheduledAt 
        ? new Date(formData.scheduledAt) 
        : undefined;

      await createCampaign({
        salonId: activeSalonId || '',
        name: formData.name,
        description: formData.description,
        type: formData.type,
        channel: formData.channel,
        segmentId: formData.segmentId || undefined,
        targetClientIds: formData.targetClientIds.length > 0 ? formData.targetClientIds : undefined,
        subject: formData.subject || undefined,
        messageTemplate: formData.messageTemplate,
        scheduledAt,
      });

      window.location.href = '/campaigns';
    } catch (error: any) {
      alert(error.message || 'Erro ao criar campanha');
    } finally {
      setSubmitting(false);
    }
  };

  const canGoToStep2 = formData.name && formData.type && formData.channel;
  const canGoToStep3 = canGoToStep2 && (formData.segmentId || formData.targetClientIds.length > 0);
  const canSubmit = canGoToStep3 && formData.messageTemplate;

  const applyTemplate = (template: any) => {
    setFormData({
      ...formData,
      subject: template.subject || formData.subject,
      messageTemplate: template.messageTemplate,
    });
  };

  const insertPlaceholder = (placeholder: string) => {
    setFormData({
      ...formData,
      messageTemplate: formData.messageTemplate + ' ' + placeholder,
    });
  };

  return (
    <div className='container mx-auto py-6 px-4 max-w-5xl'>
      {/* Header */}
      <div className='flex items-center gap-4 mb-6'>
        <Link to='/campaigns'>
          <Button variant='ghost' size='icon'>
            <ArrowLeft className='h-5 w-5' />
          </Button>
        </Link>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Nova Campanha</h1>
          <p className='text-muted-foreground'>Crie uma campanha de marketing em 3 etapas simples</p>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className='mb-8'>
        <div className='flex items-center justify-between max-w-2xl mx-auto'>
          {[1, 2, 3].map((step) => (
            <div key={step} className='flex items-center flex-1'>
              <div className='flex flex-col items-center flex-1'>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep > step
                      ? 'bg-green-500 text-white'
                      : currentStep === step
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step ? <Check className='h-5 w-5' /> : step}
                </div>
                <span className='text-xs mt-2 text-center'>
                  {step === 1 ? 'Configuração' : step === 2 ? 'Segmentação' : 'Conteúdo'}
                </span>
              </div>
              {step < 3 && (
                <div
                  className={`h-1 flex-1 mx-2 rounded ${
                    currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Basic Configuration */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='h-5 w-5' />
              Configuração Básica
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Campaign Name */}
            <div>
              <label className='block text-sm font-medium mb-2'>Nome da Campanha *</label>
              <input
                type='text'
                required
                className='w-full border rounded-md px-4 py-2'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder='Ex: Promoção de Verão 2025'
              />
            </div>

            {/* Description */}
            <div>
              <label className='block text-sm font-medium mb-2'>Descrição</label>
              <textarea
                className='w-full border rounded-md px-4 py-2 resize-none'
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder='Descreva o objetivo da campanha...'
              />
            </div>

            {/* Campaign Type */}
            <div>
              <label className='block text-sm font-medium mb-3'>Tipo de Campanha *</label>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                {CAMPAIGN_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type='button'
                    className={`p-4 border rounded-lg text-left transition-all hover:border-primary ${
                      formData.type === type.value ? 'border-primary bg-primary/5 ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setFormData({ ...formData, type: type.value })}
                  >
                    <div className='flex items-start gap-3'>
                      <span className='text-2xl'>{type.icon}</span>
                      <div className='flex-1'>
                        <p className='font-semibold'>{type.label}</p>
                        <p className='text-xs text-muted-foreground'>{type.description}</p>
                      </div>
                      {formData.type === type.value && <Check className='h-5 w-5 text-primary' />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Channel */}
            <div>
              <label className='block text-sm font-medium mb-3'>Canal de Comunicação *</label>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                {CHANNELS.map((channel) => {
                  const Icon = channel.icon;
                  return (
                    <button
                      key={channel.value}
                      type='button'
                      className={`p-4 border rounded-lg text-left transition-all hover:border-primary ${
                        formData.channel === channel.value ? 'border-primary bg-primary/5 ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setFormData({ ...formData, channel: channel.value })}
                    >
                      <div className='flex items-start gap-3'>
                        <Icon className='h-6 w-6 text-primary' />
                        <div className='flex-1'>
                          <p className='font-semibold'>{channel.label}</p>
                          <p className='text-xs text-muted-foreground'>{channel.description}</p>
                        </div>
                        {formData.channel === channel.value && <Check className='h-5 w-5 text-primary' />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className='flex justify-end pt-4'>
              <Button onClick={() => setCurrentStep(2)} disabled={!canGoToStep2}>
                Próximo: Segmentação
                <ArrowRight className='ml-2 h-4 w-4' />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Segmentation */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Target className='h-5 w-5' />
              Segmentação de Público
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Segments */}
            <div>
              <label className='block text-sm font-medium mb-3'>
                Selecione um Segmento de Clientes *
              </label>
              
              {segmentsData && segmentsData.segments.length > 0 ? (
                <div className='space-y-2'>
                  {segmentsData.segments.map((segment: any) => (
                    <button
                      key={segment.id}
                      type='button'
                      className={`w-full p-4 border rounded-lg text-left transition-all hover:border-primary ${
                        formData.segmentId === segment.id ? 'border-primary bg-primary/5 ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setFormData({ ...formData, segmentId: segment.id, targetClientIds: [] })}
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <p className='font-semibold'>{segment.name}</p>
                          {segment.description && (
                            <p className='text-sm text-muted-foreground mt-1'>{segment.description}</p>
                          )}
                          <div className='flex items-center gap-2 mt-2'>
                            <Badge variant='outline'>{segment.clientCount} clientes</Badge>
                            {segment.isActive && <Badge variant='default'>Ativo</Badge>}
                          </div>
                        </div>
                        {formData.segmentId === segment.id && <Check className='h-5 w-5 text-primary ml-4' />}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg'>
                  <Target className='h-12 w-12 mx-auto mb-3 opacity-50' />
                  <p className='mb-2'>Nenhum segmento criado ainda</p>
                  <p className='text-sm'>Você pode criar segmentos na página de Segmentação</p>
                </div>
              )}
            </div>

            {/* Schedule Option */}
            <div className='border-t pt-6'>
              <div className='flex items-center gap-3 mb-4'>
                <input
                  type='checkbox'
                  id='useSchedule'
                  checked={formData.useSchedule}
                  onChange={(e) => setFormData({ ...formData, useSchedule: e.target.checked })}
                  className='h-4 w-4'
                />
                <label htmlFor='useSchedule' className='text-sm font-medium flex items-center gap-2'>
                  <Calendar className='h-4 w-4' />
                  Agendar envio para uma data específica
                </label>
              </div>

              {formData.useSchedule && (
                <input
                  type='datetime-local'
                  className='w-full border rounded-md px-4 py-2'
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                />
              )}
            </div>

            {/* Actions */}
            <div className='flex justify-between pt-4'>
              <Button variant='outline' onClick={() => setCurrentStep(1)}>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Voltar
              </Button>
              <Button onClick={() => setCurrentStep(3)} disabled={!canGoToStep3}>
                Próximo: Conteúdo
                <ArrowRight className='ml-2 h-4 w-4' />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Content */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <MessageSquare className='h-5 w-5' />
              Conteúdo da Mensagem
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Templates */}
            {templates && templates.length > 0 && (
              <div>
                <label className='block text-sm font-medium mb-3 flex items-center gap-2'>
                  <Sparkles className='h-4 w-4' />
                  Templates Disponíveis
                </label>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  {templates.map((template: any) => (
                    <button
                      key={template.id}
                      type='button'
                      className='p-3 border rounded-lg text-left hover:border-primary transition-all'
                      onClick={() => applyTemplate(template)}
                    >
                      <p className='font-semibold text-sm'>{template.name}</p>
                      {template.description && (
                        <p className='text-xs text-muted-foreground mt-1'>{template.description}</p>
                      )}
                      <Badge variant='outline' className='mt-2 text-xs'>
                        {template.channel}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Subject (Email only) */}
            {formData.channel === 'EMAIL' && (
              <div>
                <label className='block text-sm font-medium mb-2'>Assunto do E-mail</label>
                <input
                  type='text'
                  className='w-full border rounded-md px-4 py-2'
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder='Digite o assunto do e-mail...'
                />
              </div>
            )}

            {/* Message Template */}
            <div>
              <label className='block text-sm font-medium mb-2'>Mensagem *</label>
              <textarea
                required
                className='w-full border rounded-md px-4 py-2 resize-none font-mono text-sm'
                rows={8}
                value={formData.messageTemplate}
                onChange={(e) => setFormData({ ...formData, messageTemplate: e.target.value })}
                placeholder='Digite sua mensagem aqui...'
              />
              <p className='text-xs text-muted-foreground mt-1'>
                {formData.messageTemplate.length} caracteres
              </p>
            </div>

            {/* Placeholders */}
            <div>
              <label className='block text-sm font-medium mb-2'>Variáveis Disponíveis</label>
              <div className='flex flex-wrap gap-2'>
                {PLACEHOLDERS.map((ph) => (
                  <button
                    key={ph.value}
                    type='button'
                    className='px-3 py-1 text-xs border rounded-full hover:bg-primary hover:text-white transition-colors'
                    onClick={() => insertPlaceholder(ph.value)}
                    title={`Clique para inserir: ${ph.label}`}
                  >
                    {ph.label}
                  </button>
                ))}
              </div>
              <p className='text-xs text-muted-foreground mt-2'>
                Clique nas variáveis para adicioná-las à mensagem
              </p>
            </div>

            {/* Preview */}
            {formData.messageTemplate && (
              <div>
                <label className='block text-sm font-medium mb-2'>Preview</label>
                <div className='p-4 bg-muted rounded-lg border'>
                  {formData.channel === 'EMAIL' && formData.subject && (
                    <p className='font-semibold mb-2 pb-2 border-b'>
                      Assunto: {formData.subject}
                    </p>
                  )}
                  <p className='whitespace-pre-wrap text-sm'>{formData.messageTemplate}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className='flex justify-between pt-4'>
              <Button variant='outline' onClick={() => setCurrentStep(2)}>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Voltar
              </Button>
              <Button onClick={handleSubmit} disabled={!canSubmit || submitting}>
                {submitting ? (
                  <>
                    <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                    Criando...
                  </>
                ) : (
                  <>
                    <Check className='mr-2 h-4 w-4' />
                    Criar Campanha
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
