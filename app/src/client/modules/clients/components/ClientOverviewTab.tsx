import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  CreditCard,
  User,
  Cake,
  Instagram
} from 'lucide-react';
import { formatDate, formatPhone, formatCPF } from '../../../lib/formatters';

interface ClientOverviewTabProps {
  client: any;
}

export default function ClientOverviewTab({ client }: ClientOverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
              <p className="text-base font-medium">{client.name}</p>
            </div>

            {client.email && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <p className="text-base">{client.email}</p>
              </div>
            )}

            {client.phone && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefone
                </label>
                <p className="text-base">{formatPhone(client.phone)}</p>
              </div>
            )}

            {client.cpf && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  CPF
                </label>
                <p className="text-base">{formatCPF(client.cpf)}</p>
              </div>
            )}

            {client.birthDate && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Cake className="h-4 w-4" />
                  Data de Nascimento
                </label>
                <p className="text-base">{formatDate(client.birthDate)}</p>
              </div>
            )}

            {client.gender && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Gênero</label>
                <p className="text-base capitalize">{client.gender.toLowerCase()}</p>
              </div>
            )}

            {client.instagramHandle && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </label>
                <p className="text-base">@{client.instagramHandle}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      {(client.street || client.city || client.state) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {client.street && (
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Rua</label>
                  <p className="text-base">{client.street}</p>
                </div>
              )}

              {client.neighborhood && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Bairro</label>
                  <p className="text-base">{client.neighborhood}</p>
                </div>
              )}

              {client.city && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Cidade</label>
                  <p className="text-base">{client.city}</p>
                </div>
              )}

              {client.state && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Estado</label>
                  <p className="text-base">{client.state}</p>
                </div>
              )}

              {client.zipCode && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">CEP</label>
                  <p className="text-base">{client.zipCode}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Total de Agendamentos</p>
              <p className="text-3xl font-bold mt-2">{client._count?.appointments || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Total Gasto</p>
              <p className="text-3xl font-bold mt-2">
                R$ {(client.totalSpent || 0).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Cliente desde</p>
              <p className="text-lg font-semibold mt-2">
                {formatDate(client.createdAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status and Type */}
      <Card>
        <CardHeader>
          <CardTitle>Status do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Status:</span>
              <Badge variant={
                client.status === 'ACTIVE' ? 'default' :
                client.status === 'VIP' ? 'default' :
                client.status === 'INACTIVE' ? 'secondary' :
                'destructive'
              }>
                {client.status}
              </Badge>
            </div>

            {client.clientType && client.clientType !== 'REGULAR' && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Tipo:</span>
                <Badge variant="outline">{client.clientType}</Badge>
              </div>
            )}

            {client.tags && client.tags.length > 0 && (
              <>
                <span className="text-sm font-medium text-muted-foreground">Tags:</span>
                {client.tags.map((tag: any) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    style={tag.color ? { borderColor: tag.color, color: tag.color } : undefined}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      {client.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações Gerais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
