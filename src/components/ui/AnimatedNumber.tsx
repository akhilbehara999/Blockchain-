import React, { useEffect, useRef } from 'react';
import { useMotionValue, animate } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  format?: (value: number) => string;
  className?: string;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  format = (v) => Math.round(v).toLocaleString(),
  className = '',
}) => {
  const motionValue = useMotionValue(value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.5,
      ease: "easeOut",
      onUpdate: (latest) => {
        if (ref.current) {
          ref.current.textContent = format(latest);
        }
      },
    });
    return controls.stop;
  }, [value, motionValue, format]);

  return <span ref={ref} className={className}>{format(value)}</span>;
};

export default AnimatedNumber;
