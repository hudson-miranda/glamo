import { useAuth } from 'wasp/client/auth';
import { Badge } from '../../../../components/ui/badge';
import { Users, Crown, Sparkles } from 'lucide-react';
import { getEffectivePlan, getPlanLimits } from '../../../lib/plans';

interface PlanLimitsBadgeProps {
  currentCount: number;
}

export function PlanLimitsBadge({ currentCount }: PlanLimitsBadgeProps) {
  const { data: user } = useAuth();

  if (!user) return null;

  const effectivePlan = getEffectivePlan({
    subscriptionPlan: user.subscriptionPlan,
    createdAt: user.createdAt,
    datePaid: user.datePaid,
  });

  const limits = getPlanLimits(effectivePlan);
  const isUnlimited = limits.maxProfessionalsPerSalon === Infinity;
  const isNearLimit = !isUnlimited && currentCount >= limits.maxProfessionalsPerSalon * 0.8;
  const isAtLimit = !isUnlimited && currentCount >= limits.maxProfessionalsPerSalon;

  // Trial badge
  const isTrial = effectivePlan === 'profissional' && !user.subscriptionPlan;
  
  return (
    <div className='flex items-center gap-2'>
      {isTrial && (
        <Badge variant='default' className='bg-gradient-to-r from-brand-500 to-brand-600'>
          <Sparkles className='mr-1 h-3 w-3' />
          Trial
        </Badge>
      )}
      
      <Badge
        variant={isAtLimit ? 'destructive' : isNearLimit ? 'secondary' : 'outline'}
        className='flex items-center gap-1.5'
      >
        {isUnlimited ? (
          <>
            <Crown className='h-3.5 w-3.5' />
            <span className='font-medium'>Ilimitado</span>
          </>
        ) : (
          <>
            <Users className='h-3.5 w-3.5' />
            <span className='font-medium'>
              {currentCount}/{limits.maxProfessionalsPerSalon}
            </span>
            <span className='text-xs opacity-70'>funcionários</span>
          </>
        )}
      </Badge>
    </div>
  );
}
