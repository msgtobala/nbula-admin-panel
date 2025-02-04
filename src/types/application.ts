export interface Application {
  id: string;
  appliedAt: Date;
  currentCompany: string;
  email: string;
  experience: number;
  fullName: string;
  jobId: string;
  jobTitle: string;
  noticePeriod: number;
  phone: string;
  resumeUrl: string;
  saveForLater: boolean;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
}