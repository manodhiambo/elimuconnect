import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAssignmentSubmission {
  studentId: Types.ObjectId;
  submittedAt: Date;
  files: string[]; // File paths or URLs
  textContent?: string;
  status: 'submitted' | 'late' | 'graded' | 'returned';
  grade?: number;
  feedback?: string;
  gradedAt?: Date;
  gradedBy?: Types.ObjectId;
}

export interface IAssignment extends Document {
  title: string;
  description: string;
  instructions: string;
  subject: string;
  level: 'primary' | 'secondary' | 'college' | 'university';
  teacherId: Types.ObjectId;
  schoolId?: Types.ObjectId;
  studyGroupId?: Types.ObjectId;
  
  // Assignment details
  maxPoints: number;
  passingGrade: number;
  allowedFileTypes: string[];
  maxFileSize: number; // in bytes
  allowLateSubmissions: boolean;
  lateSubmissionPenalty: number; // percentage penalty per day
  
  // Dates
  assignedDate: Date;
  dueDate: Date;
  availableFrom?: Date;
  availableUntil?: Date;
  
  // Submissions
  submissions: IAssignmentSubmission[];
  maxSubmissions: number;
  allowResubmission: boolean;
  
  // Settings
  isPublished: boolean;
  isVisible: boolean;
  requiresApproval: boolean;
  allowCollaboration: boolean;
  
  // Resources
  attachments: string[];
  referenceBooks: Types.ObjectId[];
  referencePapers: Types.ObjectId[];
  
  // Statistics
  submissionCount: number;
  averageGrade: number;
  completionRate: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSubmissionSchema = new Schema<IAssignmentSubmission>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  submittedAt: { type: Date, default: Date.now },
  files: [{ type: String }],
  textContent: { type: String },
  status: { 
    type: String, 
    enum: ['submitted', 'late', 'graded', 'returned'],
    default: 'submitted'
  },
  grade: { type: Number, min: 0 },
  feedback: { type: String },
  gradedAt: { type: Date },
  gradedBy: { type: Schema.Types.ObjectId, ref: 'User' }
});

const AssignmentSchema = new Schema<IAssignment>({
  title: { type: String, required: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 2000 },
  instructions: { type: String, required: true },
  subject: { type: String, required: true },
  level: { 
    type: String, 
    enum: ['primary', 'secondary', 'college', 'university'],
    required: true 
  },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  schoolId: { type: Schema.Types.ObjectId, ref: 'School' },
  studyGroupId: { type: Schema.Types.ObjectId, ref: 'StudyGroup' },
  
  // Assignment details
  maxPoints: { type: Number, required: true, min: 1 },
  passingGrade: { type: Number, required: true, min: 0 },
  allowedFileTypes: [{ type: String }],
  maxFileSize: { type: Number, default: 10485760 }, // 10MB default
  allowLateSubmissions: { type: Boolean, default: true },
  lateSubmissionPenalty: { type: Number, default: 10, min: 0, max: 100 },
  
  // Dates
  assignedDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  availableFrom: { type: Date },
  availableUntil: { type: Date },
  
  // Submissions
  submissions: [AssignmentSubmissionSchema],
  maxSubmissions: { type: Number, default: 1, min: 1 },
  allowResubmission: { type: Boolean, default: false },
  
  // Settings
  isPublished: { type: Boolean, default: false },
  isVisible: { type: Boolean, default: true },
  requiresApproval: { type: Boolean, default: false },
  allowCollaboration: { type: Boolean, default: false },
  
  // Resources
  attachments: [{ type: String }],
  referenceBooks: [{ type: Schema.Types.ObjectId, ref: 'Book' }],
  referencePapers: [{ type: Schema.Types.ObjectId, ref: 'PastPaper' }],
  
  // Statistics
  submissionCount: { type: Number, default: 0 },
  averageGrade: { type: Number, default: 0 },
  completionRate: { type: Number, default: 0 }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
AssignmentSchema.index({ teacherId: 1, createdAt: -1 });
AssignmentSchema.index({ schoolId: 1, subject: 1 });
AssignmentSchema.index({ studyGroupId: 1 });
AssignmentSchema.index({ dueDate: 1 });
AssignmentSchema.index({ isPublished: 1, isVisible: 1 });

// Virtual fields
AssignmentSchema.virtual('teacher', {
  ref: 'User',
  localField: 'teacherId',
  foreignField: '_id',
  justOne: true,
  select: 'firstName lastName email profilePicture'
});

AssignmentSchema.virtual('school', {
  ref: 'School',
  localField: 'schoolId',
  foreignField: '_id',
  justOne: true
});

AssignmentSchema.virtual('studyGroup', {
  ref: 'StudyGroup',
  localField: 'studyGroupId',
  foreignField: '_id',
  justOne: true
});

AssignmentSchema.virtual('isOverdue').get(function() {
  return new Date() > this.dueDate;
});

AssignmentSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  const timeLeft = this.dueDate.getTime() - now.getTime();
  
  if (timeLeft <= 0) return null;
  
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  
  return { days, hours, minutes, total: timeLeft };
});

// Methods
AssignmentSchema.methods.addSubmission = function(submissionData: Partial<IAssignmentSubmission>) {
  const submission = {
    studentId: submissionData.studentId,
    submittedAt: new Date(),
    files: submissionData.files || [],
    textContent: submissionData.textContent,
    status: new Date() > this.dueDate ? 'late' : 'submitted'
  } as IAssignmentSubmission;
  
  // Check if student already has a submission
  const existingIndex = this.submissions.findIndex(
    (s: IAssignmentSubmission) => s.studentId.toString() === submissionData.studentId?.toString()
  );
  
  if (existingIndex >= 0 && !this.allowResubmission) {
    throw new Error('Resubmission not allowed for this assignment');
  }
  
  if (existingIndex >= 0) {
    this.submissions[existingIndex] = submission;
  } else {
    this.submissions.push(submission);
    this.submissionCount += 1;
  }
  
  this.updateStatistics();
  return submission;
};

AssignmentSchema.methods.gradeSubmission = function(studentId: string, grade: number, feedback?: string, gradedBy?: string) {
  const submissionIndex = this.submissions.findIndex(
    (s: IAssignmentSubmission) => s.studentId.toString() === studentId
  );
  
  if (submissionIndex === -1) {
    throw new Error('Submission not found');
  }
  
  this.submissions[submissionIndex].grade = grade;
  this.submissions[submissionIndex].feedback = feedback;
  this.submissions[submissionIndex].gradedAt = new Date();
  this.submissions[submissionIndex].gradedBy = gradedBy ? new Types.ObjectId(gradedBy) : undefined;
  this.submissions[submissionIndex].status = 'graded';
  
  this.updateStatistics();
};

AssignmentSchema.methods.updateStatistics = function() {
  const gradedSubmissions = this.submissions.filter((s: IAssignmentSubmission) => s.grade !== undefined);
  
  if (gradedSubmissions.length > 0) {
    const totalGrades = gradedSubmissions.reduce((sum: number, s: IAssignmentSubmission) => sum + (s.grade || 0), 0);
    this.averageGrade = totalGrades / gradedSubmissions.length;
  }
  
  // Calculate completion rate based on expected students
  // This would need to be updated based on how you track assignment recipients
  this.completionRate = this.submissions.length; // Simplified for now
};

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
export default Assignment;
