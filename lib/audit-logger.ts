import prisma from "@/src/lib/prisma";
import { nanoid } from "nanoid";

export interface AuditLogParams {
  userId?: string;
  userEmail?: string;
  action: string;
  resource: string;
  details?: string;
  ipAddress: string;
  userAgent: string;
  status: "SUCCESS" | "FAILURE" | "WARNING";
  sessionId?: string;
}

export interface SecurityEventParams {
  eventType: string;
  userId?: string;
  userEmail?: string;
  ipAddress: string;
  userAgent: string;
  details?: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

// Audit logging utility
export async function logAuditEvent(params: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        id: nanoid(),
        userId: params.userId,
        userEmail: params.userEmail,
        action: params.action,
        resource: params.resource,
        details: params.details,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        status: params.status,
        sessionId: params.sessionId,
        timestamp: new Date(),
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
    // Don't throw error to prevent breaking main functionality
  }
}

// Security event logging utility
export async function logSecurityEvent(params: SecurityEventParams) {
  try {
    await prisma.securityEvent.create({
      data: {
        id: nanoid(),
        eventType: params.eventType,
        userId: params.userId,
        userEmail: params.userEmail,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        details: params.details,
        severity: params.severity,
        timestamp: new Date(),
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to log security event:", error);
    // Don't throw error to prevent breaking main functionality
  }
}

// Helper to get client info from request
export function getClientInfo(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ipAddress = forwardedFor?.split(",")[0] || realIp || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  return { ipAddress, userAgent };
}

// Helper to get client info from NextRequest
export function getClientInfoFromNextRequest(request: any) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ipAddress =
    forwardedFor?.split(",")[0] || realIp || request.ip || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  return { ipAddress, userAgent };
}
