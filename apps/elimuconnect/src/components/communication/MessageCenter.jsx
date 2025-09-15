import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Info,
  Archive,
  Trash2,
  Star,
  Download,
  Image,
  File,
  Users,
  Circle,
  Check,
  CheckCheck,
  Pin,
  Edit,
  Reply,
  Forward,
  Copy,
  Ban,
  UserPlus,
  Settings,
  X,
  Plus,
  Filter
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '../common/LoadingSpinner';

const MessageCenter = () => {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [filter, setFilter] = useState('all'); // all, unread, starred, archived

  // Socket connection for real-time messaging
  useEffect(() => {
    // Initialize socket connection
    const initializeSocket = () => {
      // Socket setup would go here
      console.log('Socket initialized');
    };

    initializeSocket();
    return () => {
      // Cleanup socket connection
    };
  }, []);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await api.get('/messages/conversations');
        setConversations(response.data);
        if (response.data.length > 0 && !selectedConversation) {
          setSelectedConversation(response.data[0]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to load conversations:', error);
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  // Load messages for selected conversation
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversation) return;

      try {
        const response = await api.get(`/messages/${selectedConversation.id}`);
        setMessages(response.data);
        scrollToBottom();
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();
  }, [selectedConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const response = await api.post('/messages/send', {
        conversationId: selectedConversation.id,
        content: newMessage.trim(),
        type: 'text'
      });

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      
      // Update conversation list
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id
            ? { ...conv, lastMessage: response.data, updatedAt: new Date() }
            : conv
        )
      );
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !selectedConversation) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', selectedConversation.id);

    try {
      const response = await api.post('/messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessages(prev => [...prev, response.data]);
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  };

  const createNewConversation = async (participants) => {
    try {
      const response = await api.post('/messages/conversations/create', {
        participants,
        type: participants.length > 1 ? 'group' : 'direct'
      });

      setConversations(prev => [response.data, ...prev]);
      setSelectedConversation(response.data);
      setShowNewChat(false);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const starMessage = async (messageId) => {
    try {
      await api.post(`/messages/${messageId}/star`);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isStarred: !msg.isStarred }
            : msg
        )
      );
    } catch (error) {
      console.error('Failed to star message:', error);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.participants.some(p => 
                           p.name.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    switch (filter) {
      case 'unread':
        return matchesSearch && conv.unreadCount > 0;
      case 'starred':
        return matchesSearch && conv.isStarred;
      case 'archived':
        return matchesSearch && conv.isArchived;
      default:
        return matchesSearch && !conv.isArchived;
    }
  });

  const getMessageStatus = (message) => {
    if (message.senderId === user.id) {
      if (message.readBy?.length === selectedConversation.participants.length) {
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      } else if (message.deliveredTo?.length > 0) {
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      } else {
        return <Check className="w-3 h-3 text-gray-400" />;
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowNewChat(true)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-md">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 mt-3">
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'starred', label: 'Starred' }
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  filter === id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <motion.div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
              whileHover={{ backgroundColor: '#f9fafb' }}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  {conversation.type === 'group' ? (
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                  ) : (
                    <img
                      src={conversation.avatar || '/default-avatar.png'}
                      alt={conversation.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  {onlineUsers.has(conversation.participants[0]?.id) && (
                    <Circle className="w-3 h-3 text-green-500 fill-current absolute -bottom-0.5 -right-0.5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {conversation.name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.lastMessage?.content || 'No messages yet'}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center space-x-1">
                      {conversation.lastMessage && getMessageStatus(conversation.lastMessage)}
                      {conversation.isStarred && (
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      )}
                    </div>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {selectedConversation.type === 'group' ? (
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                  ) : (
                    <img
                      src={selectedConversation.avatar || '/default-avatar.png'}
                      alt={selectedConversation.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  {onlineUsers.has(selectedConversation.participants[0]?.id) && (
                    <Circle className="w-3 h-3 text-green-500 fill-current absolute -bottom-0.5 -right-0.5" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{selectedConversation.name}</h3>
                  <p className="text-sm text-gray-500">
                    {selectedConversation.type === 'group' 
                      ? `${selectedConversation.participants.length} members`
                      : onlineUsers.has(selectedConversation.participants[0]?.id) 
                        ? 'Online' 
                        : 'Last seen recently'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
                  <Video className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowUserInfo(!showUserInfo)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  <Info className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-md">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Typing Indicator */}
            {typingUsers.size > 0 && (
              <div className="mt-2 text-sm text-gray-500">
                {Array.from(typingUsers).join(', ')} 
                {typingUsers.size === 1 ? ' is' : ' are'} typing...
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => {
              const isOwn = message.senderId === user.id;
              const showAvatar = !isOwn && (
                index === 0 || 
                messages[index - 1].senderId !== message.senderId
              );

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {showAvatar && !isOwn && (
                      <img
                        src={message.sender.avatar || '/default-avatar.png'}
                        alt={message.sender.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    {!showAvatar && !isOwn && <div className="w-6" />}

                    <div
                      className={`px-4 py-2 rounded-lg ${
                        isOwn
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.type === 'text' ? (
                        <p className="text-sm">{message.content}</p>
                      ) : message.type === 'file' ? (
                        <div className="flex items-center space-x-2">
                          <File className="w-4 h-4" />
                          <span className="text-sm">{message.fileName}</span>
                          <button className="text-blue-300 hover:text-white">
                            <Download className="w-3 h-3" />
                          </button>
                        </div>
                      ) : message.type === 'image' ? (
                        <img
                          src={message.fileUrl}
                          alt="Shared image"
                          className="max-w-full h-auto rounded"
                        />
                      ) : null}

                      <div className={`flex items-center justify-between mt-1 text-xs ${
                        isOwn ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        <span>
                          {new Date(message.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        {isOwn && getMessageStatus(message)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-end space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                <Smile className="w-4 h-4" />
              </button>

              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
            <p className="text-gray-600">Choose a conversation to start messaging</p>
          </div>
        </div>
      )}

      {/* User Info Sidebar */}
      <AnimatePresence>
        {showUserInfo && selectedConversation && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="w-80 border-l border-gray-200 bg-white p-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Chat Info</h3>
              <button
                onClick={() => setShowUserInfo(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6">
              {selectedConversation.type === 'group' ? (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Group Members</h4>
                  <div className="space-y-3">
                    {selectedConversation.participants.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={participant.avatar || '/default-avatar.png'}
                            alt={participant.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="text-sm text-gray-900">{participant.name}</span>
                        </div>
                        {participant.isAdmin && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Admin
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <img
                    src={selectedConversation.avatar || '/default-avatar.png'}
                    alt={selectedConversation.name}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
                  />
                  <h4 className="font-medium text-gray-900">{selectedConversation.name}</h4>
                  <p className="text-sm text-gray-500">
                    {onlineUsers.has(selectedConversation.participants[0]?.id) 
                      ? 'Online' 
                      : 'Last seen recently'
                    }
                  </p>
                </div>
              )}

              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 mb-3">Shared Files</h4>
                <div className="space-y-2">
                  {messages
                    .filter(msg => msg.type === 'file' || msg.type === 'image')
                    .slice(0, 5)
                    .map((msg) => (
                      <div key={msg.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                        {msg.type === 'image' ? (
                          <Image className="w-4 h-4 text-gray-400" />
                        ) : (
                          <File className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-600 flex-1 truncate">
                          {msg.fileName}
                        </span>
                        <button className="text-blue-600 hover:text-blue-700">
                          <Download className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              <div className="border-t pt-6 space-y-2">
                <button className="w-full text-left p-2 text-red-600 hover:bg-red-50 rounded flex items-center">
                  <Ban className="w-4 h-4 mr-3" />
                  Block User
                </button>
                <button className="w-full text-left p-2 text-red-600 hover:bg-red-50 rounded flex items-center">
                  <Trash2 className="w-4 h-4 mr-3" />
                  Delete Chat
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Start New Chat</h3>
              {/* New chat form would go here */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNewChat(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Start Chat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessageCenter;
