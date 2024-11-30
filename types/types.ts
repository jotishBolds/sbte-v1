// types.ts
export interface Batch {
  id: string;
  name: string;
}

export interface BatchSubject {
  id: string;
  subjectName: string;
}

export interface ExamMark {
  examTypeId: string;
  studentId: string;
  batchSubjectId: string;
  achievedMarks: number;
  wasAbsent: boolean;
  debarred: boolean;
  malpractice: boolean;
}

export interface CertificateType {
  id: string;
  name: string;
  collegeId: string;
  certificates?: number;
  college?: {
    name: string;
  };
}

export type Student = {
  id: string;
  name: string;
  // Add other student fields as needed
};

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export type Certificate = {
  id: string;
  studentId: string;
  certificateTypeId: string;
  issueDate: Date | null;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
  student: Student;
  certificateType: CertificateType;
};

import { Notification, NotifiedCollege } from "@prisma/client";

export interface ExtendedNotification extends Notification {
  notifiedColleges: NotifiedCollege[];
}

export interface NotificationProps {
  notification: ExtendedNotification;
  userRole: string;
}
