import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Job } from '../types/job';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Briefcase, Users, TrendingUp, Building2,
  CheckCircle2, XCircle, Clock, Rocket
} from 'lucide-react';

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'jobs'));
        const jobsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          datePosted: doc.data().datePosted.toDate(),
        })) as Job[];
        setJobs(jobsData);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(job => job.isActive).length;
  const activelyHiring = jobs.filter(job => job.isActivelyHiring).length;
  
  // Calculate skills statistics
  const skillStats = jobs.reduce((acc, job) => {
    job.skills.forEach(skill => {
      acc[skill] = (acc[skill] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const skillData = Object.entries(skillStats)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Show top 10 skills

  const statusData = [
    { name: 'Active', value: activeJobs },
    { name: 'Inactive', value: totalJobs - activeJobs }
  ];

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

  const stats = [
    {
      name: 'Total Jobs',
      value: totalJobs,
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Active Jobs',
      value: activeJobs,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Actively Hiring',
      value: activelyHiring,
      icon: Users,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      name: 'Total Skills',
      value: Object.keys(skillStats).length,
      icon: Rocket,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor your job listings and hiring activities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center">
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Most Requested Skills</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={skillData} 
                margin={{ top: 5, right: 30, left: 40, bottom: 50 }}
                barSize={40}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={50}
                  interval={0}
                  tick={{ fontSize: 12 }}
                  stroke="#6B7280"
                />
                <YAxis 
                  allowDecimals={false}
                  domain={[0, 'dataMax']}
                  padding={{ top: 10 }}
                  stroke="#6B7280"
                />
                <Tooltip 
                  formatter={(value) => [`${value} jobs`, 'Frequency']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    padding: '8px'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#4F46E5"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Status Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => 
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}