import React, { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';
import { Storage } from '../utils/storage';

type SoundType = 'success' | 'error' | 'warning' | 'info' | 'mining' | 'network' | 'click' | 'hover';

interface SoundContextType {
  playSound: (type: SoundType) => void;
  toggleMute: () => void;
  isMuted: boolean;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const SoundProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const stored = Storage.getItem<boolean | string>('yupp_sound_muted');
    return stored === true || stored === 'true';
  });

  const audioContextRef = useRef<AudioContext | null>(null);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const newState = !prev;
      Storage.setItem('yupp_sound_muted', newState);
      return newState;
    });
  };

  const getContext = () => {
    if (!audioContextRef.current) {
      // Use type assertion to unknown first for safety
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    }
    return audioContextRef.current;
  };

  const playSound = useCallback((type: SoundType) => {
    if (isMuted) return;

    try {
      const ctx = getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      // Define standard gain/freq values to reduce repetition
      const playTone = (oscType: OscillatorType, freq: number, freqEnd: number | null, vol: number, volEnd: number, duration: number) => {
          osc.type = oscType;
          osc.frequency.setValueAtTime(freq, now);
          if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, now + (duration / 2));
          gain.gain.setValueAtTime(vol, now);
          gain.gain.exponentialRampToValueAtTime(volEnd, now + duration);
          osc.start(now);
          osc.stop(now + duration);
      };

      switch (type) {
        case 'success':
          playTone('sine', 500, 1000, 0.1, 0.01, 0.4);
          break;
        case 'error':
          // Sawtooth needs linear ramp for frequency usually or just static
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.linearRampToValueAtTime(100, now + 0.3);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
          break;
        case 'warning':
           osc.type = 'square';
           osc.frequency.setValueAtTime(400, now);
           gain.gain.setValueAtTime(0.05, now);
           gain.gain.setValueAtTime(0, now + 0.1); // gap
           gain.gain.setValueAtTime(0.05, now + 0.15);
           gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
           osc.start(now);
           osc.stop(now + 0.3);
           break;
        case 'mining':
           playTone('triangle', 800, 1200, 0.1, 0.01, 0.1);
           break;
        case 'network':
           playTone('sine', 600, null, 0.05, 0.01, 0.1);
           break;
        case 'click':
           playTone('sine', 800, null, 0.05, 0.01, 0.05);
           break;
        default:
           playTone('sine', 440, null, 0.02, 0.01, 0.1);
           break;
      }
    } catch {
       // Ignore audio errors
    }
  }, [isMuted]);

  return (
    <SoundContext.Provider value={{ playSound, toggleMute, isMuted }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
