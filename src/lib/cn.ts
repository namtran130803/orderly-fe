import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Hàm cn kết hợp clsx và tailwind-merge để xử lý các class Tailwind CSS linh hoạt.
 * Giúp gộp các class có điều kiện và giải quyết xung đột class của Tailwind.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
