import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar } from 'lucide-react';
import { getAttendance, getStaff, isLateIn, isEarlyOut } from '@/utils/attendance';
import { useSettings } from '@/contexts/SettingsContext';
import { exportToExcel } from '@/utils/excelExport';

type ReportType = 'daily' | 'monthly' | 'yearly' | 'custom';

const Reports: React.FC = () => {
  const { settings } = useSettings();
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [report, setReport] = useState<any[] | null>(null);

  const generateReport = () => {
    const records = getAttendance();
    const staff = getStaff();
    const today = new Date();
    let filtered = records;

    if (reportType === 'daily') {
      const dateStr = today.toISOString().split('T')[0];
      filtered = records.filter(r => r.date === dateStr);
    } else if (reportType === 'monthly') {
      const month = today.toISOString().slice(0, 7);
      filtered = records.filter(r => r.date.startsWith(month));
    } else if (reportType === 'yearly') {
      const year = today.getFullYear().toString();
      filtered = records.filter(r => r.date.startsWith(year));
    } else if (reportType === 'custom' && customStart && customEnd) {
      filtered = records.filter(r => r.date >= customStart && r.date <= customEnd);
    }

    const result = filtered.map(r => {
      const member = staff.find(s => s.id === r.staffId);
      return {
        Date: r.date,
        Name: member?.name || r.staffName,
        'Check In': r.checkIn || '-',
        'Check Out': r.checkOut || '-',
        'Late In': r.checkIn && isLateIn(r.checkIn, settings.workStartTime) ? 'Yes' : 'No',
        'Early Out': r.checkOut && isEarlyOut(r.checkOut, settings.workEndTime) ? 'Yes' : 'No',
      };
    });

    setReport(result);
  };

  const handleExport = () => {
    if (report) exportToExcel(report, `attendance_report_${reportType}`);
  };

  const types: { value: ReportType; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom Range' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl font-bold">Reports</h2>
        <p className="text-muted-foreground mt-1">Generate and export attendance reports</p>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap gap-3">
          {types.map(t => (
            <button
              key={t.value}
              onClick={() => { setReportType(t.value); setReport(null); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                reportType === t.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {reportType === 'custom' && (
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Start Date</label>
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
                className="px-4 py-2 rounded-xl bg-muted/50 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">End Date</label>
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                className="px-4 py-2 rounded-xl bg-muted/50 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={generateReport}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-heading font-semibold text-primary-foreground"
            style={{ background: 'var(--gradient-primary)' }}>
            <FileText size={18} />
            Generate Report
          </motion.button>
          {report && (
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleExport}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-heading font-semibold bg-secondary text-secondary-foreground">
              <Download size={18} />
              Export Excel
            </motion.button>
          )}
        </div>
      </div>

      {report && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
          {report.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No records found for the selected period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    {Object.keys(report[0]).map(key => (
                      <th key={key} className="text-left py-3 px-4 text-muted-foreground font-medium">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.map((row, i) => (
                    <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="py-3 px-4">{val as string}</td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Reports;
