import { PrismaClient } from "@prisma/client";
import prisma from "@/src/lib/prisma";
export async function cleanupUserSession(userId: string) {
  try {
    // Update user's logged in status
    await prisma.user.update({
      where: { id: userId },
      data: {
        isLoggedIn: false,
        lastLogout: new Date(),
      },
    });

    return true;
  } catch (error) {
    console.error("Error updating user login status:", error);
    return false;
  }
}
