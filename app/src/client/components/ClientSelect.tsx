import { useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import { listClients } from 'wasp/client/operations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Plus } from 'lucide-react';
import { ClientFormModalNew } from '../modules/clients/components/ClientFormModalNew';
import { useSalonContext } from '../hooks/useSalonContext';
import { useToast } from '../../components/ui/use-toast';
import { createClient } from 'wasp/client/operations';

interface ClientSelectProps {
  value?: string;
  onChange: (value: string) => void;
  salonId: string;
  error?: string;
  disabled?: boolean;
}

export function ClientSelect({ 
  value, 
  onChange, 
  salonId,
  error,
  disabled = false 
}: ClientSelectProps) {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { data: clientsData, isLoading, refetch } = useQuery(listClients, {
    salonId,
  }, {
    enabled: !!salonId
  });

  const clients = clientsData?.clients || [];

  const handleClientCreated = async (data: any) => {
    setIsCreating(true);
    try {
      const newClient = await createClient({
        salonId,
        name: data.name,
        phone: data.cellPhone || data.phone || undefined,
        email: data.email || undefined,
        birthDate: data.birthDate ? new Date(data.birthDate).toISOString() : undefined,
        cpf: data.cpf || undefined,
        cnpj: data.cnpj || undefined,
        zipCode: data.zipCode || undefined,
        address: data.street || undefined,
        addressNumber: data.number || undefined,
        complement: data.complement || undefined,
        neighborhood: data.neighborhood || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        observations: data.notes || undefined,
        instagramHandle: data.instagram || undefined,
        profilePhotoUrl: data.photoPath || undefined,
      });

      await refetch();
      onChange(newClient.id);
      setIsModalOpen(false);
      
      toast({
        title: 'Cliente criado!',
        description: 'O cliente foi criado e selecionado com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao criar cliente',
        description: error.message || 'Ocorreu um erro ao criar o cliente.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Carregando clientes..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Select
          value={value}
          onValueChange={onChange}
          disabled={disabled}
        >
          <SelectTrigger className={error ? 'border-red-500' : ''}>
            <SelectValue placeholder="Selecione um cliente" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client: any) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
                {client.email && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    - {client.email}
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          disabled={disabled}
          title="Criar novo cliente"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {error && <p className="text-sm text-red-500">{error}</p>}

      <ClientFormModalNew
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleClientCreated}
        isLoading={isCreating}
        salonId={salonId}
        allClients={clients}
      />
    </div>
  );
}
