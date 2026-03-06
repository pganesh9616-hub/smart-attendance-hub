import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff, Scan } from 'lucide-react';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    
    const success = login(username, password);
    if (success) {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/employee');
    } else {
      toast.error('Invalid credentials. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen animated-bg flex flex-col">
      {/* Header */}
      <header className="glass-strong">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-heading font-bold text-lg gradient-text">
            A.A.N.M. & V.V.R.S.R. Polytechnic
          </h1>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-sm font-medium text-primary">{new Date().toLocaleTimeString('en-IN')}</p>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div className="glass-strong rounded-3xl p-8 space-y-6">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center pulse-glow" style={{ background: 'var(--gradient-primary)' }}>
                <Scan size={40} className="text-primary-foreground" />
              </div>
            </motion.div>

            <div className="text-center space-y-2">
              <h2 className="font-heading text-2xl font-bold">Smart Attendance</h2>
              <p className="text-muted-foreground text-sm">Face Recognition Based System</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Username</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl font-heading font-semibold text-primary-foreground transition-all disabled:opacity-50"
                style={{ background: 'var(--gradient-primary)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="inline-block w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
                    Authenticating...
                  </span>
                ) : 'Login'}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="glass-strong">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} A.A.N.M. & V.V.R.S.R. Polytechnic. All rights reserved.</p>
          <p className="font-medium">Developed By 23 Batch AIML Students</p>
        </div>
      </footer>
    </div>
  );
};

export default Login;
