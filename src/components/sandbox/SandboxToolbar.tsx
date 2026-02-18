import React, { useState } from 'react';
import { Play, Pause, RefreshCw, Settings, Shield, Zap, Moon, Sun } from 'lucide-react';
import Button from '../ui/Button';
import { useProgress } from '../../context/ProgressContext';
import { useDarkMode } from '../../hooks/useDarkMode';

interface SandboxToolbarProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onTriggerSpike: () => void;
  mode?: 'node' | 'god';
  onToggleMode?: () => void;
}

const SandboxToolbar: React.FC<SandboxToolbarProps> = ({
  isRunning,
  onToggle,
  onReset,
  onTriggerSpike,
  mode,
  onToggleMode,
}) => {
  const { getMasteryScore, getRank } = useProgress();
  const { isDarkMode, toggle: toggleTheme } = useDarkMode();
  const [showSettings, setShowSettings] = useState(false);

  const score = getMasteryScore();
  const rank = getRank();

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-4 sticky top-16 z-30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

        {/* Left: Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant={isRunning ? "secondary" : "primary"}
            onClick={onToggle}
            className="flex-1 md:flex-none"
          >
            {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isRunning ? 'Pause Network' : 'Resume'}
          </Button>

          {onToggleMode && (
            <>
              <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-2 hidden md:block" />

              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                 <button
                    onClick={() => mode !== 'node' && onToggleMode()}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'node' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                 >
                     Node View
                 </button>
                 <button
                    onClick={() => mode !== 'god' && onToggleMode()}
                     className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'god' ? 'bg-white dark:bg-gray-700 shadow-sm text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                 >
                     God Mode
                 </button>
              </div>
            </>
          )}
        </div>

        {/* Center: Mastery (Desktop) */}
        <div className="hidden lg:flex items-center gap-4">
             <div className="flex flex-col items-end">
                 <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mastery</div>
                 <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                     <Shield className="w-4 h-4 text-indigo-500" />
                     {rank}
                 </div>
             </div>
             <div className="w-32 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${Math.min(score, 100)}%` }} />
             </div>
             <div className="font-mono font-bold text-indigo-500">{score} XP</div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" size="sm" onClick={onTriggerSpike} title="Simulate Transaction Spike">
                <Zap className="w-4 h-4 text-amber-500" />
            </Button>

            <div className="relative">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                    className={showSettings ? 'bg-gray-100 dark:bg-gray-800' : ''}
                >
                    <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </Button>

                {showSettings && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 p-2 animate-in slide-in-from-top-2 z-50">
                        <button
                            onClick={() => {
                                toggleTheme();
                                setShowSettings(false);
                            }}
                            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            {isDarkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                        </button>
                        <div className="h-[1px] bg-gray-100 dark:bg-gray-800 my-1" />
                        <button
                            onClick={() => {
                                onReset();
                                setShowSettings(false);
                            }}
                            className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reset Network
                        </button>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default SandboxToolbar;
