ALTER TABLE "inventory_movements"
ADD COLUMN "quantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "unit_price" DECIMAL(12,2),
ADD COLUMN "total_price" DECIMAL(12,2);

CREATE INDEX "inventory_movements_workspace_id_product_id_created_at_idx"
ON "inventory_movements"("workspace_id", "product_id", "created_at");
