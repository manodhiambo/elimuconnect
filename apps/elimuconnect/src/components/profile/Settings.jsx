import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Download,
  Trash2,
  Key,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  CheckCircle,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  Lock,
  Unlock,
  Camera,
  Calendar,
  Clock,
  Languages,
  Accessibility,
  Database,
  FileText,
  UserX,
  LogOut,
  HelpCircle,
  ExternalLink,
  Monitor,
  Wifi,
  Battery,
  Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';

const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    profile: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      bio: '',
      location: '',
      dateOfBirth: '',
      profileVisibility: 'public'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      studyReminders: true,
      achievementAlerts: true,
      messageAlerts: true,
      groupUpdates: true,
      weeklyReports: true,
      marketingEmails: false
    },
    privacy: {
      profileVisibility: 'public',
      activityStatus: 'visible',
      contactInfo: 'friends',
      studyStats: 'visible',
      achievementSharing: 'public',
      searchableByEmail: true,
      searchableByPhone: false,
      dataCollection: true
    },
    appearance: {
      theme: 'light',
      fontSize: 'medium',
      colorScheme: 'blue',
      compactMode: false,
      animationsEnabled: true,
      highContrast: false
    },
    accessibility: {
      screenReader: false,
      keyboardNavigation: true,
      reducedMotion: false,
      textToSpeech: false,
      voiceCommands: false,
      subtitles: false
    },
    language: {
      primary: 'en',
      secondary: 'sw',
      timeFormat: '12h',
      dateFormat: 'MM/DD/YYYY',
      timezone: 'Africa/Nairobi'
    },
    study: {
      studyReminders: true,
      breakReminders: true,
      dailyGoalReminders: true,
      weeklyReports: true,
      offlineMode: false,
      autoSync: true,
      downloadQuality: 'high'
    }
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const sectionNavigation = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
    { id: 'language', label: 'Language & Region', icon: Languages },
    { id: 'study', label: 'Study Preferences', icon: Clock },
    { id: 'data', label: 'Data & Storage', icon: Database },
    { id: 'account', label: 'Account', icon: UserX }
  ];

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get('/settings');
        setSettings(prev => ({
          ...prev,
          ...response.data
        }));
        setLoading(false);
      } catch (error) {
        console.error('Failed to load settings:', error);
        setLoading(false);
      }
    };

    if (user) {
      loadSettings();
    }
  }, [user]);

  const saveSettings = async (section) => {
    setSaving(true);
    try {
      await api.put('/settings', { [section]: settings[section] });
      
      // Update contexts if relevant
      if (section === 'appearance') {
        setTheme(settings.appearance.theme);
      }
      if (section === 'language') {
        setLanguage(settings.language.primary);
      }
      
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await api.post('/settings/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordChange(false);
      alert('Password changed successfully');
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('Failed to change password');
    }
  };

  const exportData = async () => {
    try {
      const response = await api.get('/settings/export-data', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `elimuconnect-data-${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const deleteAccount = async () => {
    try {
      await api.delete('/settings/delete-account');
      logout();
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">{label}</div>
        {description && <div className="text-xs text-gray-500">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

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
      <div className="flex items-center mb-6">
        <SettingsIcon className="w-8 h-8 text-blue-600 mr-3" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <nav className="space-y-1">
              {sectionNavigation.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                    activeSection === id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border">
            {/* Profile Settings */}
            {activeSection === 'profile' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                  <button
                    onClick={() => saveSettings('profile')}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {saving ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={settings.profile.firstName}
                        onChange={(e) => updateSetting('profile', 'firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={settings.profile.lastName}
                        onChange={(e) => updateSetting('profile', 'lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={settings.profile.phone}
                      onChange={(e) => updateSetting('profile', 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      value={settings.profile.bio}
                      onChange={(e) => updateSetting('profile', 'bio', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profile Visibility
                    </label>
                    <select
                      value={settings.profile.profileVisibility}
                      onChange={(e) => updateSetting('profile', 'profileVisibility', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="public">Public - Anyone can see your profile</option>
                      <option value="friends">Friends - Only friends can see your profile</option>
                      <option value="private">Private - Only you can see your profile</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeSection === 'notifications' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
                  <button
                    onClick={() => saveSettings('notifications')}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {saving ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">General Notifications</h3>
                    <div className="space-y-1">
                      <ToggleSwitch
                        enabled={settings.notifications.emailNotifications}
                        onChange={(value) => updateSetting('notifications', 'emailNotifications', value)}
                        label="Email Notifications"
                        description="Receive notifications via email"
                      />
                      <ToggleSwitch
                        enabled={settings.notifications.pushNotifications}
                        onChange={(value) => updateSetting('notifications', 'pushNotifications', value)}
                        label="Push Notifications"
                        description="Receive push notifications on your device"
                      />
                      <ToggleSwitch
                        enabled={settings.notifications.smsNotifications}
                        onChange={(value) => updateSetting('notifications', 'smsNotifications', value)}
                        label="SMS Notifications"
                        description="Receive notifications via SMS"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Study Notifications</h3>
                    <div className="space-y-1">
                      <ToggleSwitch
                        enabled={settings.notifications.studyReminders}
                        onChange={(value) => updateSetting('notifications', 'studyReminders', value)}
                        label="Study Reminders"
                        description="Get reminded to study at your scheduled times"
                      />
                      <ToggleSwitch
                        enabled={settings.notifications.achievementAlerts}
                        onChange={(value) => updateSetting('notifications', 'achievementAlerts', value)}
                        label="Achievement Alerts"
                        description="Get notified when you earn new achievements"
                      />
                      <ToggleSwitch
                        enabled={settings.notifications.weeklyReports}
                        onChange={(value) => updateSetting('notifications', 'weeklyReports', value)}
                        label="Weekly Reports"
                        description="Receive weekly progress reports"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Social Notifications</h3>
                    <div className="space-y-1">
                      <ToggleSwitch
                        enabled={settings.notifications.messageAlerts}
                        onChange={(value) => updateSetting('notifications', 'messageAlerts', value)}
                        label="Message Alerts"
                        description="Get notified when you receive new messages"
                      />
                      <ToggleSwitch
                        enabled={settings.notifications.groupUpdates}
                        onChange={(value) => updateSetting('notifications', 'groupUpdates', value)}
                        label="Group Updates"
                        description="Get notified about study group activities"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy & Security Settings */}
            {activeSection === 'privacy' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Privacy & Security</h2>
                  <button
                    onClick={() => saveSettings('privacy')}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {saving ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Password Change */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-md font-medium text-gray-900">Password</h3>
                        <p className="text-sm text-gray-600">Change your account password</p>
                      </div>
                      <button
                        onClick={() => setShowPasswordChange(!showPasswordChange)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        {showPasswordChange ? 'Cancel' : 'Change Password'}
                      </button>
                    </div>

                    {showPasswordChange && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? 'text' : 'password'}
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={changePassword}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                        >
                          <Key className="w-4 h-4 mr-2" />
                          Update Password
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Privacy Controls */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Privacy Controls</h3>
                    <div className="space-y-1">
                      <ToggleSwitch
                        enabled={settings.privacy.searchableByEmail}
                        onChange={(value) => updateSetting('privacy', 'searchableByEmail', value)}
                        label="Searchable by Email"
                        description="Allow others to find you by your email address"
                      />
                      <ToggleSwitch
                        enabled={settings.privacy.searchableByPhone}
                        onChange={(value) => updateSetting('privacy', 'searchableByPhone', value)}
                        label="Searchable by Phone"
                        description="Allow others to find you by your phone number"
                      />
                      <ToggleSwitch
                        enabled={settings.privacy.dataCollection}
                        onChange={(value) => updateSetting('privacy', 'dataCollection', value)}
                        label="Analytics Data Collection"
                        description="Help improve the app by sharing anonymous usage data"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Activity Status Visibility
                    </label>
                    <select
                      value={settings.privacy.activityStatus}
                      onChange={(e) => updateSetting('privacy', 'activityStatus', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="visible">Visible to everyone</option>
                      <option value="friends">Visible to friends only</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeSection === 'appearance' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
                  <button
                    onClick={() => saveSettings('appearance')}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {saving ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light', label: 'Light', icon: Sun },
                        { value: 'dark', label: 'Dark', icon: Moon },
                        { value: 'system', label: 'System', icon: Monitor }
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => updateSetting('appearance', 'theme', value)}
                          className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                            settings.appearance.theme === value
                          'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                          <span className="text-sm font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">                   Font Size
                    </label>
                    <select
                      value={settings.appearance.fontSize}
                      onChange={(e) => updateSetting('appearance', 'fontSize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Mem</option>
                      <option value="large">Large</option>
                      <option value="extra-large">Extra Large</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Color Scheme
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { value: 'blue', color: 'bg-blue,
                        { value: 'green', color: 'bg-green-500' },
                        { value: 'purple', color: 'bg-purple-500' },
                        { value: 'orange', color: 'bg-orange-500' }
                      ].map(({ value, color }) => (
                        <button
                          key={value}
                          onClick={() => updateSetting('appearance', 'colorScheme', value)}
                          className={`w-12 h-12 rounded-full ${color} ${
                            settings.appearance.colorScheme === value
                              ? 'ring-4 ring-gray-300'
                              : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <ToggleSwitch
                      enabled={settings.appearance.compactMode}
                      onChange={(value) => updateSetting('appearance', 'compactMode', value)}
                      label="Compact Mode"
                      description="Use less spacing in the interface"
                    />
                    <ToggleSwitch
                      enabled={settings.appearance.animationsEnabled}
                      onChange={(value) => updateSetting('appearance', 'animationsEnabled', value)}
                      label="Animations"
                      description="Enable smooth animations and transitions"
                    />
                    <ToggleSh
                      enabled={settings.appearance.highContrast}
                      onChange={(value) => updateSetting('appearance', 'highContrast', value)}
                      label="High Contrast"
                      description="Increase contrast for better visibility"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Accessibility Settings */}
            {activeSection === 'accessibility' && (
              <div classNam6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Accessibility</h2>
                  <button
                    onClick={() => saveSettings('accessibility')}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {saving ? <LoadingSpinner size="sm" classNam2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-1">
                    <ToggleSwitch
                      enabled={settings.accessibility.screenReader}
                      onChange={(value) => updateSetting('accessibility', 'screenReader', value)}
                      label="Screen Reader Support"
                      description="Optimizcreen reader compatibility"
                    />
                    <ToggleSwitch
                      enabled={settings.accessibility.keyboardNavigation}
                      onChange={(value) => updateSetting('accessibility', 'keyboardNavigation', value)}
                      label="Keyboard Navigation"
                      description="Enable full keyboard navigation support"
                    />
                    <ToggleSwitch
                      enabled={settings.accessibility.reducedMotio}
                      onChange={(value) => updateSetting('accessibility', 'reducedMotion', value)}
                      label="Reduced Motion"
                      description="Minimize animations and motion effects"
                    />
                    <ToggleSwitch
                      enabled={settings.accessibility.textToSpeech}
                      onChange={(value) => updateSetting('accessibility', 'textToSpeech', value)}
                      label="Text-to-Speech"
                      dion="Enable text-to-speech for content reading"
                    />
                    <ToggleSwitch
                      enabled={settings.accessibility.voiceCommands}
                      onChange={(value) => updateSetting('accessibility', 'voiceCommands', value)}
                      label="Voice Commands"
                      description="Control the app using voice commands"
                    />
                    <ToggleSwitch
                      enabled={settings.accessibility.subtitles}
                      onChange={(value) => updateSetting('accessibility', 'subtitles', value)}
                      label="Video Subtitles"
                      description="Show subtitles for all video content"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Language & Region Settings */}
            {activeSection === 'language' && (
              <div className="p-6">
                <div className="flex items-center justify-btween mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Language & Region</h2>
                  <button
                    onClick={() => saveSettings('language')}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {saving ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                ve Changes
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primary Language
                      </label>
                      <select
                        value={settings.language.primary}
                        onChange={(e) => updateSetting('language', 'prima e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="en">English</option>
                        <option value="sw">Kiswahili</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Secondaanguage
                      </label>
                      <select
                        value={settings.language.secondary}
                        onChange={(e) => updateSetting('language', 'secondary', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="sw">Kiswahili</option>
                        <option value="en">English</opt                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time Format
                      </label>
                      <select
                        value={settings.language.timeFormat}
                        onChange={(e) => updateSetting('language', 'timeFormat', e.target.value)}                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="12h">12-hour (AM/PM)</option>
                        <option value="24h">24-hour</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date Format
                    </label>
                      <select
                        value={settings.language.dateFormat}
                        onChange={(e) => updateSetting('language', 'dateFormat', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY<n>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timezone
                    </label>
                    <select
                      value={settings.language.timezone}
                      onChange={(e) => updateSetting('language', 'timezone', e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                      <option value="Africa/Cairo">Africa/Cairo (CAT)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Study Preerences */}
            {activeSection === 'study' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Study Preferences</h2>
                  <button
                    onClick={() => saveSettings('study')}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
             >
                    {saving ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-1">
                    <ToggleSwitch
                      enabled={settings.study.studyReminders}
                      onChange={(value) => updateSetting('study', 'studyReminders', value)}
                     el="Study Reminders"
                      description="Get reminded about your scheduled study sessions"
                    />
                    <ToggleSwitch
                      enabled={settings.study.breakReminders}
                      onChange={(value) => updateSetting('study', 'breakReminders', value)}
                      label="Break Reminders"
                      description="Get reminded to take breaks during long study sessions"
                    />
                    <ToggleSwitch
                 enabled={settings.study.dailyGoalReminders}
                      onChange={(value) => updateSetting('study', 'dailyGoalReminders', value)}
                      label="Daily Goal Reminders"
                      description="Get reminded about your daily study goals"
                    />
                    <ToggleSwitch
                      enabled={settings.study.offlineMode}
                      onChange={(value) => updateSetting('study', 'offlineMode', value)}
                      label="Offline Mode"
                      description="Download content for offline studying"
                    />
                    <ToggleSwitch
                      enabled={settings.study.autoSync}
                      onChange={(value) => updateSetting('study', 'autoSync', value)}
                      label="Auto Sync"
                      description="Automatically sync your progress when online"
                    />
                  </div>

                  <div>
                    <labclassName="block text-sm font-medium text-gray-700 mb-1">
                      Download Quality
                    </label>
                    <select
                      value={settings.study.downloadQuality}
                      onChange={(e) => updateSetting('study', 'downloadQuality', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option valu"low">Low (Saves data)</option>
                      <option value="medium">Medium</option>
                      <option value="high">High (Best quality)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Data & Storage */}
            {activeSection === 'data' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Data & Storage</h2>

                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-md font-medium text-gray-900 mb-2">Export Your Data</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Download a copy of all your data including progress, achievements, and settings.
                    </p>
                    <button
                      onClick={exportData}
                      className="px-4 py-2 bg-blue-600 text rounded-md hover:bg-blue-700 flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-md font-medium text-gray-900 mb-2">Storage Usage</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                       <span>Downloaded content</span>
                        <span>245 MB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Cache data</span>
                        <span>18 MB</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium">
                        <span>Total</span>
                        <span>263 MB</span>
                      </div>
             </div>
                    <button className="mt-3 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                      Clear Cache
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Account Settings */}
            {activeSection === 'account' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Management</h2>

              div className="space-y-6">
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <h3 className="text-md font-medium text-red-900 mb-2">Danger Zone</h3>
                    <p className="text-sm text-red-700 mb-4">
                      These actions are irreversible. Please be careful.
                    </p>
                    
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowDeletem(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </button>
                      
                      <button
                        onClick={logout}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center"
                >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-md font-medium text-gray-900 mb-2">Help & Support</h3>
                    <div className="space-y-2">
                      <a href="/help" className="flex items-center text-sm text-blue-600 hover:text-blue-700">                     <HelpCircle className="w-4 h-4 mr-2" />
                        Help Center
                      </a>
                      <a href="/contact" className="flex items-center text-sm text-blue-600 hover:text-blue-700">
                        <Mail className="w-4 h-4 mr-2" />
                        Contact Support
                      </a>
                      <a href="/privacy" className="flex items-center text-sm text-blue-600 hover:text-blue-700">
                        <FileText className="w-4 h-4 mr-2" />
                        Privacy Policy
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <dissName="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Account</h3>
              <p className="text-gray-600">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
              </p>
            </div>

            <div className"flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showCurrentassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword xt' : 'password'}
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => sehowNewPassword(!showNewPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                         Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                         </button>
                          </div>
                        </div>

                        <button
                          onClick={changePassword}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                        >
                          <Key className="w-4 h-4 mr-2" />
                          Update Password
                        </button>
                      </div>
                    )}
                </div>

                  {/* Privacy Controls */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Privacy Controls</h3>
                    <div className="space-y-1">
                      <ToggleSwitch
                        enabled={settings.privacy.searchableByEmail}
                        onChange={(value) => updateSetting('privacy', 'searchableByEmail', value)}
                        label="Searchable by Email"
                        descriptn="Allow others to find you by your email address"
                      />
                      <ToggleSwitch
                        enabled={settings.privacy.searchableByPhone}
                        onChange={(value) => updateSetting('privacy', 'searchableByPhone', value)}
                        label="Searchable by Phone"
                        description="Allow others to find you by your phone number"
                      />
                      <ToggleSwitch
                        enabled={se.privacy.dataCollection}
                        onChange={(value) => updateSetting('privacy', 'dataCollection', value)}
                        label="Analytics Data Collection"
                        description="Help improve the app by sharing anonymous usage data"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Activity Status Visibility
               </label>
                    <select
                      value={settings.privacy.activityStatus}
                      onChange={(e) => updateSetting('privacy', 'activityStatus', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="visible">Visible to everyone</option>
                      <option value="friends">Visible to friends /option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeSection === 'appearance' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
                  <button
                 lick={() => saveSettings('appearance')}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {saving ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light', label: 'Light', icon: Sun },
                        { value: 'dark', label: 'Dark', icon: Moon },
                        { value: 'system', label: 'System', icon: Monitor }
                      ].map(({ value, label, icon: Icon }) => (
                    <button
                          key={value}
                          onClick={() => updateSetting('appearance', 'theme', value)}
                          className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
                            settings.appearance.theme === value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                        <Icon className="w-6 h-6" />
                          <span className="text-sm font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Size
                    </label>
                    <select
                      value={settings.appearance.fontSize}
                     onChange={(e) => updateSetting('appearance', 'fontSize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                      <option value="extra-large">Extra Large</option>
                  </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Color Scheme
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { value: 'blue', color: 'bg-blue-500' },
                        { value: 'green', color: 'bg-green-500' },
                        { value: 'purple', color: 'bg-purple-500' },
                 { value: 'orange', color: 'bg-orange-500' }
                      ].map(({ value, color }) => (
                        <button
                          key={value}
                          onClick={() => updateSetting('appearance', 'colorScheme', value)}
                          className={`w-12 h-12 rounded-full ${color} ${
                            settings.appearance.colorScheme === value
                              ? 'ring-4 ring-gray-300'
                              : ''
                    }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <ToggleSwitch
                      enabled={settings.appearance.compactMode}
                      onChange={(value) => updateSetting('appearance', 'compactMode', value)}
                      label="Compact Mode"
                      description="Use less spacing in the interface"
                    />
                    <ToggleS                      enabled={settings.appearance.animationsEnabled}
                      onChange={(value) => updateSetting('appearance', 'animationsEnabled', value)}
                      label="Animations"
                      description="Enable smooth animations and transitions"
                    />
                    <ToggleSwitch
                      enabled={settings.appearance.highContrast}
                      onChange={(value) => updateSetting('appearance', 'highContrast', value)}
                  label="High Contrast"
                      description="Increase contrast for better visibility"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Accessibility Settings */}
            {activeSection === 'accessibility' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Accessibility</h2>
               <button
                    onClick={() => saveSettings('accessibility')}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {saving ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </button>
                </div>

                <div className="space-6">
                  <div className="space-y-1">
                    <ToggleSwitch
                      enabled={settings.accessibility.screenReader}
                      onChange={(value) => updateSetting('accessibility', 'screenReader', value)}
                      label="Screen Reader Support"
                      description="Optimize for screen reader compatibility"
                    />
                    <ToggleSwitch
                      enabled={settings.accessibility.keyboardNavigation}
                    onChange={(value) => updateSetting('accessibility', 'keyboardNavigation', value)}
                      label="Keyboard Navigation"
                      description="Enable full keyboard navigation support"
                    />
                    <ToggleSwitch
                      enabled={settings.accessibility.reducedMotion}
                      onChange={(value) => updateSetting('accessibility', 'reducedMotion', value)}
                      label="Reduced Motion"
                    description="Minimize animations and motion effects"
                    />
                    <ToggleSwitch
                      enabled={settings.accessibility.textToSpeech}
                      onChange={(value) => updateSetting('accessibility', 'textToSpeech', value)}
                      label="Text-to-Speech"
                      description="Enable text-to-speech for content reading"
                    />
                    <ToggleSwitch
                      enabled={settings.accessibiliceCommands}
                      onChange={(value) => updateSetting('accessibility', 'voiceCommands', value)}
                      label="Voice Commands"
                      description="Control the app using voice commands"
                    />
                    <ToggleSwitch
                      enabled={settings.accessibility.subtitles}
                      onChange={(value) => updateSetting('accessibility', 'subtitles', value)}
                      label="Video Subtitles"
                    description="Show subtitles for all video content"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Language & Region Settings */}
            {activeSection === 'language' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Language & Region</h2>
                  <button
                    onClick={()aveSettings('language')}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {saving ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap->
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primary Language
                      </label>
                      <select
                        value={settings.language.primary}
                        onChange={(e) => updateSetting('language', 'primary', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparen
                      >
                        <option value="en">English</option>
                        <option value="sw">Kiswahili</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Secondary Language
                      </label>
                      <select
                        value={settings.language.secondary}
                        onCha(e) => updateSetting('language', 'secondary', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="sw">Kiswahili</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time Format
                      </label>
                      <select
                        value={settings.language.timeFormat}
                        onChange={(e) => updateSetting('language', 'timeFormat', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     >
                        <option value="12h">12-hour (AM/PM)</option>
                        <option value="24h">24-hour</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date Format
                      </label>
                      <select
                        value={settings.language.dateFormat}
                        onChange={(e) => uSetting('language', 'dateFormat', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timezone
                    </label>
                    <select
                      value={settings.language.timezone}
                      onChange={(e) => updateSetting('language', 'timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                         <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                      <option value="Africa/Cairo">Africa/Cairo (CAT)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Study Preferences */}
            {activeSection === 'study' && (
              <div className="p-6">
                <div className="flex items-center justify-betwen mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Study Preferences</h2>
                  <button
                    onClick={() => saveSettings('study')}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    {saving ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Sanges
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-1">
                    <ToggleSwitch
                      enabled={settings.study.studyReminders}
                      onChange={(value) => updateSetting('study', 'studyReminders', value)}
                      label="Study Reminders"
                      description="Get reminded about your scheduled study sessions"
                    />
                    <ToggleSwitch
                      enabled={settings.study.breakReminders}
                      onChange={(value) => updateSetting('study', 'breakReminders', value)}
                      label="Break Reminders"
                      description="Get reminded to take breaks during long study sessions"
                    />
                    <ToggleSwitch
                      enabled={settings.study.dailyGoalReminders}
                      onChange={(value) => updateSetting('study', 'dailyGoalReminders',alue)}
                      label="Daily Goal Reminders"
                      description="Get reminded about your daily study goals"
                    />
                    <ToggleSwitch
                      enabled={settings.study.offlineMode}
                      onChange={(value) => updateSetting('study', 'offlineMode', value)}
                      label="Offline Mode"
                      description="Download content for offline studying"
                    />
                    <ToggleSwit
                      enabled={settings.study.autoSync}
                      onChange={(value) => updateSetting('study', 'autoSync', value)}
                      label="Auto Sync"
                      description="Automatically sync your progress when online"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Download Quality
                    </label>
                    <s
                      value={settings.study.downloadQuality}
                      onChange={(e) => updateSetting('study', 'downloadQuality', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low (Saves data)</option>
                      <option value="medium">Medium</option>
                      <option value="high">High (Best qual</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Data & Storage */}
            {activeSection === 'data' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Data & Storage</h2>

                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-md font-medium text-g-900 mb-2">Export Your Data</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Download a copy of all your data including progress, achievements, and settings.
                    </p>
                    <button
                      onClick={exportData}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                     Export Data
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-md font-medium text-gray-900 mb-2">Storage Usage</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Downloaded content</span>
                        <span>245 MB</span>
                      </div>
                      <div claame="flex justify-between text-sm">
                        <span>Cache data</span>
                        <span>18 MB</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium">
                        <span>Total</span>
                        <span>263 MB</span>
                      </div>
                    </div>
                    <button className="mt-3 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                Clear Cache
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Account Settings */}
            {activeSection === 'account' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Management</h2>

                <div className="space-y-6">
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <h3 className="text-m-medium text-red-900 mb-2">Danger Zone</h3>
                    <p className="text-sm text-red-700 mb-4">
                      These actions are irreversible. Please be careful.
                    </p>
                    
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                      >
                     <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </button>
                      
                      <button
                        onClick={logout}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                  </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-md font-medium text-gray-900 mb-2">Help & Support</h3>
                    <div className="space-y-2">
                      <a href="/help" className="flex items-center text-sm text-blue-600 hover:text-blue-700">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Help Center
                      </a>
                      ref="/contact" className="flex items-center text-sm text-blue-600 hover:text-blue-700">
                        <Mail className="w-4 h-4 mr-2" />
                        Contact Support
                      </a>
                      <a href="/privacy" className="flex items-center text-sm text-blue-600 hover:text-blue-700">
                        <FileText className="w-4 h-4 mr-2" />
                        Privacy Policy
                        <ExternalLink className="w-3 h-3 ml-1" />
                  a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <AlertTriangle className="w-12 h-12 text600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Account</h3>
              <p className="text-gray-600">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-6er:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
