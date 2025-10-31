// components/ContactForm.tsx - PADRONIZADO E OTIMIZADO COM BACKEND FUNCIONAL
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { createContactMessage } from 'wasp/client/operations';
import { Button } from '../../client/components/ui/Button';
import { Card } from '../../client/components/ui/Card';
import { GlowEffect } from '../../client/components/ui/GlowEffect';
import { useToast } from '../../client/hooks/useToast';
import { createContactMessageSchema, type CreateContactMessageInput } from '../../contact/types';
import { z } from 'zod';

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function ContactForm() {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setInView(true),
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const validateForm = (): boolean => {
    try {
      createContactMessageSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Erro de validação',
        description: 'Por favor, corrija os campos destacados.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createContactMessage(formData);
      
      setSubmitSuccess(true);
      toast({
        title: 'Mensagem enviada! ✅',
        description: 'Recebemos sua mensagem e entraremos em contato em breve.',
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        message: ''
      });
      setErrors({});
      
      // Esconde mensagem após 5s
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      
      let errorMessage = 'Erro ao enviar formulário. Tente novamente.';
      
      // Parse error message from backend
      if (error?.message) {
        if (error.message.includes('rate limit') || error.message.includes('Muitas tentativas')) {
          errorMessage = 'Você enviou muitas mensagens. Por favor, aguarde antes de tentar novamente.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrors({ submit: errorMessage });
      toast({
        title: 'Erro ao enviar',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <section
      ref={ref}
      className="relative py-24 bg-gradient-to-b from-black via-zinc-950 to-black text-white overflow-hidden"
      aria-labelledby="contact-heading"
    >
      {/* Fundo animado neon green */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <GlowEffect position="top-right" size="xl" animated />
        <GlowEffect position="bottom-left" size="lg" animated />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Lado esquerdo - Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 bg-neon-500/10 text-neon-500 rounded-full text-sm font-semibold mb-4 border border-neon-500/30">
              FALE CONOSCO
            </span>
            <h2 id="contact-heading" className="text-4xl md:text-5xl font-bold mb-6">
              Vamos conversar sobre
              <br />
              <span className="bg-gradient-to-r from-neon-500 to-neon-400 bg-clip-text text-transparent">
                seu negócio
              </span>
            </h2>
            <p className="text-xl text-zinc-400 mb-8">
              Preencha o formulário e nossa equipe entrará em contato em até 1 hora útil
            </p>

            {/* Canais de contato */}
            <div className="space-y-6">
              <ContactMethod
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
                title="Email"
                value="contato@glamo.com.br"
                link="mailto:contato@glamo.com.br"
              />
              <ContactMethod
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                }
                title="Telefone"
                value="(11) 99999-9999"
                link="tel:+5511999999999"
              />
              <ContactMethod
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                }
                title="WhatsApp"
                value="(11) 99999-9999"
                link="https://wa.me/5511999999999"
              />
            </div>

            {/* Trust badges */}
            <div className="mt-12 pt-8 border-t border-zinc-800">
              <p className="text-sm text-zinc-400 mb-4">Confiado por:</p>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="px-4 py-2 bg-zinc-800/50 rounded-lg text-sm font-semibold text-zinc-300 border border-zinc-700">
                  🔒 LGPD Compliant
                </div>
                <div className="px-4 py-2 bg-zinc-800/50 rounded-lg text-sm font-semibold text-zinc-300 border border-zinc-700">
                  ⭐ 4.9/5 Rating
                </div>
                <div className="px-4 py-2 bg-zinc-800/50 rounded-lg text-sm font-semibold text-zinc-300 border border-zinc-700">
                  👥 2.500+ Clientes
                </div>
              </div>
            </div>
          </motion.div>

          {/* Lado direito - Formulário */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card variant="glass-neon" glow className="p-8">
              {/* Mensagem de sucesso */}
              <div aria-live="polite" aria-atomic="true">
                {submitSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                    role="status"
                  >
                    <div className="w-20 h-20 bg-neon-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-neon-500/30">
                      <svg className="w-10 h-10 text-neon-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">
                      Mensagem enviada!
                    </h3>
                    <p className="text-zinc-400 mb-6">
                      Recebemos sua mensagem e entraremos em contato em breve.
                    </p>
                    <Button
                      variant="primary-glow"
                      onClick={() => setSubmitSuccess(false)}
                    >
                      Enviar outra mensagem
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    {/* Nome */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-zinc-300 mb-2">
                        Nome completo *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        autoComplete="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl bg-zinc-900/50 border-2 transition-all duration-300 text-white placeholder-zinc-500 focus:outline-none ${
                          errors.name 
                            ? 'border-red-500 focus:border-red-500' 
                            : 'border-zinc-700 focus:border-neon-500/50 hover:border-zinc-600'
                        }`}
                        placeholder="Seu nome completo"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                      />
                      {errors.name && (
                        <p id="name-error" className="mt-1 text-sm text-red-400" role="alert">{errors.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-zinc-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl bg-zinc-900/50 border-2 transition-all duration-300 text-white placeholder-zinc-500 focus:outline-none ${
                          errors.email 
                            ? 'border-red-500 focus:border-red-500' 
                            : 'border-zinc-700 focus:border-neon-500/50 hover:border-zinc-600'
                        }`}
                        placeholder="seu@email.com"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                      />
                      {errors.email && (
                        <p id="email-error" className="mt-1 text-sm text-red-400" role="alert">{errors.email}</p>
                      )}
                    </div>

                    {/* Mensagem */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-zinc-300 mb-2">
                        Mensagem *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        className={`w-full px-4 py-3 rounded-xl bg-zinc-900/50 border-2 transition-all duration-300 resize-none text-white placeholder-zinc-500 focus:outline-none ${
                          errors.message 
                            ? 'border-red-500 focus:border-red-500' 
                            : 'border-zinc-700 focus:border-neon-500/50 hover:border-zinc-600'
                        }`}
                        placeholder="Conte-nos sobre suas necessidades e como podemos ajudar..."
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? 'message-error' : undefined}
                      />
                      {errors.message && (
                        <p id="message-error" className="mt-1 text-sm text-red-400" role="alert">{errors.message}</p>
                      )}
                    </div>

                    {/* Erro de envio */}
                    {errors.submit && (
                      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl" role="alert">
                        <p className="text-sm text-red-400">{errors.submit}</p>
                      </div>
                    )}

                    {/* Botão de envio */}
                    <Button
                      type="submit"
                      variant="primary-glow"
                      size="lg"
                      isLoading={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
                    </Button>

                    <p className="text-xs text-center text-zinc-500">
                      ✓ Responderemos em até 1 hora útil<br/>
                      ✓ Seus dados estão protegidos pela LGPD
                    </p>
                  </form>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ContactMethod({
  icon,
  title,
  value,
  link
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  link: string;
}) {
  return (
    <a
      href={link}
      className="flex items-center gap-4 p-4 bg-zinc-900/50 backdrop-blur-sm rounded-xl hover:bg-zinc-800/50 border border-zinc-700 hover:border-neon-500/30 hover:shadow-glow-sm transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-neon-500/40"
    >
      <div className="w-12 h-12 bg-gradient-to-br from-neon-500 to-neon-600 rounded-xl flex items-center justify-center text-black group-hover:scale-110 group-hover:shadow-glow-md transition-all duration-300">
        {icon}
      </div>
      <div>
        <p className="text-sm text-zinc-400">{title}</p>
        <p className="font-semibold text-white group-hover:text-neon-500 transition-colors">{value}</p>
      </div>
    </a>
  );
}