import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Upload, FileText } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { contentService } from '../services/contentService';
import toast from 'react-hot-toast';

const contentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  contentType: z.string().min(1, 'Content type is required'),
  subject: z.string().min(1, 'Subject is required'),
  grade: z.string().min(1, 'Grade is required'),
  language: z.string().min(1, 'Language is required'),
  difficultyLevel: z.string().min(1, 'Difficulty level is required'),
  author: z.string().min(1, 'Author is required'),
  publisher: z.string().optional(),
  tags: z.string().optional(),
  estimatedDurationMinutes: z.string().min(1, 'Duration is required'),
});

type ContentFormData = z.infer<typeof contentSchema>;

const CONTENT_TYPES = [
  { value: 'PDF', label: 'PDF Document' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'AUDIO', label: 'Audio' },
  { value: 'INTERACTIVE', label: 'Interactive Content' },
];

const SUBJECTS = [
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'English', label: 'English' },
  { value: 'Kiswahili', label: 'Kiswahili' },
  { value: 'Science', label: 'Science' },
  { value: 'Social Studies', label: 'Social Studies' },
  { value: 'Religious Education', label: 'Religious Education' },
  { value: 'Physical Education', label: 'Physical Education' },
  { value: 'Creative Arts', label: 'Creative Arts' },
];

const GRADES = [
  ...Array.from({ length: 6 }, (_, i) => ({
    value: `Grade ${i + 1}`,
    label: `Grade ${i + 1}`,
  })),
  ...Array.from({ length: 4 }, (_, i) => ({
    value: `Form ${i + 1}`,
    label: `Form ${i + 1}`,
  })),
];

const LANGUAGES = [
  { value: 'EN', label: 'English' },
  { value: 'SW', label: 'Kiswahili' },
];

const DIFFICULTY_LEVELS = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
];

export const ContentUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => contentService.uploadContent(formData),
    onSuccess: () => {
      toast.success('Content uploaded successfully and is pending review');
      navigate('/content');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload content');
    },
  });

  const onSubmit = (data: ContentFormData) => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    
    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value.toString());
      }
    });

    uploadMutation.mutate(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (max 100MB)
      if (selectedFile.size > 100 * 1024 * 1024) {
        toast.error('File size must be less than 100MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  return (
    <div>
      <Header 
        title="Upload Content" 
        subtitle="Add new educational content to the platform"
      />

      <div className="p-6">
        <Button
          variant="outline"
          onClick={() => navigate('/content')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Content
        </Button>

        <div className="max-w-4xl">
          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content File *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mp3,.zip"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PDF, DOC, PPT, MP4, MP3, ZIP (max 100MB)
                    </span>
                  </label>
                  {file && (
                    <div className="mt-4 flex items-center justify-center text-sm text-primary-600">
                      <FileText className="w-4 h-4 mr-2" />
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Title *"
                    placeholder="Enter content title"
                    {...register('title')}
                    error={errors.title?.message}
                  />
                </div>

                <div className="md:col-span-2">
                  <Textarea
                    label="Description *"
                    rows={4}
                    placeholder="Provide a detailed description of the content"
                    {...register('description')}
                    error={errors.description?.message}
                  />
                </div>

                <Select
                  label="Content Type *"
                  options={CONTENT_TYPES}
                  {...register('contentType')}
                  error={errors.contentType?.message}
                />

                <Select
                  label="Subject *"
                  options={SUBJECTS}
                  {...register('subject')}
                  error={errors.subject?.message}
                />

                <Select
                  label="Grade/Level *"
                  options={GRADES}
                  {...register('grade')}
                  error={errors.grade?.message}
                />

                <Select
                  label="Language *"
                  options={LANGUAGES}
                  {...register('language')}
                  error={errors.language?.message}
                />

                <Select
                  label="Difficulty Level *"
                  options={DIFFICULTY_LEVELS}
                  {...register('difficultyLevel')}
                  error={errors.difficultyLevel?.message}
                />

                <Input
                  label="Estimated Duration (minutes) *"
                  type="number"
                  placeholder="30"
                  {...register('estimatedDurationMinutes')}
                  error={errors.estimatedDurationMinutes?.message}
                />

                <Input
                  label="Author *"
                  placeholder="Content creator name"
                  {...register('author')}
                  error={errors.author?.message}
                />

                <Input
                  label="Publisher"
                  placeholder="Publishing organization (optional)"
                  {...register('publisher')}
                  error={errors.publisher?.message}
                />

                <div className="md:col-span-2">
                  <Input
                    label="Tags (comma-separated)"
                    placeholder="e.g., algebra, equations, grade-8"
                    {...register('tags')}
                    error={errors.tags?.message}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/content')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={uploadMutation.isPending}
                  disabled={!file}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Content
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
