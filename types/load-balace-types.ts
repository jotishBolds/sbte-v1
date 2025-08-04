// Types updated for security - pdfPath no longer exposed in API responses
export interface LoadBalancingPdf {
  id: string;
  title: string;
  // pdfPath: string; // Removed for security - files are accessed via download API only
  collegeId: string;
  college?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface UserSession {
  user: {
    role: "SBTE_ADMIN" | "COLLEGE_SUPER_ADMIN" | "HOD";
    collegeId: string;
  };
}
