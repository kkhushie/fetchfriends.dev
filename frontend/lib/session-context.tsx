// lib/session-context.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./auth-context";
import { socketClient } from "./socket/client";
import { apiClient } from "./api/client";

interface SessionContextType {
  currentSession: any | null;
  isInSession: boolean;
  isSearching: boolean;
  queueStatus: any | null;
  joinSession: (sessionId: string) => Promise<void>;
  leaveSession: () => Promise<void>;
  startSearch: (mode: string, params?: any) => Promise<void>;
  stopSearch: () => Promise<void>;
  acceptMatch: (sessionId: string) => Promise<void>;
  declineMatch: (sessionId: string) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, token } = useAuth();
  const [currentSession, setCurrentSession] = useState<any | null>(null);
  const [isInSession, setIsInSession] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [queueStatus, setQueueStatus] = useState<any | null>(null);
  const [matchFound, setMatchFound] = useState<any | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    // Connect socket
    socketClient.connect(token);

    // Listen for match found
    socketClient.getSocket()?.on('match:found', (data: any) => {
      setMatchFound(data);
      setIsSearching(false);
    });

    // Listen for session updates
    socketClient.getSocket()?.on('session:user-joined', (data: any) => {
      console.log('User joined session:', data);
    });

    socketClient.getSocket()?.on('session:user-left', (data: any) => {
      console.log('User left session:', data);
    });

    // Check existing queue status
    checkQueueStatus();

    return () => {
      socketClient.disconnect();
    };
  }, [isAuthenticated, token]);

  const checkQueueStatus = async () => {
    try {
      const status = await apiClient.getQueueStatus();
      if (status.inQueue) {
        setIsSearching(true);
        setQueueStatus(status.queue);
        if (status.queue?._id) {
          socketClient.subscribeToQueue(status.queue._id);
        }
      }
    } catch (error) {
      console.error('Error checking queue status:', error);
    }
  };

  const startSearch = async (mode: string, params?: any) => {
    try {
      const response = await apiClient.joinQueue(mode, params);
      setIsSearching(true);
      setQueueStatus(response.queue);
      
      if (response.queue?._id) {
        socketClient.subscribeToQueue(response.queue._id);
      }

      // Poll for status updates
      const interval = setInterval(async () => {
        try {
          const status = await apiClient.getQueueStatus();
          if (status.inQueue && status.queue) {
            setQueueStatus(status.queue);
          } else {
            clearInterval(interval);
            setIsSearching(false);
          }
        } catch (error) {
          console.error('Error polling queue status:', error);
        }
      }, 2000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error starting search:', error);
      throw error;
    }
  };

  const stopSearch = async () => {
    try {
      await apiClient.leaveQueue();
      setIsSearching(false);
      setQueueStatus(null);
      socketClient.unsubscribeFromQueue();
    } catch (error) {
      console.error('Error stopping search:', error);
    }
  };

  const acceptMatch = async (sessionId: string) => {
    try {
      const response = await apiClient.acceptMatch(sessionId);
      setCurrentSession(response.session);
      setIsInSession(true);
      setMatchFound(null);
      
      // Join session room
      socketClient.joinSession(sessionId);
      
      // Load session details
      const session = await apiClient.getSession(sessionId);
      setCurrentSession(session.session);
    } catch (error) {
      console.error('Error accepting match:', error);
      throw error;
    }
  };

  const declineMatch = async (sessionId: string) => {
    try {
      await apiClient.declineMatch(sessionId);
      setMatchFound(null);
      // Optionally restart search
    } catch (error) {
      console.error('Error declining match:', error);
    }
  };

  const joinSession = async (sessionId: string) => {
    try {
      await apiClient.joinSession(sessionId);
      socketClient.joinSession(sessionId);
      const session = await apiClient.getSession(sessionId);
      setCurrentSession(session.session);
      setIsInSession(true);
    } catch (error) {
      console.error('Error joining session:', error);
      throw error;
    }
  };

  const leaveSession = async () => {
    try {
      if (currentSession) {
        await apiClient.leaveSession(currentSession._id || currentSession.roomId);
        socketClient.leaveSession(currentSession._id || currentSession.roomId);
      }
      setCurrentSession(null);
      setIsInSession(false);
    } catch (error) {
      console.error('Error leaving session:', error);
    }
  };

  return (
    <SessionContext.Provider
      value={{
        currentSession,
        isInSession,
        isSearching,
        queueStatus,
        joinSession,
        leaveSession,
        startSearch,
        stopSearch,
        acceptMatch,
        declineMatch,
      }}
    >
      {children}
      {matchFound && (
        <MatchFoundModal
          match={matchFound}
          onAccept={() => acceptMatch(matchFound.sessionId)}
          onDecline={() => declineMatch(matchFound.sessionId)}
          onRemindLater={() => setMatchFound(null)}
        />
      )}
    </SessionContext.Provider>
  );
}

// MatchFoundModal component
function MatchFoundModal({ match, onAccept, onDecline, onRemindLater }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-vscode-green rounded-full flex items-center justify-center">
              <span className="text-white text-xl">✓</span>
            </div>
            <div>
              <h3 className="text-lg font-mono text-vscode-text">
                Match Found!
              </h3>
              <p className="text-sm text-vscode-text-secondary font-mono">
                Ready to code together?
              </p>
            </div>
          </div>

          <div className="bg-[#1e1e1e] p-4 rounded mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-vscode-blue rounded-full flex items-center justify-center">
                <span className="text-white font-mono">
                  {match.partner?.profile?.name?.[0] || 'U'}
                </span>
              </div>
              <div>
                <p className="text-vscode-text font-mono font-semibold">
                  {match.partner?.profile?.name || 'Developer'}
                </p>
                <p className="text-vscode-text-secondary font-mono text-xs">
                  {match.partner?.profile?.github?.username && `@${match.partner.profile.github.username}`}
                </p>
              </div>
            </div>
            {match.matchScore && (
              <div className="mt-3 pt-3 border-t border-[#3c3c3c]">
                <div className="text-xs text-vscode-text-secondary font-mono">
                  Match Score: <span className="text-vscode-green">{match.matchScore}%</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onAccept}
              className="flex-1 px-4 py-2 bg-vscode-green hover:bg-[#3da88a] rounded text-white font-mono text-sm"
            >
              Accept
            </button>
            <button
              onClick={onDecline}
              className="flex-1 px-4 py-2 bg-[#2d2d30] hover:bg-[#3c3c3c] rounded text-vscode-text font-mono text-sm"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}

