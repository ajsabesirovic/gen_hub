import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProfileImageUrl(imageUrl: string | null | undefined, fallbackEmail?: string): string {
    if (!imageUrl) {
    return fallbackEmail ? `https://avatar.vercel.sh/${fallbackEmail}` : '';
  }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

    const baseUrl = 'http://localhost:8000';
  return `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
}
