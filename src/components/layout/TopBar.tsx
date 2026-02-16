import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useThemeStore } from '../../stores/useThemeStore';
import { useProgress } from '../../context/ProgressContext';
import { useNodeIdentity } from '../../context/NodeContext';
import { useSound } from '../../context/SoundContext';
import { Moon, Sun, Lock, Home, Map, Box, CheckCircle, Menu, X, Volume2, VolumeX, Shield, Award } from 'lucide-react';
import Button from '../ui/Button';

const TopBar: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { currentStep, sandboxUnlocked, challengesUnlocked, getMasteryScore, getRank } = useProgress();
  const { identity } = useNodeIdentity();
  const { isMuted, toggleMute } = useSound();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const rank = getRank();
  const score = getMasteryScore();
  const nodeId = identity ? identity.getId() : 'Unknown';

  const NavItem = ({ to, label, icon: Icon, unlocked = true, progress = false, statusIcon = null }: any) => (
    <NavLink
      to={unlocked ? to : "#"}
      onClick={(e) => {
        if (!unlocked) e.preventDefault();
        setIsMenuOpen(false);
      }}
      className={({ isActive }) => `
        flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors relative group
        ${isActive ? 'bg-secondary-bg text-indigo-500' : 'text-text-secondary hover:text-text-primary hover:bg-secondary-bg/50'}
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
    <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-primary-bg/90 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-4 md:px-6 h-full">

        {/* Brand */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
            B
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 hidden sm:block">
            BlockSim
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavItem to="/" label="Home" icon={Home} />
          <NavItem to="/journey" label="Journey" icon={Map} progress={true} />

          <NavItem
            to="/sandbox"
            label="Sandbox"
            icon={Box}
            unlocked={sandboxUnlocked}
            statusIcon={sandboxUnlocked ? <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> : <Lock className="w-3 h-3 text-gray-400" />}
          />

          <NavItem
            to="/challenges"
            label="Challenges"
            icon={Award}
            unlocked={challengesUnlocked}
            statusIcon={challengesUnlocked ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <Lock className="w-3 h-3 text-gray-400" />}
          />
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
            {/* Mastery Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-secondary-bg/50 px-3 py-1.5 rounded-full border border-border">
                <Shield className={`w-4 h-4 ${rank === 'Novice' ? 'text-gray-400' : rank === 'Learner' ? 'text-blue-400' : rank === 'Expert' ? 'text-purple-400' : 'text-amber-400'}`} />
                <div className="flex flex-col leading-none">
                    <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">{rank}</span>
                    <span className="text-xs font-mono font-bold text-text-primary">{nodeId}</span>
                </div>
                <div className="h-4 w-[1px] bg-border mx-1" />
                <span className="text-xs font-bold text-accent">{score} XP</span>
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="p-2 rounded-full hover:bg-secondary-bg text-text-secondary hover:text-text-primary"
            >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>

            <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-secondary-bg"
            >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </Button>

            {/* Mobile Menu Toggle */}
            <button
                className="md:hidden p-2 text-text-secondary hover:text-text-primary"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-primary-bg border-b border-border shadow-2xl p-4 flex flex-col space-y-2 animate-in slide-in-from-top-4">
              <NavItem to="/" label="Home" icon={Home} />
              <div className="flex items-center justify-between px-3 py-2 text-sm text-text-secondary">
                  <div className="flex items-center">
                      <Map className="w-4 h-4 mr-2" />
                      Journey
                  </div>
                  <span className="text-indigo-500 font-bold">Step {currentStep}/8</span>
              </div>
              <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mx-3 mb-2" style={{ width: 'calc(100% - 1.5rem)' }}>
                   <div className="h-full bg-indigo-500" style={{ width: `${(currentStep/8)*100}%` }} />
              </div>
              <NavItem to="/journey" label="Continue Journey" icon={ArrowRightIcon} />

              <NavItem
                to="/sandbox"
                label="Sandbox"
                icon={Box}
                unlocked={sandboxUnlocked}
                statusIcon={sandboxUnlocked ? <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">Active</span> : <Lock className="w-3 h-3" />}
              />
              <NavItem
                to="/challenges"
                label="Challenges"
                icon={Award}
                unlocked={challengesUnlocked}
                statusIcon={challengesUnlocked ? <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">Unlocked</span> : <Lock className="w-3 h-3" />}
              />

               {/* Mobile Mastery */}
               <div className="mt-4 pt-4 border-t border-border flex items-center justify-between px-3">
                   <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-secondary-bg flex items-center justify-center">
                           <Shield className="w-4 h-4 text-accent" />
                       </div>
                       <div>
                           <div className="text-sm font-bold text-text-primary">{rank}</div>
                           <div className="text-xs text-text-secondary">{nodeId}</div>
                       </div>
                   </div>
                   <span className="font-mono font-bold text-accent">{score} XP</span>
               </div>
          </div>
      )}
    </header>
  );
};

const ArrowRightIcon = ({ className }: { className?: string }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

export default TopBar;
