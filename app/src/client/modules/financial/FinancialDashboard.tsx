
import { useState } from 'react';
import { useQuery, getCashFlowReport, getFinancialSummary } from 'wasp/client/operations';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';

export default function FinancialDashboard() {
  const { activeSalonId } = useSalonContext();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
  });

  const { data: cashFlowData, isLoading: cashFlowLoading } = useQuery(getCashFlowReport, {
    salonId: activeSalonId || '',
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  }, {
    enabled: !!activeSalonId,
  });

  const { data: summaryData, isLoading: summaryLoading } = useQuery(getFinancialSummary, {
    salonId: activeSalonId || '',
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  }, {
    enabled: !!activeSalonId,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const isLoading = cashFlowLoading || summaryLoading;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const cashFlow = cashFlowData?.summary;
  const summary = summaryData;

  const pendingReceivables = summary?.accountsReceivable?.byStatus?.find((s: any) => s.status === 'PENDING')?.total || 0;
  const overdueReceivables = summary?.accountsReceivable?.byStatus?.find((s: any) => s.status === 'OVERDUE')?.total || 0;
  const pendingPayables = summary?.accountsPayable?.byStatus?.find((s: any) => s.status === 'PENDING')?.total || 0;
  const overduePayables = summary?.accountsPayable?.byStatus?.find((s: any) => s.status === 'OVERDUE')?.total || 0;

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Financial Dashboard</h1>
        <p className='text-muted-foreground'>Overview of your finances</p>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Income</CardTitle>
            <TrendingUp className='h-4 w-4 text-green-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{formatCurrency(cashFlow?.totalIncome || 0)}</div>
            <p className='text-xs text-muted-foreground'>
              Current period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Expenses</CardTitle>
            <TrendingDown className='h-4 w-4 text-red-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{formatCurrency(cashFlow?.totalExpenses || 0)}</div>
            <p className='text-xs text-muted-foreground'>
              Current period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Net Cash Flow</CardTitle>
            <DollarSign className='h-4 w-4 text-blue-500' />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(cashFlow?.netCashFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(cashFlow?.netCashFlow || 0)}
            </div>
            <p className='text-xs text-muted-foreground'>
              Income - Expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Overdue Accounts</CardTitle>
            <AlertCircle className='h-4 w-4 text-yellow-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-yellow-600'>
              {formatCurrency(overdueReceivables + overduePayables)}
            </div>
            <p className='text-xs text-muted-foreground'>
              Receivables + Payables overdue
            </p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Accounts Receivable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Pending</span>
                <span className='text-sm font-bold'>{formatCurrency(pendingReceivables)}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-yellow-600'>Overdue</span>
                <span className='text-sm font-bold text-yellow-600'>{formatCurrency(overdueReceivables)}</span>
              </div>
              <div className='flex items-center justify-between border-t pt-2'>
                <span className='font-medium'>Total to Receive</span>
                <span className='font-bold'>{formatCurrency(pendingReceivables + overdueReceivables)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accounts Payable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Pending</span>
                <span className='text-sm font-bold'>{formatCurrency(pendingPayables)}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-red-600'>Overdue</span>
                <span className='text-sm font-bold text-red-600'>{formatCurrency(overduePayables)}</span>
              </div>
              <div className='flex items-center justify-between border-t pt-2'>
                <span className='font-medium'>Total to Pay</span>
                <span className='font-bold'>{formatCurrency(pendingPayables + overduePayables)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
