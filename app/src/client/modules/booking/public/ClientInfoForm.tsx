
import { useState } from 'react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Checkbox } from '../../../../components/ui/checkbox';
import { User, Mail, Phone, MessageSquare, AlertCircle } from 'lucide-react';

interface ClientData {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

interface ClientInfoFormProps {
  clientData: ClientData;
  onClientDataChange: (data: ClientData) => void;
  collectPhone: boolean;
  collectEmail: boolean;
  collectNotes: boolean;
  requireTermsAcceptance: boolean;
  termsText: string | null;
  termsAccepted: boolean;
  onTermsAcceptedChange: (accepted: boolean) => void;
}

export function ClientInfoForm({
  clientData,
  onClientDataChange,
  collectPhone,
  collectEmail,
  collectNotes,
  requireTermsAcceptance,
  termsText,
  termsAccepted,
  onTermsAcceptedChange,
}: ClientInfoFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof ClientData, value: string) => {
    onClientDataChange({ ...clientData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validatePhone = (phone: string) => {
    // Simple Brazilian phone validation (10 or 11 digits)
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    }
    return cleaned.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  };

  const handleBlur = (field: keyof ClientData) => {
    const newErrors = { ...errors };

    if (field === 'name' && !clientData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (field === 'email' && collectEmail) {
      if (!clientData.email.trim()) {
        newErrors.email = 'Email é obrigatório';
      } else if (!validateEmail(clientData.email)) {
        newErrors.email = 'Email inválido';
      }
    }

    if (field === 'phone' && collectPhone) {
      if (!clientData.phone.trim()) {
        newErrors.phone = 'Telefone é obrigatório';
      } else if (!validatePhone(clientData.phone)) {
        newErrors.phone = 'Telefone inválido';
      }
    }

    setErrors(newErrors);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Seus Dados</h2>
        <p className="text-muted-foreground">
          Preencha seus dados para confirmar o agendamento
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nome Completo *
            </Label>
            <Input
              id="name"
              placeholder="Digite seu nome completo"
              value={clientData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          {collectEmail && (
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={clientData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Você receberá a confirmação do agendamento por email
              </p>
            </div>
          )}

          {/* Phone Field */}
          {collectPhone && (
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefone *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={clientData.phone}
                onChange={(e) => handleChange('phone', formatPhone(e.target.value))}
                onBlur={() => handleBlur('phone')}
                className={errors.phone ? 'border-red-500' : ''}
                maxLength={15}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.phone}
                </p>
              )}
            </div>
          )}

          {/* Notes Field */}
          {collectNotes && (
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Observações (Opcional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Alguma observação ou pedido especial?"
                value={clientData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
              />
            </div>
          )}

          {/* Terms Acceptance */}
          {requireTermsAcceptance && termsText && (
            <div className="space-y-3 p-4 border border-zinc-800 rounded-lg bg-zinc-900/50">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={onTermsAcceptedChange}
                  className="mt-1"
                />
                <div className="space-y-2">
                  <Label
                    htmlFor="terms"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Aceito os termos e condições *
                  </Label>
                  <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto p-3 bg-black/30 rounded border border-zinc-800">
                    {termsText}
                  </div>
                </div>
              </div>
              {requireTermsAcceptance && !termsAccepted && (
                <p className="text-xs text-amber-500 flex items-center gap-1 ml-9">
                  <AlertCircle className="h-3 w-3" />
                  Você precisa aceitar os termos para continuar
                </p>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
