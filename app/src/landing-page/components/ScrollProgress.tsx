// components/ScrollProgress.tsx - PADRONIZADO E OTIMIZADO
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

type VariantKey = 'default' | 'glow' | 'backdrop';

interface ScrollProgressProps {
  variant?: VariantKey;
  height?: number; // em pixels
  className?: string;
}

export default function ScrollProgress({ 
  variant = 'default', 
  height = 3,
  className = '' 
}: ScrollProgressProps = {}) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Para aria-valuenow (0-100)
  const [progress, setProgress] = useState(0);
  const progressPercent = useTransform(scrollYProgress, (v) => Math.round(v * 100));

  useEffect(() => {
    const unsubscribe = progressPercent.on('change', (latest) => setProgress(latest));
    return () => unsubscribe();
  }, [progressPercent]);

  const baseClasses = `fixed top-0 left-0 right-0 origin-left z-50 ${className}`;
  const gradientClasses = 'bg-gradient-to-r from-brand-500 via-brand-500 to-brand-600';

  return (
    <>
      {/* Backdrop blur opcional (para melhor contraste sobre conteúdo claro) */}
      {variant === 'backdrop' && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200/20 dark:bg-black/20 backdrop-blur-sm z-50" />
      )}

      <motion.div
        role="progressbar"
        aria-label="Progresso de leitura da página"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`${baseClasses} ${gradientClasses}`}
        style={{ 
          scaleX,
          height: `${height}px`,
          ...(variant === 'glow' && {
            boxShadow: '0 0 12px rgba(168, 85, 247, 0.6), 0 0 24px rgba(236, 72, 153, 0.4)',
          }),
        }}
      />
    </>
  );
}
