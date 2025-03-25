/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Journal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JournalSection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Journal" DROP CONSTRAINT "Journal_userId_fkey";

-- DropForeignKey
ALTER TABLE "JournalSection" DROP CONSTRAINT "JournalSection_journalId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "journalsCompleted" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "matricule" DROP DEFAULT;

-- DropTable
DROP TABLE "Journal";

-- DropTable
DROP TABLE "JournalSection";

-- DropTable
DROP TABLE "Profile";

-- DropEnum
DROP TYPE "SectionType";
