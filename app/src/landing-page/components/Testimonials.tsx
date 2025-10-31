// components/Testimonials.tsx - REFATORADO COM DESIGN SYSTEM NEON
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
    name: 'Sarah Johnson',
    role: 'Salon Owner',
    business: 'Bella Beauty Studio',
    avatar: '👩‍🦰',
    rating: 5,
    text: 'Amazing tool! Saved me months. This is undeniably the most groundbreaking development platform. It truly revolutionizes the way we approach our projects.',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Barbershop Owner',
    business: 'Modern Cuts',
    avatar: '👨‍🦲',
    rating: 5,
    text: 'This is undeniably the most groundbreaking development platform. The AI features are incredible and help me optimize my schedule perfectly.',
  },
  {
    id: 3,
    name: 'Emma Williams',
    role: 'Spa Director',
    business: 'Zen Wellness',
    avatar: '👩‍⚕️',
    rating: 5,
    text: 'The customer experience is amazing. Our clients love the easy booking system and we saw a 60% increase in online bookings within the first month.',
  },
  {
    id: 4,
    name: 'David Martinez',
    role: 'Clinic Owner',
    business: 'Premium Aesthetic (3 locations)',
    avatar: '👨‍💼',
    rating: 5,
    text: 'Managing multiple locations has never been easier. The centralized dashboard gives me complete visibility and control over all my business operations.',
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
      className="relative py-24 bg-black text-white overflow-hidden"
    >
      {/* Glow Effects de fundo */}
      <GlowEffect position="top-right" size="xl" color="neon" animated />
      <GlowEffect position="bottom-left" size="xl" color="neon" animated />

      <div className="container mx-auto px-4 relative z-10">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <Badge variant="glow" className="mb-6">
            TESTIMONIALS
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Here's what our{' '}
            <GradientText variant="neon" as="span" className="text-4xl md:text-6xl font-bold">
              customer has to says
            </GradientText>
          </h2>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            This is undeniably the most groundbreaking development platform for all testimonials
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
                <div className="text-3xl font-bold text-neon-500 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-zinc-400">{stat.label}</div>
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
      <Card variant="glass-neon" hover glow className="h-full">
        {/* Rating */}
        <div className="flex gap-1 mb-4" aria-label={`Rating ${testimonial.rating} out of 5`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className={`w-5 h-5 ${
                i < testimonial.rating ? 'text-neon-500' : 'text-zinc-700'
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
        <blockquote className="text-zinc-300 leading-relaxed mb-6 text-base">
          "{testimonial.text}"
        </blockquote>

        {/* Author */}
        <div className="flex items-center gap-3 mt-auto">
          <div className="w-12 h-12 bg-gradient-to-br from-neon-500 to-purple-500 rounded-full flex items-center justify-center text-2xl">
            {testimonial.avatar}
          </div>
          <div>
            <div className="font-bold text-white">{testimonial.name}</div>
            <div className="text-sm text-zinc-400">
              {testimonial.role} • {testimonial.business}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
