import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import {
  BookOpen,
  Home,
  Library,
  FileText,
  MessageSquare,
  User,
  LogOut,
  Menu,
  Shield
} from 'lucide-react';
import { useState } from 'react';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: '/app/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/app/library', icon: Library, label: 'Library' },
    { to: '/app/assessments', icon: FileText, label: 'Assessments' },
    { to: '/app/communication', icon: MessageSquare, label: 'Messages' },
  ];

  // Add admin link if user is admin
  if (user?.role?.includes('ADMIN')) {
    navLinks.push({ 
      to: '/app/admin', 
      icon: Shield, 
      label: 'Admin Panel' 
    });
  }

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/app/dashboard" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">ElimuConnect</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(to)
                    ? 'bg-primary-50 text-primary-700'
                    : 'hover:bg-accent'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">{user?.name}</span>
              <span className="text-xs text-muted-foreground">
                ({user?.role.replace('ROLE_', '')})
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(to)
                    ? 'bg-primary-50 text-primary-700'
                    : 'hover:bg-accent'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
