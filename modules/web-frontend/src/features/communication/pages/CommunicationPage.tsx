import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { messageService } from '../services/messageService';
import { ConversationList } from '../components/ConversationList';
import { ChatWindow } from '../components/ChatWindow';
import { MessageSquare } from 'lucide-react';

export const CommunicationPage = () => {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);

  const { data: conversationsData, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: messageService.getConversations,
    refetchInterval: 5000, // Refresh conversation list every 5 seconds
  });

  const conversations = conversationsData?.data?.conversations || [];
  const selectedConversation = conversations.find((c: any) => c.partnerId === selectedPartnerId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-12 h-full">
        {/* Conversations List */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3 border-r bg-white">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              Messages
            </h1>
          </div>
          <ConversationList
            conversations={conversations}
            selectedPartnerId={selectedPartnerId}
            onSelectConversation={setSelectedPartnerId}
          />
        </div>

        {/* Chat Window */}
        <div className="col-span-12 md:col-span-8 lg:col-span-9">
          {selectedPartnerId && selectedConversation ? (
            <ChatWindow
              partnerId={selectedPartnerId}
              partnerName={selectedConversation.partnerName}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
