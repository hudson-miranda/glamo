
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'wasp/client/operations';
import { createCampaign } from 'wasp/client/operations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wasp/client/router';

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const createCampaignMutation = useMutation(createCampaign);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'PROMOTIONAL',
    channel: 'WHATSAPP',
    subject: '',
    messageTemplate: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // TODO: Get actual salonId from context/user
      const salonId = 'placeholder-salon-id';

      await createCampaignMutation({
        ...formData,
        salonId,
      });

      navigate('/campaigns');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar campanha');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8 max-w-4xl">
      <Link to="/campaigns">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Nova Campanha de Marketing</CardTitle>
          <CardDescription>
            Crie uma nova campanha para se comunicar com seus clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nome da Campanha *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Promoção de Verão"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o objetivo desta campanha..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Campanha *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROMOTIONAL">Promocional</SelectItem>
                    <SelectItem value="ANNOUNCEMENT">Anúncio</SelectItem>
                    <SelectItem value="BIRTHDAY">Aniversário</SelectItem>
                    <SelectItem value="REACTIVATION">Reativação</SelectItem>
                    <SelectItem value="FEEDBACK_REQUEST">Feedback</SelectItem>
                    <SelectItem value="CUSTOM">Personalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="channel">Canal de Comunicação *</Label>
                <Select
                  value={formData.channel}
                  onValueChange={(value) => setFormData({ ...formData, channel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                    <SelectItem value="EMAIL">E-mail</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.channel === 'EMAIL' && (
              <div className="space-y-2">
                <Label htmlFor="subject">Assunto do E-mail *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Ex: Promoção Especial de Verão!"
                  required={formData.channel === 'EMAIL'}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="messageTemplate">Mensagem *</Label>
              <Textarea
                id="messageTemplate"
                value={formData.messageTemplate}
                onChange={(e) => setFormData({ ...formData, messageTemplate: e.target.value })}
                placeholder="Digite sua mensagem aqui. Você pode usar variáveis como {{clientName}}, {{salonName}}, etc."
                rows={8}
                required
              />
              <p className="text-sm text-gray-500">
                Dica: Use variáveis como {`{{clientName}}`}, {`{{clientFirstName}}`}, {`{{salonName}}`} para personalizar
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Criando...' : 'Criar Campanha'}
              </Button>
              <Link to="/campaigns">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
