import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import ModuleList from './ModuleList';
import { useIsMobile } from '../../hooks/useMediaQuery';
import Sheet from '../ui/Sheet';
import { useThemeStore } from '../../stores/useThemeStore';
import Button from '../ui/Button';
import { Moon, Sun } from 'lucide-react';
import ReorgAlert from '../consensus/ReorgAlert';
import EventLog from '../network/EventLog';

type ActiveSheet = 'modules' | 'settings' | null;

const MainLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-primary-bg text-text-primary font-sans selection:bg-accent/30 selection:text-accent-foreground">
      <ReorgAlert />
      <TopBar onToggleSidebar={() => setActiveSheet('modules')} />
      <EventLog />

      {!isMobile && (
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      )}

      {isMobile && (
        <Sheet
          isOpen={activeSheet !== null}
          onClose={() => setActiveSheet(null)}
          title={activeSheet === 'modules' ? 'Modules' : 'Settings'}
        >
           <div className="py-4">
             {activeSheet === 'modules' && (
               <ModuleList onItemClick={() => setActiveSheet(null)} />
             )}
             {activeSheet === 'settings' && (
               <div className="space-y-4 px-4">
                 <div className="flex items-center justify-between p-4 rounded-xl bg-tertiary-bg/30 border border-border">
                   <div className="flex flex-col">
                     <span className="font-medium text-text-primary">Theme</span>
                     <span className="text-sm text-text-secondary">Switch between light and dark mode</span>
                   </div>
                   <Button onClick={toggleTheme} variant="ghost" size="sm" className="bg-secondary-bg hover:bg-tertiary-bg">
                      {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
                   </Button>
                 </div>
               </div>
             )}
           </div>
        </Sheet>
      )}

      <main
        className={`
          pt-16
          transition-all duration-300 ease-in-out
          ${isMobile ? 'pb-20 px-4' : (isSidebarCollapsed ? 'pl-24 pr-8' : 'pl-80 pr-8')}
        `}
      >
        <div className="max-w-7xl mx-auto py-8">
           <Outlet />
        </div>
      </main>

      {isMobile && (
        <BottomNav
          onModulesClick={() => setActiveSheet('modules')}
          onSettingsClick={() => setActiveSheet('settings')}
        />
      )}
    </div>
  );
};

export default MainLayout;
