/*
  Warnings:

  - Added the required column `branchName` to the `BankAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."BankAccount" ADD COLUMN     "branchName" TEXT NOT NULL;
