-- CreateEnum
CREATE TYPE "public"."CardType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "public"."CardStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."CardProvider" AS ENUM ('VISA', 'MASTERCARD', 'RUPAY');

-- CreateTable
CREATE TABLE "public"."Card" (
    "id" TEXT NOT NULL,
    "cardNo" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "cardType" "public"."CardType" NOT NULL,
    "status" "public"."CardStatus" NOT NULL,
    "provider" "public"."CardProvider" NOT NULL,
    "pin" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "public"."BankAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
