import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  href?: string;
}

export default function FAQ({ faqs }: { faqs: FAQ[] }) {
  return (
    <div className='py-24 sm:py-32 mx-auto max-w-4xl px-6 lg:max-w-7xl lg:px-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className='mx-auto max-w-2xl text-center mb-16'
      >
        <h2 className='text-base font-semibold leading-7 text-[#F5C542]'>FAQ</h2>
        <p className='mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl'>
          Perguntas Frequentes
        </p>
        <p className='mt-6 text-lg leading-8 text-muted-foreground'>
          Tire suas dúvidas sobre o Glamo
        </p>
      </motion.div>

      <Accordion type='single' collapsible className='w-full space-y-4 max-w-3xl mx-auto'>
        {faqs.map((faq, index) => (
          <motion.div
            key={faq.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <AccordionItem
              value={`faq-${faq.id}`}
              className='border-2 border-border rounded-lg px-6 py-2 hover:bg-muted/20 hover:border-primary/30 transition-all duration-200'
            >
              <AccordionTrigger className='text-left text-base font-semibold leading-7 text-foreground hover:text-primary transition-colors duration-200'>
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className='text-muted-foreground'>
                <div className='flex flex-col items-start justify-between gap-4'>
                  <p className='text-base leading-7 text-muted-foreground flex-1'>{faq.answer}</p>
                  {faq.href && (
                    <a
                      href={faq.href}
                      className='text-base leading-7 text-primary hover:text-primary/80 transition-colors duration-200 font-medium whitespace-nowrap flex-shrink-0'
                    >
                      Saiba mais →
                    </a>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </div>
  );
}
