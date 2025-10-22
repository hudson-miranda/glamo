import { motion } from 'framer-motion';
import { Calendar, CheckCircle, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';

const steps = [
  {
    icon: Calendar,
    title: 'Cliente agenda serviço',
    description: 'Agendamento online simples e rápido, com confirmação automática',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: CheckCircle,
    title: 'Profissional confirma',
    description: 'Notificações em tempo real para a equipe gerenciar a agenda',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: DollarSign,
    title: 'Sistema registra e calcula',
    description: 'Comissões automáticas e controle de pagamentos inteligente',
    color: 'from-[#F5C542] to-yellow-500',
  },
  {
    icon: TrendingUp,
    title: 'Financeiro consolida',
    description: 'Relatórios automáticos e insights em tempo real do seu negócio',
    color: 'from-green-500 to-emerald-500',
  },
];

export default function HowItWorks() {
  return (
    <div className='py-24 sm:py-32' id='como-funciona'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='mx-auto max-w-2xl text-center mb-16'
        >
          <h2 className='text-base font-semibold leading-7 text-[#F5C542]'>Como Funciona</h2>
          <p className='mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl'>
            Simples, rápido e eficiente
          </p>
          <p className='mt-6 text-lg leading-8 text-muted-foreground'>
            Entenda como o Glamo automatiza seu salão em 4 passos simples
          </p>
        </motion.div>

        <div className='relative'>
          {/* Connection line */}
          <div className='hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2' />

          <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className='relative'
              >
                <Card className='relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group'>
                  <CardContent className='p-6'>
                    {/* Step number */}
                    <div className='absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary'>
                      {index + 1}
                    </div>

                    {/* Icon */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${step.color} mb-4`}
                    >
                      <step.icon className='h-6 w-6 text-white' />
                    </motion.div>

                    {/* Content */}
                    <h3 className='text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors'>
                      {step.title}
                    </h3>
                    <p className='text-sm text-muted-foreground leading-relaxed'>{step.description}</p>
                  </CardContent>

                  {/* Hover glow effect */}
                  <div className='absolute inset-0 bg-gradient-to-r from-[#F5C542]/0 via-[#F5C542]/5 to-[#F5C542]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none' />
                </Card>

                {/* Animated arrow for desktop */}
                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                    className='hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 z-10'
                  >
                    <div className='text-primary'>→</div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className='mt-16 text-center'
        >
          <p className='text-lg text-muted-foreground mb-4'>
            Veja na prática como funciona
          </p>
          <motion.a
            href='#demo'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#F5C542] to-yellow-500 text-black font-semibold hover:shadow-lg transition-all duration-300'
          >
            Solicitar Demonstração
            <span>→</span>
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
}
