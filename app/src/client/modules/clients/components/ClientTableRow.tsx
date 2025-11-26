
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { TableCell, TableRow } from '../../../../components/ui/table';
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../../../../components/ui/dropdown-menu';
import { Link } from 'wasp/client/router';
import { formatDate, formatCurrency } from '../../../lib/formatters';

type Client = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  cnpj?: string;
  status: string;
  clientType: string;
  profilePhotoUrl?: string;
  totalVisits: number;
  totalSpent: number;
  lastVisitDate?: Date;
  tags: Array<{ id: string; name: string; color?: string }>;
};

type ClientTableRowProps = {
  client: Client;
  visibleColumns: string[];
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
};

export function ClientTableRow({ client, visibleColumns, onEdit, onDelete }: ClientTableRowProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'INACTIVE':
        return 'secondary';
      case 'VIP':
        return 'default';
      case 'BLOCKED':
        return 'destructive';
      case 'PROSPECT':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'INACTIVE':
        return 'Inactive';
      case 'VIP':
        return 'VIP';
      case 'BLOCKED':
        return 'Blocked';
      case 'PROSPECT':
        return 'Prospect';
      default:
        return status;
    }
  };

  const formatGender = (gender?: string) => {
    switch (gender) {
      case 'MALE':
        return 'Masculino';
      case 'FEMALE':
        return 'Feminino';
      case 'OTHER':
        return 'Outro';
      default:
        return '-';
    }
  };

  const formatClientType = (type: string) => {
    switch (type) {
      case 'REGULAR':
        return 'Regular';
      case 'VIP':
        return 'VIP';
      case 'SPORADIC':
        return 'Esporádico';
      default:
        return type;
    }
  };

  return (
    <TableRow>
      {visibleColumns.includes('name') && (
        <TableCell>
          <div className='flex items-center gap-3'>
            {client.profilePhotoUrl ? (
              <img
                src={client.profilePhotoUrl}
                alt={client.name}
                className='h-8 w-8 rounded-full object-cover'
              />
            ) : (
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary'>
                {client.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className='font-medium'>{client.name}</div>
              {client.tags.length > 0 && (
                <div className='mt-1 flex flex-wrap gap-1'>
                  {client.tags.slice(0, 2).map((tag) => (
                    <Badge
                      key={tag.id}
                      variant='outline'
                      className='text-xs'
                      style={
                        tag.color
                          ? { borderColor: tag.color, color: tag.color }
                          : undefined
                      }
                    >
                      {tag.name}
                    </Badge>
                  ))}
                  {client.tags.length > 2 && (
                    <Badge variant='outline' className='text-xs'>
                      +{client.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </TableCell>
      )}
      {visibleColumns.includes('email') && <TableCell>{client.email || '-'}</TableCell>}
      {visibleColumns.includes('phone') && <TableCell>{client.phone || '-'}</TableCell>}
      {visibleColumns.includes('status') && (
        <TableCell>
          <Badge variant={getStatusVariant(client.status)}>
            {getStatusLabel(client.status)}
          </Badge>
        </TableCell>
      )}
      {visibleColumns.includes('clientType') && (
        <TableCell>{formatClientType(client.clientType)}</TableCell>
      )}
      {visibleColumns.includes('gender') && (
        <TableCell>{formatGender((client as any).gender)}</TableCell>
      )}
      {visibleColumns.includes('birthDate') && (
        <TableCell>{(client as any).birthDate ? formatDate((client as any).birthDate) : '-'}</TableCell>
      )}
      {visibleColumns.includes('visits') && (
        <TableCell className='text-right'>{client.totalVisits}</TableCell>
      )}
      {visibleColumns.includes('totalSpent') && (
        <TableCell className='text-right font-medium'>
          {formatCurrency(client.totalSpent)}
        </TableCell>
      )}
      {visibleColumns.includes('lastVisit') && (
        <TableCell>
          {client.lastVisitDate ? formatDate(client.lastVisitDate) : 'Nunca'}
        </TableCell>
      )}
      <TableCell className='text-right'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon'>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <Link to={`/clients/${client.id}` as any}>
              <DropdownMenuItem>
                <Eye className='mr-2 h-4 w-4' />
                View Details
              </DropdownMenuItem>
            </Link>
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(client)}>
                <Pencil className='mr-2 h-4 w-4' />
                Edit
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(client)}
                className='text-destructive'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
