import { useState, useMemo } from 'react';
import { useQuery, listSuppliers, createSupplier, updateSupplier, deleteSupplier } from 'wasp/client/operations';
import { useSalonContext } from '../../../hooks/useSalonContext';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../../components/ui/alert-dialog';
import { Badge } from '../../../../components/ui/badge';
import { 
  Plus, 
  Search, 
  Building2, 
  Edit, 
  Trash2,
  MoreVertical,
  Package,
  Phone,
  Mail,
  MapPin,
  FileText,
} from 'lucide-react';
import { useToast } from '../../../../components/ui/use-toast';
import { SupplierFormModal } from '../components/SupplierFormModal';

interface Supplier {
  id: string;
  name: string;
  description?: string | null;
  email?: string | null;
  phoneType?: string | null;
  phone?: string | null;
  phoneType2?: string | null;
  phone2?: string | null;
  contactName?: string | null;
  cnpj?: string | null;
  address?: string | null;
  addressNumber?: string | null;
  complement?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  _count?: {
    products: number;
  };
}

export default function SuppliersListPage() {
  const { activeSalonId } = useSalonContext();
  const { toast } = useToast();
  
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [isDeletingSupplier, setIsDeletingSupplier] = useState(false);

  const { data, isLoading, error, refetch } = useQuery(listSuppliers, {
    salonId: activeSalonId!,
    includeProductCount: true,
  });

  const suppliers = data || [];

  // Filter and sort suppliers
  const filteredSuppliers = useMemo(() => {
    let filtered = [...suppliers];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(searchLower) ||
        supplier.email?.toLowerCase().includes(searchLower) ||
        supplier.phone?.includes(search) ||
        supplier.cnpj?.includes(search) ||
        supplier.contactName?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by name
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    return filtered;
  }, [suppliers, search]);

  const handleOpenModal = (supplier?: Supplier) => {
    setEditingSupplier(supplier || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const handleSubmitSupplier = async (formData: any) => {
    setIsSubmitting(true);
    try {
      if (editingSupplier) {
        await updateSupplier({
          supplierId: editingSupplier.id,
          salonId: activeSalonId!,
          ...formData,
        });
        toast({
          title: 'Fornecedor atualizado',
          description: 'Fornecedor atualizado com sucesso',
        });
      } else {
        await createSupplier({
          salonId: activeSalonId!,
          ...formData,
        });
        toast({
          title: 'Fornecedor criado',
          description: 'Fornecedor criado com sucesso',
        });
      }
      refetch();
      handleCloseModal();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao salvar o fornecedor',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;

    setIsDeletingSupplier(true);
    try {
      await deleteSupplier({
        supplierId: supplierToDelete.id,
        salonId: activeSalonId!,
      });
      
      toast({
        title: 'Fornecedor excluído',
        description: 'Fornecedor excluído com sucesso',
      });
      
      refetch();
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.message || 'Não foi possível excluir o fornecedor',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingSupplier(false);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
  };

  const hasActiveFilters = search !== '';

  if (!activeSalonId) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Selecione um salão para continuar</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Fornecedores</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie os fornecedores do seu salão
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Novo Fornecedor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{suppliers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Package className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Com Produtos</p>
                <p className="text-2xl font-bold">
                  {suppliers.filter((s: Supplier) => s._count && s._count.products > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Mail className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Com Email</p>
                <p className="text-2xl font-bold">
                  {suppliers.filter((s: Supplier) => s.email).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <Phone className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Com Telefone</p>
                <p className="text-2xl font-bold">
                  {suppliers.filter((s: Supplier) => s.phone).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email, telefone, CNPJ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                onClick={handleClearFilters}
                className="w-full md:w-auto"
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-destructive">Erro ao carregar fornecedores</p>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-2">
              <Building2 className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                {hasActiveFilters 
                  ? 'Nenhum fornecedor encontrado com os filtros aplicados'
                  : 'Nenhum fornecedor cadastrado'}
              </p>
              {!hasActiveFilters && (
                <Button onClick={() => handleOpenModal()} variant="outline" className="mt-2">
                  <Plus className="mr-2 h-4 w-4" />
                  Cadastrar Primeiro Fornecedor
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Nome</TableHead>
                    <TableHead className="hidden md:table-cell">Contato</TableHead>
                    <TableHead className="hidden lg:table-cell">Email</TableHead>
                    <TableHead className="hidden xl:table-cell">CNPJ</TableHead>
                    <TableHead className="text-center">Produtos</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{supplier.name}</span>
                          {supplier.contactName && (
                            <span className="text-xs text-muted-foreground">
                              Contato: {supplier.contactName}
                            </span>
                          )}
                          {/* Show on mobile */}
                          <div className="md:hidden mt-1 space-y-0.5">
                            {supplier.phone && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {supplier.phone}
                              </div>
                            )}
                            {supplier.email && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {supplier.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {supplier.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{supplier.phone}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {supplier.email ? (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{supplier.email}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {supplier.cnpj ? (
                          <span className="text-sm">{supplier.cnpj}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {supplier._count?.products || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleOpenModal(supplier)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(supplier)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <SupplierFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitSupplier}
        supplier={editingSupplier}
        isLoading={isSubmitting}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o fornecedor "{supplierToDelete?.name}"?
              {supplierToDelete?._count?.products && supplierToDelete._count.products > 0 && (
                <span className="block mt-2 text-orange-600 dark:text-orange-400">
                  ⚠️ Este fornecedor possui {supplierToDelete._count.products} produto(s) vinculado(s).
                  A exclusão removerá o vínculo com esses produtos.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingSupplier}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeletingSupplier}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingSupplier ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
