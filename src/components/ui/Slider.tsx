import React from 'react';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  showValue?: boolean;
  className?: string;
  disabled?: boolean;
}

const Slider: React.FC<SliderProps> = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  showValue = false,
  className = '',
  disabled = false,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`w-full ${className} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-text-secondary">{label}</span>}
          {showValue && <span className="text-sm font-mono text-accent">{value}</span>}
        </div>
      )}
      <div className="relative w-full h-2 bg-tertiary-bg rounded-full flex items-center">
        <div
          className={`absolute h-full rounded-full pointer-events-none ${disabled ? 'bg-text-secondary' : 'bg-accent'}`}
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          className="absolute w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
        />
        <div
          className={`absolute w-4 h-4 bg-white rounded-full shadow-lg pointer-events-none transition-transform active:scale-110 z-20 ${disabled ? 'bg-text-secondary' : ''}`}
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
