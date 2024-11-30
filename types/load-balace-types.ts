export interface LoadBalancingPdf {
  id: string;
  title: string;
  pdfPath: string;
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
