import { DashboardLayout } from '../../layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import {
  BarChart3,
  DollarSign,
  Package,
  Calendar,
  TrendingUp,
  Download,
} from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';

export default function ReportsPage() {
  const { activeSalonId } = useSalonContext();

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Reports</h1>
            <p className='text-muted-foreground'>
              Analytics and insights for your salon
            </p>
          </div>
          <Button variant='outline'>
            <Download className='mr-2 h-4 w-4' />
            Export Data
          </Button>
        </div>

        {/* Report Cards */}
        <div className='grid gap-6 md:grid-cols-2'>
          {/* Sales Report */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <DollarSign className='h-5 w-5 text-green-500' />
                <span>Sales Report</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground mb-4'>
                Revenue analysis with flexible grouping by day, week, month, professional, service, or product.
              </p>
              <div className='space-y-2'>
                <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                  <span className='text-sm'>Total Revenue (Month)</span>
                  <span className='font-semibold'>R$ 45,230</span>
                </div>
                <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                  <span className='text-sm'>Average Ticket</span>
                  <span className='font-semibold'>R$ 156</span>
                </div>
              </div>
              <Button className='w-full mt-4'>View Full Report</Button>
            </CardContent>
          </Card>

          {/* Inventory Report */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <Package className='h-5 w-5 text-blue-500' />
                <span>Inventory Report</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground mb-4'>
                Stock levels, values, and low stock alerts for all products.
              </p>
              <div className='space-y-2'>
                <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                  <span className='text-sm'>Total Products</span>
                  <span className='font-semibold'>324</span>
                </div>
                <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                  <span className='text-sm'>Low Stock Items</span>
                  <span className='font-semibold text-yellow-500'>12</span>
                </div>
              </div>
              <Button className='w-full mt-4'>View Full Report</Button>
            </CardContent>
          </Card>

          {/* Appointments Report */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <Calendar className='h-5 w-5 text-purple-500' />
                <span>Appointments Report</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground mb-4'>
                Booking statistics, trends, and status distribution.
              </p>
              <div className='space-y-2'>
                <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                  <span className='text-sm'>Total This Month</span>
                  <span className='font-semibold'>187</span>
                </div>
                <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                  <span className='text-sm'>Completion Rate</span>
                  <span className='font-semibold'>94%</span>
                </div>
              </div>
              <Button className='w-full mt-4'>View Full Report</Button>
            </CardContent>
          </Card>

          {/* Financial Report */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <TrendingUp className='h-5 w-5 text-orange-500' />
                <span>Financial Report</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground mb-4'>
                Payment and revenue analysis with method breakdown.
              </p>
              <div className='space-y-2'>
                <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                  <span className='text-sm'>Total Received</span>
                  <span className='font-semibold'>R$ 52,890</span>
                </div>
                <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                  <span className='text-sm'>Pending Payments</span>
                  <span className='font-semibold'>R$ 2,340</span>
                </div>
              </div>
              <Button className='w-full mt-4'>View Full Report</Button>
            </CardContent>
          </Card>
        </div>

        {/* Charts Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <BarChart3 className='h-5 w-5' />
              <span>Revenue Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-center h-64 bg-muted rounded-lg'>
              <p className='text-sm text-muted-foreground'>
                Chart visualization will be displayed here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
