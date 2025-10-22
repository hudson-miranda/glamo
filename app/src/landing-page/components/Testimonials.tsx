import { motion } from 'framer-motion';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '../../components/ui/card';

interface Testimonial {
  name: string;
  role: string;
  avatarSrc: string;
  socialUrl: string;
  quote: string;
}

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldShowExpand = testimonials.length > 5;
  const mobileItemsToShow = 3;
  const itemsToShow = shouldShowExpand && !isExpanded ? mobileItemsToShow : testimonials.length;

  return (
    <div className='py-24 sm:py-32 mx-auto max-w-7xl px-6 lg:px-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className='mx-auto max-w-2xl text-center mb-16'
      >
        <h2 className='text-base font-semibold leading-7 text-[#F5C542]'>Depoimentos</h2>
        <p className='mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl'>
          O que nossos clientes dizem
        </p>
        <p className='mt-6 text-lg leading-8 text-muted-foreground'>
          Histórias reais de profissionais que transformaram seus negócios com o Glamo
        </p>
      </motion.div>

      <div className='relative w-full z-10 columns-1 md:columns-2 lg:columns-3 gap-6'>
        {testimonials.slice(0, itemsToShow).map((testimonial, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className='break-inside-avoid mb-6'
          >
            <Card className='flex flex-col justify-between border-2 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group'>
              <CardContent className='p-6'>
                <div className='text-[#F5C542] text-3xl mb-4'>"</div>
                <blockquote className='leading-6 mb-4'>
                  <p className='text-sm text-muted-foreground leading-relaxed'>{testimonial.quote}</p>
                </blockquote>
              </CardContent>
              <CardFooter className='pt-0 flex flex-col border-t border-border/50 mt-4'>
                <div className='flex items-center gap-x-3 w-full pt-4'>
                  <div className='h-12 w-12 rounded-full bg-gradient-to-br from-[#F5C542] to-yellow-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300'>
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className='min-w-0 flex-1'>
                    <CardTitle className='text-sm font-semibold truncate'>{testimonial.name}</CardTitle>
                    <CardDescription className='text-xs truncate'>{testimonial.role}</CardDescription>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {shouldShowExpand && (
        <div className='flex justify-center mt-8 md:hidden'>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className='px-6 py-3 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors duration-200'
          >
            {isExpanded ? 'Mostrar Menos' : `Mostrar mais ${testimonials.length - mobileItemsToShow}`}
          </button>
        </div>
      )}
    </div>
  );
}
