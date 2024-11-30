-- CreateTable
CREATE TABLE "NotifiedRole" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,

    CONSTRAINT "NotifiedRole_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NotifiedRole" ADD CONSTRAINT "NotifiedRole_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
