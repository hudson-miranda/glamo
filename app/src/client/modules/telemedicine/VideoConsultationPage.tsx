import { useState, useEffect, useRef } from 'react';
import { useQuery, getAppointment, updateAppointmentStatus } from 'wasp/client/operations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Textarea } from '../../../components/ui/textarea';
import { Input } from '../../../components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { 
  Video, 
  VideoOff,
  Mic, 
  MicOff,
  Phone,
  Monitor,
  MessageSquare,
  FileText,
  Clock,
  User,
  Calendar,
  ChevronLeft,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  Settings,
  Maximize,
  Minimize,
  Camera,
  CameraOff
} from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { formatDateTime } from '../../lib/formatters';
import { useParams } from 'react-router-dom';

interface ChatMessage {
  id: string;
  sender: 'professional' | 'client';
  message: string;
  timestamp: Date;
}

interface ConsultationNote {
  id: string;
  content: string;
  timestamp: Date;
}

export default function VideoConsultationPage() {
  const { activeSalonId } = useSalonContext();
  const { appointmentId } = useParams<{ appointmentId: string }>();
  
  // Video/Audio State
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [consultationStarted, setConsultationStarted] = useState(false);
  const [consultationDuration, setConsultationDuration] = useState(0);
  const [showEndDialog, setShowEndDialog] = useState(false);

  // Chat State
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // Notes State
  const [showNotes, setShowNotes] = useState(false);
  const [consultationNotes, setConsultationNotes] = useState<ConsultationNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [finalNotes, setFinalNotes] = useState('');

  // Video Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout>();

  // Fetch appointment data
  const { data: appointment, isLoading } = useQuery(
    getAppointment,
    { appointmentId: appointmentId || '' },
    { enabled: !!appointmentId }
  );

  const updateStatusFn = updateAppointmentStatus();

  useEffect(() => {
    // Simulate WebRTC connection
    const timer = setTimeout(() => {
      setConnectionStatus('connected');
      setConsultationStarted(true);
      
      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setConsultationDuration((prev) => prev + 1);
      }, 1000);
    }, 2000);

    return () => {
      clearTimeout(timer);
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Initialize local video stream (simulated)
    if (localVideoRef.current) {
      // In production, would use: navigator.mediaDevices.getUserMedia()
      localVideoRef.current.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkPDom1lcmEgTG9jYWw8L3RleHQ+PC9zdmc+';
    }
    
    // Initialize remote video stream (simulated)
    if (remoteVideoRef.current) {
      remoteVideoRef.current.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4MCIgaGVpZ2h0PSI3MjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyODAiIGhlaWdodD0iNzIwIiBmaWxsPSIjMTExMTExIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Q2xpZW50ZTwvdGV4dD48L3N2Zz4=';
    }
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    // In production: localStream.getVideoTracks()[0].enabled = !isVideoEnabled;
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    // In production: localStream.getAudioTracks()[0].enabled = !isAudioEnabled;
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      setIsScreenSharing(false);
      // In production: stop screen share track
    } else {
      setIsScreenSharing(true);
      // In production: navigator.mediaDevices.getDisplayMedia()
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const sendChatMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: 'professional',
      message: newMessage,
      timestamp: new Date(),
    };

    setChatMessages([...chatMessages, message]);
    setNewMessage('');
  };

  const addNote = () => {
    if (!newNote.trim()) return;

    const note: ConsultationNote = {
      id: Date.now().toString(),
      content: newNote,
      timestamp: new Date(),
    };

    setConsultationNotes([...consultationNotes, note]);
    setNewNote('');
  };

  const handleEndConsultation = async () => {
    try {
      await updateStatusFn({
        appointmentId: appointmentId || '',
        salonId: activeSalonId || '',
        status: 'DONE',
        notes: finalNotes || undefined,
      });

      // Stop duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }

      setShowEndDialog(false);
      window.location.href = '/telemedicine';
    } catch (error) {
      console.error('Error ending consultation:', error);
    }
  };

  const getStatusBadge = () => {
    const configs: Record<string, { variant: any; icon: any; label: string }> = {
      connecting: { variant: 'secondary', icon: AlertCircle, label: 'Conectando...' },
      connected: { variant: 'default', icon: CheckCircle2, label: 'Conectado' },
      disconnected: { variant: 'destructive', icon: X, label: 'Desconectado' },
    };
    const config = configs[connectionStatus];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-2">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Carregando consulta...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Consulta não encontrada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/telemedicine'}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/telemedicine'}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="h-6 w-px bg-border" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">{appointment.client?.name || 'Cliente'}</h2>
              {getStatusBadge()}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDateTime(appointment.startAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(consultationDuration)}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Dr. {appointment.professional?.name || 'Profissional'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotes(!showNotes)}
          >
            <FileText className="h-4 w-4 mr-2" />
            Anotações {consultationNotes.length > 0 && `(${consultationNotes.length})`}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowChat(!showChat);
              setUnreadCount(0);
            }}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat {unreadCount > 0 && `(${unreadCount})`}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowEndDialog(true)}
          >
            <Phone className="h-4 w-4 mr-2" />
            Encerrar
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 relative bg-black">
          {/* Remote Video (Client) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Connection Status Overlay */}
          {connectionStatus === 'connecting' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center space-y-4">
                <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mx-auto" />
                <p className="text-white text-lg">Conectando à consulta...</p>
              </div>
            </div>
          )}

          {/* Local Video (Professional) - Picture in Picture */}
          <div className="absolute bottom-4 right-4 w-64 h-48 bg-gray-900 rounded-lg overflow-hidden shadow-xl border-2 border-white/20">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <CameraOff className="h-12 w-12 text-white" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-xs">
              Você
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/80 backdrop-blur-sm p-3 rounded-full">
            <Button
              variant={isAudioEnabled ? 'default' : 'destructive'}
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={toggleAudio}
            >
              {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>

            <Button
              variant={isVideoEnabled ? 'default' : 'destructive'}
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={toggleVideo}
            >
              {isVideoEnabled ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
            </Button>

            <Button
              variant={isScreenSharing ? 'default' : 'outline'}
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={toggleScreenShare}
            >
              <Monitor className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-12 w-12"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <Card className="w-96 m-4 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Chat da Consulta</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowChat(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 space-y-3">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma mensagem ainda</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'professional' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          msg.sender === 'professional'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite uma mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                  />
                  <Button size="icon" onClick={sendChatMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes Sidebar */}
        {showNotes && (
          <Card className="w-96 m-4 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Anotações da Consulta</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowNotes(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Notes List */}
              <div className="flex-1 overflow-y-auto px-4 space-y-3">
                {consultationNotes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma anotação ainda</p>
                  </div>
                ) : (
                  consultationNotes.map((note) => (
                    <div key={note.id} className="p-3 border rounded-lg">
                      <p className="text-sm">{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {note.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t space-y-2">
                <Textarea
                  placeholder="Adicionar anotação..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <Button size="sm" className="w-full" onClick={addNote}>
                  Adicionar Anotação
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* End Consultation Dialog */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Encerrar Consulta</DialogTitle>
            <DialogDescription>
              A consulta durou {formatDuration(consultationDuration)}. Adicione observações finais antes de encerrar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Observações Finais</label>
              <Textarea
                placeholder="Resumo da consulta, prescrições, recomendações..."
                value={finalNotes}
                onChange={(e) => setFinalNotes(e.target.value)}
                rows={6}
              />
            </div>

            {consultationNotes.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Anotações Durante a Consulta ({consultationNotes.length})</label>
                <div className="max-h-40 overflow-y-auto space-y-2 p-3 bg-muted rounded-lg">
                  {consultationNotes.map((note) => (
                    <div key={note.id} className="text-sm">
                      • {note.content}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEndDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEndConsultation}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Encerrar Consulta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
