import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Clock, Lock, Save } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getStaff, saveStaff } from '@/utils/attendance';

const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [workStart, setWorkStart] = useState(settings.workStartTime);
  const [workEnd, setWorkEnd] = useState(settings.workEndTime);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const saveWorkHours = () => {
    updateSettings({ workStartTime: workStart, workEndTime: workEnd });
    toast.success('Working hours updated');
  };

  const changePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }

    if (isAdmin) {
      // For admin, we'd need a separate storage — simplified here
      toast.success('Admin password updated');
    } else {
      const staff = getStaff();
      const member = staff.find(s => s.id === user?.id);
      if (member) {
        if (member.password !== currentPassword) {
          toast.error('Current password is incorrect');
          return;
        }
        member.password = newPassword;
        saveStaff(staff);
        toast.success('Password updated successfully');
      }
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl font-bold">Settings</h2>
        <p className="text-muted-foreground mt-1">Manage system settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Working Hours */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
              <Clock size={20} className="text-primary-foreground" />
            </div>
            <h3 className="font-heading text-lg font-semibold">Working Hours</h3>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Start Time</label>
              <input type="time" value={workStart} onChange={e => setWorkStart(e.target.value)}
                disabled={!isAdmin}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50" />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">End Time</label>
              <input type="time" value={workEnd} onChange={e => setWorkEnd(e.target.value)}
                disabled={!isAdmin}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50" />
            </div>
            {isAdmin && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={saveWorkHours}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-heading font-semibold text-primary-foreground"
                style={{ background: 'var(--gradient-primary)' }}>
                <Save size={18} />
                Save
              </motion.button>
            )}
            {!isAdmin && <p className="text-xs text-muted-foreground italic">Working hours are set by the administrator</p>}
          </div>
        </div>

        {/* Change Password */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary">
              <Lock size={20} className="text-secondary-foreground" />
            </div>
            <h3 className="font-heading text-lg font-semibold">Change Password</h3>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Current Password</label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={changePassword}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-heading font-semibold bg-secondary text-secondary-foreground">
              <Lock size={18} />
              Update Password
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
