import { useState } from 'react';
import { useParams, Link } from 'wasp/client/router';
import { useQuery, getClient } from 'wasp/client/operations';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  CreditCard,
  FileText,
  Tag,
  History,
  User,
  Edit,
  Trash2
} from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { formatDate, formatCurrency, formatPhone, formatCPF } from '../../lib/formatters';

export default function ClientDetailPage() {
  const { id } = useParams();
  const { activeSalonId } = useSalonContext();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: client, isLoading, error } = useQuery(
    getClient,
    {
      clientId: id!,
      salonId: activeSalonId || '',
    },
    {
      enabled: !!id && !!activeSalonId,
    }
  );

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-12'>
        <div className='flex flex-col items-center gap-2'>
          <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
          <p className='text-sm text-muted-foreground'>Loading client...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className='flex items-center justify-center p-12'>
        <div className='text-center'>
          <p className='text-lg font-medium text-destructive'>
            {error ? error.message : 'Client not found'}
          </p>
          <Link to='/clients' as any>
            <Button variant='outline' className='mt-4'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Clients
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'VIP': return 'default';
      case 'INACTIVE': return 'secondary';
      case 'BLOCKED': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Link to='/clients' as any>
            <Button variant='ghost' size='icon'>
              <ArrowLeft className='h-4 w-4' />
            </Button>
          </Link>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>{client.name}</h1>
            <p className='text-muted-foreground'>
              Client since {formatDate(client.createdAt)}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline'>
            <Edit className='mr-2 h-4 w-4' />
            Edit
          </Button>
          <Button variant='destructive'>
            <Trash2 className='mr-2 h-4 w-4' />
            Delete
          </Button>
        </div>
      </div>

      {/* Client Header Card */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex items-start gap-6'>
            {/* Profile Photo */}
            {client.profilePhotoUrl ? (
              <img
                src={client.profilePhotoUrl}
                alt={client.name}
                className='h-20 w-20 rounded-full object-cover'
              />
            ) : (
              <div className='flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary'>
                {client.name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Client Info */}
            <div className='flex-1 space-y-4'>
              <div className='flex items-center gap-2'>
                <h2 className='text-2xl font-semibold'>{client.name}</h2>
                <Badge variant={getStatusBadgeVariant(client.status)}>
                  {client.status}
                </Badge>
                {client.clientType !== 'REGULAR' && (
                  <Badge variant='outline'>{client.clientType}</Badge>
                )}
              </div>

              <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                {client.email && (
                  <div className='flex items-center gap-2 text-sm'>
                    <Mail className='h-4 w-4 text-muted-foreground' />
                    <span>{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className='flex items-center gap-2 text-sm'>
                    <Phone className='h-4 w-4 text-muted-foreground' />
                    <span>{formatPhone(client.phone)}</span>
                  </div>
                )}
                {client.cpf && (
                  <div className='flex items-center gap-2 text-sm'>
                    <CreditCard className='h-4 w-4 text-muted-foreground' />
                    <span>{formatCPF(client.cpf)}</span>
                  </div>
                )}
                {client.birthDate && (
                  <div className='flex items-center gap-2 text-sm'>
                    <Calendar className='h-4 w-4 text-muted-foreground' />
                    <span>{formatDate(client.birthDate)}</span>
                  </div>
                )}
                {client.city && client.state && (
                  <div className='flex items-center gap-2 text-sm'>
                    <MapPin className='h-4 w-4 text-muted-foreground' />
                    <span>{client.city}, {client.state}</span>
                  </div>
                )}
                {client.instagramHandle && (
                  <div className='flex items-center gap-2 text-sm'>
                    <span className='text-muted-foreground'>@</span>
                    <span>{client.instagramHandle}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {client.tags && client.tags.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {client.tags.map((tag: any) => (
                    <Badge
                      key={tag.id}
                      variant='outline'
                      style={
                        tag.color
                          ? { borderColor: tag.color, color: tag.color }
                          : undefined
                      }
                    >
                      <Tag className='mr-1 h-3 w-3' />
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className='hidden space-y-4 lg:block'>
              <div className='text-center'>
                <div className='text-3xl font-bold'>{client.totalVisits}</div>
                <div className='text-sm text-muted-foreground'>Total Visits</div>
              </div>
              <div className='text-center'>
                <div className='text-3xl font-bold'>
                  {formatCurrency(client.totalSpent)}
                </div>
                <div className='text-sm text-muted-foreground'>Total Spent</div>
              </div>
              {client.averageTicket > 0 && (
                <div className='text-center'>
                  <div className='text-2xl font-bold'>
                    {formatCurrency(client.averageTicket)}
                  </div>
                  <div className='text-sm text-muted-foreground'>Avg. Ticket</div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='overview'>
            <User className='mr-2 h-4 w-4' />
            Overview
          </TabsTrigger>
          <TabsTrigger value='history'>
            <History className='mr-2 h-4 w-4' />
            History
          </TabsTrigger>
          <TabsTrigger value='notes'>
            <FileText className='mr-2 h-4 w-4' />
            Notes ({client.notes?.length || 0})
          </TabsTrigger>
          <TabsTrigger value='documents'>
            <FileText className='mr-2 h-4 w-4' />
            Documents ({client.documents?.length || 0})
          </TabsTrigger>
          <TabsTrigger value='details'>
            <User className='mr-2 h-4 w-4' />
            Details
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            {/* Recent Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {client.appointments && client.appointments.length > 0 ? (
                  <div className='space-y-4'>
                    {client.appointments.slice(0, 5).map((appointment: any) => (
                      <div
                        key={appointment.id}
                        className='flex items-center justify-between border-b pb-2 last:border-0'
                      >
                        <div>
                          <div className='font-medium'>
                            {formatDate(appointment.startAt)}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            with {appointment.professional.name}
                          </div>
                        </div>
                        <Badge>{appointment.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    No appointments yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Sales */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
              </CardHeader>
              <CardContent>
                {client.sales && client.sales.length > 0 ? (
                  <div className='space-y-4'>
                    {client.sales.slice(0, 5).map((sale: any) => (
                      <div
                        key={sale.id}
                        className='flex items-center justify-between border-b pb-2 last:border-0'
                      >
                        <div>
                          <div className='font-medium'>
                            {formatDate(sale.createdAt)}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            {sale.status}
                          </div>
                        </div>
                        <div className='text-right font-medium'>
                          {formatCurrency(sale.finalTotal)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-sm text-muted-foreground'>No sales yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Client Credits */}
          {client.clientCredits && client.clientCredits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Client Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {client.clientCredits.slice(0, 5).map((credit: any) => (
                    <div
                      key={credit.id}
                      className='flex items-center justify-between border-b pb-2 last:border-0'
                    >
                      <div>
                        <div className='font-medium'>{credit.origin}</div>
                        <div className='text-sm text-muted-foreground'>
                          {formatDate(credit.date)}
                        </div>
                      </div>
                      <div className='text-right font-medium text-green-600'>
                        +{formatCurrency(credit.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value='notes'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>Client Notes</CardTitle>
              <Button size='sm'>
                <FileText className='mr-2 h-4 w-4' />
                Add Note
              </Button>
            </CardHeader>
            <CardContent>
              {client.notes && client.notes.length > 0 ? (
                <div className='space-y-4'>
                  {client.notes.map((note: any) => (
                    <div key={note.id} className='rounded-lg border p-4'>
                      {note.title && (
                        <h4 className='font-medium'>{note.title}</h4>
                      )}
                      <p className='mt-2 text-sm'>{note.content}</p>
                      <div className='mt-3 flex items-center justify-between text-xs text-muted-foreground'>
                        <span>
                          by {note.user.name} • {formatDate(note.createdAt)}
                        </span>
                        <Badge variant='outline'>{note.noteType}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-center text-sm text-muted-foreground'>
                  No notes yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value='documents'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>Documents</CardTitle>
              <Button size='sm'>
                <FileText className='mr-2 h-4 w-4' />
                Upload Document
              </Button>
            </CardHeader>
            <CardContent>
              {client.documents && client.documents.length > 0 ? (
                <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                  {client.documents.map((doc: any) => (
                    <div key={doc.id} className='rounded-lg border p-4'>
                      <div className='mb-2 flex items-center justify-between'>
                        <FileText className='h-8 w-8 text-muted-foreground' />
                        <Badge variant='outline'>{doc.documentType}</Badge>
                      </div>
                      <h4 className='font-medium'>{doc.title}</h4>
                      {doc.description && (
                        <p className='mt-1 text-xs text-muted-foreground'>
                          {doc.description}
                        </p>
                      )}
                      <div className='mt-3 text-xs text-muted-foreground'>
                        {formatDate(doc.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-center text-sm text-muted-foreground'>
                  No documents yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value='history'>
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-center text-sm text-muted-foreground'>
                History timeline coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value='details'>
          <Card>
            <CardHeader>
              <CardTitle>Full Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                {/* Personal Information */}
                <div>
                  <h3 className='mb-3 font-semibold'>Personal Information</h3>
                  <dl className='grid gap-3 sm:grid-cols-2'>
                    <div>
                      <dt className='text-sm font-medium text-muted-foreground'>
                        Full Name
                      </dt>
                      <dd className='mt-1'>{client.name}</dd>
                    </div>
                    {client.email && (
                      <div>
                        <dt className='text-sm font-medium text-muted-foreground'>
                          Email
                        </dt>
                        <dd className='mt-1'>{client.email}</dd>
                      </div>
                    )}
                    {client.phone && (
                      <div>
                        <dt className='text-sm font-medium text-muted-foreground'>
                          Phone
                        </dt>
                        <dd className='mt-1'>{formatPhone(client.phone)}</dd>
                      </div>
                    )}
                    {client.cpf && (
                      <div>
                        <dt className='text-sm font-medium text-muted-foreground'>
                          CPF
                        </dt>
                        <dd className='mt-1'>{formatCPF(client.cpf)}</dd>
                      </div>
                    )}
                    {client.birthDate && (
                      <div>
                        <dt className='text-sm font-medium text-muted-foreground'>
                          Birth Date
                        </dt>
                        <dd className='mt-1'>{formatDate(client.birthDate)}</dd>
                      </div>
                    )}
                    {client.gender && (
                      <div>
                        <dt className='text-sm font-medium text-muted-foreground'>
                          Gender
                        </dt>
                        <dd className='mt-1'>{client.gender}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Address */}
                {client.address && (
                  <div>
                    <h3 className='mb-3 font-semibold'>Address</h3>
                    <p className='text-sm'>
                      {client.address}
                      {client.addressNumber && `, ${client.addressNumber}`}
                      {client.complement && ` - ${client.complement}`}
                      <br />
                      {client.neighborhood && `${client.neighborhood}, `}
                      {client.city} - {client.state}
                      {client.zipCode && ` - CEP: ${client.zipCode}`}
                    </p>
                  </div>
                )}

                {/* Observations */}
                {client.observations && (
                  <div>
                    <h3 className='mb-3 font-semibold'>Observations</h3>
                    <p className='text-sm text-muted-foreground'>
                      {client.observations}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
