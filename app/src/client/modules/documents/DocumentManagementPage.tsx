import React, { useState, useRef } from 'react';
import { useQuery, listClients, getClientDocuments, uploadClientDocument, deleteClientDocument } from 'wasp/client/operations';
import { useSalonContext } from '../../hooks/useSalonContext';
import { formatDate, formatDateTime } from '../../lib/formatters';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
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
  Upload,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Calendar,
  FileType,
  Image,
  FileSignature,
  FileCheck,
  FolderOpen,
  Plus,
  X,
  ChevronDown,
  TrendingUp,
  BarChart3,
  File,
} from 'lucide-react';

// Document type mappings
const DOCUMENT_TYPES = {
  ANAMNESIS: { label: 'Anamnese', icon: FileCheck, color: 'bg-blue-100 text-blue-800' },
  CONSENT: { label: 'Termo de Consentimento', icon: FileSignature, color: 'bg-green-100 text-green-800' },
  CONTRACT: { label: 'Contrato', icon: FileText, color: 'bg-purple-100 text-purple-800' },
  PHOTO: { label: 'Foto', icon: Image, color: 'bg-pink-100 text-pink-800' },
  PRESCRIPTION: { label: 'Receita', icon: FileType, color: 'bg-yellow-100 text-yellow-800' },
  ID_DOCUMENT: { label: 'Documento de Identidade', icon: User, color: 'bg-indigo-100 text-indigo-800' },
  OTHER: { label: 'Outros', icon: File, color: 'bg-gray-100 text-gray-800' },
};

