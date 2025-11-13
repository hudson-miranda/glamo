import { useState } from 'react';
import { useQuery, getClientNotes } from 'wasp/client/operations';
import { addClientNote, updateClientNote, deleteClientNote } from 'wasp/client/operations';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Textarea } from '../../../../components/ui/textarea';
import { Badge } from '../../../../components/ui/badge';
import { FileText, Edit, Trash2, Save, X, Plus } from 'lucide-react';
import { formatDate } from '../../../lib/formatters';
import { useSalonContext } from '../../../hooks/useSalonContext';

interface ClientNotesTabProps {
  clientId: string;
}

export default function ClientNotesTab({ clientId }: ClientNotesTabProps) {
  const { activeSalonId } = useSalonContext();
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const { data: notes, isLoading, refetch } = useQuery(
    getClientNotes,
    {
      clientId,
      salonId: activeSalonId || '',
    },
    {
      enabled: !!clientId && !!activeSalonId,
    }
  );

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      await addClientNote({
        clientId,
        salonId: activeSalonId || '',
        content: newNote,
      });
      setNewNote('');
      setIsAdding(false);
      refetch();
    } catch (error) {
      console.error('Erro ao adicionar nota:', error);
      alert('Erro ao adicionar nota. Tente novamente.');
    }
  };

  const handleStartEdit = (note: any) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };

  const handleSaveEdit = async (noteId: string) => {
    if (!editingContent.trim()) return;
    
    try {
      await updateClientNote({
        noteId,
        salonId: activeSalonId || '',
        content: editingContent,
      });
      setEditingNoteId(null);
      setEditingContent('');
      refetch();
    } catch (error) {
      console.error('Erro ao atualizar nota:', error);
      alert('Erro ao atualizar nota. Tente novamente.');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Deseja realmente excluir esta nota?')) return;
    
    try {
      await deleteClientNote({
        noteId,
        salonId: activeSalonId || '',
      });
      refetch();
    } catch (error) {
      console.error('Erro ao excluir nota:', error);
      alert('Erro ao excluir nota. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Carregando notas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Note Button/Form */}
      {!isAdding ? (
        <Button onClick={() => setIsAdding(true)} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Nova Nota
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Nova Nota
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Escreva sua nota aqui..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="flex gap-2">
              <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                <Save className="mr-2 h-4 w-4" />
                Salvar Nota
              </Button>
              <Button variant="outline" onClick={() => {
                setIsAdding(false);
                setNewNote('');
              }}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {notes && notes.length > 0 ? (
          notes.map((note: any) => (
            <Card key={note.id}>
              <CardContent className="pt-6">
                {editingNoteId === note.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveEdit(note.id)}>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        <X className="mr-2 h-4 w-4" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                    
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{formatDate(note.createdAt)}</span>
                        {note.user && (
                          <>
                            <span>•</span>
                            <span>{note.user.name || note.user.email}</span>
                          </>
                        )}
                        {note.isPrivate && (
                          <>
                            <span>•</span>
                            <Badge variant="secondary">Privada</Badge>
                          </>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStartEdit(note)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma nota adicionada ainda.</p>
                <p className="text-sm mt-1">Clique no botão acima para criar a primeira nota.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
