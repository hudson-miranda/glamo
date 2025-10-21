import { useAuth } from 'wasp/client/auth';
import { logout } from 'wasp/client/auth';
import { Bell, ChevronDown, Building2, LogOut, User } from 'lucide-react';
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
import { DarkModeSwitcher } from '../components/DarkModeSwitcher';

export function Header() {
  const { data: user } = useAuth();
  const { activeSalonId, userSalons } = useSalonContext();

  const initials = user?.email
    ? user.email
        .split('@')[0]
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <header className='flex h-16 items-center justify-between border-b bg-background px-6'>
      <div className='flex items-center space-x-4'>
        {/* Salon Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='min-w-[200px] justify-between'>
              <div className='flex items-center space-x-2'>
                <Building2 className='h-4 w-4' />
                <span className='text-sm'>
                  {activeSalonId ? 'Salon Name' : 'Select Salon'}
                </span>
              </div>
              <ChevronDown className='h-4 w-4 opacity-50' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' className='w-[200px]'>
            <DropdownMenuLabel>Your Salons</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {userSalons.length > 0 ? (
              userSalons.map((salon) => (
                <DropdownMenuItem key={salon.id}>
                  <Building2 className='mr-2 h-4 w-4' />
                  <span>{salon.name}</span>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>
                <span className='text-sm text-muted-foreground'>
                  No salons available
                </span>
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
