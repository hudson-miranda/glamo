// app/src/landing-page/components/Announcement.tsx - PADRONIZADO (Graphite + Soft Purple)
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
      className="
        relative w-full
        flex items-center justify-center gap-3 p-3
        text-primary-foreground text-center
        bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600
        shadow-glow-sm
      "
    >
      {/* CTA desktop */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="
          hidden lg:block cursor-pointer font-semibold tracking-wide
          hover:opacity-90 hover:drop-shadow transition-opacity
          focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-md
        "
      >
        {desktopCtaText}
      </a>

      {/* Divisor */}
      <div
        className="hidden lg:block self-stretch w-0.5 bg-primary-foreground/25"
        aria-hidden="true"
      />

      {/* Badge desktop */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="
          hidden lg:inline-flex cursor-pointer rounded-full
          bg-white/15 px-2.5 py-1 text-xs tracking-wider
          hover:bg-white/20 transition-colors
          focus:outline-none focus:ring-2 focus:ring-primary/40
        "
      >
        {desktopBadgeText}
      </a>

      {/* Badge/CTA mobile */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="
          lg:hidden cursor-pointer rounded-full
          bg-white/15 px-2.5 py-1 text-xs
          hover:bg-white/20 transition-colors
          focus:outline-none focus:ring-2 focus:ring-primary/40
        "
      >
        {mobileText}
      </a>
    </div>
  );
}