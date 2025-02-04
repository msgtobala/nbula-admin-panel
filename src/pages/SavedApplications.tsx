import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, getDocs, collectionGroup, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Application } from '../types/application';
import { ArrowLeft, Download, Building2, Clock, Phone, Mail, Calendar, Timer, Bookmark, Briefcase } from 'lucide-react';
import { format } from 'date-fns';

export default function SavedApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedApplications = async () => {
      try {
        // Query all applications subcollections where saveForLater is true
        const applicationsQuery = query(
          collectionGroup(db, 'applications'),
          where('saveForLater', '==', true)
        );
        const querySnapshot = await getDocs(applicationsQuery);
        const applicationsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          appliedAt: doc.data().appliedAt.toDate(),
        })) as Application[];
        
        // Sort by most recently saved
        applicationsData.sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime());
        setApplications(applicationsData);
      } catch (error) {
        console.error('Error fetching saved applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedApplications();
  }, []);

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
        <h1 className="text-2xl font-bold text-gray-900">Saved Applications</h1>
        <p className="mt-1 text-sm text-gray-500">
          {applications.length} {applications.length === 1 ? 'application' : 'applications'} saved for later review
        </p>
      </div>

      <div className="space-y-4">
        {applications.map((application) => (
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
                  <div className="flex items-center gap-3 mt-2">
                    <Link
                      to={`/jobs/${application.jobId}/applications`}
                      className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Briefcase className="w-4 h-4" />
                      {application.jobTitle}
                    </Link>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      <Bookmark className="w-3 h-3 fill-current" />
                      Saved for Later
                    </span>
                  </div>
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
            </div>
          </div>
        ))}

        {applications.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No applications saved for later review.</p>
          </div>
        )}
      </div>
    </div>
  );
}