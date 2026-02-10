import React from 'react';
import { motion } from 'framer-motion';

interface ChainConnectorProps {
  isValid: boolean;
  direction: 'horizontal' | 'vertical';
}

const ChainConnector: React.FC<ChainConnectorProps> = ({ isValid, direction }) => {
  const color = isValid ? '#22C55E' : '#EF4444'; // success vs danger

  // Particles
  const particleCount = 3;
  const particles = Array.from({ length: particleCount });

  return (
    <div className={`relative flex items-center justify-center ${
      direction === 'horizontal' ? 'w-16 h-auto shrink-0' : 'w-full h-16 shrink-0'
    }`}>
      <svg
        className={`overflow-visible ${direction === 'horizontal' ? 'w-full h-4' : 'h-full w-4'}`}
        viewBox={direction === 'horizontal' ? "0 0 100 4" : "0 0 4 100"}
        preserveAspectRatio="none"
      >
        {/* Base Line */}
        <motion.line
          x1={direction === 'horizontal' ? 0 : 2}
          y1={direction === 'horizontal' ? 2 : 0}
          x2={direction === 'horizontal' ? 100 : 2}
          y2={direction === 'horizontal' ? 2 : 100}
          stroke={color}
          strokeWidth="2"
          strokeOpacity="0.3"
          animate={{ stroke: color }}
          transition={{ duration: 0.3 }}
        />

        {/* Animated Particles */}
        {particles.map((_, i) => (
          <motion.circle
            key={i}
            r="3"
            fill={color}
            initial={direction === 'horizontal' ? { cx: 0, cy: 2 } : { cx: 2, cy: 0 }}
            animate={direction === 'horizontal' ? { cx: 100 } : { cy: 100 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
              delay: i * (1.5 / particleCount),
            }}
          />
        ))}

         {/* Arrow Head */}
         <motion.path
            d={direction === 'horizontal'
                ? "M 96 0 L 100 2 L 96 4"
                : "M 0 96 L 2 100 L 4 96"}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ stroke: color }}
            transition={{ duration: 0.3 }}
         />
      </svg>
    </div>
  );
};

export default ChainConnector;
