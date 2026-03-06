export interface StaffMember {
  id: string;
  name: string;
  department: string;
  designation: string;
  username: string;
  password: string;
  faceDescriptors: number[][];
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
}

export const getStaff = (): StaffMember[] => JSON.parse(localStorage.getItem('staff') || '[]');
export const saveStaff = (staff: StaffMember[]) => localStorage.setItem('staff', JSON.stringify(staff));

export const getAttendance = (): AttendanceRecord[] => JSON.parse(localStorage.getItem('attendance') || '[]');
export const saveAttendance = (records: AttendanceRecord[]) => localStorage.setItem('attendance', JSON.stringify(records));

export const getTodayStr = () => new Date().toISOString().split('T')[0];

export const markAttendanceRecord = (staffId: string, staffName: string): { type: 'checkin' | 'checkout'; name: string } => {
  const records = getAttendance();
  const today = getTodayStr();
  const existing = records.find(r => r.staffId === staffId && r.date === today);
  const now = new Date().toLocaleTimeString('en-IN', { hour12: false });

  if (existing) {
    if (!existing.checkOut) {
      existing.checkOut = now;
      saveAttendance(records);
      return { type: 'checkout', name: staffName };
    }
    return { type: 'checkout', name: staffName };
  } else {
    records.push({ id: crypto.randomUUID(), staffId, staffName, date: today, checkIn: now, checkOut: null });
    saveAttendance(records);
    return { type: 'checkin', name: staffName };
  }
};

export const isLateIn = (checkIn: string, workStart: string): boolean => {
  return checkIn > workStart;
};

export const isEarlyOut = (checkOut: string, workEnd: string): boolean => {
  return checkOut < workEnd;
};
