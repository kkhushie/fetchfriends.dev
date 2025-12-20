import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class SocketClient {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    this.token = token;

    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.socket?.emit('user:online');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Session events
  joinSession(sessionId: string) {
    this.socket?.emit('session:join', sessionId);
  }

  leaveSession(sessionId: string) {
    this.socket?.emit('session:leave', sessionId);
  }

  // Code collaboration
  onCodeChange(handler: (data: any) => void) {
    this.socket?.on('code:change', handler);
  }

  emitCodeChange(sessionId: string, file: string, change: any) {
    this.socket?.emit('code:change', { sessionId, file, change });
  }

  onCodeSave(handler: (data: any) => void) {
    this.socket?.on('code:save', handler);
  }

  emitCodeSave(sessionId: string, file: string, content: string) {
    this.socket?.emit('code:save', { sessionId, file, content });
  }

  // Terminal
  onTerminalCommand(handler: (data: any) => void) {
    this.socket?.on('terminal:command', handler);
  }

  emitTerminalCommand(sessionId: string, command: string) {
    this.socket?.emit('terminal:command', { sessionId, command });
  }

  onTerminalOutput(handler: (data: any) => void) {
    this.socket?.on('terminal:output', handler);
  }

  emitTerminalOutput(sessionId: string, output: string) {
    this.socket?.emit('terminal:output', { sessionId, output });
  }

  // Chat
  onChatMessage(handler: (data: any) => void) {
    this.socket?.on('chat:message', handler);
  }

  emitChatMessage(sessionId: string, message: string, type: string = 'text') {
    this.socket?.emit('chat:message', { sessionId, message, type });
  }

  onChatTyping(handler: (data: any) => void) {
    this.socket?.on('chat:typing', handler);
  }

  emitChatTyping(sessionId: string, isTyping: boolean) {
    this.socket?.emit('chat:typing', { sessionId, isTyping });
  }

  // WebRTC
  onWebRTCOffer(handler: (data: any) => void) {
    this.socket?.on('webrtc:offer', handler);
  }

  emitWebRTCOffer(sessionId: string, offer: any, to: string) {
    this.socket?.emit('webrtc:offer', { sessionId, offer, to });
  }

  onWebRTCAnswer(handler: (data: any) => void) {
    this.socket?.on('webrtc:answer', handler);
  }

  emitWebRTCAnswer(sessionId: string, answer: any, to: string) {
    this.socket?.emit('webrtc:answer', { sessionId, answer, to });
  }

  onWebRTCIceCandidate(handler: (data: any) => void) {
    this.socket?.on('webrtc:ice-candidate', handler);
  }

  emitWebRTCIceCandidate(sessionId: string, candidate: any, to: string) {
    this.socket?.emit('webrtc:ice-candidate', { sessionId, candidate, to });
  }

  // Queue
  subscribeToQueue(queueId: string) {
    this.socket?.emit('queue:subscribe', queueId);
  }

  unsubscribeFromQueue(queueId: string) {
    this.socket?.emit('queue:unsubscribe', queueId);
  }

  // User status
  onUserStatus(handler: (data: any) => void) {
    this.socket?.on('user:status', handler);
  }

  // Session events
  onUserJoined(handler: (data: any) => void) {
    this.socket?.on('session:user-joined', handler);
  }

  onUserLeft(handler: (data: any) => void) {
    this.socket?.on('session:user-left', handler);
  }

  // Error handling
  onError(handler: (error: any) => void) {
    this.socket?.on('error', handler);
  }

  // Remove listeners
  off(event: string, handler?: any) {
    this.socket?.off(event, handler);
  }
}

export const socketClient = new SocketClient();

