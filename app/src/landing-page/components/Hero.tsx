import { motion } from 'framer-motion';
import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import { Button } from '../../components/ui/button';

export default function Hero() {
  return (
    <div className='relative pt-20 w-full min-h-screen flex items-center'>
      <TopGradient />
      <BottomGradient />
      <div className='w-full'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='lg:mb-18 mx-auto max-w-4xl text-center'
          >
            {/* Logo Animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className='mb-8'
            >
              <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20'>
                <span className='text-2xl'>✨</span>
                <span className='text-sm font-medium text-primary'>Sistema de Gestão Inteligente</span>
              </div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className='text-5xl font-bold text-foreground sm:text-7xl mb-6'
            >
              Transforme seu salão com{' '}
              <span className='bg-gradient-to-r from-[#F5C542] via-yellow-500 to-[#F5C542] bg-clip-text text-transparent'>
                Glamo
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className='mt-6 mx-auto max-w-2xl text-xl leading-8 text-muted-foreground'
            >
              Gestão completa, automação inteligente e controle financeiro em tempo real. 
              Tudo que você precisa para elevar seu negócio a outro nível.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className='mt-10 flex flex-col sm:flex-row items-center justify-center gap-4'
            >
              <Button 
                size='lg' 
                className='w-full sm:w-auto bg-gradient-to-r from-[#F5C542] to-yellow-500 hover:from-yellow-500 hover:to-[#F5C542] text-black font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl'
                asChild
              >
                <WaspRouterLink to={routes.SignupRoute.to}>
                  Comece Agora Grátis <span aria-hidden='true'>→</span>
                </WaspRouterLink>
              </Button>
              <Button 
                size='lg' 
                variant='outline' 
                className='w-full sm:w-auto border-2 hover:bg-muted/20 transition-all duration-300'
                asChild
              >
                <WaspRouterLink to='#demo'>Ver Demonstração</WaspRouterLink>
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className='mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground'
            >
              <div className='flex items-center gap-2'>
                <span className='text-[#F5C542]'>✓</span>
                <span>Sem cartão de crédito</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-[#F5C542]'>✓</span>
                <span>14 dias grátis</span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-[#F5C542]'>✓</span>
                <span>Cancele quando quiser</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Animated Dashboard Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className='mt-20 relative'
          >
            <div className='relative mx-auto max-w-5xl'>
              {/* Glow effect */}
              <div className='absolute inset-0 bg-gradient-to-r from-[#F5C542]/20 via-yellow-500/20 to-[#F5C542]/20 blur-3xl -z-10' />
              
              {/* Dashboard mockup placeholder */}
              <div className='rounded-2xl bg-card border border-border shadow-2xl overflow-hidden'>
                <div className='aspect-video bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center'>
                  <div className='text-center p-8'>
                    <div className='text-6xl mb-4'>💼</div>
                    <p className='text-muted-foreground'>Dashboard do Glamo</p>
                    <p className='text-sm text-muted-foreground mt-2'>Interface intuitiva e moderna</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function TopGradient() {
  return (
    <div
      className='absolute top-0 right-0 -z-10 transform-gpu overflow-hidden w-full blur-3xl sm:top-0'
      aria-hidden='true'
    >
      <div
        className='aspect-[1020/880] w-[70rem] flex-none sm:right-1/4 sm:translate-x-1/2 dark:hidden bg-gradient-to-tr from-amber-400 to-purple-300 opacity-10'
        style={{
          clipPath: 'polygon(80% 20%, 90% 55%, 50% 100%, 70% 30%, 20% 50%, 50% 0)',
        }}
      />
    </div>
  );
}

function BottomGradient() {
  return (
    <div
      className='absolute inset-x-0 top-[calc(100%-40rem)] sm:top-[calc(100%-65rem)] -z-10 transform-gpu overflow-hidden blur-3xl'
      aria-hidden='true'
    >
      <div
        className='relative aspect-[1020/880] sm:-left-3/4 sm:translate-x-1/4 dark:hidden bg-gradient-to-br from-amber-400 to-purple-300 opacity-10 w-[90rem]'
        style={{
          clipPath: 'ellipse(80% 30% at 80% 50%)',
        }}
      />
    </div>
  );
}
