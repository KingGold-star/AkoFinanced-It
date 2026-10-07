import { useState, useEffect } from 'react';

// Target date: October 21, 2026, 00:00:00 (WAT / West Africa Time, UTC+1)
export const COUNTDOWN_TARGET_DATE = new Date('2026-10-21T00:00:00+01:00');

export interface CountdownState {
  totalSeconds: number;
  totalDays: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  showWeeks: boolean;
  formatted: {
    ww: string;
    dd: string;
    hh: string;
    mm: string;
    ss: string;
  };
}

export function calculateCountdown(target: Date = COUNTDOWN_TARGET_DATE): CountdownState {
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    return {
      totalSeconds: 0,
      totalDays: 0,
      weeks: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      showWeeks: false,
      formatted: {
        ww: '00',
        dd: '00',
        hh: '00',
        mm: '00',
        ss: '00',
      },
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  const weeks = Math.floor(totalDays / 7);
  // When weeks > 0 (>= 1 week remaining), days is the remainder within the week
  // When weeks === 0 (< 1 week remaining), weeks is omitted and days shows the full remaining days
  const days = weeks > 0 ? totalDays % 7 : totalDays;
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');

  return {
    totalSeconds,
    totalDays,
    weeks,
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    showWeeks: weeks > 0,
    formatted: {
      ww: pad(weeks),
      dd: pad(days),
      hh: pad(hours),
      mm: pad(minutes),
      ss: pad(seconds),
    },
  };
}

export function useCountdown(target: Date = COUNTDOWN_TARGET_DATE): CountdownState {
  const [state, setState] = useState<CountdownState>(() => calculateCountdown(target));

  useEffect(() => {
    setState(calculateCountdown(target));
    const timer = setInterval(() => {
      const next = calculateCountdown(target);
      setState(next);
      if (next.isExpired) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [target]);

  return state;
}
