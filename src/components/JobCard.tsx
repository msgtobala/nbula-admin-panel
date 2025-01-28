import React, { useState } from 'react';
import { format } from 'date-fns';
import { Job } from '../types/job';
import { MapPin, Calendar, Building2, DollarSign, Video, ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onEdit: () => void;
  onDelete: (id: string) => Promise<void>;
}

export default function JobCard({ job, onEdit, onDelete }: JobCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(salary);
  };

  const normalizeValue = (value: any): string => {
    if (typeof value === 'object' && value !== null) {
      return value.value || value.label || '';
    }
    return String(value || '');
  };

  const handleDelete = async () => {
    try {
      await onDelete(job.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {normalizeValue(job.title)}
              </h3>
              <div className="flex gap-2">
                {job.isActive && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 rounded-full border border-green-200">
                    Active
                  </span>
                )}
                {job.isActivelyHiring && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                    Hiring
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4">
              <div className="flex items-center text-gray-600 text-sm">
                <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                <span>{normalizeValue(job.location)}</span>
              </div>
              
              <div className="flex items-center text-gray-600 text-sm">
                <Calendar className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                <span>{format(job.datePosted, 'MMM d, yyyy')}</span>
              </div>
              
              <div className="flex items-center text-gray-600 text-sm">
                <Building2 className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                <span>{normalizeValue(job.department)}</span>
              </div>

              <div className="flex items-center text-gray-600 text-sm">
                <DollarSign className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                <span>{formatSalary(job.salary)}/year</span>
              </div>

              <div className="flex items-center text-gray-600 text-sm">
                <Video className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                <span>{normalizeValue(job.interviewType)} Interview</span>
              </div>
            </div>

            {job.description && (
              <div className="mt-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show More
                    </>
                  )}
                </button>
                <div className={`mt-2 overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
                  <div 
                    className="prose prose-sm max-w-none text-gray-600"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {(job.skills || []).map((skill, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-gray-50 text-gray-600 text-sm rounded-lg border border-gray-100"
                >
                  {normalizeValue(skill)}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all duration-200"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Job
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this job? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}