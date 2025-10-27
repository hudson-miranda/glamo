// app/src/landing-page/components/SectionTransition.tsx - PADRONIZADO E OTIMIZADO
import { ReactNode } from 'react';

type ColorKey = 'black' | 'navy' | 'gray';
type VariantKey = 'default' | 'with-blur-top' | 'with-blur-bottom' | 'with-blur-both';
type DividerKey = 'none' | 'top' | 'bottom' | 'both';

interface SectionTransitionProps {
  children: ReactNode;
  fromColor: ColorKey;
  toColor: ColorKey;
  variant?: VariantKey;
  className?: string;
  // Opcional: adiciona um glow sutil no topo/base para unir seções
  divider?: DividerKey;
}

const gradientMap: Record<string, string> = {
  // Mantendo via-gray-900 para suavidade entre blocos
  'black-to-navy': 'bg-gradient-to-b from-black via-gray-900 to-blue-950',
  'navy-to-black': 'bg-gradient-to-b from-blue-950 via-gray-900 to-black',
  'black-to-gray': 'bg-gradient-to-b from-black via-gray-900 to-gray-900',
  'gray-to-black': 'bg-gradient-to-b from-gray-900 via-gray-900 to-black',
  'navy-to-navy': 'bg-gradient-to-b from-blue-950 via-blue-950 to-blue-950',
  'black-to-black': 'bg-gradient-to-b from-black via-black to-black',
  'gray-to-navy': 'bg-gradient-to-b from-gray-900 via-gray-900 to-blue-950',
  'navy-to-gray': 'bg-gradient-to-b from-blue-950 via-gray-900 to-gray-900',
  'gray-to-gray': 'bg-gradient-to-b from-gray-900 via-gray-900 to-gray-900',
};

export default function SectionTransition({
  children,
  fromColor,
  toColor,
  variant = 'default',
  className = '',
  divider = 'none',
}: SectionTransitionProps) {
  const gradientKey = `${fromColor}-to-${toColor}`;
  const gradientClass = gradientMap[gradientKey] || 'bg-gradient-to-b from-gray-900 via-gray-900 to-black';

  return (
    <section className={`${gradientClass} relative overflow-hidden ${className}`}>
      {/* Separadores (glow sutil para unir seções vizinhas) */}
      {(divider === 'top' || divider === 'both') && (
        <div className="pointer-events-none absolute inset-x-0 -top-12 h-24 bg-gradient-to-b from-purple-500/10 to-transparent blur-2xl" />
      )}
      {(divider === 'bottom' || divider === 'both') && (
        <div className="pointer-events-none absolute inset-x-0 -bottom-12 h-24 bg-gradient-to-t from-purple-500/10 to-transparent blur-2xl" />
      )}

      {/* Decorações com blur - contidas dentro da seção, responsivas */}
      {(variant === 'with-blur-top' || variant === 'with-blur-both') && (
        <div className="absolute top-0 left-0 right-0 h-96 pointer-events-none">
          <div className="absolute top-6 left-[12%] w-[18rem] h-[18rem] md:w-[24rem] md:h-[24rem] lg:w-[28rem] lg:h-[28rem] bg-purple-500 rounded-full blur-[100px] md:blur-[120px] opacity-20 animate-pulse-slow" />
          <div className="absolute top-10 right-[12%] w-[16rem] h-[16rem] md:w-[22rem] md:h-[22rem] lg:w-[26rem] lg:h-[26rem] bg-pink-500 rounded-full blur-[100px] md:blur-[120px] opacity-20 animate-pulse-slow" />
        </div>
      )}

      {(variant === 'with-blur-bottom' || variant === 'with-blur-both') && (
        <div className="absolute bottom-0 left-0 right-0 h-96 pointer-events-none">
          <div className="absolute bottom-10 left-[18%] w-[16rem] h-[16rem] md:w-[22rem] md:h-[22rem] lg:w-[26rem] lg:h-[26rem] bg-purple-500 rounded-full blur-[100px] md:blur-[120px] opacity-20 animate-pulse-slow" />
          <div className="absolute bottom-6 right-[18%] w-[18rem] h-[18rem] md:w-[24rem] md:h-[24rem] lg:w-[28rem] lg:h-[28rem] bg-pink-500 rounded-full blur-[100px] md:blur-[120px] opacity-20 animate-pulse-slow" />
        </div>
      )}

      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
}