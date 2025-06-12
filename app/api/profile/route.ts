// File: app/api/profile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { hash, compare } from "bcrypt";
import prisma from "@/src/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/auth";
import { log } from "console";
import { passwordSchema } from "@/lib/password-validation";

const SALT_ROUNDS = 12; // Increase security with higher salt rounds
const PASSWORD_HISTORY_LIMIT = 5; // Number of old passwords to check against

// Track failed attempts per user
const failedAttempts = new Map<string, { count: number; lastAttempt: Date }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

const MaritalStatusEnum = z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]);
const CasteEnum = z.enum(["GENERAL", "OBC", "SC", "ST"]);
const GenderEnum = z.enum(["MALE", "FEMALE", "OTHER"]);

// Updated schema with password validation
const updateProfileSchema = z
  .object({
    username: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    currentPassword: z.string().optional().nullable(),
    newPassword: passwordSchema.optional().nullable(),
    confirmPassword: z.string().optional().nullable(),
    headOfDepartment: z
      .object({
        name: z.string().optional().nullable(),
        phoneNo: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
        qualification: z.string().optional().nullable(),
        experience: z.string().optional().nullable(),
      })
      .optional()
      .nullable(),
    alumnus: z
      .object({
        jobStatus: z.string().optional().nullable(),
        currentEmployer: z.string().optional().nullable(),
        currentPosition: z.string().optional().nullable(),
        industry: z.string().optional().nullable(),
      })
      .optional()
      .nullable(),
    teacher: z
      .object({
        name: z.string().optional().nullable(),
        phoneNo: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
        qualification: z.string().optional().nullable(),
        designationId: z.string().optional().nullable(),
        categoryId: z.string().optional().nullable(),
        experience: z.string().optional().nullable(),
        maritalStatus: MaritalStatusEnum.optional().nullable(),
        joiningDate: z.string().optional().nullable(),
        gender: GenderEnum.optional().nullable(),
        religion: z.string().optional().nullable(),
        caste: CasteEnum.optional().nullable(),
        isLocalResident: z.boolean().optional().nullable(),
        isDifferentlyAbled: z.boolean().optional().nullable(),
        hasResigned: z.boolean().optional().nullable(),
      })
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (data.newPassword && data.confirmPassword) {
        return data.newPassword === data.confirmPassword;
      }
      return true;
    },
    {
      message: "New passwords do not match",
      path: ["confirmPassword"],
    }
  );

// Check if the user is locked out
function isLockedOut(userId: string): boolean {
  const attempts = failedAttempts.get(userId);
  if (!attempts) return false;

  if (attempts.count >= MAX_ATTEMPTS) {
    const timeSinceLastAttempt = Date.now() - attempts.lastAttempt.getTime();
    if (timeSinceLastAttempt < LOCKOUT_DURATION) {
      return true;
    }
    // Reset attempts after lockout period
    failedAttempts.delete(userId);
  }
  return false;
}

// Record a failed attempt
function recordFailedAttempt(userId: string) {
  const attempts = failedAttempts.get(userId) || {
    count: 0,
    lastAttempt: new Date(),
  };
  attempts.count += 1;
  attempts.lastAttempt = new Date();
  failedAttempts.set(userId, attempts);
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        headOfDepartment: true,
        teacher: true,
        student: true,
        financeManager: true,
        alumnus: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { message: "Error fetching profile", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Transform null values to undefined
    const transformedBody = {
      ...body,
      teacher: body.teacher
        ? Object.fromEntries(
            Object.entries(body.teacher).map(([key, value]) => [
              key,
              value === null ? undefined : value,
            ])
          )
        : undefined,
    };

    const result = updateProfileSchema.safeParse(transformedBody);

    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: result.error.errors },
        { status: 400 }
      );
    }

    const {
      username,
      email,
      currentPassword,
      newPassword,
      confirmPassword,
      headOfDepartment,
      teacher,
      alumnus,
    } = result.data;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        headOfDepartment: true,
        teacher: true,
        alumnus: true,
        passwordHistory: {
          orderBy: { createdAt: "desc" },
          take: PASSWORD_HISTORY_LIMIT,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if user is locked out when attempting password change
    if (currentPassword && isLockedOut(user.id)) {
      return NextResponse.json(
        {
          message:
            "Account is temporarily locked due to too many failed attempts. Please try again later.",
        },
        { status: 429 }
      );
    }

    // Enhanced password change validation
    if (currentPassword) {
      const isPasswordValid = await compare(currentPassword, user.password);
      if (!isPasswordValid) {
        recordFailedAttempt(user.id);
        return NextResponse.json(
          { message: "Current password is incorrect" },
          { status: 400 }
        );
      }

      if (newPassword) {
        // Check password history
        for (const oldPassword of user.passwordHistory) {
          const isOldPassword = await compare(
            newPassword,
            oldPassword.hashedPassword
          );
          if (isOldPassword) {
            return NextResponse.json(
              { message: "Cannot reuse any of your last 5 passwords" },
              { status: 400 }
            );
          }
        }
      }
    }

    const updatedData = await prisma.$transaction(async (prisma) => {
      // Update user basic info
      let updateData: any = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (newPassword && confirmPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error("New passwords do not match");
        }

        const newHashedPassword = await hash(newPassword, SALT_ROUNDS);
        updateData.password = newHashedPassword;

        // Store the old password in history
        await prisma.passwordHistory.create({
          data: {
            userId: user.id,
            hashedPassword: user.password,
          },
        });

        // Clean up old password history entries if needed
        const passwordHistoryCount = await prisma.passwordHistory.count({
          where: { userId: user.id },
        });

        if (passwordHistoryCount > PASSWORD_HISTORY_LIMIT) {
          const oldestPasswords = await prisma.passwordHistory.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "asc" },
            take: passwordHistoryCount - PASSWORD_HISTORY_LIMIT,
          });

          await prisma.passwordHistory.deleteMany({
            where: {
              id: {
                in: oldestPasswords.map((p) => p.id),
              },
            },
          });
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      // Reset failed attempts after successful password change
      if (currentPassword && newPassword) {
        failedAttempts.delete(user.id);
      }

      // Only update HOD if the user is HOD and data is provided
      if (session.user.role === "HOD" && headOfDepartment) {
        if (user.headOfDepartment) {
          await prisma.headOfDepartment.update({
            where: { id: user.headOfDepartment.id },
            data: headOfDepartment,
          });
        } else {
          const department = await prisma.department.findFirst({
            where: { collegeId: user.collegeId! },
          });

          if (!department) {
            throw new Error("No department found for this college");
          }

          await prisma.headOfDepartment.create({
            data: {
              ...headOfDepartment,
              userId: user.id,
              departmentId: department.id,
            },
          });
        }
      }

      // Only update teacher if the user is TEACHER and data is provided
      if (session.user.role === "TEACHER" && teacher) {
        if (user.teacher) {
          // Filter out undefined values
          const teacherUpdateData = Object.fromEntries(
            Object.entries(teacher).filter(([_, value]) => value !== undefined)
          );

          await prisma.teacher.update({
            where: { id: user.teacher.id },
            data: {
              ...teacherUpdateData,
              joiningDate: teacher.joiningDate
                ? new Date(teacher.joiningDate)
                : undefined,
            },
          });
        }
      }

      // Only update alumnus if the user is ALUMNUS and data is provided
      if (session.user.role === "ALUMNUS" && alumnus) {
        if (user.alumnus) {
          await prisma.alumnus.update({
            where: { id: user.alumnus.id },
            data: alumnus,
          });
        }
      }

      return { user: updatedUser };
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedData.user,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "Error updating profile", error: (error as Error).message },
      { status: 500 }
    );
  }
}
