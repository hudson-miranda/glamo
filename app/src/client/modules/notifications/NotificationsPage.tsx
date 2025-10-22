import { useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useQuery, listNotifications, markNotificationRead, markAllNotificationsRead } from 'wasp/client/operations';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { EmptyState } from '../../../components/ui/empty-state';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { useAuth } from 'wasp/client/auth';
import { useSalonContext } from '../../hooks/useSalonContext';
import { toast } from '../../hooks/useToast';

export default function NotificationsPage() {
  return (
    <DashboardLayout>
      <NotificationsContent />
    </DashboardLayout>
  );
}

function NotificationsContent() {
  const { data: user } = useAuth();
  const { activeSalonId } = useSalonContext();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { data, isLoading, error, refetch } = useQuery(listNotifications, {
    salonId: activeSalonId || '',
    page: 1,
    perPage: 50,
  }, {
    enabled: !!activeSalonId,
  });

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationRead({ notificationId, salonId: activeSalonId || '' });
      toast({
        title: 'Success',
        description: 'Notification marked as read',
      });
      refetch();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to mark notification as read',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead({ salonId: activeSalonId || '' });
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
      refetch();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to mark all notifications as read',
      });
    }
  };

  const notifications = data?.notifications || [];
  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n: any) => !n.read)
      : notifications;

  return (
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Notifications</h1>
            <p className='text-muted-foreground'>
              Stay updated with your salon activities
            </p>
          </div>
          {(data?.unreadCount || 0) > 0 && (
            <Button onClick={handleMarkAllAsRead} variant='outline'>
              <CheckCheck className='mr-2 h-4 w-4' />
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className='flex items-center space-x-2'>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setFilter('all')}
          >
            All ({data?.total || 0})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setFilter('unread')}
          >
            Unread ({data?.unreadCount || 0})
          </Button>
        </div>

        {/* Notifications List */}
        <div className='space-y-4'>
          {isLoading ? (
            <Card>
              <CardContent className='flex items-center justify-center p-8'>
                <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className='p-8'>
                <p className='text-sm text-destructive text-center'>
                  Error loading notifications: {error.message}
                </p>
              </CardContent>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title='No notifications'
              description={
                filter === 'unread'
                  ? 'All caught up! No unread notifications.'
                  : 'You have no notifications yet.'
              }
            />
          ) : (
            filteredNotifications.map((notification: any) => (
              <Card
                key={notification.id}
                className={notification.read ? 'opacity-60' : ''}
              >
                <CardContent className='flex items-start justify-between p-4'>
                  <div className='flex-1 space-y-1'>
                    <div className='flex items-center space-x-2'>
                      <h4 className='text-sm font-semibold'>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <Badge variant='info' className='text-xs'>
                          New
                        </Badge>
                      )}
                      <Badge variant='outline' className='text-xs'>
                        {notification.type}
                      </Badge>
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      {notification.content}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Mark as read
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
  );
}
