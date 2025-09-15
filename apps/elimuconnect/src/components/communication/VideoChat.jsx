import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Monitor,
  MonitorOff,
  Volume2,
  VolumeX,
  Settings,
  Users,
  MessageSquare,
  MoreVertical,
  Grid3X3,
  Maximize,
  Minimize,
  Pin,
  PinOff,
  Hand,
  UserCheck,
  UserX,
  Copy,
  Share2,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Camera,
  CameraOff,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  X,
  Plus,
  Send,
  Smile,
  FileText,
  Download,
  Upload,
  Pause,
  Play,
  Square,
  Circle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '../common/LoadingSpinner';

const VideoChat = () => {
  const { user } = useAuth();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const screenShareRef = useRef(null);
  const chatInputRef = useRef(null);
  
  // Call state
  const [isInCall, setIsInCall] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [currentCall, setCurrentCall] = useState(null);
  
  // Media state
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  
  // UI state
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid, speaker, gallery
  const [pinnedParticipant, setPinnedParticipant] = useState(null);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadMessages, setUnreadMessages] = useState(0);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  // Connection state
  const [connectionQuality, setConnectionQuality] = useState('good'); // poor, fair, good, excellent
  const [networkStats, setNetworkStats] = useState({
    bandwidth: 0,
    latency: 0,
    packetLoss: 0
  });

  // Scheduled calls
  const [upcomingCalls, setUpcomingCalls] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newScheduledCall, setNewScheduledCall] = useState({
    title: '',
    description: '',
    startTime: '',
    duration: 60,
    participants: [],
    isRecurring: false
  });

  // Call timer
  useEffect(() => {
    let interval;
    if (isInCall) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInCall]);

  // Recording timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Load upcoming calls
  useEffect(() => {
    const loadUpcomingCalls = async () => {
      try {
        const response = await api.get('/video-chat/upcoming');
        setUpcomingCalls(response.data);
      } catch (error) {
        console.error('Failed to load upcoming calls:', error);
      }
    };

    loadUpcomingCalls();
  }, []);

  const startCall = async (type = 'video', participants = []) => {
    setIsConnecting(true);
    try {
      // Initialize media devices
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create call session
      const response = await api.post('/video-chat/start', {
        type,
        participants
      });

      setCurrentCall(response.data);
      setIsInCall(true);
      setCallDuration(0);
      
    } catch (error) {
      console.error('Failed to start call:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const endCall = async () => {
    try {
      if (currentCall) {
        await api.post(`/video-chat/${currentCall.id}/end`);
      }

      // Stop all media streams
      if (localVideoRef.current?.srcObject) {
        localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }

      setIsInCall(false);
      setCurrentCall(null);
      setCallDuration(0);
      setIsRecording(false);
      setRecordingDuration(0);
      setIsScreenSharing(false);
      setChatMessages([]);
      setParticipants([]);
      
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  const toggleVideo = async () => {
    if (localVideoRef.current?.srcObject) {
      const videoTrack = localVideoRef.current.srcObject.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = async () => {
    if (localVideoRef.current?.srcObject) {
      const audioTrack = localVideoRef.current.srcObject.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = screenStream;
        }
        
        setIsScreenSharing(true);
      } else {
        if (screenShareRef.current?.srcObject) {
          screenShareRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Screen share error:', error);
    }
  };

  const startRecording = async () => {
    try {
      await api.post(`/video-chat/${currentCall.id}/record/start`);
      setIsRecording(true);
      setRecordingDuration(0);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      await api.post(`/video-chat/${currentCall.id}/record/stop`);
      setIsRecording(false);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim() || !currentCall) return;

    try {
      const response = await api.post(`/video-chat/${currentCall.id}/chat`, {
        message: newMessage.trim()
      });

      setChatMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const scheduleCall = async () => {
    try {
      await api.post('/video-chat/schedule', newScheduledCall);
      setShowScheduleModal(false);
      setNewScheduledCall({
        title: '',
        description: '',
        startTime: '',
        duration: 60,
        participants: [],
        isRecurring: false
      });
      
      // Reload upcoming calls
      const response = await api.get('/video-chat/upcoming');
      setUpcomingCalls(response.data);
    } catch (error) {
      console.error('Failed to schedule call:', error);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getConnectionQualityColor = (quality) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConnectionQualityIcon = (quality) => {
    switch (quality) {
      case 'excellent': return <Wifi className="w-4 h-4" />;
      case 'good': return <Wifi className="w-4 h-4" />;
      case 'fair': return <Wifi className="w-4 h-4" />;
      case 'poor': return <WifiOff className="w-4 h-4" />;
      default: return <Wifi className="w-4 h-4" />;
    }
  };

  // Pre-call lobby
  if (!isInCall && !isConnecting) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Chat</h1>
          <p className="text-gray-600">Connect with classmates and teachers through video calls</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-lg shadow-sm border cursor-pointer"
            onClick={() => startCall('video')}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Start Video Call</h3>
              <p className="text-sm text-gray-600">Begin an instant video call</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-lg shadow-sm border cursor-pointer"
            onClick={() => startCall('audio')}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Audio Call</h3>
              <p className="text-sm text-gray-600">Start an audio-only call</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-lg shadow-sm border cursor-pointer"
            onClick={() => setShowScheduleModal(true)}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Schedule Call</h3>
              <p className="text-sm text-gray-600">Plan a future video call</p>
            </div>
          </motion.div>
        </div>

        {/* Upcoming Calls */}
        {upcomingCalls.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Calls</h3>
            <div className="space-y-3">
              {upcomingCalls.map((call) => (
                <div key={call.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Video className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{call.title}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(call.startTime).toLocaleString()} • {call.duration} min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(call.startTime), { addSuffix: true })}
                    </span>
                    <button
                      onClick={() => startCall('video', call.participants)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Device Test */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Your Setup</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Camera Preview</h4>
              <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <button
                  onClick={toggleVideo}
                  className={`p-2 rounded-full ${
                    isVideoEnabled ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={toggleAudio}
                  className={`p-2 rounded-full ${
                    isAudioEnabled ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Connection Quality</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <div className={`flex items-center space-x-1 ${getConnectionQualityColor(connectionQuality)}`}>
                    {getConnectionQualityIcon(connectionQuality)}
                    <span className="text-sm font-medium capitalize">{connectionQuality}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bandwidth</span>
                  <span className="text-sm font-medium">{networkStats.bandwidth} Mbps</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Latency</span>
                  <span className="text-sm font-medium">{networkStats.latency}ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // In-call interface
  return (
    <div className="fixed inset-0 bg-gray-900 z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-4">
            <h2 className="font-semibold">Video Call</h2>
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(callDuration)}</span>
            </div>
            {isRecording && (
              <div className="flex items-center space-x-2 text-red-400">
                <Circle className="w-3 h-3 fill-current animate-pulse" />
                <span className="text-sm">Recording {formatDuration(recordingDuration)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 ${getConnectionQualityColor(connectionQuality)} text-white`}>
              {getConnectionQualityIcon(connectionQuality)}
              <span className="text-sm">{connectionQuality}</span>
            </div>
            
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30"
            >
              <Users className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setShowChat(!showChat)}
              className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 relative"
            >
              <MessageSquare className="w-4 h-4" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="h-full flex">
        {/* Video Grid */}
        <div className="flex-1 relative">
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 gap-2 h-full p-4 pt-20">
              {/* Local Video */}
              <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  You {!isVideoEnabled && '(Camera Off)'}
                </div>
              </div>

              {/* Remote Videos */}
              {participants.map((participant) => (
                <div key={participant.id} className="relative bg-gray-800 rounded-lg overflow-hidden">
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                  />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    {participant.name}
                  </div>
                  {participant.isAudioMuted && (
                    <MicOff className="absolute top-2 right-2 w-4 h-4 text-red-400" />
                  )}
                </div>
              ))}

              {/* Screen Share */}
              {isScreenSharing && (
                <div className="col-span-2 relative bg-gray-800 rounded-lg overflow-hidden">
                  <video
                    ref={screenShareRef}
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    Screen Share
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              className="w-80 bg-white border-l flex flex-col"
            >
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Chat</h3>
                  <button
                    onClick={() => setShowChat(false)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((message) => (
                  <div key={message.id} className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm text-gray-900">
                        {message.sender.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{message.content}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <input
                    ref={chatInputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={sendChatMessage}
                    className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full ${
              isAudioEnabled 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full ${
              isVideoEnabled 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-full ${
              isScreenSharing 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          </button>

          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-4 rounded-full ${
              isRecording 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            {isRecording ? <Square className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
          </button>

          <button
            onClick={endCall}
            className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Schedule Call Modal */}
      <AnimatePresence>
        {showScheduleModal && (
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Video Call</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Call Title
                  </label>
                  <input
                    type="text"
                    value={newScheduledCall.title}
                    onChange={(e) => setNewScheduledCall(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter call title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newScheduledCall.startTime}
                    onChange={(e) => setNewScheduledCall(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={newScheduledCall.duration}
                    onChange={(e) => setNewScheduledCalrev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="15"
                    max="480"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-ext-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={scheduleCall}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Schedule
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoChat;
