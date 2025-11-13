import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, getClient, getClientDocuments } from 'wasp/client/operations';
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
  Download,
  Share2,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
  FileText,
  MessageSquare,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Type,
  Highlighter,
  Trash2,
  Calendar,
  User,
  ArrowLeft,
} from 'lucide-react';

// Annotation types
interface Annotation {
  id: string;
  type: 'text' | 'highlight' | 'note';
  content: string;
  page: number;
  position: { x: number; y: number };
  color: string;
  createdAt: Date;
  createdBy: string;
}

// Document type mappings
const DOCUMENT_TYPES = {
  ANAMNESIS: { label: 'Anamnese', color: 'bg-blue-100 text-blue-800' },
  CONSENT: { label: 'Termo de Consentimento', color: 'bg-green-100 text-green-800' },
  CONTRACT: { label: 'Contrato', color: 'bg-purple-100 text-purple-800' },
  PHOTO: { label: 'Foto', color: 'bg-pink-100 text-pink-800' },
  PRESCRIPTION: { label: 'Receita', color: 'bg-yellow-100 text-yellow-800' },
  ID_DOCUMENT: { label: 'Documento de Identidade', color: 'bg-indigo-100 text-indigo-800' },
  OTHER: { label: 'Outros', color: 'bg-gray-100 text-gray-800' },
};

