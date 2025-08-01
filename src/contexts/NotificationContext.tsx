// contexts/NotificationContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

interface NotificationMessage {
  id: string;
  chamadoOs: string;
  nomeCliente: string;
  motivo: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  messages: NotificationMessage[];
  unreadCount: number;
  addMessage: (
    message: Omit<NotificationMessage, 'id' | 'timestamp' | 'read'>
  ) => void;
  markAsRead: (messageId: string) => void;
  markAllAsRead: () => void;
  clearMessages: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [messages, setMessages] = useState<NotificationMessage[]>([]);

  // Carregar mensagens do localStorage ao inicializar
  useEffect(() => {
    const savedMessages = localStorage.getItem('notification_messages');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        // Converter timestamps de string para Date
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Erro ao carregar mensagens do localStorage:', error);
      }
    }
  }, []);

  // Salvar mensagens no localStorage sempre que mudarem
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('notification_messages', JSON.stringify(messages));
    }
  }, [messages]);

  const addMessage = (
    messageData: Omit<NotificationMessage, 'id' | 'timestamp' | 'read'>
  ) => {
    const newMessage: NotificationMessage = {
      ...messageData,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    setMessages(prev => [newMessage, ...prev]);

    // Opcional: Limitar o número máximo de mensagens
    setMessages(prev => prev.slice(0, 100));
  };

  const markAsRead = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg => (msg.id === messageId ? { ...msg, read: true } : msg))
    );
  };

  const markAllAsRead = () => {
    setMessages(prev => prev.map(msg => ({ ...msg, read: true })));
  };

  const clearMessages = () => {
    setMessages([]);
    localStorage.removeItem('notification_messages');
  };

  const unreadCount = messages.filter(msg => !msg.read).length;

  const value: NotificationContextType = {
    messages,
    unreadCount,
    addMessage,
    markAsRead,
    markAllAsRead,
    clearMessages,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotifications deve ser usado dentro de um NotificationProvider'
    );
  }
  return context;
}

// hooks/useNotificationSound.ts
import { useCallback } from 'react';

export function useNotificationSound() {
  const playNotificationSound = useCallback(() => {
    try {
      // Criar um som simples usando AudioContext
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Não foi possível reproduzir som de notificação:', error);
    }
  }, []);

  return { playNotificationSound };
}
