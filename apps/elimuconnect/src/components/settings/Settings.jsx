import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Download,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Moon,
  Sun,
  Monitor,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  Lock,
  Database,
  HelpCircle,
  LogOut,
  ChevronRight,
  Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Settings = () => {
  const { user, logout, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      desktop: false,
      sound: true,
      messages: true,
      assignments: true,
      announcements: true,
      reminders: true
    },
    privacy: {
      profileVisibility: 'public',
      showOnlineStatus: true,
      allowDirectMessages: true,
      shareProgress: true,
      shareLocation: false
    },
    appearance: {
      theme: theme || 'system',
      fontSize: 'medium',
      compactMode: false,
      animations: true
    },
    language: {
      primary: 'en',
      secondary: 'sw'
    },
    data: {
      autoDownload: false,
      offlineMode: true,
      dataSaver: false,
      cacheSize: '500MB'
    }
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'general', name: 'General', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy & Security', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'language', name: 'Language', icon: Globe },
    { id: 'data', name: 'Data & Storage', icon: Database }
  ];

  const themes = [
    { id: 'light', name: 'Light', icon: Sun },
    { id: 'dark', name: 'Dark', icon: Moon },
    { id: 'system', name: 'System', icon: Monitor }
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' }
  ];

  const privacyOptions = [
    { id: 'public', name: 'Public', description: 'Visible to all users' },
    { id: 'school', name: 'School Only', description: 'Visible to users in your school' },
    { id: 'private', name: 'Private', description: 'Only visible to you' }
  ];

  const fontSizes = [
    { id: 'small', name: 'Small' },
    { id: 'medium', name: 'Medium' },
    { id: 'large', name: 'Large' }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load settings from API or localStorage
      const savedSettings = localStorage.getItem('user_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save to API and localStorage
      localStorage.setItem('user_settings', JSON.stringify(settings));
      
      // Update user preferences
      if (updateUser) {
        await updateUser({ preferences: settings });
      }

      // Apply theme change
      if (settings.appearance.theme !== theme) {
        setTheme(settings.appearance.theme);
      }

      setTimeout(() => setSaving(false), 1000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaving(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleDeleteAccount = async () => {
    try {
      // Call delete account API
      await logout();
      // Redirect would happen automatically via auth context
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  const ToggleSwitch = ({ enabled, onToggle, disabled = false }) => (
    <button
      onClick={() => !disabled && onToggle(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const SettingItem = ({ title, description, children, className = '' }) => (
    <div className={`flex items-center justify-between py-4 ${className}`}>
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      <div className="ml-4">{children}</div>
    </div>
  );

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Account Information
        </h3>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {user?.profile?.firstName} {user?.profile?.lastName}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user?.profile?.school} • {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Account Actions
        </h3>
        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Lock className="h-5 w-5 text-gray-400" />
              <span className="text-gray-900 dark:text-white">Change Password</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>
          
          <button 
            onClick={logout}
            className="w-full text-left px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <LogOut className="h-5 w-5 text-gray-400" />
              <span className="text-gray-900 dark:text-white">Sign Out</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-4">
          Danger Zone
        </h3>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full text-left px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div>
              <span className="text-red-600 dark:text-red-400 font-medium">Delete Account</span>
              <p className="text-sm text-red-500 dark:text-red-400">
                Permanently delete your account and all data
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-red-400" />
        </button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <SettingItem 
        title="Email Notifications"
        description="Receive updates via email"
      >
        <ToggleSwitch
          enabled={settings.notifications.email}
          onToggle={(value) => updateSetting('notifications', 'email', value)}
        />
      </SettingItem>

      <SettingItem 
        title="Push Notifications"
        description="Get notified on your device"
      >
        <ToggleSwitch
          enabled={settings.notifications.push}
          onToggle={(value) => updateSetting('notifications', 'push', value)}
        />
      </SettingItem>

      <SettingItem 
        title="Desktop Notifications"
        description="Show notifications on desktop"
      >
        <ToggleSwitch
          enabled={settings.notifications.desktop}
          onToggle={(value) => updateSetting('notifications', 'desktop', value)}
        />
      </SettingItem>

      <SettingItem 
        title="Sound"
        description="Play notification sounds"
      >
        <ToggleSwitch
          enabled={settings.notifications.sound}
          onToggle={(value) => updateSetting('notifications', 'sound', value)}
        />
      </SettingItem>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Notification Types
        </h3>

        <SettingItem title="New Messages">
          <ToggleSwitch
            enabled={settings.notifications.messages}
            onToggle={(value) => updateSetting('notifications', 'messages', value)}
          />
        </SettingItem>

        <SettingItem title="Assignment Updates">
          <ToggleSwitch
            enabled={settings.notifications.assignments}
            onToggle={(value) => updateSetting('notifications', 'assignments', value)}
          />
        </SettingItem>

        <SettingItem title="Announcements">
          <ToggleSwitch
            enabled={settings.notifications.announcements}
            onToggle={(value) => updateSetting('notifications', 'announcements', value)}
          />
        </SettingItem>

        <SettingItem title="Study Reminders">
          <ToggleSwitch
            enabled={settings.notifications.reminders}
            onToggle={(value) => updateSetting('notifications', 'reminders', value)}
          />
        </SettingItem>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Profile Visibility
        </h3>
        <div className="space-y-3">
          {privacyOptions.map(option => (
            <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="profileVisibility"
                value={option.id}
                checked={settings.privacy.profileVisibility === option.id}
                onChange={(e) => updateSetting('privacy', 'profileVisibility', e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-gray-900 dark:text-white font-medium">{option.name}</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <SettingItem 
          title="Show Online Status"
          description="Let others see when you're online"
        >
          <ToggleSwitch
            enabled={settings.privacy.showOnlineStatus}
            onToggle={(value) => updateSetting('privacy', 'showOnlineStatus', value)}
          />
        </SettingItem>

        <SettingItem 
          title="Allow Direct Messages"
          description="Let other users message you directly"
        >
          <ToggleSwitch
            enabled={settings.privacy.allowDirectMessages}
            onToggle={(value) => updateSetting('privacy', 'allowDirectMessages', value)}
          />
        </SettingItem>

        <SettingItem 
          title="Share Progress"
          description="Show your learning progress to others"
        >
          <ToggleSwitch
            enabled={settings.privacy.shareProgress}
            onToggle={(value) => updateSetting('privacy', 'shareProgress', value)}
          />
        </SettingItem>

        <SettingItem 
          title="Share Location"
          description="Allow location-based features"
        >
          <ToggleSwitch
            enabled={settings.privacy.shareLocation}
            onToggle={(value) => updateSetting('privacy', 'shareLocation', value)}
          />
        </SettingItem>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Theme
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {themes.map(themeOption => (
            <button
              key={themeOption.id}
              onClick={() => updateSetting('appearance', 'theme', themeOption.id)}
              className={`flex flex-col items-center p-4 rounded-lg border-2 transition-colors ${
                settings.appearance.theme === themeOption.id
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <themeOption.icon className="h-8 w-8 text-gray-600 dark:text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {themeOption.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Font Size
        </h3>
        <div className="space-y-2">
          {fontSizes.map(size => (
            <label key={size.id} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="fontSize"
                value={size.id}
                checked={settings.appearance.fontSize === size.id}
                onChange={(e) => updateSetting('appearance', 'fontSize', e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-900 dark:text-white">{size.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <SettingItem 
          title="Compact Mode"
          description="Use a more compact layout"
        >
          <ToggleSwitch
            enabled={settings.appearance.compactMode}
            onToggle={(value) => updateSetting('appearance', 'compactMode', value)}
          />
        </SettingItem>

        <SettingItem 
          title="Animations"
          description="Enable interface animations"
        >
          <ToggleSwitch
            enabled={settings.appearance.animations}
            onToggle={(value) => updateSetting('appearance', 'animations', value)}
          />
        </SettingItem>
      </div>
    </div>
  );

  const renderLanguageSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Primary Language
        </h3>
        <div className="space-y-2">
          {languages.map(lang => (
            <label key={lang.code} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="primaryLanguage"
                value={lang.code}
                checked={settings.language.primary === lang.code}
                onChange={(e) => updateSetting('language', 'primary', e.target.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-2xl">{lang.flag}</span>
              <span className="text-gray-900 dark:text-white">{lang.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <SettingItem 
        title="Auto Download"
        description="Automatically download content for offline use"
      >
        <ToggleSwitch
          enabled={settings.data.autoDownload}
          onToggle={(value) => updateSetting('data', 'autoDownload', value)}
        />
      </SettingItem>

      <SettingItem 
        title="Offline Mode"
        description="Enable offline reading and study features"
      >
        <ToggleSwitch
          enabled={settings.data.offlineMode}
          onToggle={(value) => updateSetting('data', 'offlineMode', value)}
        />
      </SettingItem>

      <SettingItem 
        title="Data Saver"
        description="Reduce data usage by compressing content"
      >
        <ToggleSwitch
          enabled={settings.data.dataSaver}
          onToggle={(value) => updateSetting('data', 'dataSaver', value)}
        />
      </SettingItem>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="flex items-center justify-between py-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Cache Size
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Current usage: {settings.data.cacheSize}
            </p>
          </div>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Clear Cache
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'language':
        return renderLanguageSettings();
      case 'data':
        return renderDataSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <>
      <Helmet>
        <title>Settings - ElimuConnect</title>
        <meta name="description" content="Customize your ElimuConnect experience" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Settings ⚙️
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Customize your ElimuConnect experience
              </p>
            </div>
            
            <button
              onClick={saveSettings}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <nav className="space-y-1">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-4 py-3 flex items-center space-x-3 transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <tab.icon className="h-5 w-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Account
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete your account? This action cannot be undone 
              and will permanently remove all your data, progress, and messages.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Settings;
