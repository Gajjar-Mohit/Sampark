-- CreateTable
CREATE TABLE "public"."VpaToAccountMapping" (
    "id" TEXT NOT NULL,
    "vpa" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "contactNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VpaToAccountMapping_pkey" PRIMARY KEY ("id")
);
