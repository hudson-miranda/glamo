import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createSalon } from 'wasp/client/operations';
import { useAuth } from 'wasp/client/auth';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { GlowEffect } from '../../components/ui/GlowEffect';
import { GradientText } from '../../components/ui/GradientText';
import DarkModeSwitcher from '../../components/DarkModeSwitcher';
import { Scissors, ArrowRight, Sparkles, Check, Calendar, Users, TrendingUp, ShoppingBag, DollarSign, Package, type LucideIcon } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export default function CreateSalonPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Campo obrigatório',
        description: 'O nome do negócio é obrigatório',
      });
      return false;
    }

    if (formData.name.trim().length < 3) {
      toast({
        variant: 'destructive',
        title: 'Nome muito curto',
        description: 'O nome do negócio deve ter pelo menos 3 caracteres',
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
        title: 'Negócio criado com sucesso!',
        description: 'Seu período de trial de 14 dias começou. Aproveite todos os recursos!',
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error creating salon:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar negócio',
        description: error.message || 'Ocorreu um erro ao criar o negócio. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const trialFeatures: { icon: LucideIcon; text: string }[] = [
    { icon: Calendar, text: 'Agendamentos ilimitados por 14 dias' },
    { icon: Users, text: 'Até 5 profissionais' },
    { icon: TrendingUp, text: 'Relatórios e análises completas' },
    { icon: DollarSign, text: 'Sistema de comissões automático' },
    { icon: ShoppingBag, text: 'Gestão de vendas e clientes' },
    { icon: Package, text: 'Controle de estoque inteligente' },
  ];

  return (
    <div className='min-h-screen flex flex-col bg-gradient-to-b from-white via-purple-50/20 to-white dark:from-black dark:via-purple-950/20 dark:to-black transition-colors duration-300'>
      {/* NavBar */}
      <header className='sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            {/* Logo */}
            <Link to="/" className='flex items-center gap-3 group'>
              {/*<div className='w-10 h-10 bg-gradient-to-r from-brand-400 to-brand-600 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6'>
                <span className='text-2xl'>✨</span>
              </div>*/}
              <span className='text-2xl font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent'>
                Glamo
              </span>
            </Link>

            {/* Dark Mode Toggle */}
            <div className='flex items-center'>
              <DarkModeSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className='relative flex-1 flex items-center justify-center p-4 overflow-hidden'>
        {/* Glow Effects */}
        <GlowEffect position="top-left" size="xl" color="brand" animated />
        <GlowEffect position="bottom-right" size="xl" color="purple" animated />

        <div ref={ref} className='w-full max-w-4xl relative z-10 py-8'>
          {/* Trial Badge Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className='text-center mb-8'
          >
            <Badge className='bg-gradient-to-r from-brand-400 to-brand-600 text-white border-0 px-6 py-3 text-base shadow-xl shadow-brand-500/30 font-semibold mb-4'>
              <Sparkles className='h-5 w-5 mr-2 inline' />
              14 Dias Grátis - Plano Profissional
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              <GradientText variant="brand" as="span" className="text-4xl md:text-5xl font-bold">
                Crie Seu Negócio
              </GradientText>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Configure seu negócio em minutos e comece a transformar sua gestão
            </p>
          </motion.div>

          {/* Trial Features - Centered Top Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <Card className='bg-gradient-to-br from-brand-50 to-purple-50 dark:from-brand-950/50 dark:to-purple-950/50 border-2 border-brand-200 dark:border-brand-800 backdrop-blur-sm shadow-xl'>
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-lg shadow-brand-500/30">
                    <Sparkles className='h-6 w-6' />
                  </div>
                  <div>
                    <CardTitle className="text-xl bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
                      Trial Gratuito
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Recursos incluídos no seu período de teste
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {trialFeatures.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                        className='flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-900/30 backdrop-blur-sm border border-brand-100 dark:border-brand-900/50 hover:border-brand-300 dark:hover:border-brand-700 transition-all hover:shadow-md'
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                            <Icon className='h-4 w-4 text-white' />
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">{feature.text}</span>
                      </motion.div>
                    );
                  })}
                </div>
                
                <div className="mt-4 pt-4 border-t border-brand-200 dark:border-brand-800">
                  <p className="text-xs text-center text-gray-600 dark:text-gray-400 leading-relaxed">
                    🎉 <strong className="text-brand-600 dark:text-brand-400">Sem cartão de crédito</strong> para começar
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Form - Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
          <Card className='bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-2xl border-2 border-gray-200 dark:border-gray-800 hover:shadow-brand-500/10 transition-all duration-300'>
            <CardHeader className='space-y-6 pb-6'>
              <div className='flex items-start justify-between flex-wrap gap-4'>
                <div className='flex items-center space-x-4'>
                  <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-xl shadow-brand-500/30'>
                    <Scissors className='h-8 w-8' />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                      Informações do Negócio
                    </CardTitle>
                    <CardDescription className='text-base mt-2 text-gray-600 dark:text-gray-400'>
                      Preencha os dados para começar seu trial gratuito
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className='space-y-6'>
                {/* Basic Information */}
                <div className='space-y-5'>
                  <div className='space-y-2'>
                    <Label htmlFor='name' className='text-base font-semibold text-gray-700 dark:text-gray-200'>
                      Nome do Negócio <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='name'
                      placeholder='Negócio Beleza & Estilo'
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      disabled={isLoading}
                      className='text-base px-4 py-3 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all'
                      maxLength={100}
                    />
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      Este será o nome principal do seu negócio no sistema
                    </p>
                  </div>

                  <div className='grid gap-5 sm:grid-cols-2'>
                    <div className='space-y-2'>
                      <Label htmlFor='cnpj' className='text-base font-semibold text-gray-700 dark:text-gray-200'>CNPJ (Opcional)</Label>
                      <Input
                        id='cnpj'
                        placeholder='00.000.000/0000-00'
                        value={formData.cnpj}
                        onChange={(e) => handleInputChange('cnpj', formatCNPJ(e.target.value))}
                        disabled={isLoading}
                        className='text-base px-4 py-3 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all'
                        maxLength={18}
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='phone' className='text-base font-semibold text-gray-700 dark:text-gray-200'>Telefone (Opcional)</Label>
                      <Input
                        id='phone'
                        type='tel'
                        placeholder='(11) 98765-4321'
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                        disabled={isLoading}
                        className='text-base px-4 py-3 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all'
                        maxLength={15}
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='email' className='text-base font-semibold text-gray-700 dark:text-gray-200'>Email de Contato (Opcional)</Label>
                    <Input
                      id='email'
                      type='email'
                      placeholder='contato@meunegocio.com.br'
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={isLoading}
                      className='text-base px-4 py-3 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all'
                      maxLength={100}
                    />
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      Email para comunicação com clientes
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='description' className='text-base font-semibold text-gray-700 dark:text-gray-200'>Descrição (Opcional)</Label>
                    <Textarea
                      id='description'
                      placeholder='Conte um pouco sobre seu negócio, serviços oferecidos e diferenciais...'
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      disabled={isLoading}
                      rows={3}
                      className='text-base px-4 py-3 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all resize-none'
                      maxLength={500}
                    />
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      {formData.description.length}/500 caracteres
                    </p>
                  </div>
                </div>

                {/* Address Information */}
                <div className='space-y-5 pt-4 border-t border-gray-200 dark:border-gray-800'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-base font-semibold text-gray-900 dark:text-white'>Endereço (Opcional)</h3>
                    <span className='text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full'>Você pode adicionar depois</span>
                  </div>

                  <div className='grid gap-5 sm:grid-cols-2'>
                    <div className='space-y-2 sm:col-span-2'>
                      <Label htmlFor='address' className='text-base font-semibold text-gray-700 dark:text-gray-200'>Logradouro</Label>
                      <Input
                        id='address'
                        placeholder='Rua das Flores, 123'
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        disabled={isLoading}
                        className='text-base px-4 py-3 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all'
                        maxLength={200}
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='city' className='text-base font-semibold text-gray-700 dark:text-gray-200'>Cidade</Label>
                      <Input
                        id='city'
                        placeholder='São Paulo'
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        disabled={isLoading}
                        className='text-base px-4 py-3 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all'
                        maxLength={100}
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='state' className='text-base font-semibold text-gray-700 dark:text-gray-200'>Estado (UF)</Label>
                      <Input
                        id='state'
                        placeholder='SP'
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value.toUpperCase())}
                        disabled={isLoading}
                        className='text-base px-4 py-3 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all uppercase'
                        maxLength={2}
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='zipCode' className='text-base font-semibold text-gray-700 dark:text-gray-200'>CEP</Label>
                      <Input
                        id='zipCode'
                        placeholder='01234-567'
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', formatZipCode(e.target.value))}
                        disabled={isLoading}
                        className='text-base px-4 py-3 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all'
                        maxLength={9}
                      />
                    </div>
                  </div>
                </div>

                <div className='flex flex-col-reverse sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-800'>
                  <Button
                    type='button'
                    onClick={() => navigate('/onboarding')}
                    disabled={isLoading}
                    className='w-full sm:w-auto bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 px-8 py-6 rounded-xl font-semibold transition-all'
                  >
                    Voltar
                  </Button>
                  <Button
                    type='submit'
                    disabled={isLoading}
                    className='w-full sm:w-auto bg-gradient-to-r from-brand-400 to-brand-600 hover:from-brand-500 hover:to-brand-700 text-white shadow-xl shadow-brand-500/30 hover:shadow-2xl hover:shadow-brand-500/40 transition-all duration-300 hover:scale-[1.02] px-8 py-6 rounded-xl font-semibold text-base'
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Criando negócio...
                      </span>
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
        </motion.div>

        {/* Footer Info */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className='text-center text-sm text-gray-600 dark:text-gray-400 mt-8'
        >
          Sem compromisso. Cancele quando quiser durante o período de trial.
        </motion.p>
      </div>
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
