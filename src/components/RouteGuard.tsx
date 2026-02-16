import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { useToast } from '../context/ToastContext';

interface RouteGuardProps {
  children: React.ReactNode;
  type: 'journey' | 'sandbox' | 'challenges';
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children, type }) => {
  const { isStepUnlocked, sandboxUnlocked, challengesUnlocked, currentStep } = useProgress();
  const { step } = useParams<{ step: string }>();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (type === 'journey' && step) {
      const stepNum = parseInt(step, 10);
      if (!isNaN(stepNum)) {
        if (stepNum < 1 || stepNum > 8) {
             navigate('/journey/1', { replace: true });
             return;
        }
        if (!isStepUnlocked(stepNum)) {
          addToast(
            `Step Locked: Complete Step ${stepNum - 1} first to unlock this lesson.`,
            'warning',
            3000
          );
          navigate(`/journey/${currentStep}`, { replace: true });
        }
      }
    } else if (type === 'sandbox' && !sandboxUnlocked) {
      addToast(
        'Sandbox Locked: Complete the Journey to unlock Sandbox mode.',
        'warning',
        3000
      );
      navigate(`/journey/${currentStep}`, { replace: true });
    } else if (type === 'challenges' && !challengesUnlocked) {
      addToast(
        'Challenges Locked: Master the Journey to unlock Challenges.',
        'warning',
        3000
      );
      navigate(`/journey/${currentStep}`, { replace: true });
    }
  }, [type, step, sandboxUnlocked, challengesUnlocked, isStepUnlocked, currentStep, addToast, navigate]);

  // While checking, we can render null or a loading state, or the children.
  // If we render children, there might be a flash of content before redirect.
  // Given the checks are fast and sync (mostly), we can return null if we detect a lock condition,
  // but since we are doing it in useEffect, we need to handle the render.

  // To avoid flash of content, we can check condition here too, but ONLY for returning null, not for side effects.
  let isLocked = false;
  if (type === 'journey' && step) {
      const stepNum = parseInt(step, 10);
      if (!isNaN(stepNum) && !isStepUnlocked(stepNum)) isLocked = true;
  }
  if (type === 'sandbox' && !sandboxUnlocked) isLocked = true;
  if (type === 'challenges' && !challengesUnlocked) isLocked = true;

  if (isLocked) return null;

  return <>{children}</>;
};

export default RouteGuard;
