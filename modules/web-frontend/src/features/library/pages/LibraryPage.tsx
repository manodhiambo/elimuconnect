import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentService } from '../services/contentService';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Search, BookOpen, Download, Eye, FileText, Video, Image as ImageIcon } from 'lucide-react';
import { formatFileSize } from '../../../lib/utils';

const SUBJECTS = [
  'Mathematics', 'English', 'Kiswahili', 'Biology', 'Chemistry', 'Physics',
  'History', 'Geography', 'CRE', 'Business Studies', 'Computer Studies'
];

const GRADES = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
  'Grade 7', 'Grade 8', 'Grade 9', 'Form 1', 'Form 2', 'Form 3', 'Form 4'
];

export const LibraryPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();

  const { data: contentData, isLoading } = useQuery({
    queryKey: ['content', searchQuery, selectedSubject, selectedGrade, page],
    queryFn: () => {
      if (searchQuery) {
        return contentService.searchContent(searchQuery, page);
      }
      if (selectedSubject && selectedGrade) {
        return contentService.filterContent(selectedSubject, selectedGrade, page);
      }
      return contentService.getAllContent(page);
    },
  });

  const viewMutation = useMutation({
    mutationFn: (id: string) => contentService.viewContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  });

  const contents = contentData?.data?.content || [];

  const handleView = (content: any) => {
    viewMutation.mutate(content.id);
    window.open(content.fileUrl, '_blank');
  };

  const handleDownload = (content: any) => {
    viewMutation.mutate(content.id);
    contentService.downloadContent(content.fileUrl, content.fileName);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-5 w-5" />;
    if (fileType.startsWith('video/')) return <Video className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Digital Library</h1>
        <p className="text-muted-foreground">Access learning materials and resources</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              options={[
                { value: '', label: 'All Subjects' },
                ...SUBJECTS.map(s => ({ value: s, label: s }))
              ]}
            />
            <Select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              options={[
                { value: '', label: 'All Grades' },
                ...GRADES.map(g => ({ value: g, label: g }))
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="animate-pulse">Loading materials...</div>
        </div>
      ) : contents.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-xl font-semibold mb-2">No content found</p>
          <p className="text-muted-foreground">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contents.map((content: any) => (
              <Card key={content.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getFileIcon(content.fileType)}
                        <span className="text-xs text-muted-foreground uppercase">
                          {content.fileType.split('/')[1]}
                        </span>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{content.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {content.subject} • {content.grade}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {content.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <span>{formatFileSize(content.fileSizeBytes)}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {content.viewCount} views
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleView(content)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleDownload(content)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {contentData?.data && contentData.data.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {page + 1} of {contentData.data.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= contentData.data.totalPages - 1}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
