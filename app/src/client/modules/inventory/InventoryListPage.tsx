import { useState } from 'react';
import { useQuery, listProducts, createProduct, updateProduct, deleteProduct } from 'wasp/client/operations';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { EmptyState } from '../../../components/ui/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Plus, Search, Package, AlertTriangle } from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { ProductFormModal } from './components/ProductFormModal';

export default function InventoryListPage() {
  const { activeSalonId } = useSalonContext();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, error } = useQuery(listProducts, {
    salonId: activeSalonId || '',
    search,
    lowStock: lowStockOnly,
    page,
    perPage: 20,
  }, {
    enabled: !!activeSalonId,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleOpenModal = (product?: any) => {
    setEditingProduct(product || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmitProduct = async (formData: any) => {
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct({
          productId: editingProduct.id,
          salonId: activeSalonId!,
          ...formData,
          expirationDate: formData.expirationDate ? new Date(formData.expirationDate) : undefined,
        });
      } else {
        await createProduct({
          salonId: activeSalonId!,
          ...formData,
          expirationDate: formData.expirationDate ? new Date(formData.expirationDate) : undefined,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Inventory</h1>
            <p className='text-muted-foreground'>
              Manage products, stock, and suppliers
            </p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className='mr-2 h-4 w-4' />
            New Product
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Search & Filters</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search by name, barcode or SKU...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='pl-10'
              />
            </div>
            <div className='flex items-center space-x-2'>
              <Button
                variant={lowStockOnly ? 'default' : 'outline'}
                size='sm'
                onClick={() => setLowStockOnly(!lowStockOnly)}
              >
                <AlertTriangle className='mr-2 h-4 w-4' />
                Low Stock Only
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardContent className='p-0'>
            {isLoading ? (
              <div className='flex items-center justify-center p-8'>
                <p className='text-sm text-muted-foreground'>Loading products...</p>
              </div>
            ) : error ? (
              <div className='flex items-center justify-center p-8'>
                <p className='text-sm text-destructive'>
                  Error loading products: {error.message}
                </p>
              </div>
            ) : !data?.products || data.products.length === 0 ? (
              <EmptyState
                icon={Package}
                title='No products found'
                description={
                  search || lowStockOnly
                    ? 'Try adjusting your filters'
                    : 'Get started by adding your first product'
                }
                action={
                  !search && !lowStockOnly && (
                    <Button onClick={() => handleOpenModal()}>
                      <Plus className='mr-2 h-4 w-4' />
                      New Product
                    </Button>
                  )
                }
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.products.map((product: any) => {
                      const isLowStock = product.stockQuantity <= product.minimumStock;
                      return (
                        <TableRow key={product.id}>
                          <TableCell className='font-medium'>
                            {product.name}
                          </TableCell>
                          <TableCell className='font-mono text-sm'>
                            {product.sku || '-'}
                          </TableCell>
                          <TableCell>
                            {product.category?.name || '-'}
                          </TableCell>
                          <TableCell>
                            {product.brand?.name || '-'}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(product.salePrice)}
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center space-x-2'>
                              <span>{product.stockQuantity}</span>
                              {isLowStock && (
                                <AlertTriangle className='h-4 w-4 text-yellow-500' />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={product.deletedAt ? 'outline' : 'success'}>
                              {product.deletedAt ? 'Inactive' : 'Active'}
                            </Badge>
                          </TableCell>
                          <TableCell className='text-right'>
                            <Button 
                              variant='ghost' 
                              size='sm'
                              onClick={() => handleOpenModal(product)}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className='flex items-center justify-between border-t px-6 py-4'>
                  <div className='text-sm text-muted-foreground'>
                    Showing {data.products.length} of {data.total} products
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setPage(page + 1)}
                      disabled={
                        !data.total || page * data.perPage >= data.total
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Product Form Modal */}
        <ProductFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitProduct}
          product={editingProduct}
          isLoading={isSubmitting}
          categories={[]}
          brands={[]}
          suppliers={[]}
        />
      </div>
  );
}
