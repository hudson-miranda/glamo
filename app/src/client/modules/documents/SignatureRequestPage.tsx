import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, listClients } from 'wasp/client/operations';
import { useSalonContext } from '../../hooks/useSalonContext';
import { formatDate, formatDateTime } from '../../lib/formatters';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import {
  FileSignature,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Download,
  Copy,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  Search,
  Filter,
  Plus,
  Edit3,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

// Signature request status
const SIGNATURE_STATUS = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  SENT: { label: 'Enviado', color: 'bg-blue-100 text-blue-800', icon: Send },
  VIEWED: { label: 'Visualizado', color: 'bg-purple-100 text-purple-800', icon: Eye },
  SIGNED: { label: 'Assinado', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  EXPIRED: { label: 'Expirado', color: 'bg-gray-100 text-gray-800', icon: XCircle },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle },
};

// Signature request interface
interface SignatureRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  documentTitle: string;
  documentType: string;
  message: string;
  status: keyof typeof SIGNATURE_STATUS;
  sentAt: Date | null;
  viewedAt: Date | null;
  signedAt: Date | null;
  expiresAt: Date;
  signatureData: string | null;
  ipAddress: string | null;
  createdAt: Date;
}

export default function SignatureRequestPage() {
  const { activeSalonId } = useSalonContext();
  const navigate = useNavigate();
  
  // Mock signature requests (in production: use queries)
  const [requests, setRequests] = useState<SignatureRequest[]>([
    {
      id: '1',
      clientId: 'c1',
      clientName: 'Maria Silva',
      clientEmail: 'maria@email.com',
      documentTitle: 'Termo de Consentimento - Botox',
      documentType: 'CONSENT',
      message: 'Por favor, assine o termo de consentimento para o procedimento agendado.',
      status: 'SIGNED',
      sentAt: new Date('2024-11-10T10:00:00'),
      viewedAt: new Date('2024-11-10T14:30:00'),
      signedAt: new Date('2024-11-10T15:00:00'),
      expiresAt: new Date('2024-11-17T10:00:00'),
      signatureData: 'data:image/png;base64,...',
      ipAddress: '192.168.1.1',
      createdAt: new Date('2024-11-10T09:45:00'),
    },
    {
      id: '2',
      clientId: 'c2',
      clientName: 'João Santos',
      clientEmail: 'joao@email.com',
      documentTitle: 'Contrato de Serviços Estéticos',
      documentType: 'CONTRACT',
      message: 'Segue contrato de serviços para sua assinatura.',
      status: 'SENT',
      sentAt: new Date('2024-11-12T11:00:00'),
      viewedAt: null,
      signedAt: null,
      expiresAt: new Date('2024-11-19T11:00:00'),
      signatureData: null,
      ipAddress: null,
      createdAt: new Date('2024-11-12T10:45:00'),
    },
    {
      id: '3',
      clientId: 'c3',
      clientName: 'Ana Paula',
      clientEmail: 'ana@email.com',
      documentTitle: 'Anamnese Facial',
      documentType: 'ANAMNESIS',
      message: 'Por favor, preencha e assine a anamnese antes do procedimento.',
      status: 'PENDING',
      sentAt: null,
      viewedAt: null,
      signedAt: null,
      expiresAt: new Date('2024-11-20T10:00:00'),
      signatureData: null,
      ipAddress: null,
      createdAt: new Date('2024-11-13T08:30:00'),
    },
  ]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // New request state
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentType, setDocumentType] = useState('CONSENT');
  const [message, setMessage] = useState('');
  const [expiryDays, setExpiryDays] = useState('7');
  
  // Details dialog
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SignatureRequest | null>(null);
  
  // Signature pad dialog
  const [signaturePadOpen, setSignaturePadOpen] = useState(false);
  const [requestToSign, setRequestToSign] = useState<SignatureRequest | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Queries
  const { data: clients, isLoading: loadingClients } = useQuery(listClients, {
     salonId: activeSalonId || '',
  });
  
  // Filter requests
  const filteredRequests = requests.filter((request) => {
    const matchesSearch = !searchQuery || 
      request.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.documentTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Statistics
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'PENDING').length,
    sent: requests.filter(r => r.status === 'SENT').length,
    signed: requests.filter(r => r.status === 'SIGNED').length,
    signatureRate: requests.length > 0 
      ? Math.round((requests.filter(r => r.status === 'SIGNED').length / requests.length) * 100) 
      : 0,
  };
  
  // Create new request
  const handleCreateRequest = () => {
    if (!selectedClientId || !documentTitle) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    
      const client = (clients?.clients || []).find((c: any) => c.id === selectedClientId);
    if (!client) return;
    
    const newRequest: SignatureRequest = {
      id: Date.now().toString(),
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      documentTitle,
      documentType,
      message: message || 'Por favor, assine o documento.',
      status: 'PENDING',
      sentAt: null,
      viewedAt: null,
      signedAt: null,
      expiresAt: new Date(Date.now() + parseInt(expiryDays) * 24 * 60 * 60 * 1000),
      signatureData: null,
      ipAddress: null,
      createdAt: new Date(),
    };
    
    setRequests([newRequest, ...requests]);
    setNewRequestOpen(false);
    
    // Reset form
    setSelectedClientId('');
    setDocumentTitle('');
    setDocumentType('CONSENT');
    setMessage('');
    setExpiryDays('7');
    
    alert('Solicitação de assinatura criada com sucesso!');
  };
  
  // Send request
  const handleSendRequest = (requestId: string) => {
    setRequests(requests.map(r => 
      r.id === requestId 
        ? { ...r, status: 'SENT', sentAt: new Date() }
        : r
    ));
    
    alert('Solicitação enviada por email para o cliente!');
  };
  
  // Resend request
  const handleResendRequest = (requestId: string) => {
    alert('Solicitação reenviada com sucesso!');
  };
  
  // Cancel request
  const handleCancelRequest = (requestId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta solicitação?')) return;
    
    setRequests(requests.map(r => 
      r.id === requestId 
        ? { ...r, status: 'CANCELLED' }
        : r
    ));
    
    alert('Solicitação cancelada com sucesso!');
  };
  
  // Delete request
  const handleDeleteRequest = (requestId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta solicitação?')) return;
    
    setRequests(requests.filter(r => r.id !== requestId));
    alert('Solicitação excluída com sucesso!');
  };
  
  // Copy signature link
  const copySignatureLink = (requestId: string) => {
    const link = `${window.location.origin}/sign/${requestId}`;
    navigator.clipboard.writeText(link);
    alert('Link copiado para a área de transferência!');
  };
  
  // Signature pad handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
  };
  
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  
  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !requestToSign) return;
    
    const signatureData = canvas.toDataURL();
    
    setRequests(requests.map(r => 
      r.id === requestToSign.id 
        ? { 
            ...r, 
            status: 'SIGNED', 
            signedAt: new Date(),
            signatureData,
            ipAddress: '192.168.1.100', // In production: get actual IP
          }
        : r
    ));
    
    setSignaturePadOpen(false);
    setRequestToSign(null);
    
    alert('Assinatura salva com sucesso!');
  };
  
  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, [signaturePadOpen]);
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Assinaturas Digitais</h1>
        <p className="text-muted-foreground">
          Solicite e gerencie assinaturas digitais de documentos dos clientes
        </p>
      </div>
      
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Solicitações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Enviados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.sent}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assinados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.signed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Assinatura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.signatureRate}%</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              dos enviados
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters & Actions */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filtros e Ações</CardTitle>
            <Button onClick={() => setNewRequestOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Solicitação
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cliente, email ou documento..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            {/* Status */}
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  {Object.entries(SIGNATURE_STATUS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => {
          const statusConfig = SIGNATURE_STATUS[request.status];
          const StatusIcon = statusConfig.icon;
          const isExpired = new Date() > request.expiresAt && request.status !== 'SIGNED';
          
          return (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{request.documentTitle}</CardTitle>
                      <Badge className={statusConfig.color}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusConfig.label}
                      </Badge>
                      {isExpired && request.status !== 'CANCELLED' && (
                        <Badge variant="destructive">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Expirado
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{request.clientName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{request.clientEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Criado em {formatDate(request.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setDetailsOpen(true);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Detalhes
                    </Button>
                    
                    {request.status === 'PENDING' && (
                      <Button
                        size="sm"
                        onClick={() => handleSendRequest(request.id)}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Enviar
                      </Button>
                    )}
                    
                    {(request.status === 'SENT' || request.status === 'VIEWED') && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResendRequest(request.id)}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Reenviar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copySignatureLink(request.id)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    {request.status === 'SIGNED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alert('Download do documento assinado')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Baixar
                      </Button>
                    )}
                    
                    {request.status !== 'SIGNED' && request.status !== 'CANCELLED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelRequest(request.id)}
                      >
                        <XCircle className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteRequest(request.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    {request.sentAt && (
                      <div>Enviado: {formatDateTime(request.sentAt)}</div>
                    )}
                    {request.viewedAt && (
                      <div>Visualizado: {formatDateTime(request.viewedAt)}</div>
                    )}
                    {request.signedAt && (
                      <div>Assinado: {formatDateTime(request.signedAt)}</div>
                    )}
                  </div>
                  <div className="text-muted-foreground">
                    Expira em: {formatDateTime(request.expiresAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {filteredRequests.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <FileSignature className="h-12 w-12 mx-auto mb-4" />
                <p className="font-medium mb-2">Nenhuma solicitação encontrada</p>
                <Button onClick={() => setNewRequestOpen(true)} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeira Solicitação
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* New Request Dialog */}
      <Dialog open={newRequestOpen} onOpenChange={setNewRequestOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Nova Solicitação de Assinatura</DialogTitle>
            <DialogDescription>
              Crie uma solicitação de assinatura digital para um cliente
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Cliente *</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                    {(clients?.clients || []).map((client: any) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Título do Documento *</Label>
              <Input
                placeholder="Ex: Termo de Consentimento - Botox"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
              />
            </div>
            
            <div>
              <Label>Tipo de Documento</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONSENT">Termo de Consentimento</SelectItem>
                  <SelectItem value="CONTRACT">Contrato</SelectItem>
                  <SelectItem value="ANAMNESIS">Anamnese</SelectItem>
                  <SelectItem value="OTHER">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Mensagem Personalizada</Label>
              <Textarea
                placeholder="Mensagem que será enviada ao cliente..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
            
            <div>
              <Label>Validade (dias)</Label>
              <Select value={expiryDays} onValueChange={setExpiryDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 dia</SelectItem>
                  <SelectItem value="3">3 dias</SelectItem>
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="15">15 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewRequestOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateRequest}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Solicitação</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <p className="font-medium">
                    <Badge className={SIGNATURE_STATUS[selectedRequest.status].color}>
                      {SIGNATURE_STATUS[selectedRequest.status].label}
                    </Badge>
                  </p>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Documento</Label>
                  <p className="font-medium">{selectedRequest.documentTitle}</p>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Cliente</Label>
                  <p className="font-medium">{selectedRequest.clientName}</p>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedRequest.clientEmail}</p>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Criado em</Label>
                  <p className="font-medium">{formatDateTime(selectedRequest.createdAt)}</p>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Expira em</Label>
                  <p className="font-medium">{formatDateTime(selectedRequest.expiresAt)}</p>
                </div>
                
                {selectedRequest.sentAt && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Enviado em</Label>
                    <p className="font-medium">{formatDateTime(selectedRequest.sentAt)}</p>
                  </div>
                )}
                
                {selectedRequest.viewedAt && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Visualizado em</Label>
                    <p className="font-medium">{formatDateTime(selectedRequest.viewedAt)}</p>
                  </div>
                )}
                
                {selectedRequest.signedAt && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Assinado em</Label>
                    <p className="font-medium">{formatDateTime(selectedRequest.signedAt)}</p>
                  </div>
                )}
                
                {selectedRequest.ipAddress && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Endereço IP</Label>
                    <p className="font-medium">{selectedRequest.ipAddress}</p>
                  </div>
                )}
              </div>
              
              {selectedRequest.message && (
                <div>
                  <Label className="text-xs text-muted-foreground">Mensagem</Label>
                  <p className="text-sm mt-1">{selectedRequest.message}</p>
                </div>
              )}
              
              {selectedRequest.signatureData && (
                <div>
                  <Label className="text-xs text-muted-foreground">Assinatura</Label>
                  <div className="mt-2 border rounded-lg p-4 bg-white">
                    <img 
                      src={selectedRequest.signatureData} 
                      alt="Assinatura" 
                      className="max-h-32 mx-auto"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setDetailsOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Signature Pad Dialog (for testing) */}
      <Dialog open={signaturePadOpen} onOpenChange={setSignaturePadOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assinar Documento</DialogTitle>
            <DialogDescription>
              {requestToSign?.documentTitle}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-4 bg-gray-50">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="bg-white border rounded cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Desenhe sua assinatura acima
              </p>
              <Button variant="outline" size="sm" onClick={clearSignature}>
                Limpar
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignaturePadOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveSignature}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirmar Assinatura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
