import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { useToast } from '../../components/ui/use-toast';

interface FormData {
  name: string;
  email: string;
  businessType: string;
  message?: string;
}

export default function ContactForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    businessType: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    
    if (!formData.businessType) {
      newErrors.businessType = 'Tipo de empresa é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Erro no formulário',
        description: 'Por favor, corrija os erros antes de enviar',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Integrate with backend API route /api/contact
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      
      toast({
        title: 'Solicitação enviada! ✅',
        description: 'Entraremos em contato em breve. Obrigado!',
        variant: 'default',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        businessType: '',
        message: '',
      });
      setErrors({});
    } catch (error) {
      toast({
        title: 'Erro ao enviar',
        description: 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className='py-24 sm:py-32' id='demo'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          {/* Left side - Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className='text-base font-semibold leading-7 text-[#F5C542]'>Solicite uma Demo</h2>
            <p className='mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl'>
              Veja o Glamo em ação
            </p>
            <p className='mt-6 text-lg leading-8 text-muted-foreground'>
              Agende uma demonstração personalizada e descubra como o Glamo pode revolucionar a gestão do seu salão.
            </p>

            <div className='mt-8 space-y-6'>
              {[
                { emoji: '🎯', text: 'Demonstração personalizada para seu negócio' },
                { emoji: '💡', text: 'Tire todas as suas dúvidas com nossos especialistas' },
                { emoji: '🚀', text: 'Comece a usar em minutos' },
                { emoji: '🎁', text: '14 dias grátis para testar todas as funcionalidades' },
              ].map((item, idx) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className='flex items-start gap-4'
                >
                  <span className='text-2xl'>{item.emoji}</span>
                  <p className='text-muted-foreground'>{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className='border-2'>
              <CardContent className='p-8'>
                <form onSubmit={handleSubmit} className='space-y-6'>
                  {/* Name field */}
                  <div className='relative'>
                    <label htmlFor='name' className='block text-sm font-medium text-foreground mb-2'>
                      Nome completo <span className='text-destructive'>*</span>
                    </label>
                    <input
                      type='text'
                      id='name'
                      name='name'
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border-2 bg-background transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                        errors.name ? 'border-destructive' : 'border-input hover:border-primary/50'
                      }`}
                      placeholder='Seu nome'
                    />
                    {errors.name && (
                      <p className='mt-1 text-sm text-destructive'>{errors.name}</p>
                    )}
                  </div>

                  {/* Email field */}
                  <div className='relative'>
                    <label htmlFor='email' className='block text-sm font-medium text-foreground mb-2'>
                      E-mail <span className='text-destructive'>*</span>
                    </label>
                    <input
                      type='email'
                      id='email'
                      name='email'
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border-2 bg-background transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                        errors.email ? 'border-destructive' : 'border-input hover:border-primary/50'
                      }`}
                      placeholder='seu@email.com'
                    />
                    {errors.email && (
                      <p className='mt-1 text-sm text-destructive'>{errors.email}</p>
                    )}
                  </div>

                  {/* Business type field */}
                  <div className='relative'>
                    <label htmlFor='businessType' className='block text-sm font-medium text-foreground mb-2'>
                      Tipo de empresa <span className='text-destructive'>*</span>
                    </label>
                    <select
                      id='businessType'
                      name='businessType'
                      value={formData.businessType}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border-2 bg-background transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                        errors.businessType ? 'border-destructive' : 'border-input hover:border-primary/50'
                      }`}
                    >
                      <option value=''>Selecione...</option>
                      <option value='salao'>Salão de Beleza</option>
                      <option value='barbearia'>Barbearia</option>
                      <option value='spa'>Spa</option>
                      <option value='clinica'>Clínica Estética</option>
                      <option value='outro'>Outro</option>
                    </select>
                    {errors.businessType && (
                      <p className='mt-1 text-sm text-destructive'>{errors.businessType}</p>
                    )}
                  </div>

                  {/* Message field (optional) */}
                  <div className='relative'>
                    <label htmlFor='message' className='block text-sm font-medium text-foreground mb-2'>
                      Mensagem (opcional)
                    </label>
                    <textarea
                      id='message'
                      name='message'
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      className='w-full px-4 py-3 rounded-lg border-2 border-input hover:border-primary/50 bg-background transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none'
                      placeholder='Conte-nos mais sobre seu negócio...'
                    />
                  </div>

                  {/* Submit button */}
                  <Button
                    type='submit'
                    disabled={isSubmitting}
                    className='w-full bg-gradient-to-r from-[#F5C542] to-yellow-500 hover:from-yellow-500 hover:to-[#F5C542] text-black font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
                  >
                    {isSubmitting ? 'Enviando...' : 'Solicitar Demonstração'}
                    {!isSubmitting && <span className='ml-2'>→</span>}
                  </Button>

                  <p className='text-xs text-center text-muted-foreground'>
                    Ao enviar, você concorda com nossa política de privacidade
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
