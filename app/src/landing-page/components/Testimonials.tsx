// components/Testimonials.tsx - REFATORADO COM DESIGN SYSTEM BRAND (Soft Purple)
import { motion } from 'framer-motion';
import { Card } from '../../client/components/ui/Card';
import { GradientText } from '../../client/components/ui/GradientText';
import { Badge } from '../../client/components/ui/Badge';
import { GlowEffect } from '../../client/components/ui/GlowEffect';
import { useRef, useState, useEffect } from 'react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  business: string;
  avatar: string;
  rating: number;
  text: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Mariana Silva',
    role: 'Proprietária',
    business: 'Negócio Elegance',
    avatar: '👩‍🦰',
    rating: 5,
    text: 'O Glamo transformou completamente a gestão do meu negócio. Antes eu perdia horas com planilhas, agora tudo é automático. Aumentei meu faturamento em 30% no primeiro trimestre!',
  },
  {
    id: 2,
    name: 'Carlos Eduardo',
    role: 'Gerente',
    business: 'Barbearia Premium',
    avatar: '👨‍🦲',
    rating: 5,
    text: 'A melhor decisão que tomei para minha barbearia. O controle de comissões ficou transparente e a equipe adorou. Recomendo para todos os colegas do setor.',
  },
  {
    id: 3,
    name: 'Ana Paula Costa',
    role: 'Diretora',
    business: 'Rede Beleza & Cia (3 unidades)',
    avatar: '👩‍⚕️',
    rating: 5,
    text: 'Gerencio 3 unidades e o Glamo me dá visão completa de tudo em tempo real. Os relatórios são incríveis e me ajudam a tomar decisões estratégicas rapidamente.',
  },
  {
    id: 4,
    name: 'Roberto Mendes',
    role: 'Proprietário',
    business: 'Studio Hair',
    avatar: '👨‍💼',
    rating: 5,
    text: 'Interface super intuitiva e moderna. Minha equipe aprendeu a usar em menos de um dia. O suporte é excepcional e sempre disponível quando precisamos.',
  },
];

export default function Testimonials() {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative py-24 bg-white dark:bg-black text-gray-900 dark:text-white overflow-hidden transition-colors duration-300"
    >
      {/* Glow Effects de fundo */}
      <GlowEffect position="top-right" size="xl" color="brand" animated />
      <GlowEffect position="bottom-left" size="xl" color="brand" animated />

      <div className="container mx-auto px-4 relative z-10">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <Badge variant="glow" className="mb-6" id="depoimentos">
            DEPOIMENTOS
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            O que nossos{' '}
            <GradientText variant="brand" as="span" className="text-4xl md:text-6xl font-bold">
              clientes dizem
            </GradientText>
          </h2>
          <p className="text-xl text-gray-600 dark:text-zinc-400 max-w-3xl mx-auto">
            Histórias reais de transformação e sucesso com o Glamo
          </p>
        </motion.div>

        {/* Grid de testimonials */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
              inView={inView}
            />
          ))}
        </div>

        {/* Métricas de confiança */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          {[
            { value: '4.9/5', label: 'Average rating' },
            { value: '98%', label: 'Recommend us' },
            { value: '2,500+', label: 'Active clients' },
            { value: '50K+', label: 'Bookings/month' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
            >
              <Card variant="glass" className="text-center">
                <div className="text-3xl font-bold text-brand-500 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-zinc-400">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function TestimonialCard({
  testimonial,
  index,
  inView,
}: {
  testimonial: Testimonial;
  index: number;
  inView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15 }}
    >
      <Card variant="glass-brand" hover glow className="h-full">
        {/* Rating */}
        <div className="flex gap-1 mb-4" aria-label={`Rating ${testimonial.rating} out of 5`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className={`w-5 h-5 ${
                i < testimonial.rating ? 'text-brand-500' : 'text-gray-300 dark:text-zinc-700'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        {/* Quote */}
        <blockquote className="text-gray-700 dark:text-zinc-300 leading-relaxed mb-6 text-base">
          "{testimonial.text}"
        </blockquote>

        {/* Author */}
        <div className="flex items-center gap-3 mt-auto">
          <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-500 rounded-full flex items-center justify-center text-2xl">
            {testimonial.avatar}
          </div>
          <div>
            <div className="font-bold text-gray-900 dark:text-white">{testimonial.name}</div>
            <div className="text-sm text-gray-600 dark:text-zinc-400">
              {testimonial.role} • {testimonial.business}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
