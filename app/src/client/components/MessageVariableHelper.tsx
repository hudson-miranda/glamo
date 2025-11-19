import { Button } from '../../components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';
import { Code2 } from 'lucide-react';

interface MessageVariable {
  key: string;
  label: string;
  description: string;
}

const AVAILABLE_VARIABLES: MessageVariable[] = [
  { key: '{clientName}', label: 'Nome do Cliente', description: 'Nome completo do cliente' },
  { key: '{clientFirstName}', label: 'Primeiro Nome', description: 'Primeiro nome do cliente' },
  { key: '{clientPhone}', label: 'Telefone', description: 'Telefone do cliente' },
  { key: '{appointmentDate}', label: 'Data do Agendamento', description: 'Data do agendamento (DD/MM/AAAA)' },
  { key: '{appointmentTime}', label: 'Hora do Agendamento', description: 'Horário do agendamento (HH:MM)' },
  { key: '{serviceName}', label: 'Nome do Serviço', description: 'Nome do serviço agendado' },
  { key: '{employeeName}', label: 'Nome do Profissional', description: 'Nome do profissional' },
  { key: '{salonName}', label: 'Nome do Salão', description: 'Nome do estabelecimento' },
  { key: '{salonPhone}', label: 'Telefone do Salão', description: 'Telefone do estabelecimento' },
  { key: '{salonAddress}', label: 'Endereço do Salão', description: 'Endereço completo do estabelecimento' },
];

interface MessageVariableHelperProps {
  onInsert: (variable: string) => void;
}

export function MessageVariableHelper({ onInsert }: MessageVariableHelperProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Code2 className="h-4 w-4" />
          Inserir Variável
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm mb-1">Variáveis Disponíveis</h4>
            <p className="text-xs text-muted-foreground">
              Clique em uma variável para inserir no texto
            </p>
          </div>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {AVAILABLE_VARIABLES.map((variable) => (
              <button
                key={variable.key}
                type="button"
                onClick={() => onInsert(variable.key)}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors"
              >
                <div className="font-medium text-sm">{variable.label}</div>
                <div className="text-xs text-muted-foreground">
                  {variable.key}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {variable.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Parser function to replace variables in message templates
 */
export function parseMessageVariables(
  template: string,
  data: {
    clientName?: string;
    clientPhone?: string;
    appointmentDate?: Date;
    appointmentTime?: string;
    serviceName?: string;
    employeeName?: string;
    salonName?: string;
    salonPhone?: string;
    salonAddress?: string;
  }
): string {
  let message = template;

  if (data.clientName) {
    message = message.replace(/{clientName}/g, data.clientName);
    const firstName = data.clientName.split(' ')[0];
    message = message.replace(/{clientFirstName}/g, firstName);
  }

  if (data.clientPhone) {
    message = message.replace(/{clientPhone}/g, data.clientPhone);
  }

  if (data.appointmentDate) {
    const formattedDate = new Intl.DateTimeFormat('pt-BR').format(data.appointmentDate);
    message = message.replace(/{appointmentDate}/g, formattedDate);
  }

  if (data.appointmentTime) {
    message = message.replace(/{appointmentTime}/g, data.appointmentTime);
  }

  if (data.serviceName) {
    message = message.replace(/{serviceName}/g, data.serviceName);
  }

  if (data.employeeName) {
    message = message.replace(/{employeeName}/g, data.employeeName);
  }

  if (data.salonName) {
    message = message.replace(/{salonName}/g, data.salonName);
  }

  if (data.salonPhone) {
    message = message.replace(/{salonPhone}/g, data.salonPhone);
  }

  if (data.salonAddress) {
    message = message.replace(/{salonAddress}/g, data.salonAddress);
  }

  return message;
}

/**
 * Get preview of message with sample data
 */
export function getMessagePreview(template: string): string {
  return parseMessageVariables(template, {
    clientName: 'Maria Silva',
    clientPhone: '(11) 98765-4321',
    appointmentDate: new Date(),
    appointmentTime: '14:30',
    serviceName: 'Corte de Cabelo',
    employeeName: 'Ana Santos',
    salonName: 'Salão Exemplo',
    salonPhone: '(11) 3456-7890',
    salonAddress: 'Rua Exemplo, 123',
  });
}
