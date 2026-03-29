import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useRef } from 'react'

// Your existing styling utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Maps an ISO 4217 currency code to its display symbol.
 * Falls back to the code itself for unknown currencies.
 */
export function getCurrencySymbol(currency: string | null | undefined): string {
  if (!currency) return '$'
  const symbols: Record<string, string> = {
    USD: '$',    CAD: 'C$',   AUD: 'A$',  NZD: 'NZ$', HKD: 'HK$',
    SGD: 'S$',   MXN: 'Mex$', BRL: 'R$',  ZAR: 'R',   TWD: 'NT$',
    EUR: '€',    GBP: '£',
    JPY: '¥',    CNY: '¥',    CNH: '¥',
    KRW: '₩',
    INR: '₹',
    RUB: '₽',
    TRY: '₺',
    ILS: '₪',
    PLN: 'zł',   PHP: '₱',    THB: '฿',   VND: '₫',
    SEK: 'kr',   NOK: 'kr',   DKK: 'kr',  ISK: 'kr',
    CHF: 'Fr',   HUF: 'Ft',   CZK: 'Kč',  IDR: 'Rp',  MYR: 'RM',
  }
  return symbols[currency.toUpperCase()] ?? currency
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
