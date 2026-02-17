import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Trophy } from 'lucide-react';
import Button from '../ui/Button';
import { useProgress } from '../../context/ProgressContext';
import { ChallengesState } from '../../context/ProgressContext';

interface ChallengeLayoutProps {
  title: string;
  description: string;
  onBack: () => void;
  children: React.ReactNode;
  challengeId: string;
}

const ChallengeLayout: React.FC<ChallengeLayoutProps> = ({
  title,
  description,
  onBack,
  children,
  challengeId,
}) => {
  const { challenges } = useProgress();
  const [elapsed, setElapsed] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Timer
  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
        setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Completion Detection
  useEffect(() => {
      // Safe access using keyof
      const id = challengeId as keyof ChallengesState;
      const isCompleted = challenges[id]?.completed;

      if (isCompleted && !showCelebration) {
          setShowCelebration(true);
      }
  }, [challenges, challengeId, showCelebration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showCelebration) {
      return (
          <div className="relative flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in-95 duration-500 overflow-hidden">

              {/* CSS Confetti */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                 {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="confetti-piece"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            backgroundColor: ['#6366f1', '#a855f7', '#ec4899', '#fbbf24'][Math.floor(Math.random() * 4)]
                        }}
                    />
                 ))}
              </div>

              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6 animate-bounce z-10">
                  <Trophy className="w-12 h-12 text-yellow-500" />
              </div>
              <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-2 text-center z-10">
                  Challenge Complete!
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 text-center z-10">
                  You've mastered this concept.
              </p>

              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-center w-full max-w-md mb-8 z-10">
                  <div className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-2">Points Earned</div>
                  <div className="text-5xl font-mono font-bold text-indigo-500 mb-6">
                     +{
                         challengeId === 'storm' ? 25 : challengeId === 'fork' ? 20 : 15
                     }
                  </div>

                  <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>Time: {formatTime(elapsed)}</span>
                  </div>
              </div>

              <Button onClick={onBack} size="lg" className="z-10">
                  Back to Challenges
              </Button>

              {/* Styles for confetti */}
              <style>{`
                .confetti-piece {
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    top: -10px;
                    opacity: 0.7;
                    animation: fall 3s linear infinite;
                }
                @keyframes fall {
                    0% { transform: translateY(-10vh) rotate(0deg); }
                    100% { transform: translateY(100vh) rotate(720deg); }
                }
              `}</style>
          </div>
      );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
            <button
                onClick={onBack}
                className="group flex items-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4 transition-colors"
            >
                <div className="p-1 rounded-full group-hover:bg-gray-100 dark:group-hover:bg-gray-800 mr-2 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </div>
                Back to Challenges
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl">{description}</p>
        </div>

        <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3">
                <Clock className="w-5 h-5 text-indigo-500" />
                <span className="font-mono text-xl font-bold text-gray-700 dark:text-gray-200">
                    {formatTime(elapsed)}
                </span>
            </div>
        </div>
      </div>

      {/* Challenge Content */}
      <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-800/50 shadow-xl overflow-hidden min-h-[500px]">
          {children}
      </div>
    </div>
  );
};

export default ChallengeLayout;
