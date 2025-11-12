import { useState, useEffect } from 'react';
import { useQuery } from 'wasp/client/operations';
import { getBookingConfig, updateBookingConfig } from 'wasp/client/operations';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Switch } from '../../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Badge } from '../../../components/ui/badge';
import {
  Globe,
  Settings,
  Palette,
  Clock,
  FileText,
  Save,
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { EmptyState } from '../../../components/ui/empty-state';
import { cn } from '../../../lib/utils';

export default function OnlineBookingSettingsPage() {
  const { activeSalonId } = useSalonContext();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [urlCopied, setUrlCopied] = useState(false);

  // Fetch booking config
  const {
    data: bookingConfig,
    isLoading,
    refetch,
  } = useQuery(
    getBookingConfig,
    { salonId: activeSalonId || '' },
    { enabled: !!activeSalonId }
  );

  // Form state
  const [formData, setFormData] = useState({
    enableOnlineBooking: false,
    bookingSlug: '',
    bookingPageTitle: '',
    bookingPageDescription: '',
    bookingPageLogo: '',
    bookingPageBanner: '',
    bookingPagePrimaryColor: '#00FF94',
    bookingPageTheme: 'dark',
    requireClientRegistration: false,
    collectClientPhone: true,
    collectClientEmail: true,
    collectClientNotes: true,
    showProfessionalPhotos: true,
    showServicePrices: true,
    enableServiceSelection: true,
    enableProfessionalChoice: true,
    sendConfirmationEmail: true,
    sendConfirmationSMS: false,
    autoApproveBookings: true,
    bookingTermsText: '',
    requireTermsAcceptance: false,
    minAdvanceHours: 2,
    maxAdvanceDays: 90,
    allowSameDayBooking: true,
  });

  // Update form data when config loads
  useEffect(() => {
    if (bookingConfig) {
      setFormData({
        enableOnlineBooking: bookingConfig.enableOnlineBooking || false,
        bookingSlug: bookingConfig.bookingSlug || '',
        bookingPageTitle: bookingConfig.bookingPageTitle || '',
        bookingPageDescription: bookingConfig.bookingPageDescription || '',
        bookingPageLogo: bookingConfig.bookingPageLogo || '',
        bookingPageBanner: bookingConfig.bookingPageBanner || '',
        bookingPagePrimaryColor: bookingConfig.bookingPagePrimaryColor || '#00FF94',
        bookingPageTheme: bookingConfig.bookingPageTheme || 'dark',
        requireClientRegistration: bookingConfig.requireClientRegistration || false,
        collectClientPhone: bookingConfig.collectClientPhone ?? true,
        collectClientEmail: bookingConfig.collectClientEmail ?? true,
        collectClientNotes: bookingConfig.collectClientNotes ?? true,
        showProfessionalPhotos: bookingConfig.showProfessionalPhotos ?? true,
        showServicePrices: bookingConfig.showServicePrices ?? true,
        enableServiceSelection: bookingConfig.enableServiceSelection ?? true,
        enableProfessionalChoice: bookingConfig.enableProfessionalChoice ?? true,
        sendConfirmationEmail: bookingConfig.sendConfirmationEmail ?? true,
        sendConfirmationSMS: bookingConfig.sendConfirmationSMS || false,
        autoApproveBookings: bookingConfig.autoApproveBookings ?? true,
        bookingTermsText: bookingConfig.bookingTermsText || '',
        requireTermsAcceptance: bookingConfig.requireTermsAcceptance || false,
        minAdvanceHours: bookingConfig.minAdvanceHours || 2,
        maxAdvanceDays: bookingConfig.maxAdvanceDays || 90,
        allowSameDayBooking: bookingConfig.allowSameDayBooking ?? true,
      });
    }
  }, [bookingConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSalonId) return;

    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      await updateBookingConfig({
        salonId: activeSalonId,
        config: formData,
      });

      setSaveSuccess(true);
      await refetch();
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error saving booking config:', error);
      setSaveError(error.message || 'Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateSlug = () => {
    // Simple slug generator - in production you'd want more sophisticated logic
    const randomStr = Math.random().toString(36).substring(2, 8);
    const slug = `salon-${randomStr}`;
    handleChange('bookingSlug', slug);
  };

  const copyBookingUrl = () => {
    const url = `${window.location.origin}/book/${formData.bookingSlug}`;
    navigator.clipboard.writeText(url);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  const bookingUrl = formData.bookingSlug
    ? `${window.location.origin}/book/${formData.bookingSlug}`
    : '';

  if (!activeSalonId) {
    return (
      <div className="container mx-auto p-6">
        <EmptyState
          icon={AlertCircle}
          title="Nenhum salão selecionado"
          description="Por favor, selecione um salão para configurar o agendamento online."
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-neon-500 mx-auto" />
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamento Online</h1>
          <p className="text-muted-foreground mt-1">
            Configure sua página pública de agendamento 24/7
          </p>
        </div>
        <div className="flex items-center gap-2">
          {formData.enableOnlineBooking ? (
            <Badge variant="default" className="bg-neon-500 text-black">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Ativo
            </Badge>
          ) : (
            <Badge variant="outline">Inativo</Badge>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {saveSuccess && (
        <Card className="p-4 bg-neon-500/5 border-neon-500">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-neon-500" />
            <p className="font-medium text-neon-500">Configurações salvas com sucesso!</p>
          </div>
        </Card>
      )}

      {saveError && (
        <Card className="p-4 bg-red-500/5 border-red-500">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="font-medium text-red-500">{saveError}</p>
          </div>
        </Card>
      )}

      {/* Booking URL Card */}
      {formData.bookingSlug && (
        <Card className="p-6 bg-gradient-to-br from-neon-500/5 to-neon-600/5 border-neon-500/30">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-neon-500" />
              <h3 className="font-semibold text-neon-500">URL de Agendamento Público</h3>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={bookingUrl}
                readOnly
                className="flex-1 bg-black/30 border-neon-500/30"
              />
              <Button
                variant="outline"
                onClick={copyBookingUrl}
                className="gap-2"
              >
                {urlCopied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-neon-500" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copiar
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(bookingUrl, '_blank')}
                disabled={!formData.enableOnlineBooking}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">
              <Settings className="h-4 w-4 mr-2" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="h-4 w-4 mr-2" />
              Aparência
            </TabsTrigger>
            <TabsTrigger value="booking">
              <Clock className="h-4 w-4 mr-2" />
              Agendamento
            </TabsTrigger>
            <TabsTrigger value="terms">
              <FileText className="h-4 w-4 mr-2" />
              Termos
            </TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>
                  Configure as opções básicas do agendamento online
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enable Online Booking */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Ativar Agendamento Online</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir que clientes façam agendamentos pela internet
                    </p>
                  </div>
                  <Switch
                    checked={formData.enableOnlineBooking}
                    onCheckedChange={(checked) =>
                      handleChange('enableOnlineBooking', checked)
                    }
                  />
                </div>

                {/* Booking Slug */}
                <div className="space-y-2">
                  <Label htmlFor="bookingSlug">
                    URL Personalizada (Slug) *
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="bookingSlug"
                      placeholder="meu-salao"
                      value={formData.bookingSlug}
                      onChange={(e) =>
                        handleChange('bookingSlug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                      }
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={generateSlug}>
                      Gerar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Este será parte da URL: {window.location.origin}/book/
                    <span className="text-neon-500">{formData.bookingSlug || 'slug'}</span>
                  </p>
                </div>

                {/* Auto Approve */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Aprovar Automaticamente</Label>
                    <p className="text-sm text-muted-foreground">
                      Confirmar agendamentos automaticamente sem revisão manual
                    </p>
                  </div>
                  <Switch
                    checked={formData.autoApproveBookings}
                    onCheckedChange={(checked) =>
                      handleChange('autoApproveBookings', checked)
                    }
                  />
                </div>

                {/* Notifications */}
                <div className="space-y-4">
                  <h4 className="font-medium">Notificações</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email de Confirmação</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar email quando agendamento for confirmado
                      </p>
                    </div>
                    <Switch
                      checked={formData.sendConfirmationEmail}
                      onCheckedChange={(checked) =>
                        handleChange('sendConfirmationEmail', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS de Confirmação</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar SMS quando agendamento for confirmado
                      </p>
                    </div>
                    <Switch
                      checked={formData.sendConfirmationSMS}
                      onCheckedChange={(checked) =>
                        handleChange('sendConfirmationSMS', checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Aparência da Página</CardTitle>
                <CardDescription>
                  Personalize o visual da sua página de agendamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="bookingPageTitle">Título da Página</Label>
                  <Input
                    id="bookingPageTitle"
                    placeholder="Agende seu horário"
                    value={formData.bookingPageTitle}
                    onChange={(e) => handleChange('bookingPageTitle', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bookingPageDescription">Descrição</Label>
                  <Textarea
                    id="bookingPageDescription"
                    placeholder="Descreva seu salão..."
                    value={formData.bookingPageDescription}
                    onChange={(e) => handleChange('bookingPageDescription', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bookingPageLogo">URL do Logo</Label>
                  <Input
                    id="bookingPageLogo"
                    type="url"
                    placeholder="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Booking.com_Icon_2022.svg/1200px-Booking.com_Icon_2022.svg.png"
                    value={formData.bookingPageLogo}
                    onChange={(e) => handleChange('bookingPageLogo', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bookingPageBanner">URL do Banner</Label>
                  <Input
                    id="bookingPageBanner"
                    type="url"
                    placeholder="https://i.pinimg.com/736x/f2/66/99/f266990403342b02aadb895d396a94d7.jpg"
                    value={formData.bookingPageBanner}
                    onChange={(e) => handleChange('bookingPageBanner', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bookingPagePrimaryColor">Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bookingPagePrimaryColor"
                      type="color"
                      value={formData.bookingPagePrimaryColor}
                      onChange={(e) => handleChange('bookingPagePrimaryColor', e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={formData.bookingPagePrimaryColor}
                      onChange={(e) => handleChange('bookingPagePrimaryColor', e.target.value)}
                      placeholder="#00FF94"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Opções de Exibição</h4>

                  <div className="flex items-center justify-between">
                    <Label>Mostrar Fotos dos Profissionais</Label>
                    <Switch
                      checked={formData.showProfessionalPhotos}
                      onCheckedChange={(checked) =>
                        handleChange('showProfessionalPhotos', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Mostrar Preços dos Serviços</Label>
                    <Switch
                      checked={formData.showServicePrices}
                      onCheckedChange={(checked) =>
                        handleChange('showServicePrices', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Permitir Escolher Profissional</Label>
                    <Switch
                      checked={formData.enableProfessionalChoice}
                      onCheckedChange={(checked) =>
                        handleChange('enableProfessionalChoice', checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Booking Settings Tab */}
          <TabsContent value="booking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Regras de Agendamento</CardTitle>
                <CardDescription>
                  Configure as regras e restrições de agendamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minAdvanceHours">
                      Antecedência Mínima (horas)
                    </Label>
                    <Input
                      id="minAdvanceHours"
                      type="number"
                      min="0"
                      value={formData.minAdvanceHours}
                      onChange={(e) =>
                        handleChange('minAdvanceHours', parseInt(e.target.value))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxAdvanceDays">
                      Antecedência Máxima (dias)
                    </Label>
                    <Input
                      id="maxAdvanceDays"
                      type="number"
                      min="1"
                      value={formData.maxAdvanceDays}
                      onChange={(e) =>
                        handleChange('maxAdvanceDays', parseInt(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Permitir Agendamento no Mesmo Dia</Label>
                    <p className="text-sm text-muted-foreground">
                      Clientes podem agendar para o dia atual
                    </p>
                  </div>
                  <Switch
                    checked={formData.allowSameDayBooking}
                    onCheckedChange={(checked) =>
                      handleChange('allowSameDayBooking', checked)
                    }
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Dados do Cliente</h4>

                  <div className="flex items-center justify-between">
                    <Label>Coletar Email</Label>
                    <Switch
                      checked={formData.collectClientEmail}
                      onCheckedChange={(checked) =>
                        handleChange('collectClientEmail', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Coletar Telefone</Label>
                    <Switch
                      checked={formData.collectClientPhone}
                      onCheckedChange={(checked) =>
                        handleChange('collectClientPhone', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Permitir Observações</Label>
                    <Switch
                      checked={formData.collectClientNotes}
                      onCheckedChange={(checked) =>
                        handleChange('collectClientNotes', checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Terms Tab */}
          <TabsContent value="terms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Termos e Condições</CardTitle>
                <CardDescription>
                  Configure os termos que os clientes devem aceitar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Exigir Aceitação de Termos</Label>
                    <p className="text-sm text-muted-foreground">
                      Clientes devem aceitar os termos antes de agendar
                    </p>
                  </div>
                  <Switch
                    checked={formData.requireTermsAcceptance}
                    onCheckedChange={(checked) =>
                      handleChange('requireTermsAcceptance', checked)
                    }
                  />
                </div>

                {formData.requireTermsAcceptance && (
                  <div className="space-y-2">
                    <Label htmlFor="bookingTermsText">
                      Texto dos Termos e Condições
                    </Label>
                    <Textarea
                      id="bookingTermsText"
                      placeholder="Digite os termos e condições..."
                      value={formData.bookingTermsText}
                      onChange={(e) => handleChange('bookingTermsText', e.target.value)}
                      rows={8}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Estes termos serão exibidos na página de agendamento para aceitação do cliente
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-6">
          <Button
            type="submit"
            disabled={isSaving || !formData.bookingSlug}
            className="gap-2 bg-neon-500 text-black hover:bg-neon-600"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
