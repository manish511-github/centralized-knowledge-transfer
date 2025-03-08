-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "visibilityType" TEXT NOT NULL DEFAULT 'public',
ADD COLUMN     "visibleToDepartments" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "visibleToRoles" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "AnswerVisibility" (
    "id" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AnswerVisibility_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnswerVisibility_answerId_userId_key" ON "AnswerVisibility"("answerId", "userId");

-- AddForeignKey
ALTER TABLE "AnswerVisibility" ADD CONSTRAINT "AnswerVisibility_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerVisibility" ADD CONSTRAINT "AnswerVisibility_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
