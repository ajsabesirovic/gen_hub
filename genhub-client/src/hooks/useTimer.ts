import { useState, useEffect, useCallback } from 'react';

export interface UseTimerReturn {
  timeLeft: number;
  isRunning: boolean;
  start: (duration?: number) => void;
  reset: () => void;
}

/**
 * Countdown timer hook used for resend cooldowns
 */
export function useTimer(initialDuration: number = 0): UseTimerReturn {
  const [timeLeft, setTimeLeft] = useState<number>(initialDuration);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft === 0 && isRunning) {
        setIsRunning(false);
      }
      return undefined;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const start = useCallback(
    (duration?: number) => {
      const nextDuration = duration ?? initialDuration;
      if (nextDuration <= 0) {
        setTimeLeft(0);
        setIsRunning(false);
        return;
      }
      setTimeLeft(nextDuration);
      setIsRunning(true);
    },
    [initialDuration],
  );

  const reset = useCallback(() => {
    setTimeLeft(0);
    setIsRunning(false);
  }, []);

  return { timeLeft, isRunning, start, reset };
}

