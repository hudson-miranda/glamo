
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Check, Clock } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
}

interface ServiceSelectorProps {
  services: Service[];
  selectedServiceId: string | null;
  onSelectService: (serviceId: string) => void;
  showPrices: boolean;
}

export function ServiceSelector({
  services,
  selectedServiceId,
  onSelectService,
  showPrices,
}: ServiceSelectorProps) {
  // Group all services under one category since Service model doesn't have direct category relation
  const groupedServices = services.reduce((acc, service) => {
    const categoryName = 'Todos os Serviços';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

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
      <div>
        <h2 className="text-2xl font-bold mb-2">Escolha o Serviço</h2>
        <p className="text-muted-foreground">
          Selecione o serviço que você deseja agendar
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedServices).map(([categoryName, categoryServices]) => (
          <div key={categoryName}>
            <h3 className="text-lg font-semibold mb-3 text-neon-500">
              {categoryName}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryServices.map((service) => {
                const isSelected = selectedServiceId === service.id;
                return (
                  <Card
                    key={service.id}
                    onClick={() => onSelectService(service.id)}
                    className={cn(
                      'p-4 cursor-pointer transition-all duration-200 hover:shadow-glow-md',
                      'hover:scale-[1.02] hover:border-neon-500/50',
                      isSelected && 'border-neon-500 shadow-glow-md bg-neon-500/5'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-lg">{service.name}</h4>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-neon-500 flex items-center justify-center">
                              <Check className="h-4 w-4 text-black" />
                            </div>
                          )}
                        </div>
                        {service.description && (
                          <p className="text-sm text-muted-foreground">
                            {service.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(service.duration)}
                          </Badge>
                          {showPrices && (
                            <span className="font-semibold text-neon-500">
                              {formatPrice(service.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {services.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Nenhum serviço disponível no momento
          </p>
        </Card>
      )}
    </div>
  );
}
