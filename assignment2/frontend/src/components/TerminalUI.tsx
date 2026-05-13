'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Terminal, Shield, Ghost, Activity, Send } from 'lucide-react';
import { encryptMessage, decryptMessage } from '@/lib/crypto';

interface Message {
  sender: string;
  text: string;
  timestamp: string;
}

interface PulseEvent {
  type: 'AUTH' | 'SOCKET' | 'REDIS' | 'GHOST';
  message: string;
  timestamp: string;
}

export default function TerminalUI({ user, idToken }: { user: any; idToken: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pulseLogs, setPulseLogs] = useState<PulseEvent[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, string>>({});
  const [inputText, setInputText] = useState('');
  const [targetUid, setTargetUid] = useState('global');
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('authenticate', { uid: user.uid, name: user.displayName });
    });

    newSocket.on('receive_message', (msg: Message & { room: string }) => {
      // Decrypt message text
      const decryptedText = decryptMessage(msg.text);
      const decryptedMsg = { ...msg, text: decryptedText };

      // Only show messages for current chat or global
      const currentRoom = [user.uid, targetUid].sort().join('_');
      if (msg.room === currentRoom || targetUid === 'global') {
        setMessages(prev => [...prev, decryptedMsg]);
      }
    });

    newSocket.on('presence_update', (users: Record<string, string>) => {
      setOnlineUsers(users);
      setPulseLogs(prev => [...prev, {
        type: 'SOCKET',
        message: `Presence update: ${Object.keys(users).length} users online.`,
        timestamp: new Date().toISOString()
      }]);
    });

    newSocket.on('system_pulse', (event: PulseEvent) => {
      setPulseLogs(prev => [...prev, event]);
    });

    newSocket.on('ghost_wipe', ({ room }: { room: string }) => {
      const currentRoom = [user.uid, targetUid].sort().join('_');
      if (room === currentRoom || room === 'global') {
        setMessages([]);
        setPulseLogs(prev => [...prev, {
          type: 'GHOST',
          message: `TTL reached 0 for room ${room}. Memory purged.`,
          timestamp: new Date().toISOString()
        }]);
      }
    });

    newSocket.on('history_wipe', ({ room, history }: { room: string; history: Message[] }) => {
      const decryptedHistory = history.map(msg => ({
        ...msg,
        text: decryptMessage(msg.text)
      }));
      setMessages(decryptedHistory);
      setPulseLogs(prev => [...prev, {
        type: 'REDIS',
        message: `Atomic Read-Once: ${history.length} messages retrieved and purged.`,
        timestamp: new Date().toISOString()
      }]);
    });

    return () => {
      newSocket.close();
    };
  }, [targetUid, user.uid, user.displayName]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const pulseEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    pulseEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [pulseLogs]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socket) return;

    // Encrypt message text
    const encryptedText = encryptMessage(inputText);

    socket.emit('send_message', {
      targetUid,
      text: encryptedText
    });
    setInputText('');
  };

  const joinChat = (uid: string) => {
    setTargetUid(uid);
    setMessages([]); // Clear local view when switching rooms
    socket?.emit('join_room', { targetUid: uid });
  };

  return (
    <div className="terminal-container">
      <header className="terminal-header">
        <div className="header-left">
          <Terminal size={18} />
          <span>GHOST_PROTOCOL_v1.0.4</span>
        </div>
        <div className="header-right">
          <Activity size={14} className="pulse-icon" />
          <span>SESSION_ACTIVE: {user.displayName?.toUpperCase()}</span>
        </div>
      </header>

      <main className="terminal-main">
        {/* Ghost Chat Pane */}
        <section className="pane chat-pane">
          <div className="pane-header">
            <Ghost size={16} />
            <h2>GHOST_CHAT {targetUid !== 'global' ? `(${targetUid})` : ''}</h2>
            <div className="presence-chips">
              <button onClick={() => joinChat('global')} className={targetUid === 'global' ? 'active' : ''}>GLOBAL</button>
              {Object.keys(onlineUsers).filter(uid => uid !== user.uid).map(uid => (
                <button key={uid} onClick={() => joinChat(uid)} className={targetUid === uid ? 'active' : ''}>
                  {uid.slice(0, 6)}
                </button>
              ))}
            </div>
          </div>
          <div className="message-list">
            {messages.length === 0 && (
              <div className="empty-state">NO_MESSAGES_IN_VOLATILE_STORAGE</div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className="message-line">
                <span className="timestamp">[{new Date(msg.timestamp).toLocaleTimeString()}]</span>
                <span className="sender">[{msg.sender}]:</span>
                <span className="text">{msg.text}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="input-area">
            <span className="prompt">&gt;</span>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type message..."
              autoFocus
            />
            <button type="submit"><Send size={16} /></button>
          </form>
        </section>

        {/* System Pulse Monitor Pane */}
        <section className="pane pulse-pane">
          <div className="pane-header">
            <Shield size={16} />
            <h2>SYSTEM_PULSE_MONITOR</h2>
          </div>
          <div className="log-list">
            {pulseLogs.map((log, i) => (
              <div key={i} className={`log-line type-${log.type.toLowerCase()}`}>
                <span className="log-type">[{log.type}]</span>
                <span className="log-msg">{log.message}</span>
                <span className="log-time">{new Date(log.timestamp).toISOString()}</span>
              </div>
            ))}
            <div ref={pulseEndRef} />
          </div>
        </section>
      </main>

      <style jsx>{`
        .terminal-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #0a0a0a;
          color: #00ff41;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          padding: 1rem;
          box-sizing: border-box;
        }

        .terminal-header {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 1rem;
          background: #1a1a1a;
          border: 1px solid #333;
          font-size: 0.8rem;
          margin-bottom: 1rem;
        }

        .header-left, .header-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .pulse-icon {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }

        .terminal-main {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          flex: 1;
          min-height: 0;
        }

        .pane {
          display: flex;
          flex-direction: column;
          background: #050505;
          border: 1px solid #222;
          border-radius: 4px;
          overflow: hidden;
        }

        .pane-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #111;
          border-bottom: 1px solid #222;
        }

        .pane-header h2 {
          font-size: 0.9rem;
          margin: 0;
          letter-spacing: 1px;
          flex: 1;
        }

        .presence-chips {
          display: flex;
          gap: 0.5rem;
        }

        .presence-chips button {
          font-size: 0.65rem;
          padding: 0.2rem 0.5rem;
          background: #111;
          border: 1px solid #333;
          color: #555;
          border-radius: 2px;
        }

        .presence-chips button.active {
          color: #00ff41;
          border-color: #00ff41;
          background: #00ff4111;
        }

        .message-list, .log-list {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          font-size: 0.85rem;
          line-height: 1.4;
        }

        .message-line {
          margin-bottom: 0.2rem;
          word-break: break-all;
        }

        .timestamp { color: #555; margin-right: 0.5rem; }
        .sender { color: #008f11; font-weight: bold; margin-right: 0.5rem; }
        .text { color: #00ff41; }

        .empty-state {
          color: #333;
          text-align: center;
          margin-top: 2rem;
          font-style: italic;
        }

        .input-area {
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background: #111;
          border-top: 1px solid #222;
          gap: 0.5rem;
        }

        .prompt { color: #00ff41; font-weight: bold; }

        input {
          flex: 1;
          background: transparent;
          border: none;
          color: #00ff41;
          font-family: inherit;
          font-size: 0.9rem;
          outline: none;
        }

        button {
          background: transparent;
          border: none;
          color: #008f11;
          cursor: pointer;
          transition: color 0.2s;
        }

        button:hover { color: #00ff41; }

        .log-line {
          margin-bottom: 0.4rem;
          display: flex;
          flex-direction: column;
          font-size: 0.75rem;
          border-left: 2px solid #333;
          padding-left: 0.5rem;
        }

        .log-type { font-weight: bold; margin-bottom: 0.1rem; }
        .log-msg { color: #888; }
        .log-time { color: #444; font-size: 0.65rem; }

        .type-auth { border-color: #00ff41; }
        .type-socket { border-color: #008f11; }
        .type-redis { border-color: #bc13fe; }
        .type-ghost { border-color: #ff0000; }

        /* Scrollbar Styling */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #333; }
      `}</style>
    </div>
  );
}
