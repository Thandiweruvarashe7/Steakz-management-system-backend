import { TransactionType } from '@prisma/client';
import prisma from '../config/database';
import { createNotification } from './notificationHelper';

type AlertLevel = 'LOW_STOCK' | 'CRITICAL';

interface StockAlert {
  name: string;
  quantity: number;
  minimumStock: number;
  alertLevel: AlertLevel;
}

/**
 * Deduct inventory for all items in an order and notify the branch manager
 * if any item drops below stock thresholds.
 * Called only when an order status changes to COMPLETED.
 *
 * Thresholds:
 *   quantity < 50    → CRITICAL
 *   quantity <= 100  → LOW_STOCK
 *   quantity <= minimumStock → LOW_STOCK (catches custom per-item minimums)
 */
export async function deductInventoryForOrder(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { menuItem: { select: { name: true } } } },
    },
  });

  if (!order) {
    console.warn('[INVENTORY] deductInventoryForOrder: order not found', orderId);
    return;
  }

  const inventoryItems = await prisma.inventory.findMany({
    where: { branchId: order.branchId },
  });

  console.log('[INVENTORY] deductInventoryForOrder START — orderId:', orderId,
    '| orderItems:', order.items.length, '| branch:', order.branchId,
    '| inventoryItems:', inventoryItems.length);

  const stockAlerts: StockAlert[] = [];

  for (const orderItem of order.items) {
    const itemName = orderItem.menuItem.name.toLowerCase();

    // Match any word (length > 2) from menu item name against inventory name, or vice versa
    const match = inventoryItems.find((inv) => {
      const invName = inv.name.toLowerCase();
      const menuWords = itemName.split(' ').filter((w) => w.length > 2);
      const invWords = invName.split(' ').filter((w) => w.length > 2);
      return menuWords.some((w) => invName.includes(w)) || invWords.some((w) => itemName.includes(w));
    });

    if (!match) {
      console.log('[INVENTORY] No inventory match for menu item:', orderItem.menuItem.name, '— skipping');
      continue;
    }

    const deductQty = orderItem.quantity;
    const newQty = Math.max(0, match.quantity - deductQty);

    await prisma.inventory.update({
      where: { id: match.id },
      data: { quantity: newQty },
    });

    await prisma.inventoryTransaction.create({
      data: {
        inventoryId: match.id,
        quantity: deductQty,
        transactionType: TransactionType.OUT,
        notes: `Deducted on order ${orderId} completion`,
      },
    });

    console.log(`[INVENTORY] Deducted ${deductQty} of "${match.name}" (branch ${order.branchId}) — new qty: ${newQty}`);

    // Threshold check: CRITICAL < 50, LOW_STOCK <= 100 or <= minimumStock
    let alertLevel: AlertLevel | null = null;
    if (newQty < 50) {
      alertLevel = 'CRITICAL';
    } else if (newQty <= 100 || newQty <= match.minimumStock) {
      alertLevel = 'LOW_STOCK';
    }

    if (alertLevel) {
      stockAlerts.push({ name: match.name, quantity: newQty, minimumStock: match.minimumStock, alertLevel });
      console.log(`[INVENTORY] ${alertLevel} alert for "${match.name}" — qty: ${newQty}`);
    }

    // Update local cache so repeated hits on same item are accurate
    match.quantity = newQty;
  }

  if (stockAlerts.length === 0) return;

  const branchManager = await prisma.user.findFirst({
    where: { branchId: order.branchId, role: 'BRANCH_MANAGER' },
    select: { id: true },
  });

  if (!branchManager) {
    console.warn('[INVENTORY] No BRANCH_MANAGER found for branch', order.branchId);
    return;
  }

  for (const alert of stockAlerts) {
    const isCritical = alert.alertLevel === 'CRITICAL';
    await createNotification({
      userId: branchManager.id,
      type: 'SYSTEM',
      title: isCritical ? 'Critical Stock Alert' : 'Low Stock Alert',
      message: isCritical
        ? `CRITICAL — nearly out of ${alert.name}: only ${alert.quantity} remaining (minimum: ${alert.minimumStock}). Reorder immediately.`
        : `Low stock: ${alert.name} — ${alert.quantity} remaining (minimum: ${alert.minimumStock})`,
    });
    console.log(`[INVENTORY] ${alert.alertLevel} notification sent for "${alert.name}" to manager ${branchManager.id}`);
  }
}
