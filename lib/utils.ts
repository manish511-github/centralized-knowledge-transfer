import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function debounced(...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  } as T
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

