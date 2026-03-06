import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react';
import { getStaff, getAttendance, getTodayStr } from '@/utils/attendance';

const AdminHome: React.FC = () => {
  const staff = getStaff();
  const todayRecords = getAttendance().filter(r => r.date === getTodayStr());
  const presentCount = todayRecords.length;
  const absentCount = staff.length - presentCount;

  const stats = [
    { label: 'Total Staff', value: staff.length, icon: Users, color: 'from-blue-500 to-cyan-400' },
    { label: 'Present Today', value: presentCount, icon: UserCheck, color: 'from-emerald-500 to-green-400' },
    { label: 'Absent Today', value: absentCount, icon: UserX, color: 'from-rose-500 to-pink-400' },
    { label: 'Attendance Rate', value: staff.length > 0 ? `${Math.round((presentCount / staff.length) * 100)}%` : '0%', icon: TrendingUp, color: 'from-amber-500 to-orange-400' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-3xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Welcome back, Administrator</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="stat-card group"
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 float-animation group-hover:shadow-lg transition-shadow`}>
              <stat.icon size={28} className="text-primary-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">{stat.label}</p>
            <p className="font-heading text-3xl font-bold mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Today's Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-6">
        <h3 className="font-heading text-xl font-semibold mb-4">Today's Activity</h3>
        {todayRecords.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No attendance records for today yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Check In</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Check Out</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {todayRecords.map(r => (
                  <tr key={r.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">{r.staffName}</td>
                    <td className="py-3 px-4 text-success">{r.checkIn || '-'}</td>
                    <td className="py-3 px-4 text-warning">{r.checkOut || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${r.checkOut ? 'bg-muted text-muted-foreground' : 'bg-primary/20 text-primary'}`}>
                        {r.checkOut ? 'Completed' : 'Working'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminHome;
