import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ! duplicate of ui/libs/utils to avoid boundary error
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
