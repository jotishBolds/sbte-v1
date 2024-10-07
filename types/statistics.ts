// File: types/statistics.ts

export interface Statistics {
  [key: string]: number | Subject[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  semester: string;
  studentCount: number;
}

export interface SBTEAdminStatistics extends Statistics {
  totalColleges: number;
  totalStudents: number;
  totalTeachers: number;
  totalDepartments: number;
}

export interface CollegeSuperAdminStatistics extends Statistics {
  totalDepartments: number;
  totalStudents: number;
  totalTeachers: number;
  totalSubjects: number;
}

export interface HODStatistics extends Statistics {
  totalStudents: number;
  totalTeachers: number;
  totalSubjects: number;
  totalAlumni: number;
}

export interface TeacherStatistics extends Statistics {
  totalSubjects: number;
  totalStudents: number;
  totalFeedbacks: number;
  subjects: Subject[];
}

export interface StudentStatistics extends Statistics {
  totalSubjects: number;
  averageAttendance: number;
  averageScore: number;
}
