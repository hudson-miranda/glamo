import { motion } from 'framer-motion';
import { BarChart3, Brain, Clock, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

const differentials = [
  {
    icon: Brain,
    title: 'Sistema Inteligente de Gestão',
    description: 'IA que aprende com seu negócio e sugere melhorias automaticamente',
    features: ['Previsão de demanda', 'Alertas inteligentes', 'Sugestões personalizadas'],
  },
  {
    icon: BarChart3,
    title: 'Análises e Relatórios Automáticos',
    description: 'Insights em tempo real sobre seu negócio sem esforço manual',
    features: ['Dashboards interativos', 'Relatórios customizados', 'Métricas em tempo real'],
  },
  {
    icon: Clock,
    title: 'Controle Total em Tempo Real',
    description: 'Acompanhe caixa, estoque e equipe de qualquer lugar',
    features: ['Sincronização instantânea', 'Multi-dispositivo', 'Notificações push'],
  },
  {
    icon: Sparkles,
    title: 'Experiência Visual Premium',
    description: 'Interface moderna e intuitiva que sua equipe vai adorar usar',
    features: ['Design minimalista', 'Mobile-first', 'Acessibilidade total'],
  },
];

export default function WhyDifferent() {
  return (
    <div className='py-24 sm:py-32 bg-muted/30' id='diferenciais'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='mx-auto max-w-2xl text-center mb-16'
        >
          <h2 className='text-base font-semibold leading-7 text-[#F5C542]'>Diferenciais</h2>
          <p className='mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl'>
            Por que o Glamo é diferente
          </p>
          <p className='mt-6 text-lg leading-8 text-muted-foreground'>
            Não é apenas mais um software de gestão. É a evolução que seu salão merece.
          </p>
        </motion.div>

        <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
          {differentials.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className='h-full border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl group overflow-hidden relative'>
                <CardContent className='p-8'>
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className='inline-flex p-4 rounded-xl bg-gradient-to-br from-[#F5C542] to-yellow-500 mb-6 shadow-lg'
                  >
                    <item.icon className='h-8 w-8 text-white' />
                  </motion.div>

                  {/* Content */}
                  <CardTitle className='text-xl mb-3 group-hover:text-primary transition-colors'>
                    {item.title}
                  </CardTitle>
                  <CardDescription className='text-base mb-6 leading-relaxed'>
                    {item.description}
                  </CardDescription>

                  {/* Features list */}
                  <ul className='space-y-3'>
                    {item.features.map((feature, idx) => (
                      <motion.li
                        key={feature}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: index * 0.1 + idx * 0.05 }}
                        className='flex items-center gap-3 text-sm text-muted-foreground'
                      >
                        <div className='flex-shrink-0 w-5 h-5 rounded-full bg-[#F5C542]/20 flex items-center justify-center'>
                          <span className='text-[#F5C542] text-xs'>✓</span>
                        </div>
                        {feature}
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>

                {/* Animated background gradient */}
                <motion.div
                  className='absolute inset-0 bg-gradient-to-br from-[#F5C542]/0 via-[#F5C542]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none'
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                />
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className='mt-16 text-center'
        >
          <Card className='max-w-3xl mx-auto border-2 border-primary/30 bg-gradient-to-br from-card to-primary/5'>
            <CardContent className='p-8 md:p-12'>
              <h3 className='text-2xl font-bold text-foreground mb-4'>
                Pronto para transformar seu salão?
              </h3>
              <p className='text-muted-foreground mb-8 text-lg'>
                Comece gratuitamente e veja a diferença que o Glamo pode fazer
              </p>
              <Button
                size='lg'
                className='bg-gradient-to-r from-[#F5C542] to-yellow-500 hover:from-yellow-500 hover:to-[#F5C542] text-black font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl'
              >
                Experimente agora gratuitamente
                <span className='ml-2'>→</span>
              </Button>
              <p className='text-sm text-muted-foreground mt-4'>
                Sem cartão de crédito • 14 dias grátis • Cancele quando quiser
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
