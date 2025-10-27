// components/Analytics.tsx - NOVO
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface AnalyticsEvent {
  event: string;
  category: string;
  label?: string;
  value?: number;
}

export const trackEvent = ({ event, category, label, value }: AnalyticsEvent) => {
  // Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', event, {
      category,
      label,
      value,
    });
  }

  // Custom analytics
  console.log('Analytics Event:', { event, category, label, value });
};

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    trackEvent({
      event: 'page_view',
      category: 'Navigation',
      label: location.pathname,
    });
  }, [location]);
};

export default function Analytics() {
  usePageTracking();
  return null;
}