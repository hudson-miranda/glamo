import { useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import { listCategories } from 'wasp/client/operations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Plus } from 'lucide-react';
import { CategoryModal } from './CategoryModal';

interface CategorySelectProps {
  value?: string;
  onChange: (value: string) => void;
  salonId: string;
  error?: string;
  disabled?: boolean;
}

export function CategorySelect({ 
  value, 
  onChange, 
  salonId,
  error,
  disabled = false 
}: CategorySelectProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: categories, isLoading, refetch } = useQuery(listCategories, {
    salonId,
    includeDeleted: false,
  });

  const handleCategoryCreated = (categoryId: string) => {
    refetch();
    onChange(categoryId);
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Carregando categorias..." />
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
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem categoria</SelectItem>
            {categories?.map((category: any) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
                {category._count?.services > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({category._count.services} {category._count.services === 1 ? 'serviço' : 'serviços'})
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
          onClick={() => setIsModalOpen(true)}
          disabled={disabled}
          title="Criar nova categoria"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {error && <p className="text-sm text-red-500">{error}</p>}

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCategoryCreated}
        salonId={salonId}
      />
    </div>
  );
}
