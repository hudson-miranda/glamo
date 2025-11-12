
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  CheckCircle2,
  Scissors,
  MapPin,
  MessageSquare,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BookingConfirmationProps {
  serviceName: string;
  serviceDuration: number;
  servicePrice: number;
  professionalName: string;
  dateTime: Date;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientNotes?: string;
  confirmationCode: string;
  salonName: string;
  salonAddress?: string;
  showPrice: boolean;
}

export function BookingConfirmation({
  serviceName,
  serviceDuration,
  servicePrice,
  professionalName,
  dateTime,
  clientName,
  clientEmail,
  clientPhone,
  clientNotes,
  confirmationCode,
  salonName,
  salonAddress,
  showPrice,
}: BookingConfirmationProps) {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price / 100);
  };

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-neon-500/10 flex items-center justify-center mx-auto border-2 border-neon-500 animate-pulse-glow">
          <CheckCircle2 className="h-10 w-10 text-neon-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-2 text-gradient-neon">
            Agendamento Confirmado!
          </h2>
          <p className="text-muted-foreground">
            Seu agendamento foi realizado com sucesso
          </p>
        </div>
        <Card className="inline-block px-6 py-3 bg-neon-500/5 border-neon-500">
          <p className="text-sm text-muted-foreground">Código de Confirmação</p>
          <p className="text-2xl font-mono font-bold text-neon-500">
            {confirmationCode}
          </p>
        </Card>
      </div>

      {/* Booking Details */}
      <Card className="p-6 space-y-6">
        <h3 className="text-xl font-semibold">Detalhes do Agendamento</h3>

        <div className="space-y-4">
          {/* Service */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-neon-500/10 flex items-center justify-center flex-shrink-0">
              <Scissors className="h-5 w-5 text-neon-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Serviço</p>
              <p className="font-semibold">{serviceName}</p>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(serviceDuration)}
                </Badge>
                {showPrice && (
                  <span className="text-sm font-semibold text-neon-500">
                    {formatPrice(servicePrice)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Professional */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-neon-500/10 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-neon-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Profissional</p>
              <p className="font-semibold">{professionalName}</p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-neon-500/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="h-5 w-5 text-neon-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Data e Horário</p>
              <p className="font-semibold capitalize">
                {format(dateTime, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
              <p className="font-semibold text-neon-500">
                {format(dateTime, 'HH:mm', { locale: ptBR })}
              </p>
            </div>
          </div>

          {/* Salon Location */}
          {salonAddress && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-neon-500/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-neon-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Local</p>
                <p className="font-semibold">{salonName}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {salonAddress}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Client Information */}
      <Card className="p-6 space-y-4">
        <h3 className="text-xl font-semibold">Seus Dados</h3>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{clientName}</span>
          </div>

          {clientEmail && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{clientEmail}</span>
            </div>
          )}

          {clientPhone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{clientPhone}</span>
            </div>
          )}

          {clientNotes && (
            <div className="flex items-start gap-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground mt-1" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Observações</p>
                <p className="text-sm mt-1">{clientNotes}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Important Notice */}
      <Card className="p-6 bg-amber-500/5 border-amber-500/30">
        <div className="space-y-3">
          <h4 className="font-semibold text-amber-500">Informações Importantes</h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex gap-2">
              <span className="text-amber-500">•</span>
              <span>Você receberá um email de confirmação em breve</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-500">•</span>
              <span>Caso precise cancelar ou remarcar, entre em contato com o salão</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-500">•</span>
              <span>Chegue com alguns minutos de antecedência</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-500">•</span>
              <span>Guarde o código de confirmação: <strong className="text-neon-500">{confirmationCode}</strong></span>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
