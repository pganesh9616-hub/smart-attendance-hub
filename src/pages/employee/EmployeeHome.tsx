import React from 'react';
import { motion } from 'framer-motion';
import { LogIn, LogOut, Clock } from 'lucide-react';
import { getAttendance, getTodayStr } from '@/utils/attendance';
import { useAuth } from '@/contexts/AuthContext';

const EmployeeHome: React.FC = () => {
  const { user } = useAuth();
  const todayRecord = getAttendance().find(r => r.staffId === user?.id && r.date === getTodayStr());

  const cards = [
    {
      label: 'Check In',
      value: todayRecord?.checkIn || 'Not yet',
      icon: LogIn,
      color: 'from-emerald-500 to-green-400',
      active: !!todayRecord?.checkIn,
    },
    {
      label: 'Check Out',
      value: todayRecord?.checkOut || 'Not yet',
      icon: LogOut,
      color: 'from-rose-500 to-pink-400',
      active: !!todayRecord?.checkOut,
    },
    {
      label: 'Status',
      value: !todayRecord ? 'Absent' : todayRecord.checkOut ? 'Completed' : 'Working',
      icon: Clock,
      color: 'from-amber-500 to-orange-400',
      active: true,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-3xl font-bold">Welcome, {user?.name}</h2>
        <p className="text-muted-foreground mt-1">Your attendance status for today</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="stat-card text-center"
          >
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mx-auto mb-4 float-animation`}>
              <card.icon size={32} className="text-primary-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">{card.label}</p>
            <p className="font-heading text-2xl font-bold mt-1">{card.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeHome;
