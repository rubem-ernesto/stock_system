CREATE TYPE "InventoryMovementStatus" AS ENUM ('ACTIVE', 'DELETED', 'PADDING', 'SUSPENDED');

ALTER TABLE "inventory_movements"
ADD COLUMN "status" "InventoryMovementStatus" NOT NULL DEFAULT 'ACTIVE';
