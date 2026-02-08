-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'ID');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'EN';
