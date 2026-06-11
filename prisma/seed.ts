/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ── Branches ──────────────────────────────────────────────────────────────────
const BRANCHES = [
  { name: 'London',         location: 'London, EC1A 1BB',    phone: '+44 20 1234 5678',  email: 'london@steakz.co.uk',     slug: 'london'     },
  { name: 'Manchester',     location: 'Manchester, M1 1AA',  phone: '+44 161 234 5678',  email: 'manchester@steakz.co.uk', slug: 'manchester' },
  { name: 'Leeds',          location: 'Leeds, LS1 1AA',      phone: '+44 113 234 5678',  email: 'leeds@steakz.co.uk',      slug: 'leeds'      },
  { name: 'Birmingham',     location: 'Birmingham, B1 1AA',  phone: '+44 121 234 5678',  email: 'birmingham@steakz.co.uk', slug: 'birmingham' },
  { name: 'Liverpool',      location: 'Liverpool, L1 1AA',   phone: '+44 151 234 5678',  email: 'liverpool@steakz.co.uk',  slug: 'liverpool'  },
];

const CATEGORIES = ['Starters', 'Steaks', 'Burgers', 'Sides', 'Desserts', 'Drinks'];

const MENU_ITEMS = [
  { category: 'Starters', name: 'Garlic Bread',          description: 'Toasted sourdough with garlic butter',        price: 4.99,  imageUrl: 'https://images.unsplash.com/photo-1619535860434-cf9b902578ac?w=400' },
  { category: 'Starters', name: 'Prawn Cocktail',        description: 'Classic prawn cocktail with Marie Rose sauce', price: 7.99,  imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400' },
  { category: 'Starters', name: 'Soup of the Day',       description: 'Freshly made seasonal soup',                   price: 5.49,  imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400' },
  { category: 'Steaks',   name: 'Ribeye 8oz',            description: 'Prime ribeye, chargrilled to perfection',      price: 28.99, imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400' },
  { category: 'Steaks',   name: 'Sirloin 10oz',          description: 'Classic sirloin, seasoned and grilled',        price: 31.99, imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400' },
  { category: 'Steaks',   name: 'Fillet 8oz',            description: 'Tender beef fillet, the finest cut',           price: 38.99, imageUrl: 'https://images.unsplash.com/photo-1607116667981-ff148b2d5b7b?w=400' },
  { category: 'Steaks',   name: 'T-Bone 16oz',           description: 'The showstopper – for real steak lovers',      price: 44.99, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400' },
  { category: 'Burgers',  name: 'Steakz Classic Burger', description: '6oz beef patty, lettuce, tomato, pickles',     price: 13.99, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
  { category: 'Burgers',  name: 'BBQ Bacon Burger',      description: 'Smoky BBQ, streaky bacon, cheddar',            price: 15.99, imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400' },
  { category: 'Burgers',  name: 'Mushroom Swiss Burger', description: 'Sautéed mushrooms, Swiss cheese',              price: 14.99, imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400' },
  { category: 'Sides',    name: 'Chunky Chips',          description: 'Thick-cut hand-fried chips',                   price: 3.99,  imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400' },
  { category: 'Sides',    name: 'Onion Rings',           description: 'Crispy battered onion rings',                  price: 3.49,  imageUrl: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400' },
  { category: 'Sides',    name: 'Side Salad',            description: 'Mixed leaves with house dressing',             price: 3.49,  imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400' },
  { category: 'Sides',    name: 'Peppercorn Sauce',      description: 'Classic creamy peppercorn',                    price: 2.49,  imageUrl: 'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=400' },
  { category: 'Desserts', name: 'Chocolate Brownie',     description: 'Warm brownie with vanilla ice cream',          price: 6.99,  imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400' },
  { category: 'Desserts', name: 'Cheesecake',            description: 'New York-style baked cheesecake',              price: 6.49,  imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400' },
  { category: 'Drinks',   name: 'Soft Drink',            description: 'Coke, Diet Coke, Lemonade, J2O',              price: 2.99,  imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400' },
  { category: 'Drinks',   name: 'Still Water',           description: '500ml still mineral water',                    price: 2.50,  imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400' },
  { category: 'Drinks',   name: 'Sparkling Water',       description: '500ml sparkling mineral water',                price: 2.75,  imageUrl: 'https://images.unsplash.com/photo-1585155770447-2f66e2a397b5?w=400' },
  { category: 'Drinks',   name: 'House Wine (Glass)',    description: 'Red, White, or Rosé',                         price: 5.49,  imageUrl: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400' },
  { category: 'Drinks',   name: 'Beer (Pint)',           description: 'Lager or Ale',                                 price: 4.99,  imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400' },
];

const INVENTORY_ITEMS = [
  // Main Meals — serving
  { name: 'Ribeye Steak',      category: 'Main Meals',  unit: 'serving', quantity: 500, minimumStock: 50  },
  { name: 'Sirloin Steak',     category: 'Main Meals',  unit: 'serving', quantity: 500, minimumStock: 50  },
  { name: 'Beef Fillet',       category: 'Main Meals',  unit: 'serving', quantity: 500, minimumStock: 50  },
  { name: 'Chicken Breast',    category: 'Main Meals',  unit: 'serving', quantity: 500, minimumStock: 50  },
  { name: 'Burger Patties',    category: 'Main Meals',  unit: 'serving', quantity: 500, minimumStock: 50  },
  // Side Dishes — serving
  { name: 'Chips',             category: 'Side Dishes', unit: 'serving', quantity: 500, minimumStock: 100 },
  { name: 'Bread Rolls',       category: 'Side Dishes', unit: 'serving', quantity: 500, minimumStock: 50  },
  { name: 'Salad Mix',         category: 'Side Dishes', unit: 'serving', quantity: 200, minimumStock: 30  },
  { name: 'Onion Rings',       category: 'Side Dishes', unit: 'serving', quantity: 300, minimumStock: 30  },
  // Desserts — serving
  { name: 'Chocolate Brownie', category: 'Desserts',    unit: 'serving', quantity: 200, minimumStock: 20  },
  { name: 'Cheesecake',        category: 'Desserts',    unit: 'serving', quantity: 200, minimumStock: 20  },
  { name: 'Ice Cream',         category: 'Desserts',    unit: 'serving', quantity: 150, minimumStock: 20  },
  // Soft Drinks — bottle
  { name: 'Soft Drinks',       category: 'Soft Drinks', unit: 'bottle',  quantity: 300, minimumStock: 50  },
  { name: 'Fruit Juice',       category: 'Soft Drinks', unit: 'bottle',  quantity: 200, minimumStock: 30  },
  // Water — bottle
  { name: 'Still Water',       category: 'Water',       unit: 'bottle',  quantity: 300, minimumStock: 50  },
  { name: 'Sparkling Water',   category: 'Water',       unit: 'bottle',  quantity: 200, minimumStock: 30  },
  // Starters — all five from the menu
  { name: 'Garlic Bread',          category: 'Starters',    unit: 'serving', quantity: 200, minimumStock: 30 },
  { name: 'Loaded Fries',          category: 'Starters',    unit: 'serving', quantity: 200, minimumStock: 30 },
  { name: 'Chicken Wings',         category: 'Starters',    unit: 'serving', quantity: 150, minimumStock: 20 },
  { name: 'Prawn Cocktail',        category: 'Starters',    unit: 'serving', quantity: 150, minimumStock: 20 },
  { name: 'Soup of the Day',       category: 'Starters',    unit: 'serving', quantity: 100, minimumStock: 15 },
  // Steaks — T-Bone and Tomahawk were missing
  { name: 'T-Bone Steak',          category: 'Main Meals',  unit: 'serving', quantity: 300, minimumStock: 30 },
  { name: 'Tomahawk Steak',        category: 'Main Meals',  unit: 'serving', quantity: 100, minimumStock: 10 },
  // Mains — Lamb Chops and Fish and Chips had no inventory at all
  { name: 'Lamb Chops',            category: 'Main Meals',  unit: 'serving', quantity: 150, minimumStock: 20 },
  { name: 'Fish and Chips',        category: 'Main Meals',  unit: 'serving', quantity: 150, minimumStock: 20 },
  // Desserts — three items from the menu had no inventory
  { name: 'Chocolate Lava Cake',   category: 'Desserts',    unit: 'serving', quantity: 150, minimumStock: 20 },
  { name: 'Sticky Toffee Pudding', category: 'Desserts',    unit: 'serving', quantity: 150, minimumStock: 20 },
  { name: 'Apple Crumble',         category: 'Desserts',    unit: 'serving', quantity: 150, minimumStock: 20 },
  // Drinks — hot drinks and specials had no inventory
  { name: 'Coffee',                category: 'Hot Drinks',  unit: 'cup',     quantity: 500, minimumStock: 50 },
  { name: 'Tea',                   category: 'Hot Drinks',  unit: 'cup',     quantity: 500, minimumStock: 50 },
  { name: 'Mocktails',             category: 'Soft Drinks', unit: 'glass',   quantity: 200, minimumStock: 30 },
  { name: 'Milkshakes',            category: 'Soft Drinks', unit: 'glass',   quantity: 200, minimumStock: 30 },
];

// ── Employee accounts ─────────────────────────────────────────────────────────
// 27 total: 2 HQ/Admin + 5 branches × 5 staff (manager, 2 waiters, chef, KA)
// String literals used for enum fields so the seed compiles before `prisma generate` runs.
// Prisma calls use `as any` on new fields (salary, shift, etc.) that only exist
// in the schema after running: npx prisma migrate dev
interface EmployeeData {
  email: string;
  password: string;
  role: string;
  branchSlug: string | null;
  firstName: string;
  lastName: string;
  employeeId: string;
  salary: number;
  shift: string;
  employeeStatus: string;
  dateJoined: Date;
  teamAssignment: string;
}

const DEMO_ACCOUNTS: EmployeeData[] = [
  // ── HQ ──────────────────────────────────────────────────────────────────────
  { email: 'admin@steakz.co.uk',              password: 'Admin@123',   role: 'ADMIN',            branchSlug: null,         firstName: 'System',     lastName: 'Admin',    employeeId: 'STZ-ADM-001',     salary: 48000, shift: 'FLEXIBLE',  employeeStatus: 'ACTIVE', dateJoined: new Date('2021-03-01'), teamAssignment: 'Corporate'   },
  { email: 'hq@steakz.co.uk',                 password: 'HQ@123',      role: 'HQ_MANAGER',       branchSlug: null,         firstName: 'HQ',         lastName: 'Manager',  employeeId: 'STZ-HQM-001',     salary: 58000, shift: 'FLEXIBLE',  employeeStatus: 'ACTIVE', dateJoined: new Date('2021-06-01'), teamAssignment: 'Corporate'   },

  // ── London ───────────────────────────────────────────────────────────────────
  { email: 'manager.london@steakz.co.uk',     password: 'Manager@123', role: 'BRANCH_MANAGER',   branchSlug: 'london',     firstName: 'James',      lastName: 'Mitchell', employeeId: 'STZ-BRM-LON-001', salary: 38000, shift: 'FLEXIBLE',  employeeStatus: 'ACTIVE', dateJoined: new Date('2021-09-01'), teamAssignment: 'Management'  },
  { email: 'waiter.london@steakz.co.uk',      password: 'Waiter@123',  role: 'WAITER_CASHIER',   branchSlug: 'london',     firstName: 'Sophie',     lastName: 'Clarke',   employeeId: 'STZ-WTC-LON-001', salary: 24000, shift: 'MORNING',   employeeStatus: 'ACTIVE', dateJoined: new Date('2022-01-10'), teamAssignment: 'Floor Team'  },
  { email: 'waiter.london2@steakz.co.uk',     password: 'Waiter@123',  role: 'WAITER_CASHIER',   branchSlug: 'london',     firstName: 'Daniel',     lastName: 'Hughes',   employeeId: 'STZ-WTC-LON-002', salary: 23500, shift: 'AFTERNOON', employeeStatus: 'ACTIVE', dateJoined: new Date('2022-06-15'), teamAssignment: 'Floor Team'  },
  { email: 'chef.london@steakz.co.uk',        password: 'Chef@123',    role: 'CHEF',             branchSlug: 'london',     firstName: 'Marco',      lastName: 'Bianchi',  employeeId: 'STZ-CHF-LON-001', salary: 32000, shift: 'MORNING',   employeeStatus: 'ACTIVE', dateJoined: new Date('2021-09-15'), teamAssignment: 'Kitchen Team'},
  { email: 'kitchen.london@steakz.co.uk',     password: 'Kitchen@123', role: 'KITCHEN_ASSISTANT',branchSlug: 'london',     firstName: 'Aisha',      lastName: 'Patel',    employeeId: 'STZ-KTA-LON-001', salary: 21000, shift: 'MORNING',   employeeStatus: 'ACTIVE', dateJoined: new Date('2022-03-01'), teamAssignment: 'Kitchen Team'},

  // ── Manchester ───────────────────────────────────────────────────────────────
  { email: 'manager.manchester@steakz.co.uk', password: 'Manager@123', role: 'BRANCH_MANAGER',   branchSlug: 'manchester', firstName: 'Rachel',     lastName: 'Thompson', employeeId: 'STZ-BRM-MCR-001', salary: 38000, shift: 'FLEXIBLE',  employeeStatus: 'ACTIVE', dateJoined: new Date('2021-10-01'), teamAssignment: 'Management'  },
  { email: 'waiter.manchester@steakz.co.uk',  password: 'Waiter@123',  role: 'WAITER_CASHIER',   branchSlug: 'manchester', firstName: 'Liam',       lastName: 'Walker',   employeeId: 'STZ-WTC-MCR-001', salary: 24000, shift: 'MORNING',   employeeStatus: 'ACTIVE', dateJoined: new Date('2022-02-01'), teamAssignment: 'Floor Team'  },
  { email: 'waiter.manchester2@steakz.co.uk', password: 'Waiter@123',  role: 'WAITER_CASHIER',   branchSlug: 'manchester', firstName: 'Emma',       lastName: 'Davies',   employeeId: 'STZ-WTC-MCR-002', salary: 23500, shift: 'AFTERNOON', employeeStatus: 'ACTIVE', dateJoined: new Date('2022-07-01'), teamAssignment: 'Floor Team'  },
  { email: 'chef.manchester@steakz.co.uk',    password: 'Chef@123',    role: 'CHEF',             branchSlug: 'manchester', firstName: 'Tom',        lastName: 'Harrison', employeeId: 'STZ-CHF-MCR-001', salary: 32000, shift: 'MORNING',   employeeStatus: 'ACTIVE', dateJoined: new Date('2021-10-15'), teamAssignment: 'Kitchen Team'},
  { email: 'kitchen.manchester@steakz.co.uk', password: 'Kitchen@123', role: 'KITCHEN_ASSISTANT',branchSlug: 'manchester', firstName: 'Priya',      lastName: 'Singh',    employeeId: 'STZ-KTA-MCR-001', salary: 21000, shift: 'MORNING',   employeeStatus: 'ACTIVE', dateJoined: new Date('2022-04-01'), teamAssignment: 'Kitchen Team'},

  // ── Leeds ────────────────────────────────────────────────────────────────────
  { email: 'manager.leeds@steakz.co.uk',      password: 'Manager@123', role: 'BRANCH_MANAGER',   branchSlug: 'leeds',      firstName: 'Claire',     lastName: 'Robinson', employeeId: 'STZ-BRM-LDS-001', salary: 38000, shift: 'FLEXIBLE',  employeeStatus: 'ACTIVE', dateJoined: new Date('2022-01-01'), teamAssignment: 'Management'  },
  { email: 'waiter.leeds@steakz.co.uk',       password: 'Waiter@123',  role: 'WAITER_CASHIER',   branchSlug: 'leeds',      firstName: 'Jake',       lastName: 'Wilson',   employeeId: 'STZ-WTC-LDS-001', salary: 24000, shift: 'MORNING',   employeeStatus: 'ACTIVE', dateJoined: new Date('2022-03-01'), teamAssignment: 'Floor Team'  },
  { email: 'waiter.leeds2@steakz.co.uk',      password: 'Waiter@123',  role: 'WAITER_CASHIER',   branchSlug: 'leeds',      firstName: 'Chloe',      lastName: 'Brown',    employeeId: 'STZ-WTC-LDS-002', salary: 23500, shift: 'AFTERNOON', employeeStatus: 'ACTIVE', dateJoined: new Date('2022-08-01'), teamAssignment: 'Floor Team'  },
  { email: 'chef.leeds@steakz.co.uk',         password: 'Chef@123',    role: 'CHEF',             branchSlug: 'leeds',      firstName: 'Sven',       lastName: 'Andersen', employeeId: 'STZ-CHF-LDS-001', salary: 32000, shift: 'MORNING',   employeeStatus: 'ACTIVE', dateJoined: new Date('2022-01-15'), teamAssignment: 'Kitchen Team'},
  { email: 'kitchen.leeds@steakz.co.uk',      password: 'Kitchen@123', role: 'KITCHEN_ASSISTANT',branchSlug: 'leeds',      firstName: 'Fatima',     lastName: 'Ali',      employeeId: 'STZ-KTA-LDS-001', salary: 21000, shift: 'MORNING',   employeeStatus: 'ACTIVE', dateJoined: new Date('2022-05-01'), teamAssignment: 'Kitchen Team'},

  // ── Birmingham ───────────────────────────────────────────────────────────────
  { email: 'manager.birmingham@steakz.co.uk', password: 'Manager@123', role: 'BRANCH_MANAGER',   branchSlug: 'birmingham', firstName: 'David',      lastName: 'Evans',    employeeId: 'STZ-BRM-BHM-001', salary: 38000, shift: 'FLEXIBLE',  employeeStatus: 'ACTIVE', dateJoined: new Date('2021-11-01'), teamAssignment: 'Management'  },
  { email: 'waiter.birmingham@steakz.co.uk',  password: 'Waiter@123',  role: 'WAITER_CASHIER',   branchSlug: 'birmingham', firstName: 'Naomi',      lastName: 'James',    employeeId: 'STZ-WTC-BHM-001', salary: 24000, shift: 'MORNING',   employeeStatus: 'ACTIVE', dateJoined: new Date('2022-02-15'), teamAssignment: 'Floor Team'  },
  { email: 'waiter.birmingham2@steakz.co.uk', password: 'Waiter@123',  role: 'WAITER_CASHIER',   branchSlug: 'birmingham', firstName: 'Owen',       lastName: 'Phillips', employeeId: 'STZ-WTC-BHM-002', salary: 23500, shift: 'AFTERNOON', employeeStatus: 'ACTIVE', dateJoined: new Date('2022-09-01'), teamAssignment: 'Floor Team'  },
  { email: 'chef.birmingham@steakz.co.uk',    password: 'Chef@123',    role: 'CHEF',             branchSlug: 'birmingham', firstName: 'Kenji',      lastName: 'Nakamura', employeeId: 'STZ-CHF-BHM-001', salary: 32000, shift: 'MORNING',   employeeStatus: 'ACTIVE', dateJoined: new Date('2021-11-15'), teamAssignment: 'Kitchen Team'},
  { email: 'kitchen.birmingham@steakz.co.uk', password: 'Kitchen@123', role: 'KITCHEN_ASSISTANT',branchSlug: 'birmingham', firstName: 'Mei',        lastName: 'Chen',     employeeId: 'STZ-KTA-BHM-001', salary: 21000, shift: 'MORNING',   employeeStatus: 'ACTIVE', dateJoined: new Date('2022-06-01'), teamAssignment: 'Kitchen Team'},

  // ── Liverpool ────────────────────────────────────────────────────────────────
  { email: 'manager.liverpool@steakz.co.uk',  password: 'Manager@123', role: 'BRANCH_MANAGER',   branchSlug: 'liverpool',  firstName: 'Sarah',      lastName: 'Kelly',    employeeId: 'STZ-BRM-LPL-001', salary: 38000, shift: 'FLEXIBLE',  employeeStatus: 'ACTIVE', dateJoined: new Date('2022-02-01'), teamAssignment: 'Management'  },
  { email: 'waiter.liverpool@steakz.co.uk',   password: 'Waiter@123',  role: 'WAITER_CASHIER',   branchSlug: 'liverpool',  firstName: 'Ryan',       lastName: 'Murphy',   employeeId: 'STZ-WTC-LPL-001', salary: 24000, shift: 'MORNING',   employeeStatus: 'ACTIVE', dateJoined: new Date('2022-04-01'), teamAssignment: 'Floor Team'  },
  { email: 'waiter.liverpool2@steakz.co.uk',  password: 'Waiter@123',  role: 'WAITER_CASHIER',   branchSlug: 'liverpool',  firstName: 'Grace',      lastName: 'Connor',   employeeId: 'STZ-WTC-LPL-002', salary: 23500, shift: 'AFTERNOON', employeeStatus: 'ACTIVE', dateJoined: new Date('2022-10-01'), teamAssignment: 'Floor Team'  },
  { email: 'chef.liverpool@steakz.co.uk',     password: 'Chef@123',    role: 'CHEF',             branchSlug: 'liverpool',  firstName: 'Carlos',     lastName: 'Mendez',   employeeId: 'STZ-CHF-LPL-001', salary: 32000, shift: 'MORNING',   employeeStatus: 'ACTIVE', dateJoined: new Date('2022-02-15'), teamAssignment: 'Kitchen Team'},
  { email: 'kitchen.liverpool@steakz.co.uk',  password: 'Kitchen@123', role: 'KITCHEN_ASSISTANT',branchSlug: 'liverpool',  firstName: 'Yemi',       lastName: 'Okafor',   employeeId: 'STZ-KTA-LPL-001', salary: 21000, shift: 'MORNING',   employeeStatus: 'ACTIVE', dateJoined: new Date('2022-07-01'), teamAssignment: 'Kitchen Team'},
];

async function main() {
  console.log('🥩  Running Steakz UK seed...\n');

  // ── 1. Branches ───────────────────────────────────────────────────────────
  const branchIdMap = new Map<string, string>();
  for (const { slug, ...data } of BRANCHES) {
    const branch = await prisma.branch.upsert({
      where: { email: data.email },
      update: { name: data.name, location: data.location, phone: data.phone },
      create: data,
    });
    branchIdMap.set(slug, branch.id);
  }
  console.log(`✓ Branches: ${BRANCHES.length} upserted`);

  // ── 2. Menu categories + items ────────────────────────────────────────────
  const categoryMap = new Map<string, string>();
  for (const name of CATEGORIES) {
    let cat = await prisma.menuCategory.findFirst({ where: { name } });
    if (!cat) cat = await prisma.menuCategory.create({ data: { name } });
    categoryMap.set(name, cat.id);
  }

  let menuCreated = 0;
  let menuUpdated = 0;
  for (const item of MENU_ITEMS) {
    const categoryId = categoryMap.get(item.category)!;
    const exists = await prisma.menuItem.findFirst({ where: { name: item.name, categoryId } });
    if (!exists) {
      await prisma.menuItem.create({
        data: { categoryId, name: item.name, description: item.description, price: item.price, imageUrl: item.imageUrl },
      });
      menuCreated++;
    } else if (exists.imageUrl !== item.imageUrl) {
      await prisma.menuItem.update({ where: { id: exists.id }, data: { imageUrl: item.imageUrl } });
      menuUpdated++;
    }
  }
  console.log(`✓ Menu: ${CATEGORIES.length} categories, ${menuCreated} new items, ${menuUpdated} images updated`);

  // ── 3. Tables per branch ──────────────────────────────────────────────────
  const BRANCH_TABLE_COUNTS: Record<string, number> = {
    london:     50,
    manchester: 40,
    birmingham: 35,
    leeds:      35,
    liverpool:  30,
  };
  let tablesCreated = 0;
  for (const { slug } of BRANCHES) {
    const branchId = branchIdMap.get(slug)!;
    const existing = await prisma.table.count({ where: { branchId } });
    const target = BRANCH_TABLE_COUNTS[slug] ?? 20;
    if (existing < target) {
      for (let i = existing + 1; i <= target; i++) {
        const capacity = i <= Math.floor(target * 0.3) ? 2 : i <= Math.floor(target * 0.7) ? 4 : 6;
        await prisma.table.create({ data: { branchId, tableNumber: i, capacity } });
        tablesCreated++;
      }
    }
  }
  console.log(`✓ Tables: ${tablesCreated} created`);

  // ── 4. Inventory (per branch) ─────────────────────────────────────────────
  // Use explicit findFirst → create/update to avoid the upsert({ where: { id: 'new' } })
  // pattern which can create duplicates if the seed is run twice concurrently or rapidly.
  let invCreated = 0;
  let invUpdated = 0;
  for (const { slug } of BRANCHES) {
    const branchId = branchIdMap.get(slug)!;
    for (const inv of INVENTORY_ITEMS) {
      const existingItem = await prisma.inventory.findFirst({ where: { branchId, name: inv.name } });
      if (existingItem) {
        await prisma.inventory.update({
          where: { id: existingItem.id },
          data: { category: inv.category, unit: inv.unit, quantity: inv.quantity, minimumStock: inv.minimumStock },
        });
        invUpdated++;
      } else {
        await prisma.inventory.create({
          data: { branchId, name: inv.name, category: inv.category, unit: inv.unit, quantity: inv.quantity, minimumStock: inv.minimumStock },
        });
        invCreated++;
      }
    }
  }
  console.log(`✓ Inventory: ${invCreated} items created, ${invUpdated} updated`);

  // ── 5. Employee accounts (27 total) ──────────────────────────────────────
  // ── Demo customer account ────────────────────────────────────────────────
  {
    const customerHash = await bcrypt.hash('Customer@123', 12);
    const existing = await prisma.user.findUnique({ where: { email: 'jane@steakz.co.uk' } });
    if (!existing) {
      await prisma.user.create({ data: { firstName: 'Jane', lastName: 'Smith', email: 'jane@steakz.co.uk', password: customerHash, role: 'CUSTOMER' } });
    } else {
      await prisma.user.update({ where: { email: 'jane@steakz.co.uk' }, data: { password: customerHash } });
    }
  }

  console.log('\nSyncing employee accounts...');
  let created = 0;
  let updated = 0;

  for (const account of DEMO_ACCOUNTS) {
    const hashedPassword = await bcrypt.hash(account.password, 12);
    const branchId = account.branchSlug ? (branchIdMap.get(account.branchSlug) ?? null) : null;

    // New fields (salary, shift, employeeId, etc.) only exist in the generated client
    // after running `prisma migrate dev`. Using `as any` lets the seed compile now
    // and work correctly once the migration has run.
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const employeeData: any = {
      firstName:      account.firstName,
      lastName:       account.lastName,
      password:       hashedPassword,
      role:           account.role,
      branchId,
      employeeId:     account.employeeId,
      salary:         account.salary,
      shift:          account.shift,
      employeeStatus: account.employeeStatus,
      dateJoined:     account.dateJoined,
      teamAssignment: account.teamAssignment,
    };

    const existing = await prisma.user.findUnique({ where: { email: account.email } });
    if (existing) {
      await (prisma.user as any).update({ where: { email: account.email }, data: employeeData });
      updated++;
    } else {
      await (prisma.user as any).create({ data: { email: account.email, ...employeeData } });
      created++;
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }

  console.log(`✓ Accounts: ${created} created, ${updated} updated (passwords refreshed)\n`);

  // ── 6. Sample orders, reservations, payments (10 per branch) ─────────────
  const demoCustomer = await prisma.user.findUnique({ where: { email: 'jane@steakz.co.uk' } });
  const allMenuItems = await prisma.menuItem.findMany({ take: 6 });
  let ordersCreated = 0;
  let reservationsCreated = 0;
  let paymentsCreated = 0;

  if (demoCustomer && allMenuItems.length >= 2) {
    for (const { slug } of BRANCHES) {
      const branchId = branchIdMap.get(slug)!;
      const existingOrders = await prisma.order.count({ where: { branchId } });
      if (existingOrders > 0) continue;

      const tables = await prisma.table.findMany({ where: { branchId }, take: 15 });
      const waiter = await (prisma.user as any).findFirst({
        where: { branchId, role: 'WAITER_CASHIER' },
      });

      // Create 10 sample orders
      for (let i = 0; i < 10; i++) {
        const table = tables[i % tables.length];
        const pickedItems = allMenuItems.slice(i % 3, (i % 3) + 2);
        const orderTotal = pickedItems.reduce((s, m) => s + Number(m.price), 0);
        const orderStatus = i < 4 ? 'COMPLETED' : i < 7 ? 'SERVED' : 'PENDING';
        const daysAgo = 10 - i;
        const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

        const order = await prisma.order.create({
          data: {
            branchId,
            tableId: table?.id ?? null,
            waiterId: waiter?.id ?? null,
            customerId: demoCustomer.id,
            total: orderTotal,
            status: orderStatus as any,
            createdAt,
            items: {
              create: pickedItems.map((m) => ({
                menuItemId: m.id,
                quantity: 1,
                unitPrice: m.price,
              })),
            },
          },
        });
        ordersCreated++;

        // Payment for non-PENDING orders
        if (orderStatus !== 'PENDING') {
          await prisma.payment.create({
            data: {
              orderId: order.id,
              amount: orderTotal,
              method: (['CARD', 'CASH', 'CONTACTLESS'] as const)[i % 3],
              status: 'COMPLETED',
              createdAt,
            },
          });
          paymentsCreated++;
        }
      }

      // Create 10 sample reservations (future dates so they don't conflict with orders)
      const existingReservations = await prisma.reservation.count({ where: { branchId } });
      if (existingReservations === 0) {
        const resTables = tables.slice(10); // use different tables from order tables
        for (let i = 0; i < 10; i++) {
          const table = resTables[i % Math.max(resTables.length, 1)];
          if (!table) continue;
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + i + 1);
          futureDate.setHours(19, 0, 0, 0);
          futureDate.setMinutes(0, 0, 0);

          await prisma.reservation.create({
            data: {
              customerId: demoCustomer.id,
              branchId,
              tableId: table.id,
              reservationDate: futureDate,
              partySize: 2 + (i % 4),
              status: 'CONFIRMED',
            },
          });
          reservationsCreated++;
        }
      }
    }
  }

  console.log(`✓ Sample data: ${ordersCreated} orders, ${reservationsCreated} reservations, ${paymentsCreated} payments\n`);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('Demo credentials');
  console.log('────────────────────────────────────────────────────────────────────────');
  console.log('  admin@steakz.co.uk                     ADMIN             Admin@123');
  console.log('  hq@steakz.co.uk                        HQ_MANAGER        HQ@123');
  console.log('  manager.{branch}@steakz.co.uk          BRANCH_MANAGER    Manager@123');
  console.log('  waiter.{branch}@steakz.co.uk           WAITER_CASHIER    Waiter@123');
  console.log('  waiter.{branch}2@steakz.co.uk          WAITER_CASHIER    Waiter@123');
  console.log('  chef.{branch}@steakz.co.uk             CHEF              Chef@123');
  console.log('  kitchen.{branch}@steakz.co.uk          KITCHEN_ASSISTANT Kitchen@123');
  console.log('  {branch} = london | manchester | leeds | birmingham | liverpool');
  console.log('────────────────────────────────────────────────────────────────────────');
  console.log('  Customers self-register via POST /api/auth/register');
  console.log('\n✅  Seed complete — 27 employees across 5 branches + HQ');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
