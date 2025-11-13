import { useState } from 'react';
import { Link } from 'wasp/client/router';
import {
  useQuery,
  listCampaignTemplates,
  createCampaignTemplate,
  type CampaignTemplate,
} from 'wasp/client/operations';
import { useSalonContext } from '../../contexts/SalonContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
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
  Search,
  Plus,
  Mail,
  MessageSquare,
  Phone,
  Bell,
  Cake,
  RefreshCw,
  Percent,
  Megaphone,
  MessageCircle,
  Calendar,
  UserCheck,
  Sparkles,
  Edit,
  Copy,
  Trash2,
  Eye,
  Filter,
  Star,
} from 'lucide-react';

// Type and Channel configurations
const CAMPAIGN_TYPES = {
  BIRTHDAY: { label: 'Aniversário', icon: Cake },
  REACTIVATION: { label: 'Reativação', icon: RefreshCw },
  PROMOTIONAL: { label: 'Promocional', icon: Percent },
  ANNOUNCEMENT: { label: 'Comunicado', icon: Megaphone },
  FEEDBACK_REQUEST: { label: 'Pesquisa', icon: MessageCircle },
  APPOINTMENT_REMINDER: { label: 'Lembrete', icon: Calendar },
  FOLLOW_UP: { label: 'Follow-up', icon: UserCheck },
  CUSTOM: { label: 'Personalizada', icon: Sparkles },
};

const CHANNELS = {
  EMAIL: { label: 'E-mail', icon: Mail, color: 'text-blue-600' },
  SMS: { label: 'SMS', icon: MessageSquare, color: 'text-green-600' },
  WHATSAPP: { label: 'WhatsApp', icon: Phone, color: 'text-green-500' },
  PUSH: { label: 'Push', icon: Bell, color: 'text-purple-600' },
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

export default function TemplatesPage() {
  const { activeSalonId } = useSalonContext();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [channelFilter, setChannelFilter] = useState<string>('');
  const [showSystemTemplates, setShowSystemTemplates] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    channel: '',
    subject: '',
    messageTemplate: '',
  });

  // Fetch templates
  const { data, isLoading, error, refetch } = useQuery(listCampaignTemplates, {
    salonId: activeSalonId,
  });

  const createTemplateFn = createCampaignTemplate();

  // Filter templates
  const filteredTemplates = data?.templates?.filter((template: any) => {
    if (!showSystemTemplates && template.isSystem) return false;
    if (typeFilter && template.type !== typeFilter) return false;
    if (channelFilter && template.channel !== channelFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        template.name.toLowerCase().includes(search) ||
        template.description?.toLowerCase().includes(search) ||
        template.messageTemplate.toLowerCase().includes(search)
      );
    }
    return true;
  }) || [];

  // Stats
  const totalTemplates = data?.templates?.length || 0;
  const customTemplates = data?.templates?.filter((t: any) => !t.isSystem).length || 0;
  const systemTemplates = data?.templates?.filter((t: any) => t.isSystem).length || 0;

  const handleOpenDialog = (template?: any) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        description: template.description || '',
        type: template.type,
        channel: template.channel,
        subject: template.subject || '',
        messageTemplate: template.messageTemplate,
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: '',
        description: '',
        type: '',
        channel: '',
        subject: '',
        messageTemplate: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createTemplateFn({
        salonId: activeSalonId || '',
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type as any,
        channel: formData.channel as any,
        subject: formData.subject || undefined,
        messageTemplate: formData.messageTemplate,
        placeholders: PLACEHOLDERS.map((p) => p.value),
      });

      await refetch();
      handleCloseDialog();
    } catch (err: any) {
      alert('Erro ao salvar template: ' + err.message);
    }
  };

  const handleDuplicate = (template: any) => {
    setFormData({
      name: `${template.name} (Cópia)`,
      description: template.description || '',
      type: template.type,
      channel: template.channel,
      subject: template.subject || '',
      messageTemplate: template.messageTemplate,
    });
    setEditingTemplate(null);
    setIsDialogOpen(true);
  };

  const insertPlaceholder = (placeholder: string) => {
    setFormData({
      ...formData,
      messageTemplate: formData.messageTemplate + ' ' + placeholder,
    });
  };

  return (
    <div className='container mx-auto py-6 px-4 max-w-7xl'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Biblioteca de Templates</h1>
          <p className='text-muted-foreground'>
            Gerencie templates de mensagens para suas campanhas
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className='h-4 w-4 mr-2' />
          Novo Template
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total de Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              <p className='text-2xl font-bold'>{totalTemplates}</p>
              <Sparkles className='h-5 w-5 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Templates Personalizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              <p className='text-2xl font-bold'>{customTemplates}</p>
              <Edit className='h-5 w-5 text-blue-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Templates do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              <p className='text-2xl font-bold'>{systemTemplates}</p>
              <Star className='h-5 w-5 text-yellow-500' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className='mb-6'>
        <CardContent className='pt-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {/* Search */}
            <div className='lg:col-span-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  type='text'
                  placeholder='Buscar templates...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className='w-full border rounded-md px-3 py-2 text-sm'
              >
                <option value=''>Todos os Tipos</option>
                {Object.entries(CAMPAIGN_TYPES).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Channel Filter */}
            <div>
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className='w-full border rounded-md px-3 py-2 text-sm'
              >
                <option value=''>Todos os Canais</option>
                {Object.entries(CHANNELS).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            {/* System Templates Toggle */}
            <div className='flex items-center gap-2'>
              <input
                type='checkbox'
                id='showSystem'
                checked={showSystemTemplates}
                onChange={(e) => setShowSystemTemplates(e.target.checked)}
                className='rounded'
              />
              <label htmlFor='showSystem' className='text-sm cursor-pointer'>
                Exibir templates do sistema
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {isLoading ? (
        <div className='text-center py-12'>
          <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          <p className='mt-2 text-muted-foreground'>Carregando templates...</p>
        </div>
      ) : error ? (
        <Card className='border-red-200 bg-red-50'>
          <CardContent className='pt-6'>
            <p className='text-red-600'>Erro ao carregar templates: {error.message}</p>
          </CardContent>
        </Card>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className='py-12 text-center'>
            <Sparkles className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
            <h3 className='text-lg font-semibold mb-2'>Nenhum template encontrado</h3>
            <p className='text-muted-foreground mb-4'>
              {searchTerm || typeFilter || channelFilter
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando seu primeiro template'}
            </p>
            {!searchTerm && !typeFilter && !channelFilter && (
              <Button onClick={() => handleOpenDialog()}>
                <Plus className='h-4 w-4 mr-2' />
                Criar Primeiro Template
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filteredTemplates.map((template: any) => {
            const typeConfig = CAMPAIGN_TYPES[template.type as keyof typeof CAMPAIGN_TYPES] || {
              label: template.type,
              icon: Sparkles,
            };
            const TypeIcon = typeConfig.icon;
            const channelConfig = CHANNELS[template.channel as keyof typeof CHANNELS] || {
              label: template.channel,
              icon: Bell,
              color: 'text-gray-500',
            };
            const ChannelIcon = channelConfig.icon;

            return (
              <Card key={template.id} className='hover:shadow-md transition-shadow'>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center gap-2 flex-1'>
                      <div className='p-2 bg-primary/10 rounded-full'>
                        <TypeIcon className='h-4 w-4 text-primary' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <CardTitle className='text-base truncate'>{template.name}</CardTitle>
                        <div className='flex items-center gap-2 mt-1'>
                          <Badge variant='outline' className='text-xs'>
                            {typeConfig.label}
                          </Badge>
                          {template.isSystem && (
                            <Badge className='text-xs bg-yellow-500'>Sistema</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {template.description && (
                    <p className='text-sm text-muted-foreground mt-2 line-clamp-2'>
                      {template.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {/* Channel */}
                    <div className='flex items-center gap-2 text-sm'>
                      <ChannelIcon className={`h-4 w-4 ${channelConfig.color}`} />
                      <span className='text-muted-foreground'>{channelConfig.label}</span>
                    </div>

                    {/* Subject (Email only) */}
                    {template.subject && (
                      <div className='text-sm'>
                        <span className='font-medium'>Assunto:</span>
                        <p className='text-muted-foreground truncate'>{template.subject}</p>
                      </div>
                    )}

                    {/* Message Preview */}
                    <div className='text-sm'>
                      <span className='font-medium'>Mensagem:</span>
                      <p className='text-muted-foreground line-clamp-3 mt-1 bg-muted p-2 rounded text-xs'>
                        {template.messageTemplate}
                      </p>
                    </div>

                    {/* Placeholders */}
                    {template.placeholders && template.placeholders.length > 0 && (
                      <div className='text-xs text-muted-foreground'>
                        <span className='font-medium'>Variáveis:</span>{' '}
                        {template.placeholders.slice(0, 3).join(', ')}
                        {template.placeholders.length > 3 && ` +${template.placeholders.length - 3}`}
                      </div>
                    )}

                    {/* Actions */}
                    <div className='flex items-center gap-2 pt-2 border-t'>
                      <Button
                        variant='outline'
                        size='sm'
                        className='flex-1'
                        onClick={() => setPreviewTemplate(template)}
                      >
                        <Eye className='h-3 w-3 mr-1' />
                        Visualizar
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleDuplicate(template)}
                      >
                        <Copy className='h-3 w-3' />
                      </Button>
                      {!template.isSystem && (
                        <>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleOpenDialog(template)}
                          >
                            <Edit className='h-3 w-3' />
                          </Button>
                          <Button variant='outline' size='sm' className='text-red-600'>
                            <Trash2 className='h-3 w-3' />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Editar Template' : 'Novo Template'}
            </DialogTitle>
            <DialogDescription>
              Crie templates reutilizáveis para suas campanhas de marketing
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Name */}
            <div>
              <label className='text-sm font-medium'>Nome do Template *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder='Ex: Boas-vindas Email'
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className='text-sm font-medium'>Descrição</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder='Breve descrição do template'
              />
            </div>

            {/* Type and Channel */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium'>Tipo de Campanha *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className='w-full border rounded-md px-3 py-2 text-sm'
                  required
                >
                  <option value=''>Selecione...</option>
                  {Object.entries(CAMPAIGN_TYPES).map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='text-sm font-medium'>Canal *</label>
                <select
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                  className='w-full border rounded-md px-3 py-2 text-sm'
                  required
                >
                  <option value=''>Selecione...</option>
                  {Object.entries(CHANNELS).map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subject (Email only) */}
            {formData.channel === 'EMAIL' && (
              <div>
                <label className='text-sm font-medium'>Assunto *</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder='Assunto do e-mail'
                  required
                />
              </div>
            )}

            {/* Message Template */}
            <div>
              <label className='text-sm font-medium'>Mensagem *</label>
              <Textarea
                value={formData.messageTemplate}
                onChange={(e) => setFormData({ ...formData, messageTemplate: e.target.value })}
                placeholder='Digite a mensagem do template...'
                rows={6}
                required
              />
            </div>

            {/* Placeholders */}
            <div>
              <label className='text-sm font-medium mb-2 block'>Variáveis Disponíveis</label>
              <div className='flex flex-wrap gap-2'>
                {PLACEHOLDERS.map((placeholder) => (
                  <Button
                    key={placeholder.value}
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => insertPlaceholder(placeholder.value)}
                  >
                    {placeholder.label}
                  </Button>
                ))}
              </div>
              <p className='text-xs text-muted-foreground mt-2'>
                Clique em uma variável para inseri-la na mensagem
              </p>
            </div>

            <DialogFooter>
              <Button type='button' variant='outline' onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type='submit'>
                {editingTemplate ? 'Salvar Alterações' : 'Criar Template'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
            <DialogDescription>{previewTemplate?.description}</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            {previewTemplate?.subject && (
              <div>
                <span className='text-sm font-medium'>Assunto:</span>
                <p className='text-sm text-muted-foreground mt-1'>{previewTemplate.subject}</p>
              </div>
            )}
            <div>
              <span className='text-sm font-medium'>Mensagem:</span>
              <div className='mt-2 p-4 bg-muted rounded-md text-sm whitespace-pre-wrap'>
                {previewTemplate?.messageTemplate}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
