import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { Theme, TextSize } from '../types';
import { CloseIcon } from './icons';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    const { settings, updateSettings } = useSettings();

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateSettings({ volume: parseFloat(e.target.value) });
    };

    const handleThemeChange = () => {
        updateSettings({ theme: settings.theme === Theme.Light ? Theme.Dark : Theme.Light });
    };

    const setTextSize = (size: TextSize) => {
        updateSettings({ textSize: size });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-surface dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-text dark:hover:text-white">
                    <CloseIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-primary-dark dark:text-primary-light mb-6">Settings</h2>

                <div className="space-y-6">
                    {/* Volume */}
                    <div>
                        <label className="block font-semibold text-text dark:text-gray-200 mb-2">🔊 Voice Volume</label>
                        <div className="flex items-center space-x-4">
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={settings.volume}
                                onChange={handleVolumeChange}
                                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary-light"
                            />
                            <span className="font-mono w-10 text-center text-muted dark:text-gray-400">{Math.round(settings.volume * 100)}%</span>
                        </div>
                    </div>
                    
                    {/* Text Size */}
                    <div>
                        <label className="block font-semibold text-text dark:text-gray-200 mb-2">🔠 Text Size</label>
                        <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-200 dark:bg-gray-700 p-1">
                            {(Object.values(TextSize) as TextSize[]).map(size => (
                                <button
                                    key={size}
                                    onClick={() => setTextSize(size)}
                                    className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${settings.textSize === size ? 'bg-primary-light text-white shadow' : 'text-muted dark:text-gray-400 hover:bg-white/50 dark:hover:bg-black/20'}`}
                                >
                                    {size.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Theme */}
                    <div>
                        <label className="block font-semibold text-text dark:text-gray-200 mb-2">🎨 Color Theme</label>
                         <div className="flex items-center justify-between bg-gray-200 dark:bg-gray-700 p-2 rounded-lg">
                            <span className="text-muted dark:text-gray-300">Light / Dark</span>
                            <button onClick={handleThemeChange} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${settings.theme === Theme.Dark ? 'bg-primary-light' : 'bg-gray-400'}`}>
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.theme === Theme.Dark ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
