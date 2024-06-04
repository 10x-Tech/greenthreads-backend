/*
  Warnings:

  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vendor_roles` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "VendorRole" AS ENUM ('ADMIN', 'SELLER');

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_roleId_fkey";

-- DropForeignKey
ALTER TABLE "vendor_roles" DROP CONSTRAINT "vendor_roles_roleId_fkey";

-- DropForeignKey
ALTER TABLE "vendor_roles" DROP CONSTRAINT "vendor_roles_vendorId_fkey";

-- AlterTable
ALTER TABLE "seller" ADD COLUMN     "role" "VendorRole" NOT NULL DEFAULT 'SELLER';

-- DropTable
DROP TABLE "permissions";

-- DropTable
DROP TABLE "role_permissions";

-- DropTable
DROP TABLE "roles";

-- DropTable
DROP TABLE "vendor_roles";
