import prisma from '../config/database'

const IMAGE_MAP: Record<string, string> = {
  // Exact names as stored in the DB
  'Garlic Bread':          'https://images.unsplash.com/photo-1619535860434-cf9b902578ac?w=400',
  'Prawn Cocktail':        'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
  'Soup of the Day':       'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
  'Ribeye 8oz':            'https://images.unsplash.com/photo-1558030006-450675393462?w=400',
  'Sirloin 10oz':          'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400',
  'Fillet 8oz':            'https://images.unsplash.com/photo-1607116667981-ff148b2d5b7b?w=400',
  'T-Bone 16oz':           'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
  'Steakz Classic Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
  'BBQ Bacon Burger':      'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400',
  'Mushroom Swiss Burger': 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400',
  'Chunky Chips':          'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
  'Onion Rings':           'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400',
  'Side Salad':            'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
  'Peppercorn Sauce':      'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=400',
  'Chocolate Brownie':     'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
  'Cheesecake':            'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400',
  'Soft Drink':            'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400',
  'Still Water':           'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400',
  'Sparkling Water':       'https://images.unsplash.com/photo-1585155770447-2f66e2a397b5?w=400',
  'House Wine (Glass)':    'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400',
  'Beer (Pint)':           'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400',
  // Alternative / nice names for partial matching on any extra items
  'Ribeye Steak':          'https://images.unsplash.com/photo-1558030006-450675393462?w=400',
  'Sirloin Steak':         'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400',
  'Fillet Steak':          'https://images.unsplash.com/photo-1607116667981-ff148b2d5b7b?w=400',
  'T-Bone Steak':          'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
  'Tomahawk Steak':        'https://images.unsplash.com/photo-1615937691194-97dbd3f3dc29?w=400',
  'Classic Burger':        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
  'BBQ Burger':            'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400',
  'Cheese Burger':         'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400',
  'Grilled Chicken':       'https://images.unsplash.com/photo-1598103442097-8b74394b95c7?w=400',
  'Chicken Wings':         'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400',
  'Calamari':              'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400',
  'Bruschetta':            'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400',
  'Chips':                 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
  'Salad':                 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
  'Coleslaw':              'https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?w=400',
  'Bread Rolls':           'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
  'Ice Cream':             'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400',
  'Sticky Toffee Pudding': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
  'Chocolate Fondant':     'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
  'Soft Drinks':           'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400',
  'Milkshake':             'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400',
  'Fruit Juice':           'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400',
}

async function fix() {
  const items = await prisma.menuItem.findMany({ select: { id: true, name: true, imageUrl: true } })
  console.log('[FIX] Found', items.length, 'menu items')
  let updated = 0

  for (const item of items) {
    // Exact match first
    let newUrl = IMAGE_MAP[item.name]

    // Partial match fallback
    if (!newUrl) {
      const key = Object.keys(IMAGE_MAP).find((k) =>
        item.name.toLowerCase().includes(k.toLowerCase()) ||
        k.toLowerCase().includes(item.name.toLowerCase())
      )
      if (key) newUrl = IMAGE_MAP[key]
    }

    if (newUrl && newUrl !== item.imageUrl) {
      await prisma.menuItem.update({ where: { id: item.id }, data: { imageUrl: newUrl } })
      console.log('[FIX] Updated:', item.name, '→ image fixed')
      updated++
    } else if (!newUrl) {
      console.log('[SKIP] No image mapping found for:', item.name)
    } else {
      console.log('[OK] Already correct:', item.name)
    }
  }

  console.log('[FIX] Done —', updated, 'images updated')
  await prisma.$disconnect()
}

fix().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
