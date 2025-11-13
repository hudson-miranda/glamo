import { useState } from 'react';
import { useQuery, getClientDocuments, uploadClientDocument, deleteClientDocument } from 'wasp/client/operations';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { FileText, Download, Trash2, Upload, File } from 'lucide-react';
import { formatDate } from '../../../lib/formatters';
import { useSalonContext } from '../../../hooks/useSalonContext';

interface ClientDocumentsTabProps {
  clientId: string;
}

export default function ClientDocumentsTab({ clientId }: ClientDocumentsTabProps) {
  const { activeSalonId } = useSalonContext();
  const [uploading, setUploading] = useState(false);

  const { data: documents, isLoading, refetch } = useQuery(
    getClientDocuments,
    {
      clientId,
      salonId: activeSalonId || '',
    },
    {
      enabled: !!clientId && !!activeSalonId,
    }
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // TODO: Implement file upload with proper backend integration
      // await uploadClientDocument({
      //   clientId,
      //   salonId: activeSalonId || '',
      //   fileName: file.name,
      //   fileUrl: URL.createObjectURL(file),
      // });
      console.log('Upload file:', file.name);
      alert('Funcionalidade de upload será implementada em breve.');
      refetch();
      // Reset input
      e.target.value = '';
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload do documento. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Deseja realmente excluir este documento?')) return;
    
    try {
      await deleteClientDocument({
        documentId,
        clientId,
        salonId: activeSalonId || '',
      });
      refetch();
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      alert('Erro ao excluir documento. Tente novamente.');
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return '🖼️';
    } else if (['pdf'].includes(ext || '')) {
      return '📄';
    } else if (['doc', 'docx'].includes(ext || '')) {
      return '📝';
    } else if (['xls', 'xlsx'].includes(ext || '')) {
      return '📊';
    }
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Carregando documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Adicionar Documento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <label className="block">
            <div className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors hover:border-primary hover:bg-primary/5
              ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}>
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.xls,.xlsx"
              />
              <File className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              {uploading ? (
                <p className="text-sm text-muted-foreground">Enviando documento...</p>
              ) : (
                <>
                  <p className="text-sm font-medium">Clique para selecionar um arquivo</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOC, XLS, Imagens (máx. 10MB)
                  </p>
                </>
              )}
            </div>
          </label>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="space-y-3">
        {documents && documents.length > 0 ? (
          documents.map((doc: any) => (
            <Card key={doc.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="text-3xl flex-shrink-0">
                      {getFileIcon(doc.fileName || '')}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {doc.fileName || doc.name || 'Documento sem nome'}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span>{formatDate(doc.createdAt)}</span>
                        {doc.fileSize && (
                          <>
                            <span>•</span>
                            <span>{formatFileSize(doc.fileSize)}</span>
                          </>
                        )}
                        {doc.user && (
                          <>
                            <span>•</span>
                            <span>{doc.user.name || doc.user.email}</span>
                          </>
                        )}
                      </div>
                      {doc.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {doc.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(doc.url || doc.fileUrl, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Baixar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteDocument(doc.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum documento enviado ainda.</p>
                <p className="text-sm mt-1">Use o formulário acima para adicionar documentos.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
