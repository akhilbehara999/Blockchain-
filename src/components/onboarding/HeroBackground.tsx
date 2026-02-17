import React from 'react';

const HeroBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Dark Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-brand-950/20 to-gray-950 z-0" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-20 z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Floating Elements Container */}
      <div className="absolute inset-0 z-0">
        {/* Node 1 & Connections */}
        <div className="absolute top-1/4 left-1/4 animate-float" style={{ animationDelay: '0s', animationDuration: '6s' }}>
          <div className="w-3 h-3 bg-brand-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
          {/* Connection line */}
          <div className="absolute top-1.5 left-1.5 w-32 h-[1px] bg-gradient-to-r from-brand-500/50 to-transparent transform -rotate-12 origin-left" />
        </div>

        {/* Node 2 */}
        <div className="absolute top-1/3 right-1/4 animate-float" style={{ animationDelay: '1s', animationDuration: '7s' }}>
          <div className="w-4 h-4 bg-brand-400 rounded-full shadow-[0_0_20px_rgba(129,140,248,0.4)] opacity-80" />
           <div className="absolute top-2 right-2 w-24 h-[1px] bg-gradient-to-l from-brand-400/40 to-transparent transform rotate-45 origin-right" />
        </div>

        {/* Node 3 */}
        <div className="absolute bottom-1/3 left-1/3 animate-float" style={{ animationDelay: '2s', animationDuration: '8s' }}>
          <div className="w-2 h-2 bg-indigo-300 rounded-full shadow-[0_0_10px_rgba(165,180,252,0.6)]" />
        </div>

        {/* Node 4 (Far right) */}
        <div className="absolute top-1/2 right-10 animate-float" style={{ animationDelay: '0.5s', animationDuration: '9s' }}>
          <div className="w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
          <div className="absolute top-1.5 right-1.5 w-40 h-[1px] bg-gradient-to-l from-purple-500/30 to-transparent transform -rotate-15 origin-right" />
        </div>

        {/* Node 5 (Bottom left) */}
        <div className="absolute bottom-1/4 left-20 animate-float" style={{ animationDelay: '1.5s', animationDuration: '6.5s' }}>
           <div className="w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)] opacity-70" />
        </div>

        {/* Node 6 (Center-ish background) */}
        <div className="absolute top-20 left-1/2 animate-float" style={{ animationDelay: '3s', animationDuration: '10s' }}>
           <div className="w-2 h-2 bg-brand-600 rounded-full opacity-50" />
        </div>

        {/* Subtle large glow in center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-900/10 rounded-full blur-3xl pointer-events-none" />
      </div>
    </div>
  );
};

export default HeroBackground;
