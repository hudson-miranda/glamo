// app/src/landing-page/components/Announcement.tsx - PADRONIZADO
interface AnnouncementProps {
  url?: string;
  desktopCtaText?: string;
  desktopBadgeText?: string;
  mobileText?: string;
}

const DEFAULT_URL = '/signup';

export function Announcement({
  url = DEFAULT_URL,
  desktopCtaText = 'Comece agora!',
  desktopBadgeText = '14 dias grátis ⭐️ →',
  mobileText = '⭐️ Comece agora com 14 dias grátis! ⭐️',
}: AnnouncementProps) {
  return (
    <div
      role="region"
      aria-label="Anúncio"
      className="relative flex justify-center items-center gap-3 p-3 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-primary-foreground text-center"
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden lg:block cursor-pointer font-semibold hover:opacity-90 hover:drop-shadow transition-opacity focus:outline-none focus:ring-2 focus:ring-white/40 rounded-md"
      >
        {desktopCtaText}
      </a>

      <div className="hidden lg:block self-stretch w-0.5 bg-primary-foreground/20" aria-hidden="true" />

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden lg:inline-flex cursor-pointer rounded-full bg-white/20 px-2.5 py-1 text-xs hover:bg-white/25 transition-colors tracking-wider focus:outline-none focus:ring-2 focus:ring-white/40"
      >
        {desktopBadgeText}
      </a>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="lg:hidden cursor-pointer rounded-full bg-white/20 px-2.5 py-1 text-xs hover:bg-white/25 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
      >
        {mobileText}
      </a>
    </div>
  );
}