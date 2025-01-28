export interface Job {
  id: string;
  title: string;
  experience: number;
  location: string;
  description: string;
  datePosted: Date;
  department: string;
  salary: number;
  skills: string[];
  interviewType: string;
  isActive: boolean;
  isActivelyHiring: boolean;
}

export const departments = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'Customer Support',
  'Human Resources',
  'Finance',
  'Operations',
  'Legal'
] as const;

export type Department = typeof departments[number];

export interface SkillOption {
  value: string;
  label: string;
}