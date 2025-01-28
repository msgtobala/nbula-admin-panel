import React, { useState } from 'react';
import { Job } from '../types/job';
import JobCard from './JobCard';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import Select from 'react-select';
import { departments } from '../types/job';

interface JobListProps {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onDelete: (id: string) => Promise<void>;
}

const sortOptions = [
  { value: 'datePosted', label: 'Sort by Date' },
  { value: 'title', label: 'Sort by Title' },
  { value: 'salary', label: 'Sort by Salary' },
  { value: 'experience', label: 'Sort by Experience' },
];

export default function JobList({ jobs, onEdit, onDelete }: JobListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState({ value: 'datePosted', label: 'Sort by Date' });
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showHiringOnly, setShowHiringOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const locations = Array.from(new Set(jobs.map(job => job.location)));

  const filteredJobs = jobs
    .filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDepartment = !selectedDepartment || job.department === selectedDepartment;
      const matchesLocation = !selectedLocation || job.location === selectedLocation;
      const matchesActive = !showActiveOnly || job.isActive;
      const matchesHiring = !showHiringOnly || job.isActivelyHiring;
      
      return matchesSearch && matchesDepartment && matchesLocation && matchesActive && matchesHiring;
    })
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      switch (sortBy.value) {
        case 'title':
          return order * a.title.localeCompare(b.title);
        case 'datePosted':
          return order * (a.datePosted.getTime() - b.datePosted.getTime());
        case 'salary':
          return order * (a.salary - b.salary);
        case 'experience':
          return order * (a.experience - b.experience);
        default:
          return 0;
      }
    });

  const clearFilters = () => {
    setSelectedDepartment(null);
    setSelectedLocation(null);
    setSortBy({ value: 'datePosted', label: 'Sort by Date' });
    setSortOrder('desc');
    setShowActiveOnly(false);
    setShowHiringOnly(false);
  };

  const activeFiltersCount = [
    selectedDepartment,
    selectedLocation,
    showActiveOnly,
    showHiringOnly,
    sortBy.value !== 'datePosted'
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search jobs by title or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span className="font-medium">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Select
                  placeholder="Department"
                  options={departments.map(dept => ({ value: dept, label: dept }))}
                  value={selectedDepartment ? { value: selectedDepartment, label: selectedDepartment } : null}
                  onChange={(option) => setSelectedDepartment(option?.value || null)}
                  isClearable
                  className="w-full"
                  classNames={{
                    control: (state) => 
                      `!min-h-[42px] !bg-white ${
                        state.isFocused ? '!border-blue-500 !shadow-none' : '!border-gray-200'
                      }`,
                  }}
                />

                <Select
                  placeholder="Location"
                  options={locations.map(loc => ({ value: loc, label: loc }))}
                  value={selectedLocation ? { value: selectedLocation, label: selectedLocation } : null}
                  onChange={(option) => setSelectedLocation(option?.value || null)}
                  isClearable
                  className="w-full"
                  classNames={{
                    control: (state) => 
                      `!min-h-[42px] !bg-white ${
                        state.isFocused ? '!border-blue-500 !shadow-none' : '!border-gray-200'
                      }`,
                  }}
                />

                <div className="flex items-center gap-2">
                  <Select
                    options={sortOptions}
                    value={sortBy}
                    onChange={(option) => option && setSortBy(option)}
                    className="w-full"
                    classNames={{
                      control: (state) => 
                        `!min-h-[42px] !bg-white ${
                          state.isFocused ? '!border-blue-500 !shadow-none' : '!border-gray-200'
                        }`,
                    }}
                  />

                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="h-[42px] px-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={showActiveOnly}
                      onChange={(e) => setShowActiveOnly(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Active only</span>
                  </label>

                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={showHiringOnly}
                      onChange={(e) => setShowHiringOnly(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Hiring only</span>
                  </label>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <div className="mt-4 flex items-center justify-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    <X className="h-4 w-4" />
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{filteredJobs.length}</span> jobs
            {activeFiltersCount > 0 && ' with applied filters'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onEdit={() => onEdit(job)}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}