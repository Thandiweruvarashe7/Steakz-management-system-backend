-- AlterTable
ALTER TABLE "Inventory" ADD COLUMN     "category" TEXT;

-- CreateIndex
CREATE INDEX "Inventory_branchId_idx" ON "Inventory"("branchId");
