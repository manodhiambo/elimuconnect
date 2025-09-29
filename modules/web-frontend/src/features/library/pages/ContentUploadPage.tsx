import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Alert, AlertDescription } from '../../../components/ui/Alert';
import { contentService } from '../services/contentService';
import { Upload, FileText } from 'lucide-react';

const SUBJECTS = ['Mathematics', 'English', 'Kiswahili', 'Biology', 'Chemistry', 'Physics'];
const GRADES = ['Grade 7', 'Grade 8', 'Grade 9', 'Form 1', 'Form 2', 'Form 3', 'Form 4'];
const CONTENT_TYPES = ['PDF', 'VIDEO', 'BOOK', 'PAST_PAPER'];
const ACCESS_LEVELS = ['FREE', 'PREMIUM', 'SCHOOL_ONLY'];

const uploadSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  subject: z.string().min(1, 'Subject is required'),
  grade: z.string().min(1, 'Grade is required'),
  contentType: z.string().min(1, 'Content type is required'),
  accessLevel: z.string().min(1, 'Access level is required'),
  language: z.string().default('EN'),
  author: z.string().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

export const ContentUploadPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
  });

  const uploadMutation = useMutation({
    mutationFn: contentService.uploadContent,
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => navigate('/library'), 2000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Upload failed');
      setUploading(false);
    },
  });

  const onSubmit = async (data: UploadFormData) => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setError('');

      // First upload the file
      const fileResponse = await contentService.uploadFile(file, 'content');
      
      if (fileResponse.success && fileResponse.data) {
        // Then create the content record
        await uploadMutation.mutateAsync({
          ...data,
          fileUrl: fileResponse.data,
          fileSizeBytes: file.size,
          mimeType: file.type,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
      setUploading(false);
    }
  };

  if (success) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <Alert>
            <AlertDescription>
              Content uploaded successfully! Redirecting to library...
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Content</h1>
        <p className="text-muted-foreground">Share educational materials with students</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Input
              label="Title *"
              placeholder="Introduction to Algebra"
              error={errors.title?.message}
              {...register('title')}
            />

            <div>
              <label className="text-sm font-medium mb-2 block">Description *</label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Detailed description of the content..."
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Subject *"
                error={errors.subject?.message}
                options={SUBJECTS.map(s => ({ value: s, label: s }))}
                {...register('subject')}
              />

              <Select
                label="Grade *"
                error={errors.grade?.message}
                options={GRADES.map(g => ({ value: g, label: g }))}
                {...register('grade')}
              />

              <Select
                label="Content Type *"
                error={errors.contentType?.message}
                options={CONTENT_TYPES.map(t => ({ value: t, label: t }))}
                {...register('contentType')}
              />

              <Select
                label="Access Level *"
                error={errors.accessLevel?.message}
                options={ACCESS_LEVELS.map(a => ({ value: a, label: a }))}
                {...register('accessLevel')}
              />
            </div>

            <Input
              label="Author"
              placeholder="Author name (optional)"
              {...register('author')}
            />

            <div>
              <label className="text-sm font-medium mb-2 block">Upload File *</label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFile(null)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Click to upload or drag and drop
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.mp4,.mp3"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button type="button" variant="outline" asChild>
                        <span>Select File</span>
                      </Button>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Content'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
