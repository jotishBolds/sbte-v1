interface ExamType {
  id: string;
  examName: string;
  totalMarks: number;
  passingMarks?: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ExamTypeFormData {
  examName: string;
  totalMarks: number;
  passingMarks?: number;
  status?: boolean;
}
