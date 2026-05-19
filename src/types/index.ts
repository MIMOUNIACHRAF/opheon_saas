import type {
  Tenant,
  User,
  Category,
  Product,
  Order,
  OrderItem,
  Reservation,
  Role,
  Plan,
  OrderType,
  OrderStatus,
  ReservationStatus,
} from '@prisma/client'

export type {
  Tenant,
  User,
  Category,
  Product,
  Order,
  OrderItem,
  Reservation,
  Role,
  Plan,
  OrderType,
  OrderStatus,
  ReservationStatus,
}

export type ProductWithCategory = Product & {
  category: Category
}

export type OrderWithItems = Order & {
  items: (OrderItem & { product: Product })[]
}

export type CategoryWithProducts = Category & {
  products: Product[]
}

export type TenantWithStats = Tenant & {
  _count: {
    orders: number
    reservations: number
    products: number
  }
}

export type CartItem = {
  productId: string
  nameFr: string
  nameEn: string
  price: number
  quantity: number
  image?: string | null
}

export type SessionUser = {
  id: string
  email: string
  name: string
  role: Role
  tenantId?: string | null
  tenantSlug?: string | null
}
