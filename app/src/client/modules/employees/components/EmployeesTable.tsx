import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu';
import { MoreHorizontal, Edit, UserX, Crown, Shield } from 'lucide-react';
import { useState } from 'react';
import { EditRoleDialog } from './EditRoleDialog';
import { DeactivateEmployeeDialog } from './DeactivateEmployeeDialog';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Employee = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  roles: Array<{ id: string; name: string }>;
  isActive: boolean;
  createdAt: Date;
};

interface EmployeesTableProps {
  employees: Employee[];
  onRefresh: () => void;
}

export function EmployeesTable({ employees, onRefresh }: EmployeesTableProps) {
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deactivatingEmployee, setDeactivatingEmployee] = useState<Employee | null>(null);

  const getRoleColor = (roleName: string) => {
    const colors: Record<string, string> = {
      owner: 'default',
      manager: 'secondary',
      professional: 'outline',
      cashier: 'outline',
      assistant: 'outline',
      client: 'outline',
    };
    return colors[roleName.toLowerCase()] || 'outline';
  };

  const getRoleIcon = (roleName: string) => {
    if (roleName.toLowerCase() === 'owner') return <Crown className='h-3 w-3' />;
    if (roleName.toLowerCase() === 'manager') return <Shield className='h-3 w-3' />;
    return null;
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Função</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Membro desde</TableHead>
            <TableHead className='text-right'>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className='font-medium'>
                {employee.userName || 'Sem nome'}
              </TableCell>
              <TableCell className='text-muted-foreground'>
                {employee.userEmail || '-'}
              </TableCell>
              <TableCell>
                <div className='flex flex-wrap gap-1'>
                  {employee.roles.map((role) => (
                    <Badge
                      key={role.id}
                      variant={getRoleColor(role.name) as any}
                      className='flex items-center gap-1'
                    >
                      {getRoleIcon(role.name)}
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                {employee.isActive ? (
                  <Badge variant='success'>Ativo</Badge>
                ) : (
                  <Badge variant='destructive'>Inativo</Badge>
                )}
              </TableCell>
              <TableCell className='text-sm text-muted-foreground'>
                {formatDistanceToNow(new Date(employee.createdAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell className='text-right'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='sm'>
                      <MoreHorizontal className='h-4 w-4' />
                      <span className='sr-only'>Abrir menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setEditingEmployee(employee)}
                      disabled={!employee.isActive}
                    >
                      <Edit className='mr-2 h-4 w-4' />
                      Alterar Função
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeactivatingEmployee(employee)}
                      disabled={
                        !employee.isActive ||
                        employee.roles.some((r) => r.name.toLowerCase() === 'owner')
                      }
                      className='text-destructive'
                    >
                      <UserX className='mr-2 h-4 w-4' />
                      Desativar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Role Dialog */}
      {editingEmployee && (
        <EditRoleDialog
          employee={editingEmployee}
          open={!!editingEmployee}
          onOpenChange={(open) => !open && setEditingEmployee(null)}
          onSuccess={() => {
            setEditingEmployee(null);
            onRefresh();
          }}
        />
      )}

      {/* Deactivate Dialog */}
      {deactivatingEmployee && (
        <DeactivateEmployeeDialog
          employee={deactivatingEmployee}
          open={!!deactivatingEmployee}
          onOpenChange={(open) => !open && setDeactivatingEmployee(null)}
          onSuccess={() => {
            setDeactivatingEmployee(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
