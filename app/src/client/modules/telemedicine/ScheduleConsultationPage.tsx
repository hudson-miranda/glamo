import { useState, useEffect } from 'react';
import { useQuery, listClients, createAppointment } from 'wasp/client/operations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Calendar } from '../../../components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { 
  Video, 
  Calendar as CalendarIcon, 
  Clock, 
  User,
  Search,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Info
} from 'lucide-react';
import { useSalonContext } from '../../contexts/SalonContext';
import { formatDate } from '../../lib/formatters';

interface TimeSlot {
  time: string;
  available: boolean;
}

const AVAILABLE_TIMES = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
];

const CONSULTATION_DURATIONS = [
  { value: 30, label: '30 minutos' },
  { value: 45, label: '45 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1h 30min' },
];

export default function ScheduleConsultationPage() {
  const { activeSalonId } = useSalonContext();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Client Selection
  const [searchClient, setSearchClient] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showClientDialog, setShowClientDialog] = useState(false);
  
  // Step 2: Date & Time Selection
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  
  // Step 3: Consultation Details
  const [consultationType, setConsultationType] = useState('general');
  const [consultationNotes, setConsultationNotes] = useState('');
  const [sendConfirmation, setSendConfirmation] = useState(true);
  
  // Step 4: Confirmation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');

  const { data: clientsData, isLoading: isLoadingClients } = useQuery(
    listClients,
    { salonId: activeSalonId || '' },
    { enabled: !!activeSalonId }
  );

  const createAppointmentFn = createAppointment();

  // Filter clients by search
  const filteredClients = clientsData?.clients?.filter((client: any) => {
    if (!searchClient) return true;
    const search = searchClient.toLowerCase();
    return (
      client.name?.toLowerCase().includes(search) ||
      client.email?.toLowerCase().includes(search) ||
      client.phone?.toLowerCase().includes(search)
    );
  }) || [];

  // Generate available time slots
  useEffect(() => {
    if (selectedDate) {
      // In production, would check existing appointments
      const slots: TimeSlot[] = AVAILABLE_TIMES.map((time) => ({
        time,
        available: Math.random() > 0.3, // Simulate availability
      }));
      setAvailableSlots(slots);
    }
  }, [selectedDate]);

  const selectClient = (client: any) => {
    setSelectedClient(client);
    setShowClientDialog(false);
    setCurrentStep(2);
  };

  const selectTimeSlot = (time: string) => {
    setSelectedTime(time);
  };

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const handleSchedule = async () => {
    if (!selectedClient || !selectedDate || !selectedTime || !activeSalonId) return;

    setIsSubmitting(true);

    try {
      // Create appointment with telemedicine note
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const startAt = new Date(selectedDate);
      startAt.setHours(hours, minutes, 0, 0);

      const endAt = new Date(startAt);
      endAt.setMinutes(endAt.getMinutes() + duration);

      const appointmentData = {
        salonId: activeSalonId,
        clientId: selectedClient.id,
        professionalId: selectedClient.preferredProfessionalId || '', // Would get from salon staff
        startAt: startAt.toISOString(),
        services: [
          {
            serviceId: '', // Would be a "Video Consultation" service
            customDuration: duration,
          },
        ],
        notes: `TELEMEDICINA - Consulta Online\nTipo: ${consultationType}\n\n${consultationNotes}`,
      };

      const result = await createAppointmentFn(appointmentData);
      
      // Generate confirmation code (would come from backend)
      const code = `TM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setConfirmationCode(code);
      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error('Error scheduling consultation:', error);
      alert(error.message || 'Erro ao agendar consulta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedClient(null);
    setSelectedDate(new Date());
    setSelectedTime('');
    setDuration(30);
    setConsultationType('general');
    setConsultationNotes('');
    setShowSuccessDialog(false);
  };

  const isStep1Valid = selectedClient !== null;
  const isStep2Valid = selectedDate !== undefined && selectedTime !== '';
  const isStep3Valid = consultationType !== '';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendar Consulta Virtual</h1>
          <p className="text-muted-foreground">
            Criar novo agendamento de telemedicina
          </p>
        </div>
        <Button variant="outline" onClick={() => (window.location.href = '/telemedicine')}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      currentStep > step
                        ? 'bg-green-500 text-white'
                        : currentStep === step
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step ? <CheckCircle2 className="h-5 w-5" /> : step}
                  </div>
                  <span className="text-xs mt-2 text-center">
                    {step === 1
                      ? 'Cliente'
                      : step === 2
                      ? 'Data e Hora'
                      : step === 3
                      ? 'Detalhes'
                      : 'Confirmação'}
                  </span>
                </div>
                {step < 4 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Client Selection */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Selecionar Cliente
            </CardTitle>
            <CardDescription>Escolha o cliente para a consulta virtual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Buscar Cliente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome, email ou telefone..."
                  value={searchClient}
                  onChange={(e) => setSearchClient(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {selectedClient ? (
              <div className="p-4 border-2 border-primary rounded-lg bg-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedClient.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
                    <p className="text-sm text-muted-foreground">{selectedClient.phone}</p>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedClient(null)}>
                    Trocar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {isLoadingClients ? (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                  </div>
                ) : filteredClients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum cliente encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredClients.slice(0, 10).map((client: any) => (
                      <div
                        key={client.id}
                        onClick={() => selectClient(client)}
                        className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      >
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => (window.location.href = '/telemedicine')}>
                Cancelar
              </Button>
              <Button onClick={() => setCurrentStep(2)} disabled={!isStep1Valid}>
                Próxima: Data e Hora
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Date & Time Selection */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Selecionar Data e Horário
            </CardTitle>
            <CardDescription>Escolha quando a consulta deve acontecer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Calendar */}
              <div className="space-y-2">
                <Label>Data da Consulta</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>

              {/* Time Slots */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Duração</Label>
                  <Select value={duration.toString()} onValueChange={(v) => setDuration(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONSULTATION_DURATIONS.map((d) => (
                        <SelectItem key={d.value} value={d.value.toString()}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Horário Disponível</Label>
                  <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto p-2">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={selectedTime === slot.time ? 'default' : 'outline'}
                        size="sm"
                        disabled={!slot.available}
                        onClick={() => selectTimeSlot(slot.time)}
                        className="h-10"
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                </div>

                {selectedTime && (
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-sm font-medium">Horário Selecionado</p>
                    <p className="text-lg font-bold">
                      {selectedTime} - {calculateEndTime(selectedTime, duration)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(selectedDate || new Date())}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button onClick={() => setCurrentStep(3)} disabled={!isStep2Valid}>
                Próxima: Detalhes
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Consultation Details */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Detalhes da Consulta
            </CardTitle>
            <CardDescription>Informações adicionais sobre a consulta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Tipo de Consulta</Label>
              <Select value={consultationType} onValueChange={setConsultationType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Consulta Geral</SelectItem>
                  <SelectItem value="followup">Consulta de Retorno</SelectItem>
                  <SelectItem value="emergency">Consulta de Emergência</SelectItem>
                  <SelectItem value="evaluation">Avaliação Inicial</SelectItem>
                  <SelectItem value="prescription">Renovação de Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Observações / Motivo da Consulta</Label>
              <Textarea
                placeholder="Descreva o motivo da consulta, sintomas ou informações relevantes..."
                value={consultationNotes}
                onChange={(e) => setConsultationNotes(e.target.value)}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Estas informações serão compartilhadas com o profissional antes da consulta
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900">Informações Importantes</p>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>O link da consulta será enviado por email e SMS</li>
                    <li>Certifique-se de ter boa conexão de internet</li>
                    <li>Use fones de ouvido para melhor qualidade de áudio</li>
                    <li>Entre na sala 5 minutos antes do horário</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button onClick={() => setCurrentStep(4)} disabled={!isStep3Valid}>
                Próxima: Confirmação
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Confirmation */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Confirmar Agendamento
            </CardTitle>
            <CardDescription>Revise as informações antes de confirmar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium text-lg">{selectedClient?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedClient?.email}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium text-lg">{formatDate(selectedDate || new Date())}</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Horário</p>
                  <p className="font-medium text-lg">
                    {selectedTime} - {calculateEndTime(selectedTime, duration)}
                  </p>
                  <p className="text-sm text-muted-foreground">{duration} minutos</p>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Tipo de Consulta</p>
                <p className="font-medium">
                  {consultationType === 'general'
                    ? 'Consulta Geral'
                    : consultationType === 'followup'
                    ? 'Consulta de Retorno'
                    : consultationType === 'emergency'
                    ? 'Consulta de Emergência'
                    : consultationType === 'evaluation'
                    ? 'Avaliação Inicial'
                    : 'Renovação de Receita'}
                </p>
              </div>

              {consultationNotes && (
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Observações</p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{consultationNotes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button onClick={handleSchedule} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Agendando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirmar Agendamento
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Consulta Agendada com Sucesso!
            </DialogTitle>
            <DialogDescription>
              A consulta virtual foi agendada e o cliente receberá uma confirmação
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-muted-foreground">Código de Confirmação</p>
              <p className="text-2xl font-bold text-green-700">{confirmationCode}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Próximos Passos:</p>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li>O cliente receberá email e SMS de confirmação</li>
                <li>O link da consulta será enviado 30 minutos antes</li>
                <li>Você pode acessar a consulta pelo dashboard</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => (window.location.href = '/telemedicine')}>
              Ir para Dashboard
            </Button>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Agendar Outra
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
