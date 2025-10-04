import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8080';

export const useWebSocket = (userId: string, onMessageReceived: (message: any) => void) => {
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${WS_URL}/ws`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      onConnect: () => {
        console.log('WebSocket Connected');
        setConnected(true);
        
        // Subscribe to user's message queue
        client.subscribe(`/user/${userId}/queue/messages`, (message) => {
          const receivedMessage = JSON.parse(message.body);
          onMessageReceived(receivedMessage);
        });
      },
      
      onDisconnect: () => {
        console.log('WebSocket Disconnected');
        setConnected(false);
      },
      
      onStompError: (frame) => {
        console.error('WebSocket Error:', frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [userId, onMessageReceived]);

  const sendMessage = (receiverId: string, content: string) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({
          senderId: userId,
          receiverId,
          content,
        }),
      });
    }
  };

  return { connected, sendMessage };
};
