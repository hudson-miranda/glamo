
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { Search, SlidersHorizontal, X } from 'lucide-react';

type FilterState = {
  search: string;
  status?: string;
  clientType?: string;
  tags: string[];
};

type ClientFiltersProps = {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  showAdvanced?: boolean;
  onToggleAdvanced?: () => void;
};

export function ClientFilters({
  filters,
  onFiltersChange,
  showAdvanced = false,
  onToggleAdvanced,
}: ClientFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value === 'all' ? undefined : value });
  };

  const handleClientTypeChange = (value: string) => {
    onFiltersChange({ ...filters, clientType: value === 'all' ? undefined : value });
  };

  const handleClearFilters = () => {
    onFiltersChange({ search: '', status: undefined, clientType: undefined, tags: [] });
  };

  const hasActiveFilters = filters.status || filters.clientType || filters.tags.length > 0;

  return (
    <div className='space-y-4'>
      {/* Main Search */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex items-center gap-2'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search by name, email, phone, CPF, CNPJ or Instagram...'
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className='pl-10'
              />
            </div>
            {onToggleAdvanced && (
              <Button
                variant='outline'
                size='icon'
                onClick={onToggleAdvanced}
                className={showAdvanced ? 'bg-primary text-primary-foreground' : ''}
              >
                <SlidersHorizontal className='h-4 w-4' />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-4'>
            <CardTitle className='text-base'>Advanced Filters</CardTitle>
            {hasActiveFilters && (
              <Button variant='ghost' size='sm' onClick={handleClearFilters}>
                <X className='mr-2 h-3 w-3' />
                Clear All
              </Button>
            )}
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2'>
              {/* Status Filter */}
              <div className='space-y-2'>
                <Label>Status</Label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='All Statuses' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Statuses</SelectItem>
                    <SelectItem value='ACTIVE'>Active</SelectItem>
                    <SelectItem value='INACTIVE'>Inactive</SelectItem>
                    <SelectItem value='VIP'>VIP</SelectItem>
                    <SelectItem value='BLOCKED'>Blocked</SelectItem>
                    <SelectItem value='PROSPECT'>Prospect</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Client Type Filter */}
              <div className='space-y-2'>
                <Label>Client Type</Label>
                <Select
                  value={filters.clientType || 'all'}
                  onValueChange={handleClientTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='All Types' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Types</SelectItem>
                    <SelectItem value='REGULAR'>Regular</SelectItem>
                    <SelectItem value='VIP'>VIP</SelectItem>
                    <SelectItem value='CORPORATE'>Corporate</SelectItem>
                    <SelectItem value='REFERRAL'>Referral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
