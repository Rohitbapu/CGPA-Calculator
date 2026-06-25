export interface Course {
  id: string;
  code?: string;
  name: string;
  credits: number;
  grade: string; // Letter grade (e.g., 'A+', 'O')
  gradePoint: number; // Value used in calculations
}

export interface Semester {
  id: string;
  name: string;
  courses: Course[];
  isActive: boolean; // Whether to include in calculations
}

export interface GradeScale {
  label: string;
  value: string;
  points: number;
}

export interface GradingSystem {
  id: string;
  name: string;
  maxPoints: number;
  scales: GradeScale[];
}
