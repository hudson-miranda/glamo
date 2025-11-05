import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'wasp/client/auth';
import { getPendingInvites } from 'wasp/client/operations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Scissors, Users, ArrowRight, Building2 } from 'lucide-react';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { data: user } = useAuth();

  useEffect(() => {
    // If user already has active salon, redirect to dashboard
    if (user?.activeSalonId) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleCreateSalon = () => {
    navigate('/onboarding/create-salon');
  };

  const handleWaitForInvite = () => {
    navigate('/onboarding/waiting-invite');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-brand-50/30 to-white dark:from-black dark:via-brand-950/20 dark:to-black flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-lg shadow-brand-500/50">
              <Scissors className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent mb-4">
            Bem-vindo ao Glamo! 🎉
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Para começar a usar o sistema, escolha uma das opções abaixo
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Create Salon Option */}
          <Card className="group hover:shadow-xl hover:shadow-brand-500/10 dark:hover:shadow-brand-500/5 transition-all duration-300 border-2 hover:border-brand-400 cursor-pointer">
            <CardHeader className="space-y-1 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/50 dark:to-brand-800/50 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform">
                  <Building2 className="h-6 w-6" />
                </div>
                <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-xs font-medium text-green-800 dark:text-green-400">
                  ⚡ Trial 14 dias
                </span>
              </div>
              <CardTitle className="text-2xl mt-4">
                Criar Meu Negócio
              </CardTitle>
              <CardDescription className="text-base">
                Comece agora mesmo e crie seu salão com acesso ao plano <strong>Profissional</strong> grátis por 14 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5 text-brand-500">✓</span>
                  <span>Agendamentos ilimitados</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5 text-brand-500">✓</span>
                  <span>Até 5 profissionais</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5 text-brand-500">✓</span>
                  <span>Gestão completa de estoque</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5 text-brand-500">✓</span>
                  <span>Relatórios avançados e comissões</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5 text-brand-500">✓</span>
                  <span>Integração WhatsApp</span>
                </li>
              </ul>

              <Button
                onClick={handleCreateSalon}
                className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-lg shadow-brand-500/50 group-hover:shadow-xl group-hover:shadow-brand-500/50 transition-all"
                size="lg"
              >
                Começar Agora
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Wait for Invite Option */}
          <Card className="group hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/5 transition-all duration-300 border-2 hover:border-purple-400">
            <CardHeader className="space-y-1 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl mt-4">
                Aguardar Convite
              </CardTitle>
              <CardDescription className="text-base">
                Você foi convidado para trabalhar em um salão? Aguarde ou aceite convites pendentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5 text-purple-500">✓</span>
                  <span>Receba convites de proprietários</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5 text-purple-500">✓</span>
                  <span>Aceite ou recuse convites</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5 text-purple-500">✓</span>
                  <span>Trabalhe em múltiplos salões</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5 text-purple-500">✓</span>
                  <span>Gerencie suas permissões</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5 text-purple-500">✓</span>
                  <span>Visualize convites pendentes</span>
                </li>
              </ul>

              <Button
                onClick={handleWaitForInvite}
                variant="outline"
                className="w-full border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:border-purple-400 dark:hover:border-purple-600 group"
                size="lg"
              >
                Ver Convites
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Precisa de ajuda?{' '}
            <a
              href="mailto:suporte@glamo.com.br"
              className="text-brand-500 hover:text-brand-600 underline underline-offset-4"
            >
              Entre em contato com nosso suporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
