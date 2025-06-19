/*
  Warnings:

  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - Added the required column `username` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
-- Convert email to username by taking the part before @, or use 'user' + id if no @
INSERT INTO "new_users" ("id", "username", "createdAt", "name", "password", "role", "updatedAt") 
SELECT "id", 
       CASE 
         WHEN "email" LIKE '%@%' THEN SUBSTR("email", 1, INSTR("email", '@') - 1)
         ELSE 'user' || SUBSTR("id", 1, 8)
       END as "username",
       "createdAt", "name", "password", "role", "updatedAt" 
FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
