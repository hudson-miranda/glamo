import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSalon } from 'wasp/client/operations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Scissors, ArrowRight } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export default function CreateSalonPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Salon name is required',
      });
      return;
    }

    setIsLoading(true);
    try {
      await createSalon({
        name: formData.name,
        cnpj: formData.cnpj || undefined,
        description: formData.description || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zipCode: formData.zipCode || undefined,
      });

      toast({
        title: 'Success!',
        description: 'Your salon has been created',
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create salon',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <Card className='w-full max-w-2xl'>
        <CardHeader className='space-y-1'>
          <div className='flex items-center space-x-2 mb-4'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
              <Scissors className='h-5 w-5' />
            </div>
            <div>
              <CardTitle className='text-2xl'>Create Your Salon</CardTitle>
              <CardDescription>
                Set up your salon to start managing your business
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Basic Information */}
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>
                  Salon Name <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='name'
                  placeholder='My Beauty Salon'
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='cnpj'>CNPJ</Label>
                  <Input
                    id='cnpj'
                    placeholder='00.000.000/0000-00'
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='phone'>Phone</Label>
                  <Input
                    id='phone'
                    type='tel'
                    placeholder='(11) 98765-4321'
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='contact@mysalon.com'
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description'>Description (Optional)</Label>
                <Textarea
                  id='description'
                  placeholder='Tell us about your salon...'
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            {/* Address Information */}
            <div className='space-y-4'>
              <h3 className='text-sm font-medium'>Address (Optional)</h3>
              
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2 sm:col-span-2'>
                  <Label htmlFor='address'>Street Address</Label>
                  <Input
                    id='address'
                    placeholder='123 Main Street'
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='city'>City</Label>
                  <Input
                    id='city'
                    placeholder='São Paulo'
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='state'>State</Label>
                  <Input
                    id='state'
                    placeholder='SP'
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    maxLength={2}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='zipCode'>ZIP Code</Label>
                  <Input
                    id='zipCode'
                    placeholder='01234-567'
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className='flex justify-end space-x-3 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => navigate('/dashboard')}
                disabled={isLoading}
              >
                Skip for Now
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Salon'}
                <ArrowRight className='ml-2 h-4 w-4' />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
