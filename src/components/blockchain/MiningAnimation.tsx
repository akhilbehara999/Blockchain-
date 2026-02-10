import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface MiningAnimationProps {
  onComplete?: () => void;
}

const MiningAnimation: React.FC<MiningAnimationProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Particle positions
  const particles = Array.from({ length: 12 }).map((_, i) => ({
    angle: (i / 12) * 360,
    distance: 100,
  }));

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden rounded-xl">
      {/* Green Glow Pulse */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0, 0.5, 0], scale: 1.5 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 bg-success/20 blur-xl"
      />

      {/* Particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
            y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
            opacity: 0,
            scale: 0
          }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute w-2 h-2 bg-success rounded-full shadow-[0_0_10px_#22C55E]"
        />
      ))}

      {/* Text */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
        className="relative bg-tertiary-bg/90 backdrop-blur-md border border-success/50 px-6 py-3 rounded-xl shadow-2xl"
      >
        <div className="text-xl font-bold text-success flex items-center gap-2">
          <span className="text-2xl">✨</span>
          Block Mined!
        </div>
      </motion.div>
    </div>
  );
};

export default MiningAnimation;
