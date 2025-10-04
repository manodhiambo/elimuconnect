import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { assessmentService, Question } from '../../services/assessmentService';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { Select } from '../../../../components/ui/Select';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';

const SUBJECTS = ['Mathematics', 'English', 'Kiswahili', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'CRE', 'Business Studies'];
const GRADES = ['Grade 7', 'Grade 8', 'Grade 9', 'Form 1', 'Form 2', 'Form 3', 'Form 4'];

export const CreateAssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [assessment, setAssessment] = useState({
    title: '',
    description: '',
    subject: '',
    grade: '',
    duration: 30,
    passingMarks: 50,
    published: true,
  });

  const [questions, setQuestions] = useState<Partial<Question>[]>([
    { text: '', type: 'MCQ', options: ['', '', '', ''], correctAnswer: '', marks: 5 }
  ]);

  const createMutation = useMutation({
    mutationFn: (data: any) => assessmentService.createAssessment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      navigate('/app/dashboard');
    },
  });

  const addQuestion = () => {
    setQuestions([...questions, { 
      text: '', 
      type: 'MCQ', 
      options: ['', '', '', ''], 
      correctAnswer: '', 
      marks: 5 
    }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...questions];
    const options = [...(updated[qIndex].options || [])];
    options[optIndex] = value;
    updated[qIndex] = { ...updated[qIndex], options };
    setQuestions(updated);
  };

  const handleSubmit = () => {
    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
    
    const data = {
      ...assessment,
      totalMarks,
      questions: questions.map(q => ({
        ...q,
        id: undefined // Backend will generate IDs
      })),
    };

    createMutation.mutate(data);
  };

  const isValid = assessment.title && assessment.subject && assessment.grade && 
                  questions.every(q => q.text && q.correctAnswer && q.marks);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create Assessment</h1>
          <p className="text-gray-600">Build a quiz or test for your students</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/app/dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Assessment Details */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <Input
                value={assessment.title}
                onChange={(e) => setAssessment({ ...assessment, title: e.target.value })}
                placeholder="e.g., Algebra Quiz"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
              <Input
                type="number"
                value={assessment.duration}
                onChange={(e) => setAssessment({ ...assessment, duration: parseInt(e.target.value) })}
                min={5}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={assessment.description}
              onChange={(e) => setAssessment({ ...assessment, description: e.target.value })}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              rows={3}
              placeholder="Brief description of the assessment"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <Select
                value={assessment.subject}
                onChange={(e) => setAssessment({ ...assessment, subject: e.target.value })}
                options={[
                  { value: '', label: 'Select Subject' },
                  ...SUBJECTS.map(s => ({ value: s, label: s }))
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
              <Select
                value={assessment.grade}
                onChange={(e) => setAssessment({ ...assessment, grade: e.target.value })}
                options={[
                  { value: '', label: 'Select Grade' },
                  ...GRADES.map(g => ({ value: g, label: g }))
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Passing Marks (%)</label>
              <Input
                type="number"
                value={assessment.passingMarks}
                onChange={(e) => setAssessment({ ...assessment, passingMarks: parseInt(e.target.value) })}
                min={0}
                max={100}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Questions</h2>
          <Button onClick={addQuestion}>
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>

        {questions.map((question, qIndex) => (
          <Card key={qIndex}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Question {qIndex + 1}</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => removeQuestion(qIndex)}
                  disabled={questions.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
                <textarea
                  value={question.text}
                  onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  rows={2}
                  placeholder="Enter your question"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                  <Select
                    value={question.type}
                    onChange={(e) => {
                      const type = e.target.value;
                      updateQuestion(qIndex, 'type', type);
                      if (type === 'TRUE_FALSE') {
                        updateQuestion(qIndex, 'options', ['True', 'False']);
                      } else if (type === 'MCQ') {
                        updateQuestion(qIndex, 'options', ['', '', '', '']);
                      }
                    }}
                    options={[
                      { value: 'MCQ', label: 'Multiple Choice' },
                      { value: 'TRUE_FALSE', label: 'True/False' },
                      { value: 'SHORT_ANSWER', label: 'Short Answer' },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Marks</label>
                  <Input
                    type="number"
                    value={question.marks}
                    onChange={(e) => updateQuestion(qIndex, 'marks', parseInt(e.target.value))}
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                  <Input
                    value={question.correctAnswer}
                    onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                    placeholder="Enter correct answer"
                  />
                </div>
              </div>

              {question.type === 'MCQ' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                  <div className="space-y-2">
                    {question.options?.map((option, optIndex) => (
                      <Input
                        key={optIndex}
                        value={option}
                        onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                        placeholder={`Option ${optIndex + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate('/app/dashboard')}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={!isValid || createMutation.isPending}
        >
          <Save className="w-4 h-4 mr-2" />
          {createMutation.isPending ? 'Creating...' : 'Create Assessment'}
        </Button>
      </div>
    </div>
  );
};
