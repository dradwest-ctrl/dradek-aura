import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a number as Moroccan Dirham */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-MA', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount) + ' DH'
}

/** French-safe slug generator */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Generate order reference — uses a counter for uniqueness */
export function buildOrderRef(count: number): string {
  const year = new Date().getFullYear()
  return `AUR-${year}-${String(count + 1).padStart(5, '0')}`
}

/** Parse JSON safely with a fallback */
export function safeJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

/** Truncate text */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

/** Moroccan phone validation */
export function isValidMoroccanPhone(phone: string): boolean {
  return /^(0[67]\d{8}|(\+212|00212)[67]\d{8})$/.test(phone.replace(/\s/g, ''))
}

/** Strip non-digits for wa.me links */
export function phoneToWaMe(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  // If starts with 0, replace with 212
  if (digits.startsWith('0')) return '212' + digits.slice(1)
  return digits
}
