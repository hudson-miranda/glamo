import { useState } from 'react';
import { useQuery, listClients, listServices, createAppointment } from 'wasp/client/operations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { Textarea } from '../../../../components/ui/textarea';
import { Calendar } from '../../../../components/ui/calendar';
import { useToast } from '../../../../components/ui/use-toast';
import { useSalonContext } from '../../../hooks/useSalonContext';
import { CalendarIcon, Clock } from 'lucide-react';

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AppointmentModal({ open, onOpenChange, onSuccess }: AppointmentModalProps) {
  const { activeSalonId } = useSalonContext();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [clientId, setClientId] = useState('');
  const [professionalId, setProfessionalId] = useState<string | undefined>(undefined);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [noProfessional, setNoProfessional] = useState(true);

  // Queries
  const { data: clientsData, isLoading: loadingClients } = useQuery(
    listClients,
    { salonId: activeSalonId || '' },
    { enabled: !!activeSalonId && open }
  );

  const { data: servicesData, isLoading: loadingServices } = useQuery(
    listServices,
    { salonId: activeSalonId || '' },
    { enabled: !!activeSalonId && open }
  );

  const clients = clientsData?.clients || [];
  const services = servicesData?.services || [];

  // Generate time slots
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  const handleSubmit = async () => {
    if (!selectedDate || !clientId || selectedServices.length === 0) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha data, cliente e pelo menos um serviço.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Combine date and time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledDate = new Date(selectedDate);
      scheduledDate.setHours(hours, minutes, 0, 0);

      await createAppointment({
        salonId: activeSalonId!,
        clientId: clientId as string,
        professionalId: professionalId || clientId, // Use clientId as default if no professional selected
        startAt: scheduledDate.toISOString(),
        services: selectedServices.map(serviceId => ({ serviceId })),
        notes: notes ? notes : undefined,
      });

      toast({
        title: 'Agendamento criado!',
        description: 'O agendamento foi criado com sucesso.',
      });

      // Reset form
      setSelectedDate(new Date());
      setSelectedTime('09:00');
      setClientId('');
      setProfessionalId(undefined);
      setNoProfessional(true);
      setSelectedServices([]);
      setNotes('');

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Erro ao criar agendamento',
        description: error.message || 'Ocorreu um erro ao criar o agendamento.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
          <DialogDescription>
            Crie um novo agendamento para um cliente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label htmlFor="client">Cliente *</Label>
            {loadingClients ? (
              <div className="text-sm text-muted-foreground">Carregando clientes...</div>
            ) : (
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger id="client">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client: any) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data *</Label>
              <div className="border rounded-lg p-3">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-md"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="time">Horário *</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger id="time">
                    <Clock className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Profissional (Opcional)</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="no-professional"
                    checked={noProfessional}
                    onChange={(e) => {
                      setNoProfessional(e.target.checked);
                      if (e.target.checked) setProfessionalId(undefined);
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="no-professional" className="font-normal cursor-pointer">
                    Sem preferência de profissional
                  </Label>
                </div>
                {/* TODO: Add professionals list when available */}
              </div>
            </div>
          </div>

          {/* Services Selection */}
          <div className="space-y-2">
            <Label>Serviços *</Label>
            {loadingServices ? (
              <div className="text-sm text-muted-foreground">Carregando serviços...</div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                {services.map((service: any) => (
                  <label
                    key={service.id}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-accent p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service.id)}
                      onChange={() => toggleService(service.id)}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{service.name}</div>
                      <div className="text-xs text-muted-foreground">
                        R$ {service.price?.toFixed(2)} • {service.duration}min
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {selectedServices.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {selectedServices.length} serviço(s) selecionado(s)
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre o agendamento..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Criando...' : 'Criar Agendamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
