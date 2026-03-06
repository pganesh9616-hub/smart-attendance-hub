import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Home, Camera, BarChart3, FileText, UserPlus, UserMinus, Settings, Menu, X } from 'lucide-react';

const adminLinks = [
  { path: '/admin', label: 'Home', icon: Home },
  { path: '/admin/attendance', label: 'Mark Attendance', icon: Camera },
  { path: '/admin/analysis', label: 'Analysis', icon: BarChart3 },
  { path: '/admin/reports', label: 'Reports', icon: FileText },
  { path: '/admin/add-staff', label: 'Add Staff', icon: UserPlus },
  { path: '/admin/delete-staff', label: 'Delete Staff', icon: UserMinus },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

const employeeLinks = [
  { path: '/employee', label: 'Home', icon: Home },
  { path: '/employee/attendance', label: 'Mark Attendance', icon: Camera },
  { path: '/employee/analysis', label: 'Analysis', icon: BarChart3 },
  { path: '/employee/settings', label: 'Settings', icon: Settings },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dateTime, setDateTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const links = user?.role === 'admin' ? adminLinks : employeeLinks;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen animated-bg flex flex-col">
      {/* Header */}
      <header className="glass-strong sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-heading font-bold text-sm md:text-lg gradient-text">
            A.A.N.M. & V.V.R.S.R. Polytechnic
          </h1>
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-xs text-muted-foreground">{dateTime.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p className="text-sm font-medium text-primary">{dateTime.toLocaleTimeString('en-IN')}</p>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-xl glass">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:block border-t border-border/30">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link flex items-center gap-2 text-sm ${
                  location.pathname === link.path
                    ? 'text-primary bg-primary/10 active'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            ))}
            <button onClick={handleLogout} className="nav-link flex items-center gap-2 text-sm text-destructive hover:bg-destructive/10 ml-auto">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-border/30"
            >
              <div className="px-4 py-2 space-y-1">
                {links.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all ${
                      location.pathname === link.path
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <link.icon size={16} />
                    {link.label}
                  </Link>
                ))}
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 w-full">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="glass-strong border-t border-border/30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} A.A.N.M. & V.V.R.S.R. Polytechnic. All rights reserved.</p>
          <p className="font-medium">Developed By 23 Batch AIML Students</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
