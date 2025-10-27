// components/Testimonials.tsx - PADRONIZADO E OTIMIZADO
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  business: string;
  avatar: string; // pode ser emoji ou URL futura
  rating: number;
  text: string;
  results: {
    metric: string;
    value: string;
  }[];
  image?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Juliana Santos',
    role: 'Proprietária',
    business: 'Studio Bella',
    avatar: '👩‍🦰',
    rating: 5,
    text: 'Antes do Glamo, eu perdia horas organizando agenda no papel. Agora tudo é automático e meus clientes adoram agendar pelo celular. Meu faturamento aumentou 60% em 3 meses!',
    results: [
      { metric: 'Faturamento', value: '+60%' },
      { metric: 'Tempo economizado', value: '15h/semana' },
      { metric: 'Faltas reduzidas', value: '-80%' }
    ]
  },
  {
    id: 2,
    name: 'Carlos Mendes',
    role: 'Barbeiro',
    business: 'Barbearia Moderna',
    avatar: '👨‍🦲',
    rating: 5,
    text: 'A IA do Glamo é impressionante! Ela sugere os melhores horários e até prevê quando um cliente pode faltar. Consegui otimizar minha agenda e atender 30% mais clientes por semana.',
    results: [
      { metric: 'Clientes/semana', value: '+30%' },
      { metric: 'Ocupação', value: '95%' },
      { metric: 'Satisfação', value: '4.9/5' }
    ]
  },
  {
    id: 3,
    name: 'Mariana Costa',
    role: 'Esteticista',
    business: 'Clínica Essence',
    avatar: '👩‍⚕️',
    rating: 5,
    text: 'Migrei de outra plataforma e a diferença é absurda. O suporte responde em minutos, a interface é linda e meus clientes elogiam a facilidade de agendar. Melhor investimento que fiz!',
    results: [
      { metric: 'NPS', value: '98' },
      { metric: 'Retenção', value: '+45%' },
      { metric: 'Novos clientes', value: '+120/mês' }
    ]
  },
  {
    id: 4,
    name: 'Rafael Lima',
    role: 'Dono',
    business: 'Salão Premium (3 unidades)',
    avatar: '👨‍💼',
    rating: 5,
    text: 'Gerencio 3 salões e 15 profissionais pelo Glamo. Tenho visão completa de tudo em tempo real. O dashboard de analytics me ajuda a tomar decisões estratégicas baseadas em dados reais.',
    results: [
      { metric: 'Unidades gerenciadas', value: '3' },
      { metric: 'Profissionais', value: '15' },
      { metric: 'ROI', value: '340%' }
    ]
  },
  {
    id: 5,
    name: 'Patrícia Oliveira',
    role: 'Manicure',
    business: 'Nail Art Studio',
    avatar: '💅',
    rating: 5,
    text: 'Trabalho sozinha e o Glamo é como ter uma secretária 24/7. Os lembretes automáticos reduziram minhas faltas em 90%. Agora consigo focar no que amo: fazer unhas incríveis!',
    results: [
      { metric: 'Faltas', value: '-90%' },
      { metric: 'Agendamentos', value: '+200/mês' },
      { metric: 'Avaliações 5★', value: '100%' }
    ]
  },
  {
    id: 6,
    name: 'Fernando Souza',
    role: 'Proprietário',
    business: 'Spa Zen',
    avatar: '🧘‍♂️',
    rating: 5,
    text: 'A integração com pagamentos foi um divisor de águas. Agora recebo pagamentos antecipados e reduzi inadimplência a zero. O Glamo pagou por si mesmo no primeiro mês!',
    results: [
      { metric: 'Inadimplência', value: '0%' },
      { metric: 'Pagamentos online', value: '85%' },
      { metric: 'Ticket médio', value: '+35%' }
    ]
  }
];

interface TestimonialsProps {
  testimonials?: typeof testimonials;
}

export default function Testimonials({ testimonials: testimonialsProp }: TestimonialsProps = {}) {
  const testimonialsData = testimonialsProp || testimonials;
  const [inView, setInView] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const ref = useRef<HTMLElement>(null);

  // Intersection Observer
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

  // Auto-rotate testimonials (pausa ao interagir)
  useEffect(() => {
    if (!inView || isPaused) return;
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonialsData.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [inView, isPaused, testimonialsData.length]);

  return (
    <section
      ref={ref}
      className="relative py-24 bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Fundo animado (sem cortes) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-[28rem] h-[28rem] bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-[28rem] h-[28rem] bg-pink-500 rounded-full blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold mb-4 border border-purple-500/30">
            DEPOIMENTOS
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Histórias de sucesso.
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Resultados reais.
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Mais de 2.500 profissionais transformaram seus negócios com o Glamo
          </p>
        </motion.div>

        {/* Depoimento principal */}
        <motion.div
          key={activeTestimonial}
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto mb-12"
          aria-live="polite"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Esquerda - Texto */}
              <div>
                {/* Rating */}
                <div className="flex gap-1 mb-6" aria-label={`Avaliação ${testimonialsData[activeTestimonial].rating} de 5`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-6 h-6 ${i < testimonialsData[activeTestimonial].rating ? 'text-yellow-400' : 'text-gray-600'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Citação */}
                <blockquote className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8">
                  "{testimonialsData[activeTestimonial].text}"
                </blockquote>

                {/* Autor */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl">
                    {testimonialsData[activeTestimonial].avatar}
                  </div>
                  <div>
                    <div className="font-bold text-lg text-white">
                      {testimonialsData[activeTestimonial].name}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {testimonialsData[activeTestimonial].role} • {testimonialsData[activeTestimonial].business}
                    </div>
                  </div>
                </div>
              </div>

              {/* Direita - Resultados */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Resultados Alcançados
                </h3>
                {testimonialsData[activeTestimonial].results.map((result, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, delay: i * 0.08 }}
                    className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">{result.metric}</span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {result.value}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navegação dos depoimentos */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {testimonialsData.map((testimonial, index) => {
            const isActive = activeTestimonial === index;
            return (
              <button
                key={testimonial.id}
                onClick={() => setActiveTestimonial(index)}
                className={`group relative transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                  isActive ? 'scale-110' : 'scale-100 opacity-60 hover:opacity-100'
                }`}
                aria-label={`Selecionar depoimento de ${testimonial.name}`}
                aria-pressed={isActive}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {testimonial.avatar}
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Métricas adicionais */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          {[
            { value: '4.9/5', label: 'Avaliação média' },
            { value: '98%', label: 'Recomendam' },
            { value: '2.500+', label: 'Clientes ativos' },
            { value: '50K+', label: 'Agendamentos/mês' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center mt-16"
        >
          <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105">
            Junte-se a Eles
          </button>
          <p className="text-sm text-gray-400 mt-4">
            ✨ Comece grátis hoje mesmo
          </p>
        </motion.div>
      </div>
    </section>
  );
}