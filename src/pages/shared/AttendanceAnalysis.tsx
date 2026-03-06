import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, Loader2 } from 'lucide-react';
import { getAttendance, getStaff, isLateIn, isEarlyOut } from '@/utils/attendance';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { exportToExcel } from '@/utils/excelExport';

const AttendanceAnalysis: React.FC = () => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const [loaded, setLoaded] = useState(false);
  const [analysis, setAnalysis] = useState<any[]>([]);

  const loadAnalysis = () => {
    const records = getAttendance();
    const staff = getStaff();

    const filteredRecords = user?.role === 'employee'
      ? records.filter(r => r.staffId === user.id)
      : records;

    const grouped: Record<string, any[]> = {};
    filteredRecords.forEach(r => {
      if (!grouped[r.staffId]) grouped[r.staffId] = [];
      grouped[r.staffId].push(r);
    });

    const result = Object.entries(grouped).map(([staffId, recs]) => {
      const member = staff.find(s => s.id === staffId);
      const totalDays = recs.length;
      const lateDays = recs.filter(r => r.checkIn && isLateIn(r.checkIn, settings.workStartTime)).length;
      const earlyOutDays = recs.filter(r => r.checkOut && isEarlyOut(r.checkOut, settings.workEndTime)).length;

      return {
        staffId,
        name: member?.name || recs[0]?.staffName || 'Unknown',
        totalDays,
        lateDays,
        earlyOutDays,
        onTimeDays: totalDays - lateDays,
      };
    });

    setAnalysis(result);
    setLoaded(true);
  };

  const handleExport = () => {
    exportToExcel(analysis.map(a => ({
      Name: a.name,
      'Total Days': a.totalDays,
      'On Time': a.onTimeDays,
      'Late In': a.lateDays,
      'Early Out': a.earlyOutDays,
    })), 'attendance_analysis');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-heading text-3xl font-bold">Attendance Analysis</h2>
          <p className="text-muted-foreground mt-1">Detailed attendance insights</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadAnalysis}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-heading font-semibold text-primary-foreground"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <BarChart3 size={18} />
            Load Analysis
          </motion.button>
          {loaded && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-heading font-semibold bg-secondary text-secondary-foreground"
            >
              <Download size={18} />
              Export
            </motion.button>
          )}
        </div>
      </div>

      {!loaded ? (
        <div className="glass rounded-2xl p-12 text-center">
          <BarChart3 size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Click "Load Analysis" to view attendance data</p>
        </div>
      ) : analysis.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">No attendance data available.</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Total Days</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">On Time</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Late In</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Early Out</th>
                </tr>
              </thead>
              <tbody>
                {analysis.map((a, i) => (
                  <motion.tr
                    key={a.staffId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border/20 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium">{a.name}</td>
                    <td className="py-3 px-4">{a.totalDays}</td>
                    <td className="py-3 px-4 text-success">{a.onTimeDays}</td>
                    <td className="py-3 px-4 text-destructive">{a.lateDays}</td>
                    <td className="py-3 px-4 text-warning">{a.earlyOutDays}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AttendanceAnalysis;
