import { z } from 'zod'

export const ReservationSchema = z.object({
  clientName: z.string().min(2, 'Nom requis (min. 2 caractères)'),
  clientPhone: z.string().min(8, 'Téléphone invalide'),
  clientEmail: z.string().email('Email invalide').optional().or(z.literal('')),
  date: z.string().min(1, 'Date requise'),
  time: z.string().min(1, 'Heure requise'),
  covers: z.number().min(1).max(20),
  note: z.string().optional(),
})

export const OrderSchema = z.object({
  type: z.enum(['DINE_IN', 'TAKEAWAY', 'DELIVERY']),
  clientName: z.string().min(2, 'Nom requis'),
  clientPhone: z.string().min(8, 'Téléphone invalide').optional().or(z.literal('')),
  clientEmail: z.string().email('Email invalide').optional().or(z.literal('')),
  address: z.string().optional(),
  note: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
      unitPrice: z.number().min(0),
    })
  ).min(1, 'Panier vide'),
})

export const ProductSchema = z.object({
  nameFr: z.string().min(2, 'Nom FR requis'),
  nameEn: z.string().min(2, 'Nom EN requis'),
  descFr: z.string().optional(),
  descEn: z.string().optional(),
  price: z.number().min(0, 'Prix invalide'),
  image: z.string().url().optional().or(z.literal('')),
  available: z.boolean().default(true),
  featured: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  allergens: z.string().optional(),
  categoryId: z.string().min(1, 'Catégorie requise'),
})

export const CategorySchema = z.object({
  nameFr: z.string().min(2, 'Nom FR requis'),
  nameEn: z.string().min(2, 'Nom EN requis'),
  slug: z.string().min(2, 'Slug requis'),
  order: z.number().default(0),
  icon: z.string().optional(),
})

export const LoginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court'),
})

export const TenantSettingsSchema = z.object({
  name: z.string().min(2),
  tagline: z.string().optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  hours: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
})

export type ReservationInput = z.infer<typeof ReservationSchema>
export type OrderInput = z.infer<typeof OrderSchema>
export type ProductInput = z.infer<typeof ProductSchema>
export type CategoryInput = z.infer<typeof CategorySchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type TenantSettingsInput = z.infer<typeof TenantSettingsSchema>
