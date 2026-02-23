/*
  Warnings:

  - You are about to drop the column `checkInAllowedFrom` on the `shifts` table. All the data in the column will be lost.
  - You are about to drop the column `checkOutAllowedFrom` on the `shifts` table. All the data in the column will be lost.
  - You are about to alter the column `code` on the `shifts` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to alter the column `startTime` on the `shifts` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(5)`.
  - You are about to alter the column `endTime` on the `shifts` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(5)`.
  - A unique constraint covering the columns `[companyId,code]` on the table `shifts` will be added. If there are existing duplicate values, this will fail.
  - Made the column `breakDuration` on table `shifts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `workingHours` on table `shifts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "shifts" DROP COLUMN "checkInAllowedFrom",
DROP COLUMN "checkOutAllowedFrom",
ADD COLUMN     "checkInGrace" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "color" VARCHAR(7),
ADD COLUMN     "defineWeeklyOff" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "earlyCheckoutThreshold" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "earlyGrace" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "firstHalfDuration" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fullDayThreshold" INTEGER NOT NULL DEFAULT 480,
ADD COLUMN     "halfDayAbsenceThreshold" INTEGER NOT NULL DEFAULT 120,
ADD COLUMN     "halfDayThreshold" INTEGER NOT NULL DEFAULT 240,
ADD COLUMN     "lateGrace" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "noAttendanceThreshold" INTEGER NOT NULL DEFAULT 120,
ADD COLUMN     "secondHalfDuration" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "code" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "startTime" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "endTime" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "breakDuration" SET NOT NULL,
ALTER COLUMN "breakDuration" SET DEFAULT 0,
ALTER COLUMN "workingHours" SET NOT NULL,
ALTER COLUMN "workingHours" SET DEFAULT 0.0,
ALTER COLUMN "restrictManagerFuture" SET DEFAULT true;

-- CreateIndex
CREATE INDEX "shifts_companyId_shiftType_idx" ON "shifts"("companyId", "shiftType");

-- CreateIndex
CREATE UNIQUE INDEX "shifts_companyId_code_key" ON "shifts"("companyId", "code");
