// components/ContactForm.tsx - PADRONIZADO E OTIMIZADO
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  businessType: string;
  message: string;
  consent: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const businessTypes = [
  'Salão de Beleza',
  'Barbearia',
  'Clínica de Estética',
  'Manicure/Pedicure',
  'Studio de Sobrancelhas',
  'Spa',
  'Clínica Médica',
  'Outro'
];

export default function ContactForm() {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    businessType: '',
    message: '',
    consent: false
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

  // Helpers
  const formatPhoneBR = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 11); // DDD + 9 dígitos
    const part1 = digits.slice(0, 2);
    const part2 = digits.length > 6 ? digits.slice(2, 7) : digits.slice(2, 6);
    const part3 = digits.length > 6 ? digits.slice(7, 11) : digits.slice(6, 10);
    if (digits.length <= 2) return part1 ? `(${part1}` : '';
    if (digits.length <= 6) return `(${part1}) ${part2}`;
    return `(${part1}) ${part2}-${part3}`;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else {
      const digits = formData.phone.replace(/\D/g, '');
      // Aceita 10 ou 11 dígitos (fixo ou celular), DDD válido (não inicia com 0)
      if (!/^[1-9]\d{1}\d{8,9}$/.test(digits)) {
        newErrors.phone = 'Telefone inválido';
      }
    }

    if (!formData.businessType) newErrors.businessType = 'Selecione o tipo de negócio';
    if (!formData.consent) newErrors.consent = 'Você precisa aceitar os termos';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Simula envio (substituir com sua API)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Exemplo de chamada real:
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      // if (!response.ok) throw new Error('Falha no envio');

      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        businessType: '',
        message: '',
        consent: false
      });
      setErrors({});
      // Esconde mensagem após 5s
      const t = setTimeout(() => setSubmitSuccess(false), 5000);
      return () => clearTimeout(t);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Erro ao enviar formulário. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    let newValue = type === 'checkbox' ? checked : value;

    if (name === 'phone') {
      newValue = formatPhoneBR(String(value));
    }

    setFormData((prev) => ({ ...prev, [name]: newValue as any }));

    if (errors[name]) {
      setErrors((prev) => {
        const ne = { ...prev };
        delete ne[name];
        return ne;
      });
    }
  };

  return (
    <section
      ref={ref}
      className="relative py-24 bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white overflow-hidden"
      aria-labelledby="contact-heading"
    >
      {/* Fundo animado (sem cortes) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[28rem] h-[28rem] bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[28rem] h-[28rem] bg-pink-500 rounded-full blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Lado esquerdo - Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold mb-4 border border-purple-500/30">
              FALE CONOSCO
            </span>
            <h2 id="contact-heading" className="text-4xl md:text-5xl font-bold mb-6">
              Vamos conversar sobre
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                seu negócio
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-8">
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
            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-sm text-gray-400 mb-4">Confiado por:</p>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="px-4 py-2 bg-white/10 rounded-lg text-sm font-semibold text-gray-300">
                  🔒 LGPD Compliant
                </div>
                <div className="px-4 py-2 bg-white/10 rounded-lg text-sm font-semibold text-gray-300">
                  ⭐ 4.9/5 Rating
                </div>
                <div className="px-4 py-2 bg-white/10 rounded-lg text-sm font-semibold text-gray-300">
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
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/10">
              {/* Mensagem de sucesso */}
              <div aria-live="polite" aria-atomic="true">
                {submitSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                    role="status"
                  >
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                      <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">
                      Mensagem enviada!
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Recebemos sua mensagem e entraremos em contato em breve.
                    </p>
                    <button
                      onClick={() => setSubmitSuccess(false)}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                    >
                      Enviar outra mensagem
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    {/* Nome */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-2">
                        Nome completo *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        autoComplete="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl bg-white/5 border-2 transition-colors duration-300 text-white placeholder-gray-500 focus:outline-none ${
                          errors.name ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-purple-500/50'
                        }`}
                        placeholder="Seu nome"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                      />
                      {errors.name && (
                        <p id="name-error" className="mt-1 text-sm text-red-400" role="alert">{errors.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl bg-white/5 border-2 transition-colors duration-300 text-white placeholder-gray-500 focus:outline-none ${
                          errors.email ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-purple-500/50'
                        }`}
                        placeholder="seu@email.com"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                      />
                      {errors.email && (
                        <p id="email-error" className="mt-1 text-sm text-red-400" role="alert">{errors.email}</p>
                      )}
                    </div>

                    {/* Telefone */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-300 mb-2">
                        Telefone/WhatsApp *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        inputMode="tel"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl bg-white/5 border-2 transition-colors duration-300 text-white placeholder-gray-500 focus:outline-none ${
                          errors.phone ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-purple-500/50'
                        }`}
                        placeholder="(11) 99999-9999"
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                      />
                      {errors.phone && (
                        <p id="phone-error" className="mt-1 text-sm text-red-400" role="alert">{errors.phone}</p>
                      )}
                    </div>

                    {/* Tipo de negócio */}
                    <div>
                      <label htmlFor="businessType" className="block text-sm font-semibold text-gray-300 mb-2">
                        Tipo de negócio *
                      </label>
                      <select
                        id="businessType"
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl bg-white/5 border-2 transition-colors duration-300 text-white focus:outline-none ${
                          errors.businessType ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-purple-500/50'
                        }`}
                        aria-invalid={!!errors.businessType}
                        aria-describedby={errors.businessType ? 'businessType-error' : undefined}
                      >
                        <option value="" className="bg-gray-900">Selecione...</option>
                        {businessTypes.map((type, index) => (
                          <option key={index} value={type} className="bg-gray-900">
                            {type}
                          </option>
                        ))}
                      </select>
                      {errors.businessType && (
                        <p id="businessType-error" className="mt-1 text-sm text-red-400" role="alert">{errors.businessType}</p>
                      )}
                    </div>

                    {/* Mensagem */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-gray-300 mb-2">
                        Mensagem (opcional)
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border-2 border-white/10 focus:border-purple-500/50 focus:outline-none transition-colors duration-300 resize-none text-white placeholder-gray-500"
                        placeholder="Conte-nos mais sobre suas necessidades..."
                      />
                    </div>

                    {/* Consentimento */}
                    <fieldset>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="consent"
                          checked={formData.consent}
                          onChange={handleChange}
                          className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          aria-invalid={!!errors.consent}
                          aria-describedby={errors.consent ? 'consent-error' : undefined}
                        />
                        <span className="text-sm text-gray-400">
                          Aceito receber comunicações do Glamo e concordo com a{' '}
                          <a href="/privacy" className="text-purple-400 hover:text-purple-300 hover:underline">
                            Política de Privacidade
                          </a>
                          {' '}e{' '}
                          <a href="/terms" className="text-purple-400 hover:text-purple-300 hover:underline">
                            Termos de Uso
                          </a>
                          . *
                        </span>
                      </label>
                      {errors.consent && (
                        <p id="consent-error" className="mt-1 text-sm text-red-400" role="alert">{errors.consent}</p>
                      )}
                    </fieldset>

                    {/* Erro de envio */}
                    {errors.submit && (
                      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl" role="alert">
                        <p className="text-sm text-red-400">{errors.submit}</p>
                      </div>
                    )}

                    {/* Botão de envio */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-3">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enviando...
                        </span>
                      ) : (
                        'Enviar Mensagem'
                      )}
                    </button>

                    <p className="text-xs text-center text-gray-500">
                      Responderemos em até 1 hora útil
                    </p>
                  </form>
                )}
              </div>
            </div>
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
      className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl hover:bg-white/10 border border-white/10 hover:border-purple-500/30 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-purple-500/40"
    >
      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="font-semibold text-white">{value}</p>
      </div>
    </a>
  );
}