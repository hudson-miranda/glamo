import { useState } from 'react';
import { Link } from 'wasp/client/router';
import {
  useQuery,
  listClients,
  listSegments,
  listCampaignTemplates,
  sendManualMessage,
} from 'wasp/client/operations';
import { useSalonContext } from '../../contexts/SalonContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  Send,
  Mail,
  MessageSquare,
  Phone,
  Bell,
  Users,
  Filter,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Target,
  Sparkles,
  Eye,
  Download,
  Plus,
  Minus,
} from 'lucide-react';

const CHANNELS = {
  EMAIL: { label: 'E-mail', icon: Mail, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  SMS: { label: 'SMS', icon: MessageSquare, color: 'text-green-600', bgColor: 'bg-green-50' },
  WHATSAPP: { label: 'WhatsApp', icon: Phone, color: 'text-green-500', bgColor: 'bg-green-50' },
  PUSH: { label: 'Push Notification', icon: Bell, color: 'text-purple-600', bgColor: 'bg-purple-50' },
};

const PLACEHOLDERS = [
  { value: '{{NOME_CLIENTE}}', label: 'Nome do Cliente' },
  { value: '{{NOME_SALAO}}', label: 'Nome do Salão' },
  { value: '{{DATA_AGENDAMENTO}}', label: 'Data do Agendamento' },
  { value: '{{HORA_AGENDAMENTO}}', label: 'Hora do Agendamento' },
  { value: '{{SERVICO}}', label: 'Serviço' },
  { value: '{{PROFISSIONAL}}', label: 'Profissional' },
  { value: '{{VALOR}}', label: 'Valor' },
  { value: '{{LINK_CONFIRMACAO}}', label: 'Link de Confirmação' },
];

type RecipientSelectionMode = 'all' | 'segment' | 'manual' | 'upload';

export default function BulkMessagingPage() {
  const { activeSalonId } = useSalonContext();

  // Step state
  const [currentStep, setCurrentStep] = useState(1); // 1: Recipients, 2: Message, 3: Review

  // Recipient selection
  const [selectionMode, setSelectionMode] = useState<RecipientSelectionMode>('segment');
  const [selectedSegmentId, setSelectedSegmentId] = useState('');
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [uploadedRecipients, setUploadedRecipients] = useState<any[]>([]);

  // Message configuration
  const [channel, setChannel] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');

  // Sending state
  const [isSending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [sendResults, setSendResults] = useState<any>(null);

  // Preview
  const [showPreview, setShowPreview] = useState(false);

  // Fetch data
  const { data: clientsData } = useQuery(listClients, {
    salonId: activeSalonId,
    status: 'ACTIVE',
    page: 1,
    pageSize: 1000,
  });

  const { data: segmentsData } = useQuery(listSegments, {
    salonId: activeSalonId,
    isActive: true,
  });

  const { data: templatesData } = useQuery(listCampaignTemplates, {
    salonId: activeSalonId,
  });

  const sendMessageFn = sendManualMessage();

  // Calculate recipients
  const getRecipients = () => {
    if (selectionMode === 'all') {
      return clientsData?.clients || [];
    } else if (selectionMode === 'segment' && selectedSegmentId) {
      // In a real implementation, this would call evaluateSegment
      return clientsData?.clients || [];
    } else if (selectionMode === 'manual') {
      return clientsData?.clients?.filter((c: any) => selectedClientIds.includes(c.id)) || [];
    } else if (selectionMode === 'upload') {
      return uploadedRecipients;
    }
    return [];
  };

  const recipients = getRecipients();
  const recipientCount = recipients.length;

  // Estimate cost (exemplo: R$ 0.10 por SMS, R$ 0.05 por WhatsApp, grátis para Email/Push)
  const estimateCost = () => {
    if (channel === 'SMS') return recipientCount * 0.1;
    if (channel === 'WHATSAPP') return recipientCount * 0.05;
    return 0;
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = templatesData?.templates?.find((t: any) => t.id === templateId);
    if (template) {
      setChannel(template.channel);
      setSubject(template.subject || '');
      setMessage(template.messageTemplate);
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    setMessage(message + ' ' + placeholder);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map((h) => h.trim());

      const recipients = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim());
        const recipient: any = {};
        headers.forEach((header, index) => {
          recipient[header] = values[index];
        });
        return recipient;
      });

      setUploadedRecipients(recipients.filter((r) => r.name || r.email || r.phone));
    };
    reader.readAsText(file);
  };

  const handleSend = async () => {
    if (!channel || !message || recipientCount === 0) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setSending(true);
    setSendProgress(0);

    const results = {
      total: recipientCount,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Simulate sending (in real implementation, this would be a batch job)
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];

      try {
        await sendMessageFn({
          clientId: recipient.id,
          salonId: activeSalonId || '',
          channel: channel as any,
          subject: subject || undefined,
          message,
        });

        results.sent++;
      } catch (err: any) {
        results.failed++;
        results.errors.push(`${recipient.name}: ${err.message}`);
      }

      setSendProgress(Math.round(((i + 1) / recipientCount) * 100));
    }

    setSendResults(results);
    setSending(false);
  };

  const isStep1Valid = selectionMode && recipientCount > 0;
  const isStep2Valid = channel && message && (channel !== 'EMAIL' || subject);

  return (
    <div className='container mx-auto py-6 px-4 max-w-6xl'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-3xl font-bold tracking-tight'>Envio em Massa</h1>
        <p className='text-muted-foreground'>
          Envie mensagens para múltiplos clientes de uma vez
        </p>
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
                  {currentStep > step ? <CheckCircle2 className='h-5 w-5' /> : step}
                </div>
                <span className='text-xs mt-2 text-center'>
                  {step === 1 ? 'Destinatários' : step === 2 ? 'Mensagem' : 'Revisão'}
                </span>
              </div>
              {step < 3 && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Recipients */}
      {currentStep === 1 && (
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Selecione os Destinatários</CardTitle>
              <CardDescription>Escolha como você deseja selecionar os clientes</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Selection Mode */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <button
                  type='button'
                  onClick={() => setSelectionMode('all')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectionMode === 'all'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <Users className='h-6 w-6 text-primary' />
                    <div>
                      <h4 className='font-semibold'>Todos os Clientes</h4>
                      <p className='text-sm text-muted-foreground'>
                        {clientsData?.clients?.length || 0} clientes ativos
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type='button'
                  onClick={() => setSelectionMode('segment')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectionMode === 'segment'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <Target className='h-6 w-6 text-primary' />
                    <div>
                      <h4 className='font-semibold'>Segmento de Clientes</h4>
                      <p className='text-sm text-muted-foreground'>
                        {segmentsData?.segments?.length || 0} segmentos disponíveis
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type='button'
                  onClick={() => setSelectionMode('manual')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectionMode === 'manual'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <Filter className='h-6 w-6 text-primary' />
                    <div>
                      <h4 className='font-semibold'>Seleção Manual</h4>
                      <p className='text-sm text-muted-foreground'>
                        Escolha clientes individualmente
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type='button'
                  onClick={() => setSelectionMode('upload')}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectionMode === 'upload'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <Upload className='h-6 w-6 text-primary' />
                    <div>
                      <h4 className='font-semibold'>Upload de CSV</h4>
                      <p className='text-sm text-muted-foreground'>
                        Importar lista de contatos
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Segment Selection */}
              {selectionMode === 'segment' && (
                <div>
                  <label className='text-sm font-medium mb-2 block'>Escolha o Segmento</label>
                  <select
                    value={selectedSegmentId}
                    onChange={(e) => setSelectedSegmentId(e.target.value)}
                    className='w-full border rounded-md px-3 py-2'
                  >
                    <option value=''>Selecione um segmento...</option>
                    {segmentsData?.segments?.map((segment: any) => (
                      <option key={segment.id} value={segment.id}>
                        {segment.name} ({segment.clientCount || 0} clientes)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Manual Selection */}
              {selectionMode === 'manual' && (
                <div>
                  <label className='text-sm font-medium mb-2 block'>Selecione os Clientes</label>
                  <div className='max-h-64 overflow-y-auto border rounded-md p-3 space-y-2'>
                    {clientsData?.clients?.map((client: any) => (
                      <label key={client.id} className='flex items-center gap-2 cursor-pointer'>
                        <input
                          type='checkbox'
                          checked={selectedClientIds.includes(client.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedClientIds([...selectedClientIds, client.id]);
                            } else {
                              setSelectedClientIds(selectedClientIds.filter((id) => id !== client.id));
                            }
                          }}
                          className='rounded'
                        />
                        <span className='text-sm'>{client.name}</span>
                        {client.email && (
                          <span className='text-xs text-muted-foreground'>({client.email})</span>
                        )}
                      </label>
                    ))}
                  </div>
                  <p className='text-sm text-muted-foreground mt-2'>
                    {selectedClientIds.length} cliente(s) selecionado(s)
                  </p>
                </div>
              )}

              {/* CSV Upload */}
              {selectionMode === 'upload' && (
                <div>
                  <label className='text-sm font-medium mb-2 block'>Upload de CSV</label>
                  <div className='border-2 border-dashed rounded-lg p-6 text-center'>
                    <Upload className='h-8 w-8 text-muted-foreground mx-auto mb-2' />
                    <p className='text-sm text-muted-foreground mb-2'>
                      Arraste um arquivo CSV ou clique para selecionar
                    </p>
                    <input
                      type='file'
                      accept='.csv'
                      onChange={handleFileUpload}
                      className='text-sm'
                    />
                    <p className='text-xs text-muted-foreground mt-2'>
                      Formato: name, email, phone (separados por vírgula)
                    </p>
                  </div>
                  {uploadedRecipients.length > 0 && (
                    <div className='mt-3 p-3 bg-green-50 border border-green-200 rounded-md'>
                      <p className='text-sm text-green-700'>
                        ✓ {uploadedRecipients.length} contato(s) importado(s)
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Recipient Count */}
              <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Users className='h-5 w-5 text-blue-600' />
                    <span className='font-semibold text-blue-900'>
                      {recipientCount} destinatário(s) selecionado(s)
                    </span>
                  </div>
                  <Badge className='bg-blue-600'>
                    Custo Estimado: R$ {estimateCost().toFixed(2)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className='flex justify-end gap-2'>
            <Button onClick={() => setCurrentStep(2)} disabled={!isStep1Valid}>
              Próxima: Mensagem
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Message */}
      {currentStep === 2 && (
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Configure a Mensagem</CardTitle>
              <CardDescription>Escolha o canal e escreva sua mensagem</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Template Selection */}
              <div>
                <label className='text-sm font-medium mb-2 block'>
                  Template (Opcional)
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className='w-full border rounded-md px-3 py-2'
                >
                  <option value=''>Começar do zero...</option>
                  {templatesData?.templates?.map((template: any) => (
                    <option key={template.id} value={template.id}>
                      {template.name} - {CHANNELS[template.channel as keyof typeof CHANNELS]?.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Channel Selection */}
              <div>
                <label className='text-sm font-medium mb-2 block'>Canal de Envio *</label>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                  {Object.entries(CHANNELS).map(([value, config]) => {
                    const ChannelIcon = config.icon;
                    return (
                      <button
                        key={value}
                        type='button'
                        onClick={() => setChannel(value)}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          channel === value
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <ChannelIcon className={`h-6 w-6 ${config.color} mx-auto mb-2`} />
                        <p className='text-sm font-medium text-center'>{config.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject (Email only) */}
              {channel === 'EMAIL' && (
                <div>
                  <label className='text-sm font-medium mb-2 block'>Assunto *</label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder='Assunto do e-mail'
                  />
                </div>
              )}

              {/* Message */}
              <div>
                <label className='text-sm font-medium mb-2 block'>Mensagem *</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder='Digite sua mensagem...'
                  rows={8}
                />
                <p className='text-xs text-muted-foreground mt-1'>
                  {message.length} caracteres
                </p>
              </div>

              {/* Placeholders */}
              <div>
                <label className='text-sm font-medium mb-2 block'>Variáveis</label>
                <div className='flex flex-wrap gap-2'>
                  {PLACEHOLDERS.map((placeholder) => (
                    <Button
                      key={placeholder.value}
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => insertPlaceholder(placeholder.value)}
                    >
                      <Plus className='h-3 w-3 mr-1' />
                      {placeholder.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div className='flex items-center gap-3 p-3 border rounded-lg'>
                <input
                  type='checkbox'
                  id='schedule'
                  checked={scheduleEnabled}
                  onChange={(e) => setScheduleEnabled(e.target.checked)}
                  className='rounded'
                />
                <label htmlFor='schedule' className='flex-1 cursor-pointer'>
                  <span className='text-sm font-medium'>Agendar envio</span>
                  <p className='text-xs text-muted-foreground'>
                    Programe para enviar em uma data/hora específica
                  </p>
                </label>
                {scheduleEnabled && (
                  <input
                    type='datetime-local'
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className='border rounded px-2 py-1 text-sm'
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className='flex justify-between gap-2'>
            <Button variant='outline' onClick={() => setCurrentStep(1)}>
              Voltar
            </Button>
            <div className='flex gap-2'>
              <Button variant='outline' onClick={() => setShowPreview(true)}>
                <Eye className='h-4 w-4 mr-2' />
                Visualizar
              </Button>
              <Button onClick={() => setCurrentStep(3)} disabled={!isStep2Valid}>
                Próxima: Revisão
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review and Send */}
      {currentStep === 3 && (
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Revisar e Enviar</CardTitle>
              <CardDescription>Confira os detalhes antes de enviar</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Summary */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='p-4 bg-muted rounded-lg'>
                  <p className='text-sm text-muted-foreground mb-1'>Destinatários</p>
                  <p className='text-2xl font-bold'>{recipientCount}</p>
                </div>
                <div className='p-4 bg-muted rounded-lg'>
                  <p className='text-sm text-muted-foreground mb-1'>Canal</p>
                  <p className='text-2xl font-bold'>
                    {CHANNELS[channel as keyof typeof CHANNELS]?.label}
                  </p>
                </div>
                <div className='p-4 bg-muted rounded-lg'>
                  <p className='text-sm text-muted-foreground mb-1'>Custo Estimado</p>
                  <p className='text-2xl font-bold'>R$ {estimateCost().toFixed(2)}</p>
                </div>
                <div className='p-4 bg-muted rounded-lg'>
                  <p className='text-sm text-muted-foreground mb-1'>Agendamento</p>
                  <p className='text-2xl font-bold'>
                    {scheduleEnabled ? 'Agendado' : 'Imediato'}
                  </p>
                </div>
              </div>

              {/* Message Preview */}
              <div className='border rounded-lg p-4'>
                <h4 className='font-semibold mb-2'>Preview da Mensagem</h4>
                {subject && (
                  <p className='text-sm mb-2'>
                    <span className='font-medium'>Assunto:</span> {subject}
                  </p>
                )}
                <div className='bg-muted p-3 rounded text-sm whitespace-pre-wrap'>
                  {message}
                </div>
              </div>

              {/* Sending Progress */}
              {isSending && (
                <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                  <div className='flex items-center gap-3 mb-2'>
                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600' />
                    <span className='font-semibold text-blue-900'>
                      Enviando... {sendProgress}%
                    </span>
                  </div>
                  <div className='w-full bg-blue-200 rounded-full h-2'>
                    <div
                      className='bg-blue-600 h-2 rounded-full transition-all'
                      style={{ width: `${sendProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Results */}
              {sendResults && (
                <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
                  <h4 className='font-semibold text-green-900 mb-3'>Envio Concluído!</h4>
                  <div className='grid grid-cols-3 gap-4 mb-3'>
                    <div>
                      <p className='text-sm text-green-700'>Total</p>
                      <p className='text-2xl font-bold text-green-900'>{sendResults.total}</p>
                    </div>
                    <div>
                      <p className='text-sm text-green-700'>Enviados</p>
                      <p className='text-2xl font-bold text-green-900'>{sendResults.sent}</p>
                    </div>
                    <div>
                      <p className='text-sm text-red-700'>Falhas</p>
                      <p className='text-2xl font-bold text-red-900'>{sendResults.failed}</p>
                    </div>
                  </div>
                  {sendResults.errors.length > 0 && (
                    <details className='text-sm'>
                      <summary className='cursor-pointer text-red-700 font-medium'>
                        Ver erros ({sendResults.errors.length})
                      </summary>
                      <ul className='mt-2 space-y-1 text-red-600 text-xs'>
                        {sendResults.errors.map((error: string, i: number) => (
                          <li key={i}>• {error}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className='flex justify-between gap-2'>
            <Button variant='outline' onClick={() => setCurrentStep(2)} disabled={isSending}>
              Voltar
            </Button>
            <div className='flex gap-2'>
              {sendResults ? (
                <>
                  <Button variant='outline' onClick={() => window.location.reload()}>
                    Novo Envio
                  </Button>
                  <Button onClick={() => (window.location.href = '/communication/log')}>
                    Ver Histórico
                  </Button>
                </>
              ) : (
                <Button onClick={handleSend} disabled={isSending}>
                  {isSending ? (
                    <>
                      <Clock className='h-4 w-4 mr-2 animate-spin' />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className='h-4 w-4 mr-2' />
                      Enviar Agora ({recipientCount})
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview da Mensagem</DialogTitle>
            <DialogDescription>
              Visualize como sua mensagem será exibida
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              {CHANNELS[channel as keyof typeof CHANNELS]?.icon &&
                (() => {
                  const ChannelIcon = CHANNELS[channel as keyof typeof CHANNELS].icon;
                  return <ChannelIcon className='h-5 w-5' />;
                })()}
              <span className='font-medium'>
                {CHANNELS[channel as keyof typeof CHANNELS]?.label}
              </span>
            </div>
            {subject && (
              <div>
                <span className='text-sm font-medium'>Assunto:</span>
                <p className='text-sm mt-1'>{subject}</p>
              </div>
            )}
            <div>
              <span className='text-sm font-medium'>Mensagem:</span>
              <div className='mt-2 p-4 bg-muted rounded-md text-sm whitespace-pre-wrap'>
                {message.replace(/\{\{NOME_CLIENTE\}\}/g, 'João Silva')
                  .replace(/\{\{NOME_SALAO\}\}/g, 'Meu Salão')
                  .replace(/\{\{DATA_AGENDAMENTO\}\}/g, '15/11/2025')
                  .replace(/\{\{HORA_AGENDAMENTO\}\}/g, '14:00')}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
