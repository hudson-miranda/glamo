import { useQuery, getClientHistory } from 'wasp/client/operations';
import { Card, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { 
  Calendar, 
  DollarSign, 
  FileText, 
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../../lib/formatters';
import { useSalonContext } from '../../../hooks/useSalonContext';

interface ClientHistoryTabProps {
  clientId: string;
}

export default function ClientHistoryTab({ clientId }: ClientHistoryTabProps) {
  const { activeSalonId } = useSalonContext();

  const { data: history, isLoading } = useQuery(
    getClientHistory,
    {
      clientId,
      salonId: activeSalonId || '',
    },
    {
      enabled: !!clientId && !!activeSalonId,
    }
  );

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'appointment':
      case 'APPOINTMENT':
        return Calendar;
      case 'sale':
      case 'SALE':
        return DollarSign;
      case 'note':
      case 'NOTE':
        return FileText;
      case 'created':
      case 'CREATED':
        return UserPlus;
      default:
        return Clock;
    }
  };

  const getEventColor = (type: string, status?: string) => {
    if (status === 'COMPLETED' || status === 'CONFIRMED') return 'text-green-600 bg-green-100';
    if (status === 'CANCELLED' || status === 'NO_SHOW') return 'text-red-600 bg-red-100';
    if (status === 'PENDING') return 'text-yellow-600 bg-yellow-100';
    
    switch (type) {
      case 'appointment':
      case 'APPOINTMENT':
        return 'text-blue-600 bg-blue-100';
      case 'sale':
      case 'SALE':
        return 'text-green-600 bg-green-100';
      case 'note':
      case 'NOTE':
        return 'text-purple-600 bg-purple-100';
      case 'created':
      case 'CREATED':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'CONFIRMED':
        return CheckCircle;
      case 'CANCELLED':
      case 'NO_SHOW':
        return XCircle;
      case 'PENDING':
        return AlertCircle;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <div className="relative">
        {history && history.length > 0 ? (
          history.map((event: any, index: number) => {
            const EventIcon = getEventIcon(event.type);
            const StatusIcon = getStatusIcon(event.status);
            const colorClass = getEventColor(event.type, event.status);

            return (
              <div key={event.id} className="flex gap-4 pb-6">
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                    <EventIcon className="h-5 w-5" />
                  </div>
                  {index < history.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 mt-2" />
                  )}
                </div>

                {/* Event Content */}
                <Card className="flex-1">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{event.title}</h4>
                          {event.status && (
                            <Badge variant={
                              event.status === 'COMPLETED' || event.status === 'CONFIRMED' ? 'default' :
                              event.status === 'CANCELLED' || event.status === 'NO_SHOW' ? 'destructive' :
                              'secondary'
                            }>
                              {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
                              {event.status}
                            </Badge>
                          )}
                        </div>
                        
                        {event.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {event.description}
                          </p>
                        )}

                        {/* Additional Details */}
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(event.createdAt)}
                          </span>
                          
                          {event.value && (
                            <span className="flex items-center gap-1 font-medium text-green-600">
                              <DollarSign className="h-3 w-3" />
                              {formatCurrency(event.value)}
                            </span>
                          )}

                          {event.user && (
                            <span>Por: {event.user.name || event.user.email}</span>
                          )}

                          {event.service && (
                            <span>Serviço: {event.service.name}</span>
                          )}

                          {event.employee && (
                            <span>Profissional: {event.employee.name}</span>
                          )}
                        </div>

                        {/* Tags or Categories */}
                        {event.tags && event.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {event.tags.map((tag: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum histórico registrado ainda.</p>
                <p className="text-sm mt-1">
                  As atividades do cliente aparecerão aqui automaticamente.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