// File type validation
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function DocumentManagementPage() {
  const { activeSalonId } = useSalonContext();
  
  // Filters
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [documentTypeFilter, setDocumentTypeFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  
  // Upload state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadClientId, setUploadClientId] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadDocType, setUploadDocType] = useState('OTHER');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Details dialog
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  
  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<any>(null);
  
  // Client search dialog
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  
  // Queries
  const { data: clients, isLoading: loadingClients } = useQuery(listClients, {
      salonId: activeSalonId || '',
  });
  
  const { data: documentsData, isLoading: loadingDocuments, refetch: refetchDocuments } = useQuery(
    getClientDocuments,
    selectedClient ? {
      clientId: selectedClient.id,
        salonId: activeSalonId || '',
      } : undefined,
    { enabled: !!selectedClient }
  );
  
  const documents = documentsData || [];
  
  // Mutations
    const uploadDocumentFn = uploadClientDocument;
    const deleteDocumentFn = deleteClientDocument;
  
  // Filter documents
  const filteredDocuments = documents.filter((doc: any) => {
    // Search filter
    const matchesSearch = !searchQuery || 
      doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Document type filter
    const matchesType = documentTypeFilter === 'all' || doc.documentType === documentTypeFilter;
    
    // Date range filter
    let matchesDate = true;
    if (dateRangeFilter !== 'all') {
      const docDate = new Date(doc.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - docDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateRangeFilter) {
        case 'week':
          matchesDate = daysDiff <= 7;
          break;
        case 'month':
          matchesDate = daysDiff <= 30;
          break;
        case 'quarter':
          matchesDate = daysDiff <= 90;
          break;
        case 'year':
          matchesDate = daysDiff <= 365;
          break;
      }
    }
    
    return matchesSearch && matchesType && matchesDate;
  });
  
  // Client search results
  const searchedClients = (clients?.clients || []).filter((client: any) => {
    if (!clientSearch) return true;
    const query = clientSearch.toLowerCase();
    return (
      client.name?.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query) ||
      client.phone?.toLowerCase().includes(query)
    );
  }).slice(0, 10) || [];
  
  // Statistics
  const stats = {
    total: documents.length,
    byType: {} as Record<string, number>,
    thisWeek: 0,
    thisMonth: 0,
  };
  
  documents.forEach((doc: any) => {
    // Count by type
    stats.byType[doc.documentType] = (stats.byType[doc.documentType] || 0) + 1;
    
    // Count by time
    const docDate = new Date(doc.createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - docDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 7) stats.thisWeek++;
    if (daysDiff <= 30) stats.thisMonth++;
  });
  
  // File selection handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      alert('Tipo de arquivo não permitido. Use PDF, imagens (JPG, PNG, WebP) ou documentos Word.');
      return;
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      alert('Arquivo muito grande. Tamanho máximo: 10MB');
      return;
    }
    
    setSelectedFile(file);
  };
  
  // Upload document
  const handleUpload = async () => {
    if (!selectedFile || !uploadClientId || !uploadTitle) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }
    
    setUploading(true);
    try {
      // In production: upload to S3/Cloudinary first, get URL
      // For now, simulate with file metadata
      const fileUrl = `https://storage.glamo.com/documents/${uploadClientId}/${Date.now()}_${selectedFile.name}`;
      
      await uploadDocumentFn({
        clientId: uploadClientId,
        salonId: activeSalonId || '',
        title: uploadTitle,
        description: uploadDescription,
        documentType: uploadDocType,
        fileUrl,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
      });
      
      // Reset form
      setUploadDialogOpen(false);
      setUploadTitle('');
      setUploadDescription('');
      setUploadDocType('OTHER');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Refetch if same client
      if (uploadClientId === selectedClient?.id) {
        refetchDocuments();
      }
      
      alert('Documento enviado com sucesso!');
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.message || 'Erro ao enviar documento');
    } finally {
      setUploading(false);
    }
  };
  
  // Delete document
  const handleDelete = async () => {
    if (!documentToDelete) return;
    
    try {
      await deleteDocumentFn({
        documentId: documentToDelete.id,
        clientId: selectedClient.id,
        salonId: activeSalonId || '',
      });
      
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      refetchDocuments();
      
      alert('Documento excluído com sucesso!');
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(error.message || 'Erro ao excluir documento');
    }
  };
  
  // View document details
  const openDetails = (doc: any) => {
    setSelectedDocument(doc);
    setDetailsDialogOpen(true);
  };
  
  // Open upload dialog
  const openUploadDialog = (clientId?: string) => {
    if (clientId) {
      setUploadClientId(clientId);
    } else if (selectedClient) {
      setUploadClientId(selectedClient.id);
    }
    setUploadDialogOpen(true);
  };
  
  // Select client
  const selectClient = (client: any) => {
    setSelectedClient(client);
    setClientSearchOpen(false);
    setClientSearch('');
  };
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestão de Documentos</h1>
        <p className="text-muted-foreground">
          Gerencie documentos, contratos, anamneses e outros arquivos dos clientes
        </p>
      </div>
      
      {/* Client Selection & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Client Selector */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Cliente Selecionado</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedClient ? (
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{selectedClient.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedClient(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setClientSearchOpen(true)}
              >
                <User className="mr-2 h-4 w-4" />
                Selecionar Cliente
              </Button>
            )}
          </CardContent>
        </Card>
        
        {/* Statistics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedClient ? `de ${selectedClient.name}` : 'Selecione um cliente'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Este Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {stats.thisWeek} esta semana
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters & Actions */}
      {selectedClient && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filtros e Ações</CardTitle>
              <Button onClick={() => openUploadDialog()}>
                <Upload className="mr-2 h-4 w-4" />
                Enviar Documento
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <Label>Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Título, descrição ou nome do arquivo..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              {/* Document Type */}
              <div>
                <Label>Tipo de Documento</Label>
                <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    {Object.entries(DOCUMENT_TYPES).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Date Range */}
              <div>
                <Label>Período</Label>
                <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todo o Período</SelectItem>
                    <SelectItem value="week">Última Semana</SelectItem>
                    <SelectItem value="month">Último Mês</SelectItem>
                    <SelectItem value="quarter">Último Trimestre</SelectItem>
                    <SelectItem value="year">Último Ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Documents List */}
      {selectedClient ? (
        loadingDocuments ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 animate-spin" />
                <p>Carregando documentos...</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-4" />
                <p className="font-medium mb-2">
                  {documents.length === 0 
                    ? 'Nenhum documento encontrado' 
                    : 'Nenhum documento corresponde aos filtros'}
                </p>
                {documents.length === 0 && (
                  <Button
                    variant="outline"
                    onClick={() => openUploadDialog()}
                    className="mt-4"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Enviar Primeiro Documento
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc: any) => {
              const typeConfig = DOCUMENT_TYPES[doc.documentType as keyof typeof DOCUMENT_TYPES] || DOCUMENT_TYPES.OTHER;
              const TypeIcon = typeConfig.icon;
              
              return (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                  <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-2 flex-1">
                        <TypeIcon className="h-5 w-5 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">{doc.title}</CardTitle>
                        </div>
                      </div>
                      <Badge className={typeConfig.color}>
                        {typeConfig.label}
                      </Badge>
                    </div>
                    {doc.description && (
                      <CardDescription className="line-clamp-2">
                        {doc.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="truncate">{doc.fileName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(doc.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{doc.user?.name || 'Usuário'}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openDetails(doc)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(doc.fileUrl, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDocumentToDelete(doc);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4" />
              <p className="font-medium mb-2">Selecione um cliente</p>
              <p className="text-sm mb-4">
                Para visualizar e gerenciar documentos, selecione um cliente primeiro
              </p>
              <Button onClick={() => setClientSearchOpen(true)}>
                <User className="mr-2 h-4 w-4" />
                Selecionar Cliente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Client Search Dialog */}
      <Dialog open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Selecionar Cliente</DialogTitle>
            <DialogDescription>
              Busque e selecione o cliente para gerenciar documentos
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                value={clientSearch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientSearch(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-2">
              {loadingClients ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" />
                  <p>Carregando clientes...</p>
                </div>
              ) : searchedClients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-2" />
                  <p>Nenhum cliente encontrado</p>
                </div>
              ) : (
                searchedClients.map((client: any) => (
                  <button
                    key={client.id}
                    onClick={() => selectClient(client)}
                    className="w-full p-3 text-left hover:bg-muted rounded-lg transition-colors flex items-center gap-3"
                  >
                    <User className="h-8 w-8 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {client.email} {client.phone && `• ${client.phone}`}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Enviar Documento</DialogTitle>
            <DialogDescription>
              Faça upload de documentos, contratos, anamneses ou outros arquivos
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Client (if not selected) */}
            {!selectedClient && (
              <div>
                <Label>Cliente *</Label>
                <Select value={uploadClientId} onValueChange={setUploadClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                      {(clients?.clients || []).map((client: any) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Title */}
            <div>
              <Label>Título *</Label>
              <Input
                placeholder="Ex: Termo de Consentimento - Botox"
                value={uploadTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadTitle(e.target.value)}
              />
            </div>
            
            {/* Document Type */}
            <div>
              <Label>Tipo de Documento *</Label>
              <Select value={uploadDocType} onValueChange={setUploadDocType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DOCUMENT_TYPES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Description */}
            <div>
              <Label>Descrição</Label>
              <Textarea
                placeholder="Informações adicionais sobre o documento..."
                value={uploadDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setUploadDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            {/* File Input */}
            <div>
              <Label>Arquivo *</Label>
              <Input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                onChange={handleFileSelect}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Formatos aceitos: PDF, JPG, PNG, WebP, DOC, DOCX (máx. 10MB)
              </p>
              {selectedFile && (
                <div className="mt-2 p-2 bg-muted rounded-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm flex-1">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUploadDialogOpen(false)}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={uploading || !selectedFile}>
              {uploading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Enviar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Documento</DialogTitle>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-4">
              {/* Type Badge */}
              <div>
                <Badge className={DOCUMENT_TYPES[selectedDocument.documentType as keyof typeof DOCUMENT_TYPES]?.color}>
                  {DOCUMENT_TYPES[selectedDocument.documentType as keyof typeof DOCUMENT_TYPES]?.label}
                </Badge>
              </div>
              
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Título</Label>
                  <p className="font-medium">{selectedDocument.title}</p>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Arquivo</Label>
                  <p className="font-medium truncate">{selectedDocument.fileName}</p>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Data de Upload</Label>
                  <p className="font-medium">{formatDateTime(selectedDocument.createdAt)}</p>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Enviado por</Label>
                  <p className="font-medium">{selectedDocument.user?.name || 'Usuário'}</p>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Tamanho</Label>
                  <p className="font-medium">
                    {(selectedDocument.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Tipo MIME</Label>
                  <p className="font-medium">{selectedDocument.mimeType}</p>
                </div>
              </div>
              
              {/* Description */}
              {selectedDocument.description && (
                <div>
                  <Label className="text-xs text-muted-foreground">Descrição</Label>
                  <p className="mt-1 text-sm">{selectedDocument.description}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => window.open(selectedDocument?.fileUrl, '_blank')}
            >
              <Download className="mr-2 h-4 w-4" />
              Baixar
            </Button>
            <Button onClick={() => setDetailsDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          {documentToDelete && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium">{documentToDelete.title}</p>
              <p className="text-sm text-muted-foreground">{documentToDelete.fileName}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="outline" className="text-red-600" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
