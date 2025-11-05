/**
 * Grace Period Banner - Persistent banner when subscription is in grace period
 * Shows countdown and upgrade CTA
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { X, AlertTriangle } from 'lucide-react';

interface GracePeriodBannerProps {
  daysRemaining: number;
}

export default function GracePeriodBanner({ daysRemaining }: GracePeriodBannerProps) {
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  // Color coding based on urgency
  const urgencyLevel =
    daysRemaining <= 2 ? 'critical' : daysRemaining <= 5 ? 'warning' : 'info';

  const colorClasses = {
    critical: 'bg-red-50 border-red-200 text-red-900',
    warning: 'bg-orange-50 border-orange-200 text-orange-900',
    info: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  };

  const iconColor = {
    critical: 'text-red-600',
    warning: 'text-orange-600',
    info: 'text-yellow-600',
  };

  return (
    <div className="sticky top-0 z-50 w-full">
      <Alert className={`rounded-none border-l-0 border-r-0 border-t-0 ${colorClasses[urgencyLevel]}`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 flex-1">
            <AlertTriangle className={`h-5 w-5 ${iconColor[urgencyLevel]}`} />
            <AlertDescription className="flex-1">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="font-semibold">
                    ⚠️ Período de Carência: {daysRemaining} dia{daysRemaining !== 1 ? 's' : ''}{' '}
                    restante{daysRemaining !== 1 ? 's' : ''}
                  </span>
                  <span className="text-sm">
                    Sua assinatura expirou. Você está em modo somente leitura.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-brand-400 to-brand-600 text-white hover:opacity-90"
                    onClick={handleUpgrade}
                  >
                    Renovar Assinatura
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => setIsDismissed(true)}
                    aria-label="Fechar aviso"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </div>
  );
}
