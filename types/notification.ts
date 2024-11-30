export interface Notification {
  id: string;
  title: string;
  pdfPath: string;
  createdAt: Date;
  updatedAt: Date;
  notifiedColleges: string[];
}

export interface NotificationProps {
  role: string;
  userId?: string;
}

export interface NotificationAlertProps {
  notifications: Notification[];
}

export enum UserRoles {
  EDUCATION_DEPARTMENT = "EDUCATION_DEPARTMENT",
  SBTE_ADMIN = "SBTE_ADMIN",
  COLLEGE_SUPER_ADMIN = "COLLEGE_SUPER_ADMIN",
}

export interface ExtendedNotification {
  id: string;
  title: string;
  pdfPath: string;
  createdAt: string;
  updatedAt: string;
  isRead?: boolean;
  notifiedColleges?: {
    id: string;
    collegeId: string;
    isRead: boolean;
  }[];
}
