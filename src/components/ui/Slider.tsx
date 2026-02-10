import React from 'react';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label?: string;
  showValue?: boolean;
  className?: string;
}

const Slider: React.FC<SliderProps> = ({
  value,
  min,
  max,
  onChange,
  label,
  showValue = false,
  className = '',
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-text-secondary">{label}</span>}
          {showValue && <span className="text-sm font-mono text-accent">{value}</span>}
        </div>
      )}
      <div className="relative w-full h-2 bg-tertiary-bg rounded-full flex items-center">
        <div
          className="absolute h-full bg-accent rounded-full pointer-events-none"
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div
          className="absolute w-4 h-4 bg-white rounded-full shadow-lg pointer-events-none transition-transform active:scale-110 z-20"
          style={{
            left: `${percentage}%`,
            transform: 'translateX(-50%)'
          }}
        />
      </div>
    </div>
  );
};

export default Slider;
