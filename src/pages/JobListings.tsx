import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Job } from '../types/job';
import JobList from '../components/JobList';
import JobForm from '../components/JobForm';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function JobListings() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [isEditingJob, setIsEditingJob] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'jobs'));
      const jobsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          datePosted: data.datePosted.toDate(),
          interviewType: typeof data.interviewType === 'object' ? data.interviewType.value : data.interviewType,
          skills: (data.skills || []).map((skill: string | { value: string; label: string }) => 
            typeof skill === 'object' ? skill.value : skill
          ),
        };
      }) as Job[];
      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to fetch jobs');
    }
  };

  const handleAddJob = async (jobData: Partial<Job>) => {
    try {
      // Ensure all required fields are present and properly formatted
      const formattedData = {
        title: jobData.title || '',
        experience: Number(jobData.experience) || 0,
        location: jobData.location || '',
        description: jobData.description || '',
        datePosted: Timestamp.fromDate(new Date()),
        department: jobData.department || '',
        salary: Number(jobData.salary) || 0,
        skills: (jobData.skills || []).map(skill => 
          typeof skill === 'object' ? skill.value : skill
        ),
        interviewType: typeof jobData.interviewType === 'object' 
          ? jobData.interviewType.value 
          : (jobData.interviewType || 'Online'),
        isActive: Boolean(jobData.isActive),
        isActivelyHiring: Boolean(jobData.isActivelyHiring),
      };

      await addDoc(collection(db, 'jobs'), formattedData);
      await fetchJobs();
      setIsAddingJob(false);
      toast.success('Job added successfully');
    } catch (error) {
      console.error('Error adding job:', error);
      toast.error('Failed to add job');
    }
  };

  const handleEditJob = async (jobData: Partial<Job>) => {
    if (!selectedJob) return;
    
    try {
      // Ensure all fields are properly formatted
      const formattedData = {
        title: jobData.title || selectedJob.title,
        experience: Number(jobData.experience) || selectedJob.experience,
        location: jobData.location || selectedJob.location,
        description: jobData.description || selectedJob.description,
        department: jobData.department || selectedJob.department,
        salary: Number(jobData.salary) || selectedJob.salary,
        skills: (jobData.skills || []).map(skill => 
          typeof skill === 'object' ? skill.value : skill
        ),
        interviewType: typeof jobData.interviewType === 'object' 
          ? jobData.interviewType.value 
          : (jobData.interviewType || selectedJob.interviewType),
        isActive: jobData.isActive !== undefined ? jobData.isActive : selectedJob.isActive,
        isActivelyHiring: jobData.isActivelyHiring !== undefined 
          ? jobData.isActivelyHiring 
          : selectedJob.isActivelyHiring,
      };

      await updateDoc(doc(db, 'jobs', selectedJob.id), formattedData);
      await fetchJobs();
      setSelectedJob(null);
      setIsEditingJob(false);
      toast.success('Job updated successfully');
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job');
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'jobs', id));
      await fetchJobs();
      toast.success('Job deleted successfully');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Listings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage and monitor all job postings</p>
        </div>
        <button
          onClick={() => setIsAddingJob(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Job
        </button>
      </div>

      {(isAddingJob || isEditingJob) && (
        <JobForm 
          onSubmit={isEditingJob ? handleEditJob : handleAddJob}
          onCancel={() => {
            setIsAddingJob(false);
            setIsEditingJob(false);
            setSelectedJob(null);
          }}
          initialData={selectedJob || undefined}
        />
      )}

      <JobList
        jobs={jobs}
        onEdit={(job) => {
          setSelectedJob(job);
          setIsEditingJob(true);
        }}
        onDelete={handleDeleteJob}
      />
    </div>
  );
}