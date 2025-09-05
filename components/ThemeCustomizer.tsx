import React, { useRef, useState } from 'react';
import { XIcon } from './icons/XIcon';
import { ImageIcon } from './icons/ImageIcon';
import { ThemeColor, FontFamily, themes, fonts } from '../theme';
import { ToggleSwitch } from './ToggleSwitch';
import { ThemeMode, BackgroundSettings, BackgroundMode } from '../types';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { MONTHS } from '../constants';

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  calendarName: string;
  onCalendarNameChange: (name: string) => void;
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
  currentColor: ThemeColor;
  onColorChange: (color: ThemeColor) => void;
  currentFont: FontFamily;
  onFontChange: (font: FontFamily) => void;
  backgroundSettings: BackgroundSettings;
  onBackgroundSettingsChange: (settings: BackgroundSettings) => void;
  isProximityAlertsEnabled: boolean;
  onProximityAlertsChange: (enabled: boolean) => void;
  proximityAlertThreshold: number;
  onProximityAlertThresholdChange: (minutes: number) => void;
  movementThreshold: number;
  onMovementThresholdChange: (km: number) => void;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  isOpen,
  onClose,
  calendarName,
  onCalendarNameChange,
  themeMode,
  onThemeModeChange,
  currentColor,
  onColorChange,
  currentFont,
  onFontChange,
  backgroundSettings,
  onBackgroundSettingsChange,
  isProximityAlertsEnabled,
  onProximityAlertsChange,
  proximityAlertThreshold,
  onProximityAlertThresholdChange,
  movementThreshold,
  onMovementThresholdChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeMonthUpload, setActiveMonthUpload] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleBgUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newImage = reader.result as string;
      if (activeMonthUpload !== null) {
        // Monthly upload
        const newMonthlyImages = {
          ...backgroundSettings.monthlyImages,
          [activeMonthUpload]: newImage,
        };
        onBackgroundSettingsChange({
          ...backgroundSettings,
          monthlyImages: newMonthlyImages,
        });
        setActiveMonthUpload(null); // Reset after upload
      } else {
        // Single upload
        onBackgroundSettingsChange({
          ...backgroundSettings,
          singleImage: newImage,
        });
      }
    };
    reader.readAsDataURL(file);
    if(event.target) event.target.value = ''; // Reset file input to allow re-uploading the same file
  };

  const triggerSingleUpload = () => {
    setActiveMonthUpload(null);
    fileInputRef.current?.click();
  };

  const triggerMonthUpload = (monthIndex: number) => {
    setActiveMonthUpload(monthIndex);
    fileInputRef.current?.click();
  };
  
  const removeSingleBg = () => {
    onBackgroundSettingsChange({ ...backgroundSettings, singleImage: null });
  };
  
  const removeMonthBg = (monthIndex: number) => {
    const newMonthlyImages = { ...backgroundSettings.monthlyImages };
    delete newMonthlyImages[monthIndex];
    onBackgroundSettingsChange({ ...backgroundSettings, monthlyImages: newMonthlyImages });
  };

  const handleModeChange = (mode: BackgroundMode) => {
    onBackgroundSettingsChange({ ...backgroundSettings, mode });
  };
  
  const inputClasses = "w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-500)] dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:focus:ring-offset-slate-800";
  const modeButtonClasses = (mode: BackgroundMode) => `flex-1 py-1.5 text-xs font-semibold transition-colors ${backgroundSettings.mode === mode ? 'bg-slate-200 dark:bg-slate-600' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm p-6 animate-fade-in-up flex flex-col" style={{ maxHeight: '90vh' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Customize</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
            <XIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
        
        <div className="space-y-6 overflow-y-auto pr-2 flex-1">
          {/* Calendar Name */}
          <div>
            <label htmlFor="calendar-name" className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 block">Calendar Name</label>
            <input
              id="calendar-name"
              type="text"
              value={calendarName}
              onChange={(e) => onCalendarNameChange(e.target.value)}
              className={inputClasses}
            />
          </div>

          {/* Dark Mode Toggle */}
          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 block">Appearance</label>
            <div className="flex rounded-md border border-slate-300 dark:border-slate-600 p-1">
              <button
                onClick={() => onThemeModeChange('light')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm transition-colors ${themeMode === 'light' ? 'bg-slate-200 dark:bg-slate-600' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                <SunIcon className="w-5 h-5 text-slate-700 dark:text-slate-200" /> Light
              </button>
              <button
                onClick={() => onThemeModeChange('dark')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm transition-colors ${themeMode === 'dark' ? 'bg-slate-200 dark:bg-slate-600' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                <MoonIcon className="w-5 h-5 text-slate-700 dark:text-slate-200" /> Dark
              </button>
            </div>
          </div>

          {/* Color Theme Selector */}
          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 block">Color Theme</label>
            <div className="flex flex-wrap items-center gap-3">
              {(Object.keys(themes) as ThemeColor[]).map(color => (
                <button
                  key={color}
                  onClick={() => onColorChange(color)}
                  className={`w-8 h-8 rounded-full capitalize ring-2 ring-offset-2 transition-all ${currentColor === color ? 'ring-slate-800 dark:ring-slate-200' : 'ring-transparent hover:ring-slate-400'}`}
                  style={{ backgroundColor: themes[color]['500'] }}
                  title={color}
                />
              ))}
            </div>
          </div>
          
          {/* Font Selector */}
          <div>
            <label htmlFor="font-select" className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 block">Font Style</label>
            <select
              id="font-select"
              value={currentFont}
              onChange={(e) => onFontChange(e.target.value as FontFamily)}
              className={`${inputClasses} capitalize`}
            >
              {(Object.keys(fonts) as FontFamily[]).map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>

          {/* Background Image Uploader */}
          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 block">Background Image</label>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleBgUpload} />
            <div className="flex rounded-md border border-slate-300 dark:border-slate-600 p-1 mb-3">
              <button onClick={() => handleModeChange('single')} className={`${modeButtonClasses('single')} rounded-l-md`}>Single</button>
              <button onClick={() => handleModeChange('monthly')} className={`${modeButtonClasses('monthly')} rounded-r-md border-l border-slate-300 dark:border-slate-600`}>Monthly</button>
            </div>

            {backgroundSettings.mode === 'single' ? (
              <div className="flex items-center gap-3">
                <button onClick={triggerSingleUpload} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white text-slate-700 font-semibold border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-all dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600">
                  <ImageIcon className="w-5 h-5" /> Upload
                </button>
                <button onClick={removeSingleBg} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-semibold text-sm dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500">
                  Remove
                </button>
              </div>
            ) : (
              <div>
                 <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Upload an image for each month. A fallback can also be set.</p>
                 <div className="flex items-center gap-3 mb-4">
                     <button onClick={triggerSingleUpload} className="flex-1 px-3 py-1.5 bg-white text-slate-700 font-semibold border border-slate-300 rounded-md shadow-sm hover:bg-slate-50 transition-all dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600 text-xs">
                        {backgroundSettings.singleImage ? 'Change Fallback' : 'Upload Fallback'}
                     </button>
                     {backgroundSettings.singleImage && (
                        <button onClick={removeSingleBg} className="px-3 py-1.5 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 font-semibold text-xs dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500">
                           Remove
                        </button>
                     )}
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                    {MONTHS.map((month, index) => (
                      <div key={index} className="relative">
                        <button
                          onClick={() => triggerMonthUpload(index)}
                          className="w-full aspect-square rounded-md border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 bg-cover bg-center"
                          style={{ backgroundImage: backgroundSettings.monthlyImages[index] ? `url(${backgroundSettings.monthlyImages[index]})` : 'none' }}
                        >
                          {!backgroundSettings.monthlyImages[index] && month.substring(0, 3)}
                        </button>
                        {backgroundSettings.monthlyImages[index] && (
                          <button onClick={() => removeMonthBg(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/80">
                            <XIcon className="w-3 h-3"/>
                          </button>
                        )}
                      </div>
                    ))}
                 </div>
              </div>
            )}
          </div>
          
           {/* Smart Alerter Toggle */}
          <div className="border-t border-slate-200 dark:border-slate-600 pt-5">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 block">Smart Alerts</label>
            <div className="flex items-start justify-between gap-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[75%]">
                    Get timely alerts for important events. For events with a location, it checks if you're on your way. For others, it acts as a reminder.
                </p>
                <ToggleSwitch
                    checked={isProximityAlertsEnabled}
                    onChange={onProximityAlertsChange}
                />
            </div>
            {isProximityAlertsEnabled && (
                <div className="mt-4 space-y-3 pl-2 border-l-2 border-slate-200 dark:border-slate-600">
                    <div>
                        <label htmlFor="alert-window" className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Alert Window (minutes)</label>
                        <input
                            id="alert-window"
                            type="number"
                            value={proximityAlertThreshold}
                            onChange={(e) => onProximityAlertThresholdChange(Number(e.target.value))}
                            className={`${inputClasses} mt-1 text-sm`}
                            min="1"
                            step="1"
                        />
                    </div>
                     <div>
                        <label htmlFor="movement-threshold" className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Movement Threshold (km)</label>
                        <input
                            id="movement-threshold"
                            type="number"
                            value={movementThreshold}
                            onChange={(e) => onMovementThresholdChange(Number(e.target.value))}
                            className={`${inputClasses} mt-1 text-sm`}
                            min="0.01"
                            step="0.01"
                        />
                    </div>
                </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-[var(--primary-600)] text-white rounded-md hover:bg-[var(--primary-700)] font-semibold">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};