import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Application } from '../types/application';
import { ArrowLeft, Download, Building2, Clock, Phone, Mail, Calendar, Timer, CheckCircle, XCircle, Bookmark } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function JobApplications() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const applicationsRef = collection(db, `jobs/${jobId}/applications`);
        const querySnapshot = await getDocs(query(applicationsRef));
        const applicationsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          appliedAt: doc.data().appliedAt.toDate(),
        })) as Application[];
        setApplications(applicationsData);
        if (applicationsData.length > 0) {
          setJobTitle(applicationsData[0].jobTitle);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchApplications();
    }
  }, [jobId]);

  const handleAccept = async (applicationId: string) => {
    try {
      const applicationRef = doc(db, `jobs/${jobId}/applications/${applicationId}`);
      await updateDoc(applicationRef, { 
        status: 'accepted',
        saveForLater: false
      });
      setApplications(apps => 
        apps.map(app => 
          app.id === applicationId 
            ? { ...app, status: 'accepted', saveForLater: false } 
            : app
        )
      );
      toast.success('Application accepted');
    } catch (error) {
      console.error('Error accepting application:', error);
      toast.error('Failed to accept application');
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      const applicationRef = doc(db, `jobs/${jobId}/applications/${applicationId}`);
      await updateDoc(applicationRef, { 
        status: 'rejected',
        saveForLater: false
      });
      setApplications(apps => 
        apps.map(app => 
          app.id === applicationId 
            ? { ...app, status: 'rejected', saveForLater: false } 
            : app
        )
      );
      toast.success('Application rejected');
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    }
  };

  const handleSaveForLater = async (applicationId: string, currentValue: boolean) => {
    try {
      const applicationRef = doc(db, `jobs/${jobId}/applications/${applicationId}`);
      const updates = {
        saveForLater: !currentValue,
        status: !currentValue ? 'rejected' : 'pending'
      };
      await updateDoc(applicationRef, updates);
      setApplications(apps => 
        apps.map(app => 
          app.id === applicationId 
            ? { ...app, ...updates }
            : app
        )
      );
      toast.success(currentValue ? 'Removed from saved' : 'Saved for later');
    } catch (error) {
      console.error('Error updating save for later:', error);
      toast.error('Failed to update save status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'reviewing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'accepted':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Applications for {jobTitle}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {applications.length} {applications.length === 1 ? 'application' : 'applications'} received
        </p>
      </div>

      <div className="space-y-4">
        {applications.map((application) => {
          const isActionTaken = application.status === 'accepted' || 
                              application.status === 'rejected' || 
                              application.saveForLater;

          return (
            <div
              key={application.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {application.fullName}
                    </h3>
                    <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full border mt-2 ${getStatusColor(application.status)}`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>

                  <a
                    href={application.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-all duration-200"
                  >
                    <Download className="w-4 h-4" />
                    Resume
                  </a>
                </div>

                <div className="flex justify-between items-end">
                  <div className="grid grid-cols-2 gap-y-3 gap-x-12">
                    <div className="flex items-center text-gray-600">
                      <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{application.currentCompany}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{application.experience} {application.experience === 1 ? 'year' : 'years'} experience</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{application.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{application.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Applied on {format(application.appliedAt, 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Timer className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{application.noticePeriod} {application.noticePeriod === 1 ? 'month' : 'months'} notice</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-8">
                    <button
                      onClick={() => handleAccept(application.id)}
                      disabled={isActionTaken}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                        isActionTaken
                          ? 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
                          : 'text-green-700 bg-green-50 border border-green-200 hover:bg-green-100'
                      } transition-all duration-200`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept
                    </button>

                    <button
                      onClick={() => handleReject(application.id)}
                      disabled={isActionTaken}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                        isActionTaken
                          ? 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
                          : 'text-red-700 bg-red-50 border border-red-200 hover:bg-red-100'
                      } transition-all duration-200`}
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>

                    <button
                      onClick={() => handleSaveForLater(application.id, application.saveForLater)}
                      disabled={isActionTaken && !application.saveForLater}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                        isActionTaken && !application.saveForLater
                          ? 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
                          : application.saveForLater
                          ? 'text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100'
                          : 'text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      } transition-all duration-200`}
                    >
                      <Bookmark className={`w-4 h-4 ${application.saveForLater ? 'fill-current' : ''}`} />
                      {application.saveForLater ? 'Saved' : 'Save for Later'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {applications.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No applications received yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}