/**
 * Trial Expired Modal - Blocking modal when trial expires
 * Forces user to choose a plan to continue using the system
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Sparkles, Check, Crown, Building2 } from 'lucide-react';

interface TrialExpiredModalProps {
  isOpen: boolean;
  userName: string;
}

const plans = [
  {
    id: 'essencial',
    name: 'Essencial',
    price: 'R$ 19,90',
    period: '/mês',
    icon: Sparkles,
    features: [
      '1 negócio',
      '1 profissional',
      '150 agendamentos/mês',
      '5GB de armazenamento',
      'Suporte por email',
    ],
    recommended: false,
  },
  {
    id: 'profissional',
    name: 'Profissional',
    price: 'R$ 49,90',
    period: '/mês',
    icon: Crown,
    features: [
      '2 salões',
      '5 profissionais',
      'Agendamentos ilimitados',
      '50GB de armazenamento',
      'Suporte prioritário',
      'Relatórios personalizados',
    ],
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Sob consulta',
    period: '',
    icon: Building2,
    features: [
      'Salões ilimitados',
      'Profissionais ilimitados',
      'Agendamentos ilimitados',
      '500GB de armazenamento',
      'Suporte 24/7',
      'Treinamento dedicado',
      'API personalizada',
    ],
    recommended: false,
  },
];

export default function TrialExpiredModal({ isOpen, userName }: TrialExpiredModalProps) {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>('profissional');

  const handleSelectPlan = () => {
    // Redirect to pricing/checkout page
    navigate(`/pricing?plan=${selectedPlan}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal>
      <DialogContent
        className="max-w-5xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-400 to-brand-600 blur-xl opacity-50"></div>
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                <span className="text-4xl">⏰</span>
              </div>
            </div>
          </div>

          <DialogTitle className="text-3xl text-center">Seu trial expirou</DialogTitle>
          <DialogDescription className="text-center text-lg">
            Olá <strong>{userName}</strong>! Escolha um plano para continuar aproveitando todos os
            benefícios do Glamo.
          </DialogDescription>
        </DialogHeader>

        {/* Reassurance Message */}
        <div className="my-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900 text-center">
            <strong>✓ Seus dados estão seguros</strong>
            <br />
            Todas as suas informações serão restauradas assim que você assinar um plano.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative cursor-pointer transition-all ${
                  isSelected
                    ? 'ring-2 ring-brand-500 shadow-lg'
                    : 'hover:shadow-md hover:border-brand-300'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-brand-400 to-brand-600 text-white">
                      ⭐ RECOMENDADO
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-2">
                    <div
                      className={`p-3 rounded-full ${
                        plan.recommended
                          ? 'bg-gradient-to-br from-brand-400 to-brand-600'
                          : 'bg-gray-100'
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 ${plan.recommended ? 'text-white' : 'text-gray-600'}`}
                      />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && <span className="text-gray-600">{plan.period}</span>}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full mt-4 ${
                      isSelected
                        ? 'bg-gradient-to-r from-brand-400 to-brand-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {isSelected ? 'Selecionado' : 'Selecionar'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            className="bg-gradient-to-r from-brand-400 to-brand-600 text-white hover:opacity-90 px-8"
            onClick={handleSelectPlan}
          >
            Continuar com {plans.find((p) => p.id === selectedPlan)?.name}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
