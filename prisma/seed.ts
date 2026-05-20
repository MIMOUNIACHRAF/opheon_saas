import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'

const url = (process.env.TURSO_DATABASE_URL ?? 'file:./prisma/dev.db').trim()
const authToken = process.env.TURSO_AUTH_TOKEN?.replace(/\s+/g, '')
const adapter = new PrismaLibSql({ url, authToken })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  console.log('🌱 Seeding database...')

  // ─── OPHEON TENANT ────────────────────────────────────────────
  const opheon = await prisma.tenant.upsert({
    where: { slug: 'opheon' },
    update: {},
    create: {
      slug: 'opheon',
      name: 'Café Ophéon',
      tagline: "L'art du café à l'orientale",
      description: "Nichés au cœur d'Oujda, nous vous proposons une expérience culinaire alliant tradition marocaine et modernité raffinée. Chaque plat est une invitation au voyage.",
      primaryColor: '#C9A84C',
      accentColor: '#1A0F0A',
      phone: '+212 536 XXX XXX',
      email: 'contact@opheon.ma',
      address: '12 Avenue Mohammed V',
      city: 'Oujda',
      country: 'Maroc',
      hours: 'Lun–Dim : 08h00 – 23h00',
      instagram: 'cafe.opheon',
      facebook: 'cafe.opheon',
      plan: 'PRO',
      active: true,
    },
  })

  // Opheon admin
  await prisma.user.upsert({
    where: { email: 'admin@opheon.ma' },
    update: {},
    create: {
      email: 'admin@opheon.ma',
      password: await bcrypt.hash('Admin123!', 10),
      name: 'Admin Ophéon',
      role: 'ADMIN',
      tenantId: opheon.id,
    },
  })

  // Opheon categories
  const opheonCats = await Promise.all([
    prisma.category.upsert({ where: { slug_tenantId: { slug: 'petit-dejeuner', tenantId: opheon.id } }, update: {}, create: { slug: 'petit-dejeuner', nameFr: 'Petit-déjeuner', nameEn: 'Breakfast', order: 1, icon: '🌅', tenantId: opheon.id } }),
    prisma.category.upsert({ where: { slug_tenantId: { slug: 'plats', tenantId: opheon.id } }, update: {}, create: { slug: 'plats', nameFr: 'Plats', nameEn: 'Main Dishes', order: 2, icon: '🍽️', tenantId: opheon.id } }),
    prisma.category.upsert({ where: { slug_tenantId: { slug: 'snacks', tenantId: opheon.id } }, update: {}, create: { slug: 'snacks', nameFr: 'Snacks', nameEn: 'Snacks', order: 3, icon: '🥪', tenantId: opheon.id } }),
    prisma.category.upsert({ where: { slug_tenantId: { slug: 'desserts', tenantId: opheon.id } }, update: {}, create: { slug: 'desserts', nameFr: 'Desserts', nameEn: 'Desserts', order: 4, icon: '🍮', tenantId: opheon.id } }),
    prisma.category.upsert({ where: { slug_tenantId: { slug: 'boissons', tenantId: opheon.id } }, update: {}, create: { slug: 'boissons', nameFr: 'Boissons', nameEn: 'Drinks', order: 5, icon: '☕', tenantId: opheon.id } }),
  ])

  const [petitDej, plats, snacks, desserts, boissons] = opheonCats

  // Opheon products
  const opheonProducts = [
    // Petit-déjeuner
    { nameFr: 'Msemen au Miel', nameEn: 'Msemen with Honey', descFr: 'Crêpes feuilletées marocaines dorées, servies avec miel pur et beurre fermier', descEn: 'Golden Moroccan layered pancakes with pure honey and farm butter', price: 35, categoryId: petitDej.id, featured: true, available: true },
    { nameFr: 'Baghrir aux Dattes', nameEn: 'Baghrir with Dates', descFr: 'Crêpes mille trous moelleuses accompagnées de dattes fraîches de Medjoul', descEn: 'Fluffy thousand-hole crepes with fresh Medjoul dates', price: 40, categoryId: petitDej.id, available: true },
    { nameFr: 'Plateau Marocain Complet', nameEn: 'Full Moroccan Breakfast', descFr: 'Msemen, baghrir, œuf, fromage, olive, miel, confiture, thé à la menthe', descEn: 'Msemen, baghrir, egg, cheese, olive, honey, jam, mint tea', price: 75, categoryId: petitDej.id, featured: true, available: true },
    { nameFr: 'Harcha Beurre', nameEn: 'Harcha with Butter', descFr: 'Galette de semoule croustillante, beurre et miel de fleurs', descEn: 'Crispy semolina cake with butter and flower honey', price: 30, categoryId: petitDej.id, available: true },
    // Plats
    { nameFr: 'Couscous Royal', nameEn: 'Royal Couscous', descFr: 'Couscous traditionnel aux 7 légumes, agneau, poulet et merguez, bouillon parfumé', descEn: 'Traditional couscous with 7 vegetables, lamb, chicken and merguez', price: 120, categoryId: plats.id, featured: true, available: true, isVegan: false },
    { nameFr: 'Tajine Poulet Citron', nameEn: 'Chicken Lemon Tajine', descFr: 'Poulet fondant aux olives et citrons confits, épices douces', descEn: 'Tender chicken with olives and preserved lemons, mild spices', price: 95, categoryId: plats.id, featured: true, available: true },
    { nameFr: 'Tajine Légumes', nameEn: 'Vegetable Tajine', descFr: 'Légumes de saison mijotés aux épices marocaines, couscous en accompagnement', descEn: 'Seasonal vegetables simmered in Moroccan spices, with couscous', price: 75, categoryId: plats.id, available: true, isVegan: true, isGlutenFree: true },
    { nameFr: 'Pastilla au Poulet', nameEn: 'Chicken Bastilla', descFr: 'Feuilleté croustillant au poulet, amandes et cannelle, sucre glace', descEn: 'Crispy chicken pie with almonds and cinnamon, powdered sugar', price: 85, categoryId: plats.id, available: true },
    { nameFr: 'Méchoui Agneau', nameEn: 'Roasted Lamb', descFr: 'Épaule d\'agneau rôtie lentement aux épices, servi avec pain maison', descEn: 'Slow-roasted lamb shoulder with spices, served with homemade bread', price: 145, categoryId: plats.id, featured: true, available: true },
    // Snacks
    { nameFr: 'Briouat Viande', nameEn: 'Meat Briouats', descFr: 'Feuilletés croustillants farcis viande hachée épicée, 6 pièces', descEn: 'Crispy pastries filled with seasoned minced meat, 6 pieces', price: 45, categoryId: snacks.id, available: true },
    { nameFr: 'Club Sandwich Ophéon', nameEn: 'Ophéon Club Sandwich', descFr: 'Triple étage : poulet grillé, thon, légumes frais, sauce maison', descEn: 'Triple layer: grilled chicken, tuna, fresh vegetables, house sauce', price: 55, categoryId: snacks.id, available: true },
    { nameFr: 'Salade Marocaine', nameEn: 'Moroccan Salad', descFr: 'Tomates, concombres, oignons, persil, citron, huile d\'olive Vierge Extra', descEn: 'Tomatoes, cucumber, onion, parsley, lemon, Extra Virgin olive oil', price: 35, categoryId: snacks.id, available: true, isVegan: true, isGlutenFree: true },
    // Desserts
    { nameFr: 'Cornes de Gazelle', nameEn: 'Gazelle Horns', descFr: 'Pâtisseries traditionnelles aux amandes et fleur d\'oranger, 4 pièces', descEn: 'Traditional almond and orange blossom pastries, 4 pieces', price: 40, categoryId: desserts.id, featured: true, available: true },
    { nameFr: 'Chebakia au Miel', nameEn: 'Honey Chebakia', descFr: 'Gâteau de sésame frit, trempé dans le miel pur, graine de sésame', descEn: 'Fried sesame cookie dipped in pure honey, sesame seeds', price: 35, categoryId: desserts.id, available: true },
    { nameFr: 'Crème Caramel Maison', nameEn: 'Homemade Caramel Custard', descFr: 'Crème caramel onctueuse préparée maison, à la vanille de Madagascar', descEn: 'Smooth homemade caramel custard with Madagascar vanilla', price: 30, categoryId: desserts.id, available: true },
    // Boissons
    { nameFr: 'Thé à la Menthe', nameEn: 'Mint Tea', descFr: 'Thé vert gunpowder, menthe fraîche du jardin, sucre de canne', descEn: 'Gunpowder green tea, fresh garden mint, cane sugar', price: 20, categoryId: boissons.id, featured: true, available: true, isVegan: true, isGlutenFree: true },
    { nameFr: 'Café Ophéon Signature', nameEn: 'Ophéon Signature Coffee', descFr: 'Espresso double, mousse de lait, sirop rose-cardamome', descEn: 'Double espresso, milk foam, rose-cardamom syrup', price: 28, categoryId: boissons.id, featured: true, available: true },
    { nameFr: 'Jus Frais Maison', nameEn: 'Fresh Homemade Juice', descFr: 'Orange, citron, fraise ou avocat — pressé minute', descEn: 'Orange, lemon, strawberry or avocado — freshly pressed', price: 25, categoryId: boissons.id, available: true, isVegan: true, isGlutenFree: true },
    { nameFr: 'Smoothie Dates Amandes', nameEn: 'Date Almond Smoothie', descFr: 'Dattes de Medjoul, lait d\'amande, cannelle, miel — onctueux et nourrissant', descEn: 'Medjoul dates, almond milk, cinnamon, honey — smooth and nutritious', price: 35, categoryId: boissons.id, available: true, isGlutenFree: true },
  ]

  for (const p of opheonProducts) {
    await prisma.product.create({ data: { ...p, tenantId: opheon.id } })
  }

  // Sample reservations for Opheon
  await prisma.reservation.createMany({
    data: [
      { clientName: 'Karim Benali', clientPhone: '+212 612 345 678', clientEmail: 'karim@email.ma', date: new Date('2026-05-22'), time: '12:30', covers: 4, status: 'CONFIRMED', note: 'Table terrasse si possible', tenantId: opheon.id },
      { clientName: 'Sarah Idrissi', clientPhone: '+212 661 234 567', date: new Date('2026-05-23'), time: '20:00', covers: 2, status: 'PENDING', note: 'Anniversaire', tenantId: opheon.id },
      { clientName: 'Mohammed Alami', clientPhone: '+212 655 789 012', date: new Date('2026-05-21'), time: '13:00', covers: 6, status: 'CONFIRMED', tenantId: opheon.id },
    ],
  })

  // ─── RESTAURANT2 TENANT ───────────────────────────────────────
  const r2 = await prisma.tenant.upsert({
    where: { slug: 'restaurant2' },
    update: {},
    create: {
      slug: 'restaurant2',
      name: 'La Bella Vita',
      tagline: 'Authentique saveurs italiennes',
      description: 'Un voyage gastronomique au cœur de l\'Italie. Pâtes fraîches, pizzas au feu de bois et vins sélectionnés pour une expérience mémorable.',
      primaryColor: '#D4452A',
      accentColor: '#1A0808',
      phone: '+212 536 888 999',
      email: 'contact@bellavita.ma',
      address: '45 Rue Al Massira',
      city: 'Oujda',
      country: 'Maroc',
      hours: 'Mar–Dim : 12h00 – 23h00',
      instagram: 'labellav.ma',
      plan: 'PRO',
      active: true,
    },
  })

  await prisma.user.upsert({
    where: { email: 'admin@bellavita.ma' },
    update: {},
    create: {
      email: 'admin@bellavita.ma',
      password: await bcrypt.hash('Admin123!', 10),
      name: 'Admin Bella Vita',
      role: 'ADMIN',
      tenantId: r2.id,
    },
  })

  const r2Cats = await Promise.all([
    prisma.category.upsert({ where: { slug_tenantId: { slug: 'antipasti', tenantId: r2.id } }, update: {}, create: { slug: 'antipasti', nameFr: 'Antipasti', nameEn: 'Starters', order: 1, icon: '🥗', tenantId: r2.id } }),
    prisma.category.upsert({ where: { slug_tenantId: { slug: 'pasta', tenantId: r2.id } }, update: {}, create: { slug: 'pasta', nameFr: 'Pasta', nameEn: 'Pasta', order: 2, icon: '🍝', tenantId: r2.id } }),
    prisma.category.upsert({ where: { slug_tenantId: { slug: 'pizza', tenantId: r2.id } }, update: {}, create: { slug: 'pizza', nameFr: 'Pizza', nameEn: 'Pizza', order: 3, icon: '🍕', tenantId: r2.id } }),
    prisma.category.upsert({ where: { slug_tenantId: { slug: 'dolci', tenantId: r2.id } }, update: {}, create: { slug: 'dolci', nameFr: 'Dolci', nameEn: 'Desserts', order: 4, icon: '🍮', tenantId: r2.id } }),
    prisma.category.upsert({ where: { slug_tenantId: { slug: 'boissons-r2', tenantId: r2.id } }, update: {}, create: { slug: 'boissons-r2', nameFr: 'Boissons', nameEn: 'Drinks', order: 5, icon: '🍷', tenantId: r2.id } }),
  ])

  const [anti, pasta, pizza, dolci, boisR2] = r2Cats

  const r2Products = [
    { nameFr: 'Bruschetta Classique', nameEn: 'Classic Bruschetta', descFr: 'Pain grillé, tomates fraîches, basilic, huile d\'olive extra-vierge', descEn: 'Toasted bread, fresh tomatoes, basil, extra-virgin olive oil', price: 45, categoryId: anti.id, available: true, isVegan: true },
    { nameFr: 'Carpaccio de Bœuf', nameEn: 'Beef Carpaccio', descFr: 'Fines tranches de bœuf, roquette, parmesan, câpres, citron', descEn: 'Thin beef slices, arugula, parmesan, capers, lemon', price: 85, categoryId: anti.id, featured: true, available: true },
    { nameFr: 'Spaghetti Carbonara', nameEn: 'Spaghetti Carbonara', descFr: 'Recette authentique romaine : guanciale, pecorino, œuf, poivre noir', descEn: 'Authentic Roman recipe: guanciale, pecorino, egg, black pepper', price: 90, categoryId: pasta.id, featured: true, available: true },
    { nameFr: 'Penne all\'Arrabbiata', nameEn: 'Penne Arrabbiata', descFr: 'Sauce tomate épicée, ail, piment rouge, persil, pecorino', descEn: 'Spicy tomato sauce, garlic, red chili, parsley, pecorino', price: 75, categoryId: pasta.id, available: true, isVegan: true },
    { nameFr: 'Tagliatelle Truffe', nameEn: 'Truffle Tagliatelle', descFr: 'Pâtes fraîches maison, crème de truffe, parmesan 24 mois, chapelure', descEn: 'Fresh homemade pasta, truffle cream, 24-month parmesan, breadcrumbs', price: 145, categoryId: pasta.id, featured: true, available: true },
    { nameFr: 'Pizza Margherita', nameEn: 'Margherita Pizza', descFr: 'Base tomate San Marzano, mozzarella fior di latte, basilic frais', descEn: 'San Marzano tomato base, fior di latte mozzarella, fresh basil', price: 80, categoryId: pizza.id, available: true, isVegan: false },
    { nameFr: 'Pizza Quattro Stagioni', nameEn: 'Four Seasons Pizza', descFr: 'Jambon, champignons, artichaut, olives — 4 saveurs en une pizza', descEn: 'Ham, mushrooms, artichoke, olives — 4 flavors in one pizza', price: 105, categoryId: pizza.id, featured: true, available: true },
    { nameFr: 'Pizza Diavola', nameEn: 'Diavola Pizza', descFr: 'Salami piquant, mozzarella, tomate, piment frais, origan', descEn: 'Spicy salami, mozzarella, tomato, fresh chili, oregano', price: 95, categoryId: pizza.id, available: true },
    { nameFr: 'Tiramisu Maison', nameEn: 'Homemade Tiramisu', descFr: 'Recette originale : mascarpone, café espresso, savoiardi, cacao', descEn: 'Original recipe: mascarpone, espresso, savoiardi, cocoa', price: 55, categoryId: dolci.id, featured: true, available: true },
    { nameFr: 'Panna Cotta Fruits Rouges', nameEn: 'Red Berry Panna Cotta', descFr: 'Crème cuite vanille, coulis fruits rouges frais, menthe', descEn: 'Vanilla cream, fresh red berry coulis, mint', price: 45, categoryId: dolci.id, available: true, isGlutenFree: true },
    { nameFr: 'Café Italiano', nameEn: 'Italian Coffee', descFr: 'Espresso ristretto ou lungo, torréfaction italienne sélectionnée', descEn: 'Ristretto or lungo espresso, selected Italian roast', price: 22, categoryId: boisR2.id, available: true, isGlutenFree: true },
    { nameFr: 'Limonata Siciliana', nameEn: 'Sicilian Lemonade', descFr: 'Citrons de Sicile, eau gazeuse, sucre de canne, menthe fraîche', descEn: 'Sicilian lemons, sparkling water, cane sugar, fresh mint', price: 30, categoryId: boisR2.id, available: true, isVegan: true, isGlutenFree: true },
  ]

  for (const p of r2Products) {
    await prisma.product.create({ data: { ...p, tenantId: r2.id } })
  }

  // ─── SUPER ADMIN ──────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: 'super@opheon-saas.com' },
    update: {},
    create: {
      email: 'super@opheon-saas.com',
      password: await bcrypt.hash('Super123!', 10),
      name: 'Super Administrateur',
      role: 'SUPER_ADMIN',
    },
  })

  console.log('✅ Seed terminé !')
  console.log('\n📋 COMPTES DE CONNEXION :')
  console.log('  Super Admin  : super@opheon-saas.com / Super123!')
  console.log('  Admin Ophéon : admin@opheon.ma       / Admin123!')
  console.log('  Admin Bella  : admin@bellavita.ma    / Admin123!')
  console.log('\n🌐 URLS :')
  console.log('  SaaS Landing : http://localhost:3000')
  console.log('  Ophéon Site  : http://localhost:3000/opheon')
  console.log('  Bella Vita   : http://localhost:3000/restaurant2')
  console.log('  Super Admin  : http://localhost:3000/super-admin')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
