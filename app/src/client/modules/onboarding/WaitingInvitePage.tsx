import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'wasp/client/auth';
import { getPendingInvites, acceptSalonInvite, rejectSalonInvite } from 'wasp/client/operations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Scissors, Mail, Check, X, Clock, Building2, AlertCircle } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

type PendingInvite = {
  id: string;
  salonName: string;
  roleName: string;
  inviterName: string | null;
  createdAt: Date;
  expiresAt: Date;
};

export default function WaitingInvitePage() {
  const navigate = useNavigate();
  const { data: user } = useAuth();
  const { toast } = useToast();
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingInviteId, setProcessingInviteId] = useState<string | null>(null);

  useEffect(() => {
    loadInvites();
  }, []);

  const loadInvites = async () => {
    try {
      const data = await getPendingInvites();
      setInvites(data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao carregar convites',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (inviteId: string) => {
    setProcessingInviteId(inviteId);
    try {
      await acceptSalonInvite({ inviteId });
      toast({
        title: 'Convite aceito! 🎉',
        description: 'Você agora faz parte do salão',
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao aceitar convite',
      });
    } finally {
      setProcessingInviteId(null);
    }
  };

  const handleReject = async (inviteId: string) => {
    setProcessingInviteId(inviteId);
    try {
      await rejectSalonInvite({ inviteId });
      toast({
        title: 'Convite recusado',
        description: 'O convite foi recusado',
      });
      await loadInvites();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao recusar convite',
      });
    } finally {
      setProcessingInviteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-white dark:from-black dark:via-purple-950/20 dark:to-black p-4">
      <div className="max-w-4xl mx-auto py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg shadow-purple-500/50">
              <Mail className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Convites Pendentes
          </h1>
          <p className="text-lg text-muted-foreground">
            Você tem {invites.length} {invites.length === 1 ? 'convite pendente' : 'convites pendentes'}
          </p>
        </div>

        {/* Invites List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando convites...</p>
          </div>
        ) : invites.length === 0 ? (
          <Card className="border-2">
            <CardContent className="py-12">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Nenhum convite pendente</h3>
                <p className="text-muted-foreground mb-6">
                  Quando você receber convites de proprietários de salões, eles aparecerão aqui.
                </p>
                <Button
                  onClick={() => navigate('/onboarding/create-salon')}
                  className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white"
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Ou crie seu próprio salão
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {invites.map((invite) => (
              <Card key={invite.id} className="border-2 hover:border-purple-400 dark:hover:border-purple-600 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{invite.salonName}</CardTitle>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center">
                          <span className="font-medium">Função:</span>
                          <span className="ml-2 inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/30 px-3 py-1 text-xs font-medium text-purple-800 dark:text-purple-400 capitalize">
                            {invite.roleName}
                          </span>
                        </div>
                        {invite.inviterName && (
                          <div className="text-sm">
                            Convidado por: <strong>{invite.inviterName}</strong>
                          </div>
                        )}
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          Expira em {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleAccept(invite.id)}
                      disabled={processingInviteId === invite.id}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                    >
                      {processingInviteId === invite.id ? (
                        <>Processando...</>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Aceitar Convite
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleReject(invite.id)}
                      disabled={processingInviteId === invite.id}
                      variant="outline"
                      className="flex-1 border-2 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-400 dark:hover:border-red-600"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Recusar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Salon Option */}
        {invites.length > 0 && (
          <div className="mt-8">
            <Alert className="border-2 border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-950/20">
              <Building2 className="h-4 w-4 text-brand-500" />
              <AlertDescription className="ml-2">
                <strong>Ou crie seu próprio negócio:</strong> Comece com 14 dias grátis do plano Profissional.{' '}
                <Button
                  onClick={() => navigate('/onboarding/create-salon')}
                  variant="link"
                  className="p-0 h-auto text-brand-600 dark:text-brand-400 font-semibold"
                >
                  Criar agora →
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => navigate('/onboarding')}
            variant="ghost"
            className="text-muted-foreground"
          >
            ← Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}
