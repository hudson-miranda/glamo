
import { useState } from 'react';
import { useQuery, listProducts, getLowStockProducts } from 'wasp/client/operations';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';

export default function InventoryDashboard() {
  const { activeSalonId } = useSalonContext();

  const { data: productsData, isLoading } = useQuery(listProducts, {
    salonId: activeSalonId || '',
    page: 1,
    perPage: 1000,
  }, {
    enabled: !!activeSalonId,
  });

  const { data: lowStockData } = useQuery(getLowStockProducts, {
    salonId: activeSalonId || '',
  }, {
    enabled: !!activeSalonId,
  });

  const products = productsData?.products || [];
  const lowStockProducts = lowStockData?.products || [];
  
  const totalValue = products.reduce((sum: number, p: any) => sum + (p.stockQuantity * p.salePrice), 0);
  const totalCost = products.reduce((sum: number, p: any) => sum + (p.stockQuantity * p.costPrice), 0);
  const potentialProfit = totalValue - totalCost;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Inventory Dashboard</h1>
        <p className='text-muted-foreground'>Overview of your inventory</p>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Products</CardTitle>
            <Package className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{products.length}</div>
            <p className='text-xs text-muted-foreground'>
              Active products in inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Low Stock Alerts</CardTitle>
            <AlertTriangle className='h-4 w-4 text-yellow-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{lowStockProducts.length}</div>
            <p className='text-xs text-muted-foreground'>
              Products below minimum stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Inventory Value</CardTitle>
            <TrendingUp className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{formatCurrency(totalValue)}</div>
            <p className='text-xs text-muted-foreground'>
              Total value at sale price
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Potential Profit</CardTitle>
            <TrendingDown className='h-4 w-4 text-blue-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{formatCurrency(potentialProfit)}</div>
            <p className='text-xs text-muted-foreground'>
              Difference between cost and sale price
            </p>
          </CardContent>
        </Card>
      </div>

      {lowStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {lowStockProducts.slice(0, 5).map((product: any) => (
                <div key={product.id} className='flex items-center justify-between'>
                  <div>
                    <p className='font-medium'>{product.name}</p>
                    <p className='text-sm text-muted-foreground'>
                      Current: {product.stockQuantity} | Minimum: {product.minimumStock}
                    </p>
                  </div>
                  <AlertTriangle className='h-5 w-5 text-yellow-500' />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
