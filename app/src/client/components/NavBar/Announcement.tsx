const ANNOUNCEMENT_URL = 'http://localhost:3000/signup';

export function Announcement() {
  return (
    <div className='relative flex justify-center items-center gap-3 p-3 w-full bg-gradient-to-r from-accent to-secondary font-semibold text-primary-foreground text-center'>
      <a
        href={ANNOUNCEMENT_URL}
        target='_blank'
        rel='noopener noreferrer'
        className='hidden lg:block cursor-pointer hover:opacity-90 hover:drop-shadow transition-opacity'
      >
        Começe Agora!
      </a>
      <div className='hidden lg:block self-stretch w-0.5 bg-primary-foreground/20'></div>
      <a
        href={ANNOUNCEMENT_URL}
        target='_blank'
        rel='noopener noreferrer'
        className='hidden lg:block cursor-pointer rounded-full bg-background/20 px-2.5 py-1 text-xs hover:bg-background/30 transition-colors tracking-wider'
      >
        14 Dias Grátis ⭐️ →
      </a>
      <a
        href={ANNOUNCEMENT_URL}
        target='_blank'
        rel='noopener noreferrer'
        className='lg:hidden cursor-pointer rounded-full bg-background/20 px-2.5 py-1 text-xs hover:bg-background/30 transition-colors'
      >
        ⭐️ Começe Agora com 14 Dias Grátis! ⭐️
      </a>
    </div>
  );
}
