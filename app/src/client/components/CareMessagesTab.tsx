import { useState, useEffect } from 'react';
import { useQuery } from 'wasp/client/operations';
import {
  listServiceCareMessages,
  createServiceCareMessage,
  updateServiceCareMessage,
  deleteServiceCareMessage,
  reorderServiceCareMessages,
} from 'wasp/client/operations';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Loader2, Plus, Trash2, Edit2, GripVertical, Clock } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import { MessageVariableHelper } from './MessageVariableHelper';
import { InfoTooltip } from './InfoTooltip';

interface CareMessagesTabProps {
  serviceId?: string;
  salonId: string;
}

interface CareMessageForm {
  id?: string;
  type: 'PRE_APPOINTMENT' | 'POST_APPOINTMENT';
  timeValue: number;
  timeUnit: 'HOURS' | 'DAYS';
  message: string;
}

export function CareMessagesTab({ serviceId, salonId }: CareMessagesTabProps) {
  const { toast } = useToast();
  const [activeType, setActiveType] = useState<'PRE_APPOINTMENT' | 'POST_APPOINTMENT'>('PRE_APPOINTMENT');
  const [isAdding, setIsAdding] = useState(false);
  const [editingMessage, setEditingMessage] = useState<CareMessageForm | null>(null);
  const [formData, setFormData] = useState<CareMessageForm>({
    type: 'PRE_APPOINTMENT',
    timeValue: 1,
    timeUnit: 'DAYS',
    message: '',
  });

  const { data: messages, isLoading, refetch } = useQuery(
    listServiceCareMessages,
    serviceId ? { serviceId, type: activeType, salonId } : undefined
  );

  useEffect(() => {
    setFormData((prev) => ({ ...prev, type: activeType }));
  }, [activeType]);

  const preMessages = messages?.filter((m: any) => m.type === 'PRE_APPOINTMENT') || [];
  const postMessages = messages?.filter((m: any) => m.type === 'POST_APPOINTMENT') || [];
  const currentMessages = activeType === 'PRE_APPOINTMENT' ? preMessages : postMessages;
  const canAddMore = currentMessages.length < 10;

  const handleInsertVariable = (variable: string) => {
    const textarea = document.getElementById('care-message-textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = formData.message.substring(0, start) + variable + formData.message.substring(end);
      setFormData({ ...formData, message: newMessage });
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    } else {
      setFormData({ ...formData, message: formData.message + variable });
    }
  };

  const handleStartAdd = () => {
    if (!canAddMore) {
      toast({
        title: 'Limite atingido',
        description: `Você pode ter no máximo 10 mensagens ${activeType === 'PRE_APPOINTMENT' ? 'pré' : 'pós'}-atendimento`,
        variant: 'destructive',
      });
      return;
    }
    setFormData({
      type: activeType,
      timeValue: 1,
      timeUnit: 'DAYS',
      message: '',
    });
    setEditingMessage(null);
    setIsAdding(true);
  };

  const handleEdit = (message: any) => {
    setFormData({
      id: message.id,
      type: message.type,
      timeValue: message.timeValue,
      timeUnit: message.timeUnit,
      message: message.message,
    });
    setEditingMessage(message);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingMessage(null);
    setFormData({
      type: activeType,
      timeValue: 1,
      timeUnit: 'DAYS',
      message: '',
    });
  };

  const handleSave = async () => {
    if (!serviceId) {
      toast({
        title: 'Erro',
        description: 'Salve o serviço antes de adicionar mensagens de cuidado',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.message.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'A mensagem não pode estar vazia',
        variant: 'destructive',
      });
      return;
    }

    if (formData.timeValue <= 0) {
      toast({
        title: 'Valor inválido',
        description: 'O tempo deve ser maior que zero',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingMessage) {
        await updateServiceCareMessage({
          messageId: formData.id!,
          salonId,
          timeValue: formData.timeValue,
          timeUnit: formData.timeUnit,
          message: formData.message.trim(),
        });
        toast({
          title: 'Mensagem atualizada',
          description: 'Mensagem de cuidado atualizada com sucesso',
        });
      } else {
        await createServiceCareMessage({
          serviceId,
          salonId,
          type: formData.type,
          timeValue: formData.timeValue,
          timeUnit: formData.timeUnit,
          message: formData.message.trim(),
        });
        toast({
          title: 'Mensagem criada',
          description: 'Nova mensagem de cuidado adicionada',
        });
      }
      refetch();
      handleCancel();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar mensagem',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta mensagem?')) return;

    try {
      await deleteServiceCareMessage({ messageId, salonId });
      toast({
        title: 'Mensagem excluída',
        description: 'Mensagem de cuidado removida com sucesso',
      });
      refetch();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir mensagem',
        variant: 'destructive',
      });
    }
  };

  if (!serviceId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Salve o serviço primeiro para configurar mensagens de cuidado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium flex items-center gap-2">
          Mensagens de Cuidado
          <InfoTooltip content="Configure mensagens automáticas para serem enviadas antes ou após o atendimento" />
        </h3>
        <p className="text-sm text-muted-foreground">
          Agende mensagens automáticas para seus clientes
        </p>
      </div>

      <Tabs value={activeType} onValueChange={(v) => setActiveType(v as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="PRE_APPOINTMENT">
            Pré-Atendimento
            <Badge variant="secondary" className="ml-2">
              {preMessages.length}/10
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="POST_APPOINTMENT">
            Pós-Atendimento
            <Badge variant="secondary" className="ml-2">
              {postMessages.length}/10
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="PRE_APPOINTMENT" className="space-y-4">
          <MessagesList
            messages={preMessages}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
            type="PRE_APPOINTMENT"
          />
        </TabsContent>

        <TabsContent value="POST_APPOINTMENT" className="space-y-4">
          <MessagesList
            messages={postMessages}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
            type="POST_APPOINTMENT"
          />
        </TabsContent>
      </Tabs>

      {!isAdding && (
        <Button
          type="button"
          variant="outline"
          onClick={handleStartAdd}
          disabled={!canAddMore}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Mensagem {activeType === 'PRE_APPOINTMENT' ? 'Pré' : 'Pós'}-Atendimento
          {!canAddMore && ' (Limite atingido)'}
        </Button>
      )}

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingMessage ? 'Editar' : 'Nova'} Mensagem {activeType === 'PRE_APPOINTMENT' ? 'Pré' : 'Pós'}-Atendimento
            </CardTitle>
            <CardDescription>
              {activeType === 'PRE_APPOINTMENT' 
                ? 'Será enviada ANTES do horário do atendimento'
                : 'Será enviada APÓS o horário do atendimento'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeValue" className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Tempo
                  <InfoTooltip content={`Quando enviar a mensagem ${activeType === 'PRE_APPOINTMENT' ? 'antes' : 'após'} o atendimento`} />
                </Label>
                <Input
                  id="timeValue"
                  type="number"
                  min="1"
                  value={formData.timeValue}
                  onChange={(e) => setFormData({ ...formData, timeValue: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeUnit">Unidade</Label>
                <Select
                  value={formData.timeUnit}
                  onValueChange={(v) => setFormData({ ...formData, timeUnit: v as any })}
                >
                  <SelectTrigger id="timeUnit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOURS">Hora(s)</SelectItem>
                    <SelectItem value="DAYS">Dia(s)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="care-message-textarea" className="flex items-center gap-1">
                  Mensagem
                  <InfoTooltip content="Use variáveis para personalizar a mensagem automaticamente" />
                </Label>
                <MessageVariableHelper onInsert={handleInsertVariable} />
              </div>
              <Textarea
                id="care-message-textarea"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Digite sua mensagem aqui..."
                maxLength={1000}
                rows={5}
              />
              <div className="text-xs text-muted-foreground text-right">
                {formData.message.length}/1000 caracteres
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleSave}>
                {editingMessage ? 'Atualizar' : 'Adicionar'} Mensagem
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MessagesList({ 
  messages, 
  onEdit, 
  onDelete, 
  isLoading, 
  type 
}: { 
  messages: any[];
  onEdit: (message: any) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
  type: string;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
        <p>Nenhuma mensagem {type === 'PRE_APPOINTMENT' ? 'pré' : 'pós'}-atendimento configurada</p>
        <p className="text-sm mt-1">Clique em "Adicionar Mensagem" para começar</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {messages.map((message: any, index: number) => (
        <Card key={message.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {message.timeValue} {message.timeUnit === 'HOURS' ? 'hora(s)' : 'dia(s)'}{' '}
                    {type === 'PRE_APPOINTMENT' ? 'antes' : 'após'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Ordem: {message.order}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.message}</p>
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(message)}
                  title="Editar"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(message.id)}
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
