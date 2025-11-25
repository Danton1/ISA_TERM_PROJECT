/*
  Warnings:

  - A unique constraint covering the columns `[method,endpoint]` on the table `EndpointStat` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,method,endpoint]` on the table `UserApiUsage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EndpointStat_method_endpoint_key" ON "EndpointStat"("method", "endpoint");

-- CreateIndex
CREATE UNIQUE INDEX "UserApiUsage_userId_method_endpoint_key" ON "UserApiUsage"("userId", "method", "endpoint");
