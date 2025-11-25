-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user',
ADD COLUMN     "totalApiRequests" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "EndpointStat" (
    "id" SERIAL NOT NULL,
    "method" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EndpointStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserApiUsage" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserApiUsage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserApiUsage" ADD CONSTRAINT "UserApiUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
