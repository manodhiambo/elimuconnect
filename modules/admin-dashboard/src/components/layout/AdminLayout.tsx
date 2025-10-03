import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  School, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const adminEmail = localStorage.getItem('admin_email') || 'Admin';
  const adminName = localStorage.getItem('admin_name') || 'Administrator';

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    localStorage.removeItem('admin_name');
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/users', icon: Users, label: 'User Management' },
    { path: '/content', icon: BookOpen, label: 'Content Management' },
    { path: '/schools', icon: School, label: 'Schools' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-primary-600">ElimuConnect</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-primary-700">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-2xl font-bold text-white">ElimuConnect</h1>
            </div>
            <nav className="mt-8 flex-1 space-y-1 px-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive(item.path)
                        ? 'bg-primary-800 text-white'
                        : 'text-primary-100 hover:bg-primary-600'
                    }`}
                  >
                    <Icon className="mr-3 h-6 w-6 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-primary-800 p-4">
            <div className="group block w-full flex-shrink-0">
              <div className="flex items-center">
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-white">{adminName}</p>
                  <p className="text-xs text-primary-200">{adminEmail}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-3 rounded-md p-2 text-primary-200 hover:bg-primary-600"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-gray-600 bg-opacity-75">
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-primary-700">
            <div className="flex min-h-0 flex-1 flex-col pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4">
                <h1 className="text-2xl font-bold text-white">ElimuConnect</h1>
              </div>
              <nav className="mt-8 flex-1 space-y-1 px-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive(item.path)
                          ? 'bg-primary-800 text-white'
                          : 'text-primary-100 hover:bg-primary-600'
                      }`}
                    >
                      <Icon className="mr-3 h-6 w-6 flex-shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex flex-shrink-0 border-t border-primary-800 p-4">
              <div className="group block w-full flex-shrink-0">
                <div className="flex items-center">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-white">{adminName}</p>
                    <p className="text-xs text-primary-200 truncate">{adminEmail}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-3 rounded-md p-2 text-primary-200 hover:bg-primary-600"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1 pt-16 lg:pt-0">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
