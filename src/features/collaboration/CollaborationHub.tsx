import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Users, MessageCircle, Share2, Video, UserPlus, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CollaborationUser {
  id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'collaborator' | 'viewer';
  status: 'online' | 'offline' | 'away';
  lastSeen: Date;
}

interface CollaborationSession {
  id: string;
  name: string;
  participants: CollaborationUser[];
  measurements: any[];
  createdAt: Date;
  isActive: boolean;
}

interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'measurement' | 'image';
}

export const CollaborationHub = () => {
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [isVideoCall, setIsVideoCall] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser: CollaborationUser = {
    id: 'current-user',
    name: 'You',
    role: 'owner',
    status: 'online',
    lastSeen: new Date()
  };

  useEffect(() => {
    // Load collaboration sessions
    loadSessions();
    
    // Setup WebSocket connection for real-time updates
    setupRealtimeConnection();
    
    return () => {
      // Cleanup WebSocket
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSessions = () => {
    // Simulate loading sessions
    const mockSessions: CollaborationSession[] = [
      {
        id: '1',
        name: 'Fitness Progress Tracking',
        participants: [
          currentUser,
          {
            id: '2',
            name: 'Alex Smith',
            role: 'collaborator',
            status: 'online',
            lastSeen: new Date()
          },
          {
            id: '3',
            name: 'Jordan Lee',
            role: 'viewer',
            status: 'away',
            lastSeen: new Date(Date.now() - 300000)
          }
        ],
        measurements: [],
        createdAt: new Date(),
        isActive: true
      }
    ];
    setSessions(mockSessions);
  };

  const setupRealtimeConnection = () => {
    // In a real implementation, this would setup WebSocket/Socket.IO
    console.log('Setting up real-time collaboration connection...');
  };

  const createSession = () => {
    const newSession: CollaborationSession = {
      id: Date.now().toString(),
      name: `Session ${sessions.length + 1}`,
      participants: [currentUser],
      measurements: [],
      createdAt: new Date(),
      isActive: true
    };
    
    setSessions([...sessions, newSession]);
    setCurrentSession(newSession);
    toast({
      title: "Session Created",
      description: "New collaboration session started"
    });
  };

  const joinSession = (session: CollaborationSession) => {
    setCurrentSession(session);
    // Load session messages
    loadSessionMessages(session.id);
  };

  const loadSessionMessages = (sessionId: string) => {
    // Simulate loading messages
    const mockMessages: Message[] = [
      {
        id: '1',
        userId: '2',
        content: 'Hey! Ready to track our progress together?',
        timestamp: new Date(Date.now() - 600000),
        type: 'text'
      },
      {
        id: '2',
        userId: 'current-user',
        content: 'Absolutely! Just took my latest measurements.',
        timestamp: new Date(Date.now() - 300000),
        type: 'text'
      }
    ];
    setMessages(mockMessages);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !currentSession) return;

    const message: Message = {
      id: Date.now().toString(),
      userId: currentUser.id,
      content: newMessage.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    setMessages([...messages, message]);
    setNewMessage("");
    
    // In real implementation, send via WebSocket
    console.log('Sending message:', message);
  };

  const inviteUser = () => {
    if (!inviteEmail.trim() || !currentSession) return;

    // Simulate sending invitation
    toast({
      title: "Invitation Sent",
      description: `Invited ${inviteEmail} to join the session`
    });
    setInviteEmail("");
  };

  const startVideoCall = () => {
    setIsVideoCall(true);
    toast({
      title: "Video Call Started",
      description: "Participants will be notified"
    });
  };

  const shareMeasurement = (measurement: any) => {
    if (!currentSession) return;

    const message: Message = {
      id: Date.now().toString(),
      userId: currentUser.id,
      content: `Shared measurement: ${measurement.length}" length, ${measurement.girth}" girth`,
      timestamp: new Date(),
      type: 'measurement'
    };

    setMessages([...messages, message]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'default';
      case 'collaborator': return 'secondary';
      case 'viewer': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
      {/* Sessions Sidebar */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Sessions
            </CardTitle>
            <Button onClick={createSession} size="sm">
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 p-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted ${
                    currentSession?.id === session.id ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
                  }`}
                  onClick={() => joinSession(session)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{session.name}</h4>
                    {session.isActive && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {session.participants.length} participants
                  </div>
                  <div className="flex -space-x-2 mt-2">
                    {session.participants.slice(0, 3).map((participant) => (
                      <Avatar key={participant.id} className="w-6 h-6 border border-background">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback className="text-xs">
                          {participant.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {session.participants.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-muted border border-background flex items-center justify-center text-xs">
                        +{session.participants.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Collaboration Area */}
      <div className="lg:col-span-3 space-y-6">
        {currentSession ? (
          <>
            {/* Session Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      {currentSession.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentSession.participants.length} participants
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={startVideoCall} variant="outline" size="sm">
                      <Video className="w-4 h-4 mr-2" />
                      Video Call
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {currentSession.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1">
                      <div className="relative">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback className="text-xs">
                            {participant.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(participant.status)}`} />
                      </div>
                      <span className="text-sm">{participant.name}</span>
                      <Badge variant={getRoleColor(participant.role) as any} className="text-xs">
                        {participant.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-lg">Chat & Measurements</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] p-4">
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const sender = currentSession.participants.find(p => p.id === message.userId);
                      const isCurrentUser = message.userId === currentUser.id;
                      
                      return (
                        <div key={message.id} className={`flex gap-3 ${isCurrentUser ? 'justify-end' : ''}`}>
                          {!isCurrentUser && (
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={sender?.avatar} />
                              <AvatarFallback className="text-xs">
                                {sender?.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`max-w-[70%] ${isCurrentUser ? 'order-first' : ''}`}>
                            <div className={`p-3 rounded-lg ${
                              isCurrentUser 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            } ${message.type === 'measurement' ? 'border-l-4 border-l-accent' : ''}`}>
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <Separator />
                
                <div className="p-4">
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      Send
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Invite by email..."
                      className="flex-1"
                    />
                    <Button onClick={inviteUser} variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Invite
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="flex-1">
            <CardContent className="flex items-center justify-center h-[500px]">
              <div className="text-center">
                <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Session Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Select a session or create a new one to start collaborating
                </p>
                <Button onClick={createSession}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create New Session
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};