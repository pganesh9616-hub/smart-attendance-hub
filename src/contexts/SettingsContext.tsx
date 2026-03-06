import React, { createContext, useContext, useState, useEffect } from 'react';

interface Settings {
  workStartTime: string;
  workEndTime: string;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (s: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

const DEFAULT_SETTINGS: Settings = { workStartTime: '09:00', workEndTime: '17:00' };

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (s: Partial<Settings>) => setSettings(prev => ({ ...prev, ...s }));

  return <SettingsContext.Provider value={{ settings, updateSettings }}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};
