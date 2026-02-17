import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useProgress } from '../../context/ProgressContext';
import { useNodeIdentity } from '../../context/NodeContext';
import { useSound } from '../../context/SoundContext';
import {
    Moon, Sun, Lock, Home, Map, Box, CheckCircle, Menu, X,
    Volume2, VolumeX, Shield, Award, RotateCcw, Monitor
} from 'lucide-react';
import Button from '../ui/Button';

const TopBar: React.FC = () => {
  const { isDarkMode, toggle: toggleTheme } = useDarkMode();
  const { currentStep, sandboxUnlocked, challengesUnlocked, getMasteryScore, getRank, resetProgress } = useProgress();
  const { identity } = useNodeIdentity();
  const { isMuted, toggleMute } = useSound();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const rank = getRank();
  const score = getMasteryScore();
  const nodeId = identity ? identity.getId() : 'Unknown';

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
        resetProgress();
        navigate('/');
        setIsMenuOpen(false);
    }
  };

  const NavItem = ({ to, label, icon: Icon, unlocked = true, progress = false, statusIcon = null }: any) => (
    <NavLink
      to={unlocked ? to : "#"}
      onClick={(e) => {
        if (!unlocked) e.preventDefault();
      }}
      className={({ isActive }) => `
        flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-colors relative group
        ${isActive ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}
        ${!unlocked ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <Icon className="w-4 h-4 mr-2" />
      <span className="mr-2">{label}</span>

      {progress && (
        <div className="flex flex-col w-16 ml-2 hidden lg:flex">
            <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(currentStep / 8) * 100}%` }}
                />
            </div>
            <span className="text-[10px] text-indigo-500 font-bold leading-none mt-1">Step {currentStep}/8</span>
        </div>
      )}

      {statusIcon && (
          <div className="ml-auto lg:ml-2">
              {statusIcon}
          </div>
      )}
    </NavLink>
  );

  return (
    <>
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="flex items-center justify-between px-4 md:px-6 h-full max-w-7xl mx-auto">

        {/* Brand */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
            B
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 font-display hidden sm:block">
            BlockChain Experience
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <NavItem to="/" label="Home" icon={Home} />

          {/* Journey with Progress - Corrected implementation */}
          <NavItem
            to="/journey"
            label={
                <span className="flex items-center gap-2">
                    Journey
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">▸{currentStep}/8</span>
                </span>
            }
            icon={Map}
            progress={true}
          />

          <NavItem
            to="/sandbox"
            label="Sandbox"
            icon={Box}
            unlocked={sandboxUnlocked}
            statusIcon={sandboxUnlocked ? <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> : <Lock className="w-3 h-3 text-gray-400" />}
          />

          <NavItem
            to="/challenges"
            label="Challenges"
            icon={Award}
            unlocked={challengesUnlocked}
            statusIcon={challengesUnlocked ? <div className="text-[10px] font-bold text-indigo-500">#A7F3</div> : <Lock className="w-3 h-3 text-gray-400" />}
          />
        </nav>

        {/* Right Actions (Desktop) */}
        <div className="hidden md:flex items-center space-x-3">
            {/* Node ID Badge */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
                <Monitor className="w-3 h-3 text-indigo-500" />
                <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300">Node {nodeId.substring(0, 6)}</span>
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
            >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
            className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(true)}
        >
            <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>

    {/* Mobile Menu Overlay */}
    {isMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu Panel */}
            <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-200 dark:border-gray-800">
                {/* Header */}
                <div className="p-6 flex items-center justify-end border-b border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Node Info */}
                <div className="px-6 py-8 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Node {nodeId.substring(0,6)}</h3>
                        <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full border border-indigo-200 dark:border-indigo-800">
                            #{nodeId.substring(0,4)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                             <Shield className={`w-4 h-4 ${rank === 'Novice' ? 'text-gray-400' : rank === 'Learner' ? 'text-blue-400' : rank === 'Expert' ? 'text-purple-400' : 'text-amber-400'}`} />
                             <span className="font-bold text-gray-700 dark:text-gray-200">{rank}</span>
                        </div>
                        <span className="font-mono text-sm text-gray-500 dark:text-gray-400">{score}/100 XP</span>
                    </div>

                    <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${score}%` }} />
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <NavLink
                        to="/"
                        onClick={() => setIsMenuOpen(false)}
                        className={({isActive}) => `flex items-center px-4 py-4 rounded-xl text-lg font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        <Home className="w-5 h-5 mr-3" />
                        Home
                    </NavLink>

                    <NavLink
                        to="/journey"
                        onClick={() => setIsMenuOpen(false)}
                        className={({isActive}) => `flex items-center justify-between px-4 py-4 rounded-xl text-lg font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        <div className="flex items-center">
                            <Map className="w-5 h-5 mr-3" />
                            Journey
                        </div>
                        <span className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">Step {currentStep}/8</span>
                    </NavLink>

                    <NavLink
                        to={sandboxUnlocked ? "/sandbox" : "#"}
                        onClick={(e) => {
                            if (!sandboxUnlocked) e.preventDefault();
                            else setIsMenuOpen(false);
                        }}
                        className={({isActive}) => `flex items-center justify-between px-4 py-4 rounded-xl text-lg font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'} ${!sandboxUnlocked && 'opacity-50 cursor-not-allowed'}`}
                    >
                        <div className="flex items-center">
                            <Box className="w-5 h-5 mr-3" />
                            Sandbox
                        </div>
                        {sandboxUnlocked ? <div className="w-2 h-2 rounded-full bg-emerald-500" /> : <Lock className="w-4 h-4" />}
                    </NavLink>

                    <NavLink
                        to={challengesUnlocked ? "/challenges" : "#"}
                         onClick={(e) => {
                            if (!challengesUnlocked) e.preventDefault();
                            else setIsMenuOpen(false);
                        }}
                        className={({isActive}) => `flex items-center justify-between px-4 py-4 rounded-xl text-lg font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'} ${!challengesUnlocked && 'opacity-50 cursor-not-allowed'}`}
                    >
                        <div className="flex items-center">
                            <Award className="w-5 h-5 mr-3" />
                            Challenges
                        </div>
                        {challengesUnlocked ? <span className="text-sm text-gray-500">2/5</span> : <Lock className="w-4 h-4" />}
                    </NavLink>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                    <button
                        onClick={handleReset}
                        className="flex items-center w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                    >
                        <RotateCcw className="w-5 h-5 mr-3" />
                        Reset Progress
                    </button>

                    <button
                        onClick={toggleTheme}
                        className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <div className="flex items-center text-gray-700 dark:text-gray-200 font-medium">
                            {isDarkMode ? <Moon className="w-5 h-5 mr-3" /> : <Sun className="w-5 h-5 mr-3" />}
                            Dark Mode
                        </div>
                        {/* Toggle Switch Visual */}
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${isDarkMode ? 'bg-indigo-500' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )}
    </>
  );
};

export default TopBar;
