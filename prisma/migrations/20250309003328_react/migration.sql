/*
  Warnings:

  - You are about to drop the column `teamId` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `visibilityType` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `visibleToDepartments` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `visibleToRoles` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `teamId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AnswerVisibility` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Team` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamMember` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_teamId_fkey";

-- DropForeignKey
ALTER TABLE "AnswerVisibility" DROP CONSTRAINT "AnswerVisibility_answerId_fkey";

-- DropForeignKey
ALTER TABLE "AnswerVisibility" DROP CONSTRAINT "AnswerVisibility_userId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_teamId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_teamId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_userId_fkey";

-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "teamId",
DROP COLUMN "visibilityType",
DROP COLUMN "visibleToDepartments",
DROP COLUMN "visibleToRoles";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "teamId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role";

-- DropTable
DROP TABLE "AnswerVisibility";

-- DropTable
DROP TABLE "Team";

-- DropTable
DROP TABLE "TeamMember";
