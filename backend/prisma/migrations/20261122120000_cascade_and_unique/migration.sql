-- Adiciona ON DELETE CASCADE nas relações e unicidade do compartilhamento.

-- DropForeignKey
ALTER TABLE "ShoppingList" DROP CONSTRAINT "ShoppingList_userId_fkey";
ALTER TABLE "list_items" DROP CONSTRAINT "list_items_listId_fkey";
ALTER TABLE "shared_lists" DROP CONSTRAINT "shared_lists_listId_fkey";
ALTER TABLE "shared_lists" DROP CONSTRAINT "shared_lists_sharedWithUserId_fkey";

-- AddForeignKey
ALTER TABLE "ShoppingList" ADD CONSTRAINT "ShoppingList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_listId_fkey" FOREIGN KEY ("listId") REFERENCES "ShoppingList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shared_lists" ADD CONSTRAINT "shared_lists_listId_fkey" FOREIGN KEY ("listId") REFERENCES "ShoppingList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shared_lists" ADD CONSTRAINT "shared_lists_sharedWithUserId_fkey" FOREIGN KEY ("sharedWithUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Remove compartilhamentos duplicados antes de criar a restrição única.
DELETE FROM "shared_lists" a
USING "shared_lists" b
WHERE a."id" > b."id"
  AND a."listId" = b."listId"
  AND a."sharedWithUserId" = b."sharedWithUserId";

-- CreateIndex
CREATE UNIQUE INDEX "shared_lists_listId_sharedWithUserId_key" ON "shared_lists"("listId", "sharedWithUserId");
CREATE INDEX "ShoppingList_userId_idx" ON "ShoppingList"("userId");
CREATE INDEX "list_items_listId_idx" ON "list_items"("listId");
CREATE INDEX "shared_lists_sharedWithUserId_idx" ON "shared_lists"("sharedWithUserId");
