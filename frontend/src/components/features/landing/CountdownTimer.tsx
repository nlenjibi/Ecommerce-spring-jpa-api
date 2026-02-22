'use client';

import React, { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

interface CountdownTimerProps {
  endDate: Date | string;
  onExpire?: () => void;
  size?: 'sm' | 'md' | 'lg';
  format?: 'full' | 'compact' | 'inline';
  showLabels?: boolean;
  className?: string;
}

/**
 * CountdownTimer Component
 * Animated countdown timer for deals and promotions
 * 
 * Variants:
 * - size: sm (small, inline), md (medium), lg (large, banner)
 * - format: full (vertical layout), compact (horizontal), inline (text only)
 * - showLabels: Display day/hour/minute/second labels
 * 
 * @example
 * <CountdownTimer endDate={new Date(Date.now() + 86400000)} size="lg" />
 */
export function CountdownTimer({
  endDate,
  onExpire,
  size = 'md',
  format = 'full',
  showLabels = true,
  className = '',
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });
  const [isMounted, setIsMounted] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const calculateTimeLeft = () => {
      const endDateTime = new Date(endDate).getTime();
      const now = new Date().getTime();
      const difference = endDateTime - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        onExpire?.();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        total: difference,
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate, isMounted, onExpire]);

  if (!isMounted) return null;

  if (isExpired) {
    return (
      <div className={`text-red-600 font-semibold ${className}`}>
        Sale Ended
      </div>
    );
  }

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const unitClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const formatTime = (num: number) => String(num).padStart(2, '0');

  // Full Format: Vertical boxes
  if (format === 'full') {
    return (
      <div className={`flex items-center justify-center gap-2 md:gap-3 ${className}`}>
        {[
          { value: timeLeft.days, label: 'Days' },
          { value: timeLeft.hours, label: 'Hours' },
          { value: timeLeft.minutes, label: 'Mins' },
          { value: timeLeft.seconds, label: 'Secs' },
        ].map((unit, idx) => (
          <div key={idx} className="text-center">
            <div
              className={`${unitClasses[size]} flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 text-white font-bold rounded-lg shadow-md`}
            >
              <span>{formatTime(unit.value)}</span>
            </div>
            {showLabels && <p className={`${sizeClasses[size]} text-gray-600 font-medium mt-1`}>{unit.label}</p>}
          </div>
        ))}
      </div>
    );
  }

  // Compact Format: Horizontal
  if (format === 'compact') {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        {[
          { value: timeLeft.days, label: 'D' },
          { value: timeLeft.hours, label: 'H' },
          { value: timeLeft.minutes, label: 'M' },
          { value: timeLeft.seconds, label: 'S' },
        ].map((unit, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <div
              className={`${unitClasses[size]} flex items-center justify-center bg-red-600 text-white font-bold rounded shadow-md ${sizeClasses[size]}`}
            >
              {formatTime(unit.value)}
            </div>
            {showLabels && <span className="text-xs font-medium text-gray-700">{unit.label}</span>}
          </div>
        ))}
      </div>
    );
  }

  // Inline Format: Text only
  return (
    <div className={`${sizeClasses[size]} font-semibold text-red-600 ${className}`}>
      {timeLeft.days > 0 && `${timeLeft.days}d `}
      {`${formatTime(timeLeft.hours)}:${formatTime(timeLeft.minutes)}:${formatTime(timeLeft.seconds)}`}
    </div>
  );
}
