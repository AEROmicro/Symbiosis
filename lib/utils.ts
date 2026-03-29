import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useRef } from 'react'

// Your existing styling utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function useThrottle(delay: number = 300000) {
  const lastFetch = useRef<number>(0);

  const canExecute = () => {
    const now = Date.now();
    if (now - lastFetch.current < delay) {
      return false;
    }
    lastFetch.current = now;
    return true;
  };

  return { canExecute };
}
