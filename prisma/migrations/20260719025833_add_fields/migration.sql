-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "readAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "link" TEXT;

-- AlterTable
ALTER TABLE "Salary" ADD COLUMN     "bonus" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "deductions" DOUBLE PRECISION DEFAULT 0;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "department" TEXT;

-- CreateIndex
CREATE INDEX "File_companyId_idx" ON "File"("companyId");

-- CreateIndex
CREATE INDEX "File_senderId_idx" ON "File"("senderId");

-- CreateIndex
CREATE INDEX "File_receiverId_idx" ON "File"("receiverId");

-- CreateIndex
CREATE INDEX "Message_companyId_idx" ON "Message"("companyId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_receiverId_idx" ON "Message"("receiverId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_companyId_idx" ON "Notification"("companyId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Salary_companyId_idx" ON "Salary"("companyId");

-- CreateIndex
CREATE INDEX "Salary_userId_idx" ON "Salary"("userId");

-- CreateIndex
CREATE INDEX "Salary_status_idx" ON "Salary"("status");

-- CreateIndex
CREATE INDEX "Salary_dueDate_idx" ON "Salary"("dueDate");

-- CreateIndex
CREATE INDEX "Task_companyId_idx" ON "Task"("companyId");

-- CreateIndex
CREATE INDEX "Task_assigneeId_idx" ON "Task"("assigneeId");

-- CreateIndex
CREATE INDEX "Task_creatorId_idx" ON "Task"("creatorId");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "User_companyId_idx" ON "User"("companyId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
