import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  BookOpen,
  Star,
  MessageCircle,
  Video,
  Settings,
  UserPlus,
  UserMinus,
  Crown,
  Shield,
  Eye,
  EyeOff,
  Share2,
  Edit,
  Trash2,
  MoreVertical,
  Target,
  Award,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertCircle,
  Copy,
  Link,
  Mail,
  Phone,
  Globe,
  Lock,
  Unlock,
  Bell,
  BellOff,
  Archive,
  Heart,
  Flag,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '../common/LoadingSpinner';

const StudyGroups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [view, setView] = useState('discover'); // discover, myGroups, create
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, subject, level, public, private
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    subject: '',
    level: '',
    isPrivate: false,
    maxMembers: 20,
    meetingSchedule: '',
    tags: []
  });

  const subjects = [
    'Mathematics', 'English', 'Kiswahili', 'Science', 'Social Studies',
    'Physics', 'Chemistry', 'Biology', 'Geography', 'History',
    'Computer Science', 'Business Studies'
  ];

  const levels = ['Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Form 1', 'Form 2', 'Form 3', 'Form 4'];

  // Load study groups
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const endpoint = view === 'myGroups' ? '/study-groups/my-groups' : '/study-groups/discover';
        const response = await api.get(endpoint);
        setGroups(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load study groups:', error);
        setLoading(false);
      }
    };

    loadGroups();
  }, [view]);

  const createGroup = async () => {
    try {
      const response = await api.post('/study-groups/create', newGroup);
      setGroups(prev => [response.data, ...prev]);
      setShowCreateModal(false);
      setNewGroup({
        name: '',
        description: '',
        subject: '',
        level: '',
        isPrivate: false,
        maxMembers: 20,
        meetingSchedule: '',
        tags: []
      });
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const joinGroup = async (groupId) => {
    try {
      await api.post(`/study-groups/${groupId}/join`);
      setGroups(prev => 
        prev.map(group => 
          group.id === groupId 
            ? { ...group, memberCount: group.memberCount + 1, isMember: true }
            : group
        )
      );
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  const leaveGroup = async (groupId) => {
    try {
      await api.post(`/study-groups/${groupId}/leave`);
      setGroups(prev => 
        prev.map(group => 
          group.id === groupId 
            ? { ...group, memberCount: group.memberCount - 1, isMember: false }
            : group
        )
      );
    } catch (error) {
      console.error('Failed to leave group:', error);
    }
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (filter) {
      case 'subject':
        return matchesSearch && group.subject === newGroup.subject;
      case 'level':
        return matchesSearch && group.level === newGroup.level;
      case 'public':
        return matchesSearch && !group.isPrivate;
      case 'private':
        return matchesSearch && group.isPrivate;
      default:
        return matchesSearch;
    }
  });

  const getGroupTypeIcon = (group) => {
    if (group.isPrivate) {
      return <Lock className="w-4 h-4 text-amber-600" />;
    }
    return <Globe className="w-4 h-4 text-green-600" />;
  };

  const getActivityLevel = (lastActivity) => {
    const now = new Date();
    const lastActiveDate = new Date(lastActivity);
    const hoursDiff = (now - lastActiveDate) / (1000 * 60 * 60);
    
    if (hoursDiff < 24) return { level: 'High', color: 'text-green-600', bg: 'bg-green-100' };
    if (hoursDiff < 72) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Low', color: 'text-red-600', bg: 'bg-red-100' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Study Groups</h1>
          <p className="text-gray-600">Connect with peers and collaborate on your studies</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'discover', label: 'Discover', icon: Search },
          { id: 'myGroups', label: 'My Groups', icon: Users }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`px-6 py-2 rounded-md flex items-center transition-colors ${
              view === id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Groups</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="subject">By Subject</option>
            <option value="level">By Level</option>
          </select>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => {
          const activity = getActivityLevel(group.lastActivity);
          
          return (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              {/* Group Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getGroupTypeIcon(group)}
                    <h3 className="font-semibold text-gray-900 truncate flex-1">
                      {group.name}
                    </h3>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {group.description}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {group.subject}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {group.level}
                    </span>
                  </div>
                  <div className={`px-2 py-1 rounded ${activity.bg} ${activity.color}`}>
                    {activity.level}
                  </div>
                </div>
              </div>

              {/* Group Stats */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {group.memberCount}/{group.maxMembers}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">
                        {group.rating?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  {group.isActive && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600">Active</span>
                    </div>
                  )}
                </div>

                {/* Recent Activity */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Recent Activity</span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-1">
                    {group.recentActivity || 'No recent activity'}
                  </p>
                </div>

                {/* Member Avatars */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex -space-x-2">
                    {group.members?.slice(0, 4).map((member, index) => (
                      <img
                        key={index}
                        src={member.avatar || '/default-avatar.png'}
                        alt={member.name}
                        className="w-6 h-6 rounded-full border-2 border-white object-cover"
                      />
                    ))}
                    {group.memberCount > 4 && (
                      <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                        <span className="text-xs text-gray-600">+{group.memberCount - 4}</span>
                      </div>
                    )}
                  </div>
                  
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(group.lastActivity), { addSuffix: true })}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {group.isMember ? (
                    <>
                      <button
                        onClick={() => setSelectedGroup(group)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center justify-center"
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Chat
                      </button>
                      <button
                        onClick={() => leaveGroup(group.id)}
                        className="px-3 py-2 border border-red-300 text-red-600 text-sm rounded-md hover:bg-red-50 flex items-center"
                      >
                        <UserMinus className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => joinGroup(group.id)}
                        className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 flex items-center justify-center"
                        disabled={group.memberCount >= group.maxMembers}
                      >
                        <UserPlus className="w-3 h-3 mr-1" />
                        {group.memberCount >= group.maxMembers ? 'Full' : 'Join'}
                      </button>
                      <button
                        onClick={() => setShowGroupDetails(group)}
                        className="px-3 py-2 border border-gray-300 text-gray-600 text-sm rounded-md hover:bg-gray-50 flex items-center"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>

                {/* Tags */}
                {group.tags && group.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {group.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                    {group.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{group.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {view === 'myGroups' ? 'No groups joined yet' : 'No groups found'}
          </h3>
          <p className="text-gray-600 mb-4">
            {view === 'myGroups' 
              ? 'Join a study group to start collaborating with peers'
              : 'Try adjusting your search or create a new group'
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create New Group
          </button>
        </div>
      )}

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateModal && (
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
              className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Create Study Group</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter group name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your study group"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject *
                    </label>
                    <select
                      value={newGroup.subject}
                      onChange={(e) => setNewGroup(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select subject</option>
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Level *
                    </label>
                    <select
                      value={newGroup.level}
                      onChange={(e) => setNewGroup(prev => ({ ...prev, level: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select level</option>
                      {levels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Members
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={newGroup.maxMembers}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Schedule (Optional)
                  </label>
                  <input
                    type="text"
                    value={newGroup.meetingSchedule}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, meetingSchedule: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Tuesdays at 7 PM"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={newGroup.isPrivate}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, isPrivate: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isPrivate" className="text-sm text-gray-700">
                    Private group (invite only)
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={createGroup}
                  disabled={!newGroup.name || !newGroup.description || !newGroup.subject || !newGroup.level}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Group
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Group Details Modal */}
      <AnimatePresence>
        {showGroupDetails && (
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
              className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Group Details</h3>
                <button
                  onClick={() => setShowGroupDetails(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {showGroupDetails && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      {showGroupDetails.name}
                    </h2>
                    <p className="text-gray-600 mb-4">{showGroupDetails.description}</p>
                    
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {showGroupDetails.subject}
                      </span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {showGroupDetails.level}
                      </span>
                      {getGroupTypeIcon(showGroupDetails)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-lg font-semibold text-blue-900">
                        {showGroupDetails.memberCount}
                      </div>
                      <div className="text-sm text-blue-600">Members</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Star className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <div className="text-lg font-semibold text-green-900">
                        {showGroupDetails.rating?.toFixed(1) || 'N/A'}
                      </div>
                      <div className="text-sm text-green-600">Rating</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Members</h4>
                    <div className="space-y-2 max-h-40 overfl-y-auto">
                      {showGroupDetails.members?.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-3">
                            <img
                              src={member.avatar || '/default-avatar.png'}
                              alt={member.name}
                              className="w-8 h-8 rounded-full object-cover"
                     />
                            <span className="text-sm text-gray-900">{member.name}</span>
                          </div>
                          {member.isAdmin && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-center space-x-3">
                    <button
                      onClic => {
                        joinGroup(showGroupDetails.id);
                        setShowGroupDetails(false);
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      disabled={showGroupDetails.memberCount >= showGroupDetails.maxMembers}
                    >
                      {showGroupDetails.memberCount >= showGroupDetails.maxMembers ? 'Group Full' : 'Join Group'}
                    </button>
                  <button className="px-6 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50">
                      Share Group
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyGroups;
