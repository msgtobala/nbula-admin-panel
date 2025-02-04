import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import CreatableSelect from 'react-select/creatable';
import { Job, departments, SkillOption } from '../types/job';
import { Save, X, ToggleLeft, ToggleRight, Bold, Italic, List, Link as LinkIcon, Heading1, Heading2, Heading3 } from 'lucide-react';
import { fetchSkills, addSkill } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import Select from 'react-select';

const interviewTypes = [
  { value: 'Online', label: 'Online' },
  { value: 'Offline', label: 'Offline' },
  { value: 'Hybrid', label: 'Hybrid' },
];

interface JobFormProps {
  onSubmit: (data: Partial<Job>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<Job>;
}

export default function JobForm({ onSubmit, onCancel, initialData }: JobFormProps) {
  const [skillOptions, setSkillOptions] = useState<SkillOption[]>([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);

  const { register, handleSubmit, control, formState: { errors } } = useForm<Partial<Job>>({
    defaultValues: {
      ...initialData,
      skills: initialData?.skills?.map(skill => typeof skill === 'string' ? skill : skill.value) || [],
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
    ],
    content: initialData?.description || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px] text-gray-900',
      },
    },
  });

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const skills = await fetchSkills();
      setSkillOptions(skills);
    } catch (error) {
      console.error('Error loading skills:', error);
      toast.error('Failed to load skills');
    } finally {
      setIsLoadingSkills(false);
    }
  };

  const handleCreateSkill = async (inputValue: string) => {
    try {
      await addSkill(inputValue);
      const newOption = { value: inputValue, label: inputValue };
      setSkillOptions(prev => [...prev, newOption].sort((a, b) => a.label.localeCompare(b.label)));
      toast.success('New skill added successfully');
      return newOption;
    } catch (error) {
      console.error('Error creating skill:', error);
      toast.error('Failed to create new skill');
      return null;
    }
  };

  const onFormSubmit = async (data: Partial<Job>) => {
    if (!editor) return;

    const formData = {
      ...data,
      description: editor.getHTML(),
      datePosted: new Date(),
      interviewType: typeof data.interviewType === 'object' ? data.interviewType.value : data.interviewType,
      skills: (data.skills || []).map(skill => typeof skill === 'object' ? skill.value : skill),
    };
    await onSubmit(formData);
  };

  const inputClassName = "mt-1 block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm transition-colors duration-200 ease-in-out placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-0 focus:border-blue-500";
  const selectClassName = "!border-gray-200 !bg-gray-50 !min-h-[42px] hover:!border-gray-300 transition-colors duration-200 ease-in-out";
  const selectFocusClassName = "!border-blue-500 !ring-0 !shadow-none !bg-white";

  const addLink = () => {
    if (!editor) return;
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-5 mx-auto max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              {initialData ? 'Edit Job' : 'Add New Job'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Job Title</label>
                <input
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className={inputClassName}
                  placeholder="e.g., Senior Software Engineer"
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Experience (years)</label>
                <input
                  type="number"
                  {...register('experience', { required: 'Experience is required', min: 0 })}
                  className={inputClassName}
                  placeholder="e.g., 5"
                />
                {errors.experience && (
                  <p className="text-sm text-red-600">{errors.experience.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  {...register('location', { required: 'Location is required' })}
                  className={inputClassName}
                  placeholder="e.g., New York, NY"
                />
                {errors.location && (
                  <p className="text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <Controller
                  name="department"
                  control={control}
                  rules={{ required: 'Department is required' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={departments.map(dept => ({ value: dept, label: dept }))}
                      className="mt-1"
                      classNames={{
                        control: (state) => 
                          `${selectClassName} ${state.isFocused ? selectFocusClassName : ''}`,
                        input: () => "!text-sm",
                        placeholder: () => "!text-gray-400 !text-sm",
                        singleValue: () => "!text-gray-900 !text-sm",
                        option: () => "!text-sm",
                      }}
                      placeholder="Select department"
                      theme={(theme) => ({
                        ...theme,
                        colors: {
                          ...theme.colors,
                          primary: '#3B82F6',
                          primary25: '#EFF6FF',
                          primary50: '#DBEAFE',
                          neutral0: '#F9FAFB',
                        },
                      })}
                    />
                  )}
                />
                {errors.department && (
                  <p className="text-sm text-red-600">{errors.department.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Salary</label>
                <input
                  type="number"
                  {...register('salary', { required: 'Salary is required', min: 0 })}
                  className={inputClassName}
                  placeholder="e.g., 120000"
                />
                {errors.salary && (
                  <p className="text-sm text-red-600">{errors.salary.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Notice Period (months)</label>
                <input
                  type="number"
                  {...register('noticePeriod', { required: 'Notice period is required', min: 0 })}
                  className={inputClassName}
                  placeholder="e.g., 2"
                />
                {errors.noticePeriod && (
                  <p className="text-sm text-red-600">{errors.noticePeriod.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Interview Type</label>
                <Controller
                  name="interviewType"
                  control={control}
                  rules={{ required: 'Interview type is required' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={interviewTypes}
                      className="mt-1"
                      classNames={{
                        control: (state) => 
                          `${selectClassName} ${state.isFocused ? selectFocusClassName : ''}`,
                        input: () => "!text-sm",
                        placeholder: () => "!text-gray-400 !text-sm",
                        singleValue: () => "!text-gray-900 !text-sm",
                        option: () => "!text-sm",
                      }}
                      placeholder="Select interview type"
                      theme={(theme) => ({
                        ...theme,
                        colors: {
                          ...theme.colors,
                          primary: '#3B82F6',
                          primary25: '#EFF6FF',
                          primary50: '#DBEAFE',
                          neutral0: '#F9FAFB',
                        },
                      })}
                    />
                  )}
                />
                {errors.interviewType && (
                  <p className="text-sm text-red-600">{errors.interviewType.message}</p>
                )}
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Skills</label>
                <Controller
                  name="skills"
                  control={control}
                  rules={{ required: 'At least one skill is required' }}
                  render={({ field: { onChange, value } }) => (
                    <CreatableSelect
                      isMulti
                      isClearable
                      isCreatable
                      options={skillOptions}
                      value={skillOptions.filter(option => 
                        value?.includes(option.value)
                      )}
                      onChange={(newValue) => {
                        onChange(newValue ? newValue.map(item => item.value) : []);
                      }}
                      onCreateOption={async (inputValue) => {
                        const newOption = await handleCreateSkill(inputValue);
                        if (newOption) {
                          const currentValue = value || [];
                          onChange([...currentValue, newOption.value]);
                        }
                      }}
                      isLoading={isLoadingSkills}
                      className="mt-1"
                      classNames={{
                        control: (state) => 
                          `${selectClassName} ${state.isFocused ? selectFocusClassName : ''}`,
                        input: () => "!text-sm",
                        placeholder: () => "!text-gray-400 !text-sm",
                        multiValue: () => "!bg-blue-50",
                        multiValueLabel: () => "!text-blue-700 !text-sm",
                        multiValueRemove: () => "!text-blue-700 hover:!bg-blue-100 hover:!text-blue-800",
                        option: () => "!text-sm",
                      }}
                      placeholder="Type to search skills or create new ones..."
                      noOptionsMessage={({ inputValue }) => 
                        inputValue ? "Type Enter to create this skill" : "No skills found"
                      }
                      formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                      theme={(theme) => ({
                        ...theme,
                        colors: {
                          ...theme.colors,
                          primary: '#3B82F6',
                          primary25: '#EFF6FF',
                          primary50: '#DBEAFE',
                          neutral0: '#F9FAFB',
                        },
                      })}
                    />
                  )}
                />
                {errors.skills && (
                  <p className="text-sm text-red-600">{errors.skills.message}</p>
                )}
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 focus-within:bg-white focus-within:border-blue-500 transition-colors duration-200">
                  <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 p-2 bg-white">
                    <div className="flex items-center gap-1 mr-2">
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={`p-1.5 rounded hover:bg-gray-100 ${
                          editor?.isActive('heading', { level: 1 }) ? 'bg-gray-100 text-blue-600' : 'text-gray-600'
                        }`}
                        title="Heading 1"
                      >
                        <Heading1 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`p-1.5 rounded hover:bg-gray-100 ${
                          editor?.isActive('heading', { level: 2 }) ? 'bg-gray-100 text-blue-600' : 'text-gray-600'
                        }`}
                        title="Heading 2"
                      >
                        <Heading2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={`p-1.5 rounded hover:bg-gray-100 ${
                          editor?.isActive('heading', { level: 3 }) ? 'bg-gray-100 text-blue-600' : 'text-gray-600'
                        }`}
                        title="Heading 3"
                      >
                        <Heading3 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="w-px h-6 bg-gray-200 mx-1" />
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                        className={`p-1.5 rounded hover:bg-gray-100 ${
                          editor?.isActive('bold') ? 'bg-gray-100 text-blue-600' : 'text-gray-600'
                        }`}
                        title="Bold"
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                        className={`p-1.5 rounded hover:bg-gray-100 ${
                          editor?.isActive('italic') ? 'bg-gray-100 text-blue-600' : 'text-gray-600'
                        }`}
                        title="Italic"
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                        className={`p-1.5 rounded hover:bg-gray-100 ${
                          editor?.isActive('bulletList') ? 'bg-gray-100 text-blue-600' : 'text-gray-600'
                        }`}
                        title="Bullet List"
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={addLink}
                        className={`p-1.5 rounded hover:bg-gray-100 ${
                          editor?.isActive('link') ? 'bg-gray-100 text-blue-600' : 'text-gray-600'
                        }`}
                        title="Add Link"
                      >
                        <LinkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <style>{`
                    .ProseMirror {
                      padding: 1rem;
                      min-height: 150px;
                    }
                    .ProseMirror p.is-editor-empty:first-child::before {
                      content: attr(data-placeholder);
                      float: left;
                      color: #9CA3AF;
                      pointer-events: none;
                      height: 0;
                    }
                    .ProseMirror:focus {
                      outline: none;
                    }
                    .ProseMirror ul {
                      list-style-type: disc;
                      padding-left: 1.5em;
                    }
                    .ProseMirror h1 {
                      font-size: 1.5em;
                      font-weight: 600;
                      margin-top: 1em;
                      margin-bottom: 0.5em;
                    }
                    .ProseMirror h2 {
                      font-size: 1.25em;
                      font-weight: 600;
                      margin-top: 1em;
                      margin-bottom: 0.5em;
                    }
                    .ProseMirror h3 {
                      font-size: 1.125em;
                      font-weight: 600;
                      margin-top: 1em;
                      margin-bottom: 0.5em;
                    }
                  `}</style>
                  <EditorContent editor={editor} />
                </div>
              </div>

              <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <button
                        type="button"
                        onClick={() => onChange(!value)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border ${
                          value
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                        } transition-all duration-200`}
                      >
                        <div className="flex items-center gap-2">
                          {value ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                          <span className="font-medium">Active Job</span>
                        </div>
                        <span className="text-sm">{value ? 'Active' : 'Inactive'}</span>
                      </button>
                    )}
                  />
                </div>

                <div>
                  <Controller
                    name="isActivelyHiring"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <button
                        type="button"
                        onClick={() => onChange(!value)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border ${
                          value
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                        } transition-all duration-200`}
                      >
                        <div className="flex items-center gap-2">
                          {value ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                          <span className="font-medium">Actively Hiring</span>
                        </div>
                        <span className="text-sm">{value ? 'Hiring' : 'Not Hiring'}</span>
                      </button>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200 inline-flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 inline-flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Job
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}