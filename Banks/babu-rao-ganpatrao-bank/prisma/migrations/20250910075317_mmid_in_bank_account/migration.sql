/*
  Warnings:

  - Added the required column `mmid` to the `BankAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."BankAccount" ADD COLUMN     "mmid" TEXT NOT NULL;
