import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService } from '../services/messageService';
import { useAuthStore } from '../../../store/authStore';
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

  const { data: conversationData, isLoading, error } = useQuery({
    queryKey: ['conversation', partnerId],
    queryFn: () => messageService.getConversation(partnerId),
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => messageService.sendMessage(partnerId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', partnerId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessage('');
    },
  });

  useEffect(() => {
    messageService.markAsRead(partnerId).catch(console.error);
  }, [partnerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationData]);

  const messages = conversationData?.data?.content || [];

  const handleSend = () => {
    if (message.trim()) {
      sendMutation.mutate(message);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    try {
      // Parse the timestamp and convert to local time
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return 'just now';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error loading messages: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-white">
        <h2 className="text-xl font-semibold">{partnerName}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.slice().reverse().map((msg: any) => {
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
                    {msg.createdAt && formatMessageTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

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
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