export default function DocumentViewerPage() {
  const { clientId, documentId } = useParams<{ clientId: string; documentId: string }>();
  const navigate = useNavigate();
  const { activeSalonId } = useSalonContext();
  
  // Viewer state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  
  // Annotations state
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [annotationMode, setAnnotationMode] = useState<'view' | 'text' | 'highlight' | 'note'>('view');
  const [newAnnotation, setNewAnnotation] = useState('');
  const [selectedColor, setSelectedColor] = useState('#FFEB3B');
  
  // Dialogs
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [annotationDialogOpen, setAnnotationDialogOpen] = useState(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  
  // Queries
  const { data: client, isLoading: loadingClient } = useQuery(getClient, {
    clientId: clientId!,
     salonId: activeSalonId || '',
  });
  
  const { data: documentsData, isLoading: loadingDocuments } = useQuery(getClientDocuments, {
    clientId: clientId!,
     salonId: activeSalonId || '',
  });
  
  const documents = documentsData || [];
  const document = documents.find((doc: any) => doc.id === documentId);
  
  // Load mock PDF pages (in production: use PDF.js or similar)
  useEffect(() => {
    // Simulate PDF with multiple pages
    setTotalPages(5);
  }, [document]);
  
  // Fullscreen handling
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      viewerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  // Zoom controls
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };
  
  const resetZoom = () => {
    setZoom(100);
  };
  
  // Rotation control
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };
  
  // Page navigation
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  // Annotation handling
  const addAnnotation = (type: 'text' | 'highlight' | 'note') => {
    if (!newAnnotation.trim() && type !== 'highlight') return;
    
    const annotation: Annotation = {
      id: Date.now().toString(),
      type,
      content: newAnnotation,
      page: currentPage,
      position: { x: 100, y: 100 }, // In production: get from click position
      color: selectedColor,
      createdAt: new Date(),
      createdBy: 'Usuário Atual', // In production: use actual user
    };
    
    setAnnotations([...annotations, annotation]);
    setNewAnnotation('');
    setAnnotationMode('view');
    setAnnotationDialogOpen(false);
  };
  
  const deleteAnnotation = (id: string) => {
    setAnnotations(annotations.filter(a => a.id !== id));
  };
  
  const openAnnotationDialog = (type: 'text' | 'highlight' | 'note') => {
    setAnnotationMode(type);
    setAnnotationDialogOpen(true);
  };
  
  // Print handling
  const handlePrint = () => {
    // In production: implement actual printing
    window.print();
    setPrintDialogOpen(false);
  };
  
  // Share handling
  const handleShare = (method: string) => {
    // In production: implement sharing logic
    alert(`Compartilhando via ${method}`);
    setShareDialogOpen(false);
  };
  
  // Download
  const handleDownload = () => {
    if (document?.fileUrl) {
      window.open(document.fileUrl, '_blank');
    }
  };
  
  if (loadingClient || loadingDocuments) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 animate-pulse text-primary" />
          <p className="text-muted-foreground">Carregando documento...</p>
        </div>
      </div>
    );
  }
  
  if (!document) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">Documento não encontrado</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }
  
  const typeConfig = DOCUMENT_TYPES[document.documentType as keyof typeof DOCUMENT_TYPES] || DOCUMENT_TYPES.OTHER;
  const pageAnnotations = annotations.filter(a => a.page === currentPage);
  
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div>
            <h1 className="font-semibold text-lg">{document.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge className={typeConfig.color} variant="secondary">
                {typeConfig.label}
              </Badge>
              <span>•</span>
              <span>{client?.name}</span>
              <span>•</span>
              <span>{formatDate(document.createdAt)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Baixar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShareDialogOpen(true)}>
            <Share2 className="mr-2 h-4 w-4" />
            Compartilhar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPrintDialogOpen(true)}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Annotations */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Anotações</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnnotations(!showAnnotations)}
              >
                {showAnnotations ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={annotationMode === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => openAnnotationDialog('text')}
              >
                <Type className="mr-1 h-4 w-4" />
                Texto
              </Button>
              <Button
                variant={annotationMode === 'highlight' ? 'default' : 'outline'}
                size="sm"
                onClick={() => openAnnotationDialog('highlight')}
              >
                <Highlighter className="mr-1 h-4 w-4" />
                Destaque
              </Button>
              <Button
                variant={annotationMode === 'note' ? 'default' : 'outline'}
                size="sm"
                onClick={() => openAnnotationDialog('note')}
              >
                <MessageSquare className="mr-1 h-4 w-4" />
                Nota
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {annotations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Nenhuma anotação ainda</p>
                <p className="text-xs mt-1">Clique nos botões acima para adicionar</p>
              </div>
            ) : (
              annotations.map((annotation) => (
                <Card key={annotation.id} className="relative">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {annotation.type === 'text' && <Type className="h-4 w-4" />}
                        {annotation.type === 'highlight' && <Highlighter className="h-4 w-4" />}
                        {annotation.type === 'note' && <MessageSquare className="h-4 w-4" />}
                        <span className="text-xs font-medium">Página {annotation.page}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAnnotation(annotation.id)}
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{annotation.content}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{annotation.createdBy}</span>
                      <span>•</span>
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(annotation.createdAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
        
        {/* Viewer */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Page Navigation */}
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm min-w-16 text-center">{zoom}%</span>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={resetZoom}>
                Reset
              </Button>
              
              {/* Rotation */}
              <div className="border-l pl-2 ml-2">
                <Button variant="outline" size="sm" onClick={handleRotate}>
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Fullscreen */}
              <div className="border-l pl-2 ml-2">
                <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Document Display */}
          <div
            ref={viewerRef}
            className="flex-1 overflow-auto bg-gray-200 p-8"
          >
            <div className="max-w-4xl mx-auto">
              <div
                className="bg-white shadow-lg relative"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.3s ease',
                }}
              >
                {/* Document Preview */}
                {document.mimeType.includes('image') ? (
                  <img
                    src={document.fileUrl}
                    alt={document.title}
                    className="w-full"
                  />
                ) : document.mimeType === 'application/pdf' ? (
                  <div className="aspect-[8.5/11] bg-white p-12 text-center">
                    {/* In production: Use PDF.js or react-pdf */}
                    <FileText className="h-24 w-24 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">Visualizador de PDF</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Página {currentPage} de {totalPages}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Em produção: integrar com PDF.js ou react-pdf para visualização completa
                    </p>
                  </div>
                ) : (
                  <div className="aspect-[8.5/11] bg-white p-12 text-center">
                    <FileText className="h-24 w-24 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">Visualização não disponível</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Este tipo de arquivo ({document.mimeType}) não pode ser visualizado no navegador
                    </p>
                    <Button onClick={handleDownload}>
                      <Download className="mr-2 h-4 w-4" />
                      Baixar Arquivo
                    </Button>
                  </div>
                )}
                
                {/* Annotations Overlay */}
                {showAnnotations && pageAnnotations.length > 0 && (
                  <div className="absolute inset-0 pointer-events-none">
                    {pageAnnotations.map((annotation) => (
                      <div
                        key={annotation.id}
                        className="absolute p-2 rounded shadow-lg pointer-events-auto cursor-pointer"
                        style={{
                          left: `${annotation.position.x}px`,
                          top: `${annotation.position.y}px`,
                          backgroundColor: annotation.color,
                          maxWidth: '200px',
                        }}
                        onClick={() => {
                          setSelectedAnnotation(annotation);
                        }}
                      >
                        <p className="text-xs">{annotation.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Annotation Dialog */}
      <Dialog open={annotationDialogOpen} onOpenChange={setAnnotationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {annotationMode === 'text' && 'Adicionar Texto'}
              {annotationMode === 'highlight' && 'Adicionar Destaque'}
              {annotationMode === 'note' && 'Adicionar Nota'}
            </DialogTitle>
            <DialogDescription>
              Esta anotação será adicionada à página {currentPage}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {annotationMode !== 'highlight' && (
              <div>
                <Label>Conteúdo</Label>
                <Textarea
                  placeholder={
                    annotationMode === 'text' 
                      ? 'Digite o texto da anotação...' 
                      : 'Digite sua nota...'
                  }
                  value={newAnnotation}
                  onChange={(e) => setNewAnnotation(e.target.value)}
                  rows={4}
                />
              </div>
            )}
            
            <div>
              <Label>Cor</Label>
              <div className="flex gap-2 mt-2">
                {['#FFEB3B', '#4CAF50', '#2196F3', '#F44336', '#9C27B0', '#FF9800'].map((color) => (
                  <button
                    key={color}
                    className={`w-10 h-10 rounded-full border-2 ${
                      selectedColor === color ? 'border-black' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnnotationDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => addAnnotation(annotationMode as any)}>
              <Save className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartilhar Documento</DialogTitle>
            <DialogDescription>
              Escolha como deseja compartilhar este documento
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleShare('Email')}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Enviar por Email
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleShare('WhatsApp')}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar via WhatsApp
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                navigator.clipboard.writeText(document.fileUrl);
                alert('Link copiado para a área de transferência!');
                setShareDialogOpen(false);
              }}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Copiar Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Print Dialog */}
      <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Imprimir Documento</DialogTitle>
            <DialogDescription>
              Configure as opções de impressão
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Páginas</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Páginas</SelectItem>
                  <SelectItem value="current">Página Atual</SelectItem>
                  <SelectItem value="range">Intervalo Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <input type="checkbox" id="includeAnnotations" />
              <Label htmlFor="includeAnnotations">Incluir anotações</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrintDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
