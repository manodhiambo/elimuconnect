import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Search, 
  Plus, 
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Info,
  Archive,
  Trash2,
  Circle,
  MessageCircle,
  Users,
  User,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Dummy data for demonstration
  const dummyConversations = [
    {
      id: 1,
      type: 'direct',
      name: 'Mr. Peter Mwangi',
      avatar: '/api/placeholder/40/40',
      role: 'Teacher',
      school: 'Alliance High School',
      subject: 'Mathematics',
      lastMessage: 'Good job on the last assignment! Keep it up.',
      lastMessageTime: '2024-01-15T14:30:00Z',
      unreadCount: 0,
      isOnline: true,
      participants: [
        { id: 1, name: 'Mr. Peter Mwangi', role: 'Teacher' },
        { id: 2, name: user?.profile?.firstName || 'You', role: 'Student' }
      ]
    },
    {
      id: 2,
      type: 'direct',
      name: 'Mary Wanjiku',
      avatar: '/api/placeholder/40/40',
      role: 'Student',
      school: 'Alliance Girls High School',
      lastMessage: 'Did you understand the quadratic equations lesson?',
      lastMessageTime: '2024-01-15T12:45:00Z',
      unreadCount: 2,
      isOnline: false,
      participants: [
        { id: 3, name: 'Mary Wanjiku', role: 'Student' },
        { id: 2, name: user?.profile?.firstName || 'You', role: 'Student' }
      ]
    },
    {
      id: 3,
      type: 'group',
      name: 'Form 3 Mathematics Study Group',
      avatar: '/api/placeholder/40/40',
      lastMessage: 'John: Can someone explain logarithms?',
      lastMessageTime: '2024-01-15T11:20:00Z',
      unreadCount: 5,
      isOnline: null,
      participants: [
        { id: 2, name: user?.profile?.firstName || 'You', role: 'Student' },
        { id: 3, name: 'Mary Wanjiku', role: 'Student' },
        { id: 4, name: 'John Kamau', role: 'Student' },
        { id: 5, name: 'Grace Akinyi', role: 'Student' },
        { id: 1, name: 'Mr. Peter Mwangi', role: 'Teacher' }
      ]
    },
    {
      id: 4,
      type: 'direct',
      name: 'Dr. Sarah Njeri',
      avatar: '/api/placeholder/40/40',
      role: 'Teacher',
      school: 'Starehe Boys Centre',
      subject: 'Biology',
      lastMessage: 'The assignment deadline has been extended to Friday.',
      lastMessageTime: '2024-01-14T16:15:00Z',
      unreadCount: 1,
      isOnline: false,
      participants: [
        { id: 6, name: 'Dr. Sarah Njeri', role: 'Teacher' },
        { id: 2, name: user?.profile?.firstName || 'You', role: 'Student' }
      ]
    }
  ];

  const dummyMessages = [
    {
      id: 1,
      conversationId: 1,
      senderId: 1,
      senderName: 'Mr. Peter Mwangi',
      content: 'Hello! How are you finding the current mathematics topics?',
      timestamp: '2024-01-15T10:00:00Z',
      type: 'text',
      isRead: true
    },
    {
      id: 2,
      conversationId: 1,
      senderId: 2,
      senderName: user?.profile?.firstName || 'You',
      content: 'Hi sir! I\'m doing well with algebra, but I\'m struggling a bit with geometry.',
      timestamp: '2024-01-15T10:05:00Z',
      type: 'text',
      isRead: true
    },
    {
      id: 3,
      conversationId: 1,
      senderId: 1,
      senderName: 'Mr. Peter Mwangi',
      content: 'That\'s perfectly normal. Geometry can be challenging at first. Would you like me to share some additional practice problems?',
      timestamp: '2024-01-15T10:10:00Z',
      type: 'text',
      isRead: true
    },
    {
      id: 4,
      conversationId: 1,
      senderId: 2,
      senderName: user?.profile?.firstName || 'You',
      content: 'Yes please! That would be very helpful.',
      timestamp: '2024-01-15T10:12:00Z',
      type: 'text',
      isRead: true
    },
    {
      id: 5,
      conversationId: 1,
      senderId: 1,
      senderName: 'Mr. Peter Mwangi',
      content: 'Good job on the last assignment! Keep it up.',
      timestamp: '2024-01-15T14:30:00Z',
      type: 'text',
      isRead: false
    }
  ];

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setConversations(dummyConversations);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      // Simulate API call
      const conversationMessages = dummyMessages.filter(
        msg => msg.conversationId === conversationId
      );
      setMessages(conversationMessages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message = {
      id: Date.now(),
      conversationId: selectedConversation.id,
      senderId: user?.id || 2,
      senderName: user?.profile?.firstName || 'You',
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text',
      isRead: false
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Update conversation's last message
    setConversations(prev =>
      prev.map(conv =>
        conv.id === selectedConversation.id
          ? { ...conv, lastMessage: message.content, lastMessageTime: message.timestamp }
          : conv
      )
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ConversationItem = ({ conversation }) => (
    <div
      onClick={() => {
        setSelectedConversation(conversation);
        setShowMobileChat(true);
      }}
      className={`p-4 cursor-pointer border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
        selectedConversation?.id === conversation.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
            {conversation.type === 'group' ? (
              <Users className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            ) : (
              <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            )}
          </div>
          {conversation.isOnline && conversation.type === 'direct' && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {conversation.name}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(conversation.lastMessageTime)}
              </span>
              {conversation.unreadCount > 0 && (
                <div className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {conversation.unreadCount}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {conversation.lastMessage}
            </p>
            {conversation.role && (
              <span className={`text-xs px-2 py-1 rounded ${
                conversation.role === 'Teacher'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }`}>
                {conversation.role}
              </span>
            )}
          </div>
          
          {conversation.school && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {conversation.school}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const MessageBubble = ({ message }) => {
    const isOwn = message.senderId === (user?.id || 2);
    
    return (
      <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwn
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
        }`}>
          {!isOwn && selectedConversation?.type === 'group' && (
            <p className="text-xs font-medium mb-1 opacity-70">
              {message.senderName}
            </p>
          )}
          <p className="text-sm">{message.content}</p>
          <p className={`text-xs mt-1 ${
            isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    );
  };

  const ChatHeader = () => (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowMobileChat(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="relative">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              {selectedConversation?.type === 'group' ? (
                <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              )}
            </div>
            {selectedConversation?.isOnline && selectedConversation?.type === 'direct' && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
            )}
          </div>
          
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {selectedConversation?.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedConversation?.type === 'group'
                ? `${selectedConversation.participants?.length} members`
                : selectedConversation?.isOnline ? 'Online' : 'Offline'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <Phone className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <Video className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <Info className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Messages - ElimuConnect</title>
        <meta name="description" content="Direct messaging with students and teachers" />
      </Helmet>

      <div className="h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 flex">
        {/* Conversations Sidebar */}
        <div className={`w-full lg:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col ${
          showMobileChat ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Messages
              </h1>
              <button
                onClick={() => setShowNewChat(true)}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">No conversations found</p>
              </div>
            ) : (
              filteredConversations.map(conversation => (
                <ConversationItem key={conversation.id} conversation={conversation} />
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${
          !selectedConversation ? 'hidden lg:flex' : ''
        } ${showMobileChat || !selectedConversation ? 'flex' : 'hidden lg:flex'}`}>
          {selectedConversation ? (
            <>
              <ChatHeader />
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map(message => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-4">
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      rows={1}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                    />
                  </div>
                  
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <Smile className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className={`p-2 rounded-lg ${
                      newMessage.trim()
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No conversation selected
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a conversation from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Messages;
