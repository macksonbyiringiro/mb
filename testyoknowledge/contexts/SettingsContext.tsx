import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { Settings, Theme, TextSize } from '../types';

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  volume: 0.8,
  theme: Theme.Light,
  textSize: TextSize.MD,
};

export const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
});

export const useSettings = () => useContext(SettingsContext);

const applySettingsDOM = (settings: Settings) => {
  const root = document.documentElement;

  // Theme
  if (settings.theme === Theme.Dark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Text Size
  if (settings.textSize === TextSize.SM) {
    root.style.fontSize = '14px';
  } else if (settings.textSize === TextSize.LG) {
    root.style.fontSize = '18px';
  } else { // MD
    root.style.fontSize = '16px';
  }
};


export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const storedSettings = window.localStorage.getItem('TestYoKnowledge-settings');
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        return { ...defaultSettings, ...parsed };
      }
    } catch (error) {
      console.error("Could not load settings from localStorage", error);
    }
    return defaultSettings;
  });

  useEffect(() => {
    applySettingsDOM(settings);
    try {
      window.localStorage.setItem('TestYoKnowledge-settings', JSON.stringify(settings));
    } catch (error) {
      console.error("Could not save settings to localStorage", error);
    }
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
