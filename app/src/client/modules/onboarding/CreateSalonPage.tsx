import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSalon } from 'wasp/client/operations';
import { useAuth } from 'wasp/client/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { Scissors, ArrowRight, Sparkles, Check } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export default function CreateSalonPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: user } = useAuth();
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

  // Redirect if user already has a salon
  useEffect(() => {
    if (user?.activeSalonId) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Campo obrigatório',
        description: 'O nome do salão é obrigatório',
      });
      return false;
    }

    if (formData.name.trim().length < 3) {
      toast({
        variant: 'destructive',
        title: 'Nome muito curto',
        description: 'O nome do salão deve ter pelo menos 3 caracteres',
      });
      return false;
    }

    if (formData.cnpj && !isValidCNPJ(formData.cnpj)) {
      toast({
        variant: 'destructive',
        title: 'CNPJ inválido',
        description: 'Por favor, verifique o CNPJ informado',
      });
      return false;
    }

    if (formData.email && !isValidEmail(formData.email)) {
      toast({
        variant: 'destructive',
        title: 'Email inválido',
        description: 'Por favor, verifique o email informado',
      });
      return false;
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      toast({
        variant: 'destructive',
        title: 'Telefone inválido',
        description: 'Por favor, verifique o telefone informado',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await createSalon({
        name: formData.name.trim(),
        cnpj: formData.cnpj.trim() || undefined,
        description: formData.description.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim().toUpperCase() || undefined,
        zipCode: formData.zipCode.trim() || undefined,
      });

      toast({
        title: 'Salão criado com sucesso!',
        description: 'Seu período de trial de 14 dias começou. Aproveite todos os recursos!',
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error creating salon:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar salão',
        description: error.message || 'Ocorreu um erro ao criar o salão. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const trialFeatures = [
    'Agendamentos ilimitados por 14 dias',
    'Até 5 profissionais',
    'Gestão completa de clientes',
    'Relatórios e análises',
    'Sistema de pagamentos',
    'Gestão de estoque',
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-brand-400/20 via-background to-brand-600/20 dark:from-brand-600/10 dark:via-background dark:to-brand-400/10 flex items-center justify-center p-4'>
      <div className='w-full max-w-4xl'>
        {/* Trial Badge Header */}
        <div className='text-center mb-6'>
          <Badge className='bg-gradient-to-r from-brand-500 to-brand-600 text-white border-0 px-4 py-2 text-base shadow-lg'>
            <Sparkles className='h-4 w-4 mr-2' />
            14 Dias Grátis - Plano Profissional
          </Badge>
        </div>

        <Card className='shadow-2xl border-brand-200 dark:border-brand-800'>
          <CardHeader className='space-y-4 pb-6'>
            <div className='flex items-start justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-lg'>
                  <Scissors className='h-6 w-6' />
                </div>
                <div>
                  <CardTitle className='text-3xl font-bold bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent'>
                    Crie Seu Salão
                  </CardTitle>
                  <CardDescription className='text-base mt-1'>
                    Configure seu negócio e comece a gerenciar hoje mesmo
                  </CardDescription>
                </div>
              </div>
            </div>

            {/* Trial Features */}
            <div className='bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-950 dark:to-brand-900 rounded-lg p-4 border border-brand-200 dark:border-brand-800'>
              <h3 className='font-semibold text-sm text-brand-700 dark:text-brand-300 mb-3 flex items-center'>
                <Sparkles className='h-4 w-4 mr-2' />
                Incluído no seu trial gratuito:
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                {trialFeatures.map((feature, idx) => (
                  <div key={idx} className='flex items-center text-sm text-brand-900 dark:text-brand-100'>
                    <Check className='h-4 w-4 mr-2 text-brand-600 dark:text-brand-400 flex-shrink-0' />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Basic Information */}
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name' className='text-base'>
                    Nome do Salão <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    id='name'
                    placeholder='Salão Beleza & Estilo'
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    disabled={isLoading}
                    className='text-base'
                    maxLength={100}
                  />
                  <p className='text-xs text-muted-foreground'>
                    Este será o nome principal do seu negócio no sistema
                  </p>
                </div>

                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='cnpj'>CNPJ (Opcional)</Label>
                    <Input
                      id='cnpj'
                      placeholder='00.000.000/0000-00'
                      value={formData.cnpj}
                      onChange={(e) => handleInputChange('cnpj', formatCNPJ(e.target.value))}
                      disabled={isLoading}
                      maxLength={18}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='phone'>Telefone (Opcional)</Label>
                    <Input
                      id='phone'
                      type='tel'
                      placeholder='(11) 98765-4321'
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                      disabled={isLoading}
                      maxLength={15}
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='email'>Email de Contato (Opcional)</Label>
                  <Input
                    id='email'
                    type='email'
                    placeholder='contato@meusalao.com.br'
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={isLoading}
                    maxLength={100}
                  />
                  <p className='text-xs text-muted-foreground'>
                    Email para comunicação com clientes
                  </p>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='description'>Descrição (Opcional)</Label>
                  <Textarea
                    id='description'
                    placeholder='Conte um pouco sobre seu salão, serviços oferecidos e diferenciais...'
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={isLoading}
                    rows={3}
                    maxLength={500}
                  />
                  <p className='text-xs text-muted-foreground'>
                    {formData.description.length}/500 caracteres
                  </p>
                </div>
              </div>

              {/* Address Information */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-sm font-semibold'>Endereço (Opcional)</h3>
                  <span className='text-xs text-muted-foreground'>Você pode adicionar depois</span>
                </div>

                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='space-y-2 sm:col-span-2'>
                    <Label htmlFor='address'>Logradouro</Label>
                    <Input
                      id='address'
                      placeholder='Rua das Flores, 123'
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={isLoading}
                      maxLength={200}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='city'>Cidade</Label>
                    <Input
                      id='city'
                      placeholder='São Paulo'
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      disabled={isLoading}
                      maxLength={100}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='state'>Estado (UF)</Label>
                    <Input
                      id='state'
                      placeholder='SP'
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value.toUpperCase())}
                      disabled={isLoading}
                      maxLength={2}
                      className='uppercase'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='zipCode'>CEP</Label>
                    <Input
                      id='zipCode'
                      placeholder='01234-567'
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', formatZipCode(e.target.value))}
                      disabled={isLoading}
                      maxLength={9}
                    />
                  </div>
                </div>
              </div>

              <div className='flex flex-col-reverse sm:flex-row justify-between gap-3 pt-6 border-t'>
                <Button
                  type='button'
                  variant='ghost'
                  onClick={() => navigate('/onboarding')}
                  disabled={isLoading}
                  className='w-full sm:w-auto'
                >
                  Voltar
                </Button>
                <Button
                  type='submit'
                  disabled={isLoading}
                  className='w-full sm:w-auto bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-lg'
                  size='lg'
                >
                  {isLoading ? (
                    <>
                      <span className='animate-pulse'>Criando salão...</span>
                    </>
                  ) : (
                    <>
                      Iniciar Trial Gratuito
                      <ArrowRight className='ml-2 h-5 w-5' />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <p className='text-center text-sm text-muted-foreground mt-6'>
          Sem compromisso. Cancele quando quiser durante o período de trial.
        </p>
      </div>
    </div>
  );
}

// Utility validation functions
function isValidCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  return cleanCNPJ.length === 14;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}

// Utility formatting functions
function formatCNPJ(value: string): string {
  const clean = value.replace(/\D/g, '');
  return clean
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 18);
}

function formatPhone(value: string): string {
  const clean = value.replace(/\D/g, '');
  if (clean.length <= 10) {
    return clean
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 14);
  }
  return clean
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .substring(0, 15);
}

function formatZipCode(value: string): string {
  const clean = value.replace(/\D/g, '');
  return clean.replace(/^(\d{5})(\d)/, '$1-$2').substring(0, 9);
}
