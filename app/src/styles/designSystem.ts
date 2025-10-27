// styles/designSystem.ts - NOVO
export const designSystem = {
  colors: {
    gradient: {
      primary: 'from-purple-600 to-pink-600',
      secondary: 'from-purple-400 to-pink-400',
      dark: 'from-gray-900 to-black',
      light: 'from-purple-50 to-white',
    },
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    card: 'bg-white/5 backdrop-blur-sm border-white/10 hover:border-purple-500/50',
  },
  buttons: {
    primary: 'px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105',
    secondary: 'px-8 py-4 bg-white/10 text-white rounded-full font-semibold text-lg border border-white/30 hover:bg-white/20 transition-all duration-300',
  },
  animations: {
    fadeInUp: { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } },
    fadeInScale: { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 } },
  }
};