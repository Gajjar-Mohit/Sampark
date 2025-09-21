/*
  Warnings:

  - Added the required column `name` to the `VpaToAccountMapping` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."VpaToAccountMapping" ADD COLUMN     "name" TEXT NOT NULL;
