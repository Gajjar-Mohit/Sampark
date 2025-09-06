/*
  Warnings:

  - Added the required column `panCardNo` to the `BankAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."BankAccount" ADD COLUMN     "panCardNo" TEXT NOT NULL;
