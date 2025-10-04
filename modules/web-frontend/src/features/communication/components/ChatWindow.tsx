import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService } from '../services/messageService';
import { useAuthStore } from '../../../store/authStore';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { formatDistanceToNow } from 'date-fns';

interface ChatWindowProps {
  partnerId: string;
  partnerName: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ partnerId, partnerName }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const { data: conversationData } = useQuery({
    queryKey: ['conversation', partnerId],
    queryFn: () => messageService.getConversation(partnerId),
  });

  // WebSocket for real-time messages
  const handleNewMessage = useCallback((newMessage: any) => {
    if (newMessage.senderId === partnerId || newMessage.receiverId === partnerId) {
      queryClient.invalidateQueries({ queryKey: ['conversation', partnerId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  }, [partnerId, queryClient]);

  const { connected, sendMessage: sendViaWebSocket } = useWebSocket(
    user?.id || user?.email || '', 
    handleNewMessage
  );

  const sendMutation = useMutation({
    mutationFn: (content: string) => messageService.sendMessage(partnerId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', partnerId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessage('');
    },
  });

  // Mark messages as read when viewing conversation
  useEffect(() => {
    messageService.markAsRead(partnerId);
  }, [partnerId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationData]);

  const messages = conversationData?.data?.content || [];

  const handleSend = () => {
    if (message.trim()) {
      if (connected) {
        // Use WebSocket if connected
        sendViaWebSocket(partnerId, message);
        setMessage('');
        // Still call REST API as fallback
        sendMutation.mutate(message);
      } else {
        // Fallback to REST API
        sendMutation.mutate(message);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white flex items-center justify-between">
        <h2 className="text-xl font-semibold">{partnerName}</h2>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-sm text-gray-600">
            {connected ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.reverse().map((msg: any) => {
          const isOwn = msg.senderId === user?.id || msg.senderId === user?.email;
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                <div
                  className={`px-4 py-2 rounded-lg ${
                    isOwn ? 'bg-primary-600 text-white' : 'bg-white text-gray-900'
                  }`}
                >
                  <p className="break-words">{msg.content}</p>
                </div>
                <p className={`text-xs mt-1 ${isOwn ? 'text-right' : 'text-left'} text-gray-500`}>
                  {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || sendMutation.isPending}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
