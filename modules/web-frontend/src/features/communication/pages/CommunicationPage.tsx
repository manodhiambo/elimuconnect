import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { messageService } from '../services/messageService';
import { ConversationList } from '../components/ConversationList';
import { ChatWindow } from '../components/ChatWindow';
import { MessageSquare, Plus } from 'lucide-react';
import { apiClient } from '../../../lib/axios';

export const CommunicationPage = () => {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [showUserList, setShowUserList] = useState(false);

  const { data: conversationsData } = useQuery({
    queryKey: ['conversations'],
    queryFn: messageService.getConversations,
    refetchInterval: 5000,
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiClient.get('/student/users');
      return response.data;
    },
    enabled: showUserList,
  });

  const conversations = conversationsData?.data?.conversations || [];
  const selectedConversation = conversations.find((c: any) => c.partnerId === selectedPartnerId);
  const users = usersData?.data || [];

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-12 h-full">
        {/* Conversations List */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3 border-r bg-white">
          <div className="p-4 border-b flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              Messages
            </h1>
            <button
              onClick={() => setShowUserList(!showUserList)}
              className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {showUserList ? (
            <div className="p-4">
              <h3 className="font-semibold mb-2">Start New Conversation</h3>
              <div className="space-y-2">
                {users.map((user: any) => (
                  <div
                    key={user.id}
                    onClick={() => {
                      setSelectedPartnerId(user.id);
                      setShowUserList(false);
                    }}
                    className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.role}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowUserList(false)}
                className="mt-4 text-sm text-primary-600 hover:underline"
              >
                Back to conversations
              </button>
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              selectedPartnerId={selectedPartnerId}
              onSelectConversation={setSelectedPartnerId}
            />
          )}
        </div>

        {/* Chat Window */}
        <div className="col-span-12 md:col-span-8 lg:col-span-9">
          {selectedPartnerId ? (
            <ChatWindow
              partnerId={selectedPartnerId}
              partnerName={selectedConversation?.partnerName || users.find((u: any) => u.id === selectedPartnerId)?.name || 'User'}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>Select a conversation or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
