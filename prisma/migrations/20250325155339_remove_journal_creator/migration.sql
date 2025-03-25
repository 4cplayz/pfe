/*
  Warnings:

  - You are about to drop the column `createdById` on the `Journal` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Journal" DROP CONSTRAINT "Journal_createdById_fkey";

-- AlterTable
ALTER TABLE "Journal" DROP COLUMN "createdById";
