import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserMinus, AlertTriangle, Trash2 } from 'lucide-react';
import { getStaff, saveStaff, getAttendance, saveAttendance } from '@/utils/attendance';
import { toast } from 'sonner';

const DeleteStaff: React.FC = () => {
  const [staff, setStaffList] = useState(getStaff());
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    const updated = staff.filter(s => s.id !== id);
    saveStaff(updated);
    // Also remove attendance records
    const attendance = getAttendance().filter(a => a.staffId !== id);
    saveAttendance(attendance);
    setStaffList(updated);
    setConfirmId(null);
    toast.success('Staff member deleted successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-3xl font-bold">Delete Staff</h2>
        <p className="text-muted-foreground mt-1">Remove staff members from the system</p>
      </div>

      {staff.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <UserMinus size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No staff members registered yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-5 space-y-3"
            >
              <div>
                <h3 className="font-heading font-semibold text-lg">{s.name}</h3>
                <p className="text-muted-foreground text-sm">{s.department || 'No department'}</p>
                <p className="text-muted-foreground text-xs">{s.designation || 'No designation'}</p>
              </div>

              {confirmId === s.id ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertTriangle size={16} />
                    <span>Are you sure? This cannot be undone.</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleDelete(s.id)}
                      className="flex-1 px-3 py-2 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium">
                      Confirm Delete
                    </button>
                    <button onClick={() => setConfirmId(null)}
                      className="flex-1 px-3 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-medium">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setConfirmId(s.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeleteStaff;
