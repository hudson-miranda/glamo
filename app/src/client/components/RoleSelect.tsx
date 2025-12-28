import { useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getRoles } from 'wasp/client/operations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Plus } from 'lucide-react';
import { RoleFormModal } from './RoleFormModal';

interface RoleSelectProps {
  value?: string;
  onChange: (value: string) => void;
  salonId: string;
  error?: string;
  disabled?: boolean;
}

export function RoleSelect({ 
  value, 
  onChange, 
  salonId,
  error,
  disabled = false 
}: RoleSelectProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: roles, isLoading, refetch } = useQuery(getRoles, {
    salonId,
  });

  const handleRoleCreated = (roleId: string) => {
    refetch();
    onChange(roleId);
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Carregando cargos..." />
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
            <SelectValue placeholder="Selecione um cargo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem cargo definido</SelectItem>
            {roles?.map((role: any) => (
              <SelectItem key={role.id} value={role.id}>
                <div className="flex items-center gap-2">
                  {role.isOwner && (
                    <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                  <span>{role.name}</span>
                  {role.description && (
                    <span className="text-xs text-muted-foreground">
                      - {role.description}
                    </span>
                  )}
                </div>
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
          title="Criar novo cargo"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {error && <p className="text-sm text-red-500">{error}</p>}

      <RoleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleRoleCreated}
        salonId={salonId}
      />
    </div>
  );
}
