import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { EmptyState } from '../../../components/ui/empty-state';
import { Users, Calendar, DollarSign, TrendingUp, Plus, Loader2, Building2 } from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { useQuery, listClients, listAppointments, listSales } from 'wasp/client/operations';
import { Link } from 'wasp/client/router';

export default function DashboardPage() {
  const { activeSalonId } = useSalonContext();

  // Fetch real data
  const { data: clientsData, isLoading: isLoadingClients } = useQuery(
    listClients,
    {
      salonId: activeSalonId || '',
      page: 1,
      perPage: 1, // We only need the count
    },
    {
      enabled: !!activeSalonId,
    }
  );

  const { data: appointmentsData, isLoading: isLoadingAppointments } = useQuery(
    listAppointments,
    {
      salonId: activeSalonId || '',
      page: 1,
      perPage: 100, // Get today's appointments
    },
    {
      enabled: !!activeSalonId,
    }
  );

  // Get sales data for current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  // Previous month for comparison
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const { data: currentMonthSales, isLoading: isLoadingSales } = useQuery(
    listSales,
    {
      salonId: activeSalonId || '',
      startDate: startOfMonth.toISOString(),
      endDate: endOfMonth.toISOString(),
      page: 1,
      perPage: 1000,
    },
    {
      enabled: !!activeSalonId,
    }
  );

  const { data: lastMonthSales, isLoading: isLoadingLastMonth } = useQuery(
    listSales,
    {
      salonId: activeSalonId || '',
      startDate: startOfLastMonth.toISOString(),
      endDate: endOfLastMonth.toISOString(),
      page: 1,
      perPage: 1000,
    },
    {
      enabled: !!activeSalonId,
    }
  );

  // Calculate stats
  const totalClients = clientsData?.total || 0;
  
  // Filter today's appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayAppointments = appointmentsData?.appointments?.filter((apt: any) => {
    const aptDate = new Date(apt.date);
    return aptDate >= today && aptDate < tomorrow;
  }) || [];

  const appointmentsToday = todayAppointments.length;
  const completedToday = todayAppointments.filter((apt: any) => apt.status === 'DONE').length;
  const pendingToday = todayAppointments.filter((apt: any) => 
    apt.status === 'PENDING' || apt.status === 'CONFIRMED' || apt.status === 'IN_SERVICE'
  ).length;

  // Calculate revenue
  const currentMonthRevenue = currentMonthSales?.sales?.reduce((sum: number, sale: any) => {
    return sum + (sale.finalAmount || 0);
  }, 0) || 0;

  const lastMonthRevenue = lastMonthSales?.sales?.reduce((sum: number, sale: any) => {
    return sum + (sale.finalAmount || 0);
  }, 0) || 0;

  // Calculate growth rate
  const growthRate = lastMonthRevenue > 0
    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    : 0;

  const isGrowthPositive = growthRate > 0;

  // Show empty state if no salon selected
  if (!activeSalonId) {
    return (
      <EmptyState
        icon={Building2}
        title='No salon selected'
        description='Create or select a salon to start managing your business'
        action={
          <Button asChild>
            <Link to='/onboarding/create-salon'>
              <Plus className='mr-2 h-4 w-4' />
              Create Salon
            </Link>
          </Button>
        }
      />
    );
  }

  const isLoading = isLoadingClients || isLoadingAppointments || isLoadingSales || isLoadingLastMonth;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className='space-y-6'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
          <p className='text-muted-foreground'>
            Welcome to your salon management dashboard
          </p>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Clients
              </CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
              ) : (
                <>
                  <div className='text-2xl font-bold'>{totalClients}</div>
                  <p className='text-xs text-muted-foreground'>
                    Registered clients
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Appointments Today
              </CardTitle>
              <Calendar className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
              ) : (
                <>
                  <div className='text-2xl font-bold'>{appointmentsToday}</div>
                  <p className='text-xs text-muted-foreground'>
                    {completedToday} completed, {pendingToday} pending
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Revenue (Month)
              </CardTitle>
              <DollarSign className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
              ) : (
                <>
                  <div className='text-2xl font-bold'>{formatCurrency(currentMonthRevenue)}</div>
                  <p className='text-xs text-muted-foreground'>
                    From {currentMonthSales?.total || 0} sales
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Growth Rate
              </CardTitle>
              <TrendingUp className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
              ) : (
                <>
                  <div className={`text-2xl font-bold ${isGrowthPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isGrowthPositive ? '+' : ''}{growthRate.toFixed(1)}%
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    vs. last month
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
              <Button asChild variant='outline' className='h-auto py-4'>
                <Link to='/appointments' className='flex flex-col items-center space-y-2'>
                  <Calendar className='h-6 w-6' />
                  <span>New Appointment</span>
                </Link>
              </Button>
              
              <Button asChild variant='outline' className='h-auto py-4'>
                <Link to='/sales' className='flex flex-col items-center space-y-2'>
                  <DollarSign className='h-6 w-6' />
                  <span>New Sale</span>
                </Link>
              </Button>
              
              <Button asChild variant='outline' className='h-auto py-4'>
                <Link to='/clients' className='flex flex-col items-center space-y-2'>
                  <Users className='h-6 w-6' />
                  <span>Add Client</span>
                </Link>
              </Button>
              
              <Button asChild variant='outline' className='h-auto py-4'>
                <Link to='/services' className='flex flex-col items-center space-y-2'>
                  <Plus className='h-6 w-6' />
                  <span>Add Service</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
