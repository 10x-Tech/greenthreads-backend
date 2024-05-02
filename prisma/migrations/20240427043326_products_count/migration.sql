-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "productsCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "description" DROP NOT NULL;
