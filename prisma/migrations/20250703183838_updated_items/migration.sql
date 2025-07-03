/*
  Warnings:

  - Added the required column `category` to the `item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sku` to the `item` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "sku" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "item_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_item" ("createdAt", "description", "id", "name", "quantity", "updatedAt", "user_id") SELECT "createdAt", "description", "id", "name", "quantity", "updatedAt", "user_id" FROM "item";
DROP TABLE "item";
ALTER TABLE "new_item" RENAME TO "item";
CREATE UNIQUE INDEX "item_sku_key" ON "item"("sku");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
