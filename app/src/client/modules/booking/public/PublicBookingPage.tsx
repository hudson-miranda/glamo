import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'wasp/client/operations';
import { 
  getPublicBookingConfig, 
  getPublicAvailability 
} from 'wasp/client/operations';
import { createPublicBooking } from 'wasp/client/operations';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertCircle,
  Home,
  Phone,
  Mail,
} from 'lucide-react';
import { ServiceSelector } from './ServiceSelector';
import { ProfessionalSelector } from './ProfessionalSelector';
import { DateTimePicker } from './DateTimePicker';
import { ClientInfoForm } from './ClientInfoForm';
import { BookingConfirmation } from './BookingConfirmation';
import { cn } from '../../../../lib/utils';
import { addDays } from 'date-fns';

type BookingStep = 'service' | 'professional' | 'datetime' | 'info' | 'confirmation';

interface TimeSlot {
  startTime: string;
  endTime: string;
  professionalId: string;
  professionalName: string;
}

interface ClientData {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

export default function PublicBookingPage() {
  const { bookingSlug } = useParams();
  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [clientData, setClientData] = useState<ClientData>({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch booking configuration
  const {
    data: bookingConfig,
    isLoading: configLoading,
    error: configError,
  } = useQuery(
    getPublicBookingConfig,
    { bookingSlug: bookingSlug || '' },
    { enabled: !!bookingSlug }
  );

  // Fetch available slots when service, professional, and date are selected
  const {
    data: availabilityData,
    isLoading: availabilityLoading,
    refetch: refetchAvailability,
  } = useQuery(
    getPublicAvailability,
    {
      bookingSlug: bookingSlug || '',
      date: selectedDate.toISOString(),
      serviceId: selectedServiceId || '',
      professionalId: selectedProfessionalId || undefined,
    },
    {
      enabled: !!bookingSlug && !!selectedServiceId && currentStep === 'datetime',
    }
  );

  // Calculate date boundaries
  const minDate = addDays(
    new Date(),
    bookingConfig?.bookingConfig.allowSameDayBooking ? 0 : 1
  );
  const maxDate = addDays(new Date(), bookingConfig?.bookingConfig.maxAdvanceDays || 90);

  // Step navigation helpers
  const steps: BookingStep[] = ['service', 'professional', 'datetime', 'info', 'confirmation'];
  const currentStepIndex = steps.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStep === 'info';
  const isConfirmationStep = currentStep === 'confirmation';

  const canProceed = () => {
    switch (currentStep) {
      case 'service':
        return !!selectedServiceId;
      case 'professional':
        return selectedProfessionalId !== null; // null is valid (any available)
      case 'datetime':
        return !!selectedDateTime && !!selectedSlot;
      case 'info':
        const nameValid = clientData.name.trim() !== '';
        const emailValid = !bookingConfig?.bookingConfig.collectClientEmail || 
          (clientData.email.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email));
        const phoneValid = !bookingConfig?.bookingConfig.collectClientPhone || 
          clientData.phone.replace(/\D/g, '').length >= 10;
        const termsValid = !bookingConfig?.bookingConfig.requireTermsAcceptance || termsAccepted;
        return nameValid && emailValid && phoneValid && termsValid;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && !isLastStep) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    if (!isFirstStep && !isConfirmationStep) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleSubmit = async () => {
    if (!canProceed() || !selectedServiceId || !selectedSlot || !bookingSlug) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Use the selected professional from the slot, or the explicitly selected one
      const professionalId = selectedSlot.professionalId || selectedProfessionalId;
      
      if (!professionalId) {
        throw new Error('Profissional não selecionado');
      }

      const result = await createPublicBooking({
        bookingSlug,
        serviceId: selectedServiceId,
        professionalId,
        startTime: selectedSlot.startTime,
        clientData: {
          name: clientData.name,
          email: clientData.email || undefined,
          phone: clientData.phone || undefined,
          notes: clientData.notes || undefined,
        },
        termsAccepted: termsAccepted || undefined,
      });

      setConfirmationCode(result.confirmationCode);
      setCurrentStep('confirmation');
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.message || 'Erro ao realizar agendamento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
  };

  const handleProfessionalSelect = (professionalId: string | null) => {
    setSelectedProfessionalId(professionalId);
  };

  const handleDateTimeSelect = (date: Date, slot: TimeSlot) => {
    setSelectedDateTime(date);
    setSelectedSlot(slot);
  };

  // Render step content
  const renderStepContent = () => {
    if (!bookingConfig) return null;

    switch (currentStep) {
      case 'service':
        return (
          <ServiceSelector
            services={bookingConfig.services}
            selectedServiceId={selectedServiceId}
            onSelectService={handleServiceSelect}
            showPrices={bookingConfig.bookingConfig.showServicePrices}
          />
        );

      case 'professional':
        return (
          <ProfessionalSelector
            professionals={bookingConfig.professionals}
            selectedProfessionalId={selectedProfessionalId}
            onSelectProfessional={handleProfessionalSelect}
            showPhotos={bookingConfig.bookingConfig.showProfessionalPhotos}
            allowAnyChoice={bookingConfig.bookingConfig.enableProfessionalChoice}
          />
        );

      case 'datetime':
        return (
          <DateTimePicker
            availableSlots={availabilityData?.availableSlots || []}
            selectedDateTime={selectedDateTime}
            onSelectDateTime={handleDateTimeSelect}
            onDateChange={setSelectedDate}
            isLoading={availabilityLoading}
            minDate={minDate}
            maxDate={maxDate}
          />
        );

      case 'info':
        return (
          <ClientInfoForm
            clientData={clientData}
            onClientDataChange={setClientData}
            collectPhone={bookingConfig.bookingConfig.collectClientPhone}
            collectEmail={bookingConfig.bookingConfig.collectClientEmail}
            collectNotes={bookingConfig.bookingConfig.collectClientNotes}
            requireTermsAcceptance={bookingConfig.bookingConfig.requireTermsAcceptance}
            termsText={bookingConfig.bookingConfig.bookingTermsText}
            termsAccepted={termsAccepted}
            onTermsAcceptedChange={setTermsAccepted}
          />
        );

      case 'confirmation':
        const selectedService = bookingConfig.services.find(s => s.id === selectedServiceId);
        const selectedProfessional = selectedSlot
          ? bookingConfig.professionals.find(p => p.id === selectedSlot.professionalId)
          : null;

        return (
          <BookingConfirmation
            serviceName={selectedService?.name || ''}
            serviceDuration={selectedService?.duration || 0}
            servicePrice={selectedService?.price || 0}
            professionalName={selectedProfessional?.name || 'Qualquer Profissional'}
            dateTime={selectedDateTime!}
            clientName={clientData.name}
            clientEmail={clientData.email}
            clientPhone={clientData.phone}
            clientNotes={clientData.notes}
            confirmationCode={confirmationCode}
            salonName={bookingConfig.salon.name}
            salonAddress={
              bookingConfig.salon.address
                ? `${bookingConfig.salon.address}, ${bookingConfig.salon.city || ''}`
                : undefined
            }
            showPrice={bookingConfig.bookingConfig.showServicePrices}
          />
        );

      default:
        return null;
    }
  };

  // Loading state
  if (configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-neon-500 mx-auto" />
          <p className="text-muted-foreground">Carregando página de agendamento...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (configError || !bookingConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full p-8 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold">Página Não Encontrada</h2>
          <p className="text-muted-foreground">
            A página de agendamento que você está tentando acessar não existe ou não está disponível.
          </p>
        </Card>
      </div>
    );
  }

  // Get step title for progress indicator
  const getStepTitle = (step: BookingStep) => {
    switch (step) {
      case 'service':
        return 'Serviço';
      case 'professional':
        return 'Profissional';
      case 'datetime':
        return 'Data/Hora';
      case 'info':
        return 'Seus Dados';
      case 'confirmation':
        return 'Confirmação';
    }
  };

  return (
    <div 
      className="min-h-screen bg-background"
      style={{
        background: bookingConfig.bookingConfig.bookingPageTheme === 'dark'
          ? 'hsl(0 0% 3%)'
          : 'hsl(0 0% 98%)',
      }}
    >
      {/* Header */}
      <header className="border-b border-zinc-800 sticky top-0 z-10 backdrop-blur-lg bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {bookingConfig.bookingConfig.bookingPageLogo ? (
                <img
                  src={bookingConfig.bookingConfig.bookingPageLogo}
                  alt={bookingConfig.salon.name}
                  className="h-12 w-auto"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neon-500 to-neon-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-black">
                    {bookingConfig.salon.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold">
                  {bookingConfig.bookingConfig.bookingPageTitle || bookingConfig.salon.name}
                </h1>
                {bookingConfig.bookingConfig.bookingPageDescription && (
                  <p className="text-sm text-muted-foreground">
                    {bookingConfig.bookingConfig.bookingPageDescription}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {bookingConfig.salon.phone && (
                <a
                  href={`tel:${bookingConfig.salon.phone}`}
                  className="text-sm text-muted-foreground hover:text-neon-500 flex items-center gap-1"
                >
                  <Phone className="h-4 w-4" />
                  <span className="hidden sm:inline">{bookingConfig.salon.phone}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Banner */}
      {bookingConfig.bookingConfig.bookingPageBanner && currentStep === 'service' && (
        <div className="relative h-48 md:h-64 overflow-hidden">
          <img
            src={bookingConfig.bookingConfig.bookingPageBanner}
            alt="Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      )}

      {/* Progress Steps */}
      {!isConfirmationStep && (
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-2 max-w-3xl mx-auto">
            {steps.filter(s => s !== 'confirmation').map((step, idx) => {
              const isActive = step === currentStep;
              const isCompleted = idx < currentStepIndex;
              return (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={cn(
                      'flex items-center justify-center w-full',
                      'transition-all duration-200'
                    )}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                          isActive && 'bg-neon-500 text-black shadow-glow-md',
                          isCompleted && 'bg-neon-500/30 text-neon-500',
                          !isActive && !isCompleted && 'bg-zinc-800 text-zinc-500'
                        )}
                      >
                        {idx + 1}
                      </div>
                      <span
                        className={cn(
                          'text-sm font-medium hidden sm:inline',
                          isActive && 'text-neon-500',
                          isCompleted && 'text-zinc-400',
                          !isActive && !isCompleted && 'text-zinc-600'
                        )}
                      >
                        {getStepTitle(step)}
                      </span>
                    </div>
                  </div>
                  {idx < steps.length - 2 && (
                    <div
                      className={cn(
                        'h-0.5 flex-1 mx-2 transition-all',
                        isCompleted ? 'bg-neon-500/30' : 'bg-zinc-800'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Error Message */}
          {error && (
            <Card className="p-4 bg-red-500/5 border-red-500/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-500">Erro ao Agendar</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Step Content */}
          {renderStepContent()}

          {/* Navigation Buttons */}
          {!isConfirmationStep && (
            <div className="flex items-center justify-between gap-4 pt-6 border-t border-zinc-800">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isFirstStep || isSubmitting}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Button>

              {isLastStep ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  className="gap-2 bg-neon-500 text-black hover:bg-neon-600"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Confirmando...
                    </>
                  ) : (
                    <>
                      Confirmar Agendamento
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="gap-2 bg-neon-500 text-black hover:bg-neon-600"
                >
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Confirmation Actions */}
          {isConfirmationStep && (
            <div className="flex justify-center pt-6">
              <Button
                onClick={() => window.location.reload()}
                className="gap-2 bg-neon-500 text-black hover:bg-neon-600"
              >
                <Home className="h-4 w-4" />
                Fazer Novo Agendamento
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {bookingConfig.salon.name}. Todos os direitos reservados.
          </p>
          {bookingConfig.salon.email && (
            <p className="mt-2 flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" />
              <a
                href={`mailto:${bookingConfig.salon.email}`}
                className="hover:text-neon-500 transition-colors"
              >
                {bookingConfig.salon.email}
              </a>
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
