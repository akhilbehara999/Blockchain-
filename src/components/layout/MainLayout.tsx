import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import ReorgAlert from '../consensus/ReorgAlert';
import EventLog from '../network/EventLog';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary-bg text-text-primary font-sans selection:bg-accent/30 selection:text-accent-foreground">
      <ReorgAlert />
      <TopBar />
      <EventLog />

      <main className="pt-16 px-4 md:px-6 lg:px-8 transition-all duration-300 ease-in-out">
        <div className="max-w-7xl mx-auto py-8">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
