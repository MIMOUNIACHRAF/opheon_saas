import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency = 'MAD') {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(date))
}

export function formatDateShort(date: Date | string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  PREPARING: 'En préparation',
  READY: 'Prêt',
  DELIVERED: 'Livré',
  CANCELLED: 'Annulé',
}

export const ORDER_TYPE_LABELS: Record<string, string> = {
  DINE_IN: 'Sur place',
  TAKEAWAY: 'À emporter',
  DELIVERY: 'Livraison',
}

export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  CANCELLED: 'Annulée',
}

export const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  PREPARING: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  READY: 'bg-green-500/20 text-green-400 border-green-500/30',
  DELIVERED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
  CONFIRMED: 'bg-green-500/20 text-green-400 border-green-500/30',
}
