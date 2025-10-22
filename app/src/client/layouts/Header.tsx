import { useAuth } from 'wasp/client/auth';
import { logout } from 'wasp/client/auth';
import { useQuery, getUserSalons, switchActiveSalon } from 'wasp/client/operations';
import { Bell, ChevronDown, Building2, LogOut, User, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { useSalonContext } from '../hooks/useSalonContext';
import { Link } from 'wasp/client/router';
import DarkModeSwitcher from '../components/DarkModeSwitcher';
import { useToast } from '../hooks/useToast';
import { useState } from 'react';

export function Header() {
  const { data: user } = useAuth();
  const { activeSalonId, setActiveSalonId, setUserSalons } = useSalonContext();
  const { toast } = useToast();
  const [isSwitching, setIsSwitching] = useState(false);
  
  // Fetch user's salons
  const { data: salons = [], isLoading } = useQuery(getUserSalons);

  const initials = user?.email
    ? user.email
        .split('@')[0]
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  // Find active salon name
  const activeSalon = salons.find(s => s.isActive);
  const activeSalonName = activeSalon?.name || 'Select Salon';

  // Handle salon switch
  const handleSalonSwitch = async (salonId: string) => {
    if (salonId === activeSalonId) return;
    
    setIsSwitching(true);
    try {
      await switchActiveSalon({ salonId });
      setActiveSalonId(salonId);
      toast({
        title: 'Salon switched',
        description: 'Your active salon has been updated',
      });
      // Reload page to refresh all queries with new salon context
      window.location.reload();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to switch salon',
      });
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <header className='flex h-16 items-center justify-between border-b bg-background px-6'>
      <div className='flex items-center space-x-4'>
        {/* Salon Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant='outline' 
              className='min-w-[200px] justify-between'
              disabled={isSwitching || isLoading}
            >
              <div className='flex items-center space-x-2'>
                <Building2 className='h-4 w-4' />
                <span className='text-sm'>
                  {isSwitching ? 'Switching...' : activeSalonName}
                </span>
              </div>
              <ChevronDown className='h-4 w-4 opacity-50' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' className='w-[220px]'>
            <DropdownMenuLabel>Your Salons</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {salons.length > 0 ? (
              <>
                {salons.map((salon) => (
                  <DropdownMenuItem 
                    key={salon.id}
                    onClick={() => handleSalonSwitch(salon.id)}
                    className={salon.isActive ? 'bg-accent' : ''}
                  >
                    <Building2 className='mr-2 h-4 w-4' />
                    <span>{salon.name}</span>
                    {salon.isActive && (
                      <span className='ml-auto text-xs text-primary'>Active</span>
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to='/onboarding/create-salon' className='flex items-center'>
                    <Plus className='mr-2 h-4 w-4' />
                    <span>Create New Salon</span>
                  </Link>
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem asChild>
                <Link to='/onboarding/create-salon' className='flex items-center'>
                  <Plus className='mr-2 h-4 w-4' />
                  <span>Create Your First Salon</span>
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className='flex items-center space-x-4'>
        {/* Notifications */}
        <Link to='/notifications'>
          <Button variant='ghost' size='icon' className='relative'>
            <Bell className='h-5 w-5' />
            {/* Notification badge */}
            <span className='absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground'>
              3
            </span>
          </Button>
        </Link>

        {/* Dark Mode Toggle */}
        <DarkModeSwitcher />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='flex items-center space-x-2'>
              <Avatar className='h-8 w-8'>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className='text-sm font-medium'>{user?.email}</span>
              <ChevronDown className='h-4 w-4 opacity-50' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to='/account' className='flex items-center'>
                <User className='mr-2 h-4 w-4' />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              className='text-destructive'
            >
              <LogOut className='mr-2 h-4 w-4' />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
