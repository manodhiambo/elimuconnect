import React from 'react';
import { MessageSquare } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface ConversationListProps {
  conversations: any[];
  selectedPartnerId: string | null;
  onSelectConversation: (partnerId: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedPartnerId,
  onSelectConversation,
}) => {
  return (
    <div className="h-full overflow-y-auto">
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <MessageSquare className="w-12 h-12 mb-2" />
          <p>No conversations yet</p>
        </div>
      ) : (
        conversations.map((conv) => (
          <div
            key={conv.partnerId}
            onClick={() => onSelectConversation(conv.partnerId)}
            className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
              selectedPartnerId === conv.partnerId ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{conv.partnerName}</h3>
                  {conv.unreadCount > 0 && (
                    <span className="ml-2 px-2 py-1 text-xs font-bold text-white bg-primary-600 rounded-full">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(parseISO(conv.lastMessageTime), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
