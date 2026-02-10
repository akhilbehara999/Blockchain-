import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useIsMobile } from '../../hooks/useMediaQuery';
import Sheet from '../ui/Sheet';
import ModuleNavigation from './ModuleNavigation';

const MainLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-primary-bg text-text-primary font-sans selection:bg-accent/30 selection:text-accent-foreground">
      <TopBar />

      {!isMobile && (
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      )}

      {isMobile && (
        <Sheet isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} title="Modules">
           <div className="py-4 px-2">
             <ModuleNavigation
                onItemClick={() => setIsMobileMenuOpen(false)}
                isCollapsed={false}
             />
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
          onModulesClick={() => setIsMobileMenuOpen(true)}
          onSettingsClick={() => {}}
        />
      )}
    </div>
  );
};

export default MainLayout;
