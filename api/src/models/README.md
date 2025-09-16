# ElimuConnect Database Models

This directory contains all the MongoDB models for the ElimuConnect platform. Each model represents a different entity in the educational ecosystem.

## 📚 Core Educational Models

### User Model (`User.ts`)
**Purpose**: Manages user accounts for students, teachers, and administrators

**Key Features**:
- Authentication (email/password, social login)
- Role-based access control (student, teacher, admin, school_admin)
- Profile management with avatar upload
- School association and verification
- Account settings and preferences
- Follow/follower system

**Important Fields**:
```typescript
- email, password (authentication)
- firstName, lastName, profilePicture
- role: 'student' | 'teacher' | 'admin' | 'school_admin'
- school: reference to School model
- isEmailVerified, isActive
- preferences: notifications, privacy settings
- followers, following arrays
```

### School Model (`School.ts`)
**Purpose**: Represents educational institutions in Kenya

**Key Features**:
- School registration and verification
- Location-based filtering (county, region)
- School types (primary, secondary, technical, university)
- Member management
- Performance tracking

**Important Fields**:
```typescript
- name, description, schoolType
- location: county, region, address
- contactInfo: phone, email, website
- isVerified, verificationDocuments
- members: students and teachers
- statistics: student count, performance metrics
```

### Book Model (`Book.ts`)
**Purpose**: Digital textbook and educational resource management

**Key Features**:
- Publisher integration (KLB, Longhorn, Oxford, etc.)
- Subject and level categorization
- File management (PDF, ePub)
- Rating and review system
- Download tracking

**Important Fields**:
```typescript
- title, author, publisher, isbn
- subject, level, language
- description, coverImage
- fileUrl, fileSize, fileType
- ratings, reviews
- downloadCount, viewCount
```

### PastPaper Model (`PastPaper.ts`)
**Purpose**: Kenya National Examinations past papers and practice materials

**Key Features**:
- Exam board categorization (KNEC, etc.)
- Subject and year filtering
- Practice test functionality
- Marking schemes
- Performance tracking

**Important Fields**:
```typescript
- title, subject, examBoard
- year, term, level
- duration, totalMarks
- paperFile, markingSchemeFile
- difficulty, instructions
- attemptCount, averageScore
```

## 🎯 Learning & Progress Models

### Quiz Model (`Quiz.ts`)
**Purpose**: Interactive quizzes and assessments

**Key Features**:
- Multiple choice, true/false, short answer questions
- Automatic grading
- Time limits and attempts
- Subject-based categorization
- Performance analytics

**Important Fields**:
```typescript
- title, description, subject, level
- questions: array of question objects
- timeLimit, maxAttempts
- passingScore, totalMarks
- isPublic, isActive
```

### Progress Model (`Progress.ts`)
**Purpose**: Comprehensive learning progress tracking

**Key Features**:
- Reading progress with bookmarks
- Quiz and paper attempt history
- Study time tracking
- Goals and achievements system
- Subject-wise progress analysis
- Study session logging

**Important Fields**:
```typescript
- userId: reference to User
- readingProgress: book progress array
- quizProgress: quiz attempt history
- studySessions: detailed session tracking
- goals: learning objectives
- achievements: earned badges/rewards
- subjectProgress: per-subject analytics
```

### Assignment Model (`Assignment.ts`)
**Purpose**: Teacher-created assignments and submissions

**Key Features**:
- File submission support
- Grading and feedback system
- Due date management
- Late submission policies
- Collaboration settings

**Important Fields**:
```typescript
- title, description, instructions
- teacherId, schoolId, studyGroupId
- dueDate, maxPoints, passingGrade
- submissions: student submission array
- allowLateSubmissions, lateSubmissionPenalty
```

## 💬 Social & Communication Models

### Discussion Model (`Discussion.ts`)
**Purpose**: Forum discussions and Q&A functionality

**Key Features**:
- Threaded conversations
- Subject-based categorization
- Voting and best answer system
- Moderation tools
- Search and filtering

**Important Fields**:
```typescript
- title, content, category
- authorId, subject, level
- replies: nested reply structure
- likes, views, isResolved
- tags, isPinned, isFeatured
```

### Message Model (`Message.ts`)
**Purpose**: Direct messaging between users

**Key Features**:
- One-on-one and group conversations
- File attachments
- Real-time delivery status
- Message encryption
- Conversation management

**Important Fields**:
```typescript
- conversationId, senderId, recipientIds
- content, messageType, attachments
- isRead, readBy, deliveredAt
- replyTo (for threaded messages)
```

### StudyGroup Model (`StudyGroup.ts`)
**Purpose**: Collaborative learning groups

**Key Features**:
- Group creation and management
- Member roles and permissions
- Shared resources
- Discussion boards
- Activity tracking

**Important Fields**:
```typescript
- name, description, subject, level
- creatorId, members array
- isPrivate, maxMembers
- resources: shared books/papers
- discussions: group-specific forums
```

## 📊 Analytics & Tracking Models

### Analytics Models (`Analytics.ts`)
**Purpose**: Comprehensive usage and performance analytics

**Models Included**:
1. **UserActivity**: Individual user action logging
2. **SystemMetrics**: Platform-wide daily statistics
3. **UserMetrics**: Daily user performance summaries

**Key Features**:
- Real-time activity tracking
- Performance metrics aggregation
- Usage pattern analysis
- Resource access statistics
- Geographic user distribution

**UserActivity Fields**:
```typescript
- userId, sessionId, activityType
- resourceType, resourceId, metadata
- timestamp, duration, ipAddress
- location: country, region, city
```

**SystemMetrics Fields**:
```typescript
- date, activeUsers, newRegistrations
- pageViews, resourceDownloads
- averageSessionDuration, bounceRate
- topSubjects, topBooks, topPapers
```

### Notification Model (`Notification.ts`)
**Purpose**: User notification management

**Key Features**:
- Multi-type notifications (messages, achievements, reminders)
- Priority levels
- Read/unread status
- Scheduled notifications
- Auto-expiration

**Important Fields**:
```typescript
- recipientId, senderId, type
- title, message, priority
- isRead, readAt, expiresAt
- actionUrl, imageUrl, data
```

### Bookmark Model (`Bookmark.ts`)
**Purpose**: User content bookmarking system

**Key Features**:
- Multi-resource bookmarking
- Category organization
- Tag-based filtering
- Access tracking
- Public/private bookmarks

**Important Fields**:
```typescript
- userId, resourceId, resourceType
- title, description, tags
- category, notes, priority
- isPublic, accessCount, lastAccessedAt
```

## 🏗️ Model Relationships

### Primary Relationships

```
User (1) ←→ (N) School
User (1) ←→ (N) Progress
User (1) ←→ (N) Bookmark
User (1) ←→ (N) Assignment
User (1) ←→ (N) StudyGroup

School (1) ←→ (N) User
School (1) ←→ (N) Assignment

Book (1) ←→ (N) Progress.readingProgress
PastPaper (1) ←→ (N) Progress.paperProgress
Quiz (1) ←→ (N) Progress.quizProgress

Discussion (1) ←→ (N) Message
StudyGroup (1) ←→ (N) Discussion
```

### Cross-Model References

- **Progress** tracks user activity across Books, PastPapers, and Quizzes
- **Bookmarks** can reference any resource type (books, papers, discussions, etc.)
- **Notifications** link to various resources and actions
- **Analytics** models track activity across all resources

## 📝 Usage Examples

### Creating a User with Progress Tracking
```typescript
// Create user
const user = new User({
  email: 'student@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'student'
});

// Initialize progress tracking
const progress = new Progress({
  userId: user._id,
  totalStudyTime: 0,
  level: 1
});
```

### Tracking Reading Progress
```typescript
// Update reading progress
await Progress.findOneAndUpdate(
  { userId: user._id },
  {
    $push: {
      readingProgress: {
        bookId: book._id,
        currentPage: 50,
        totalPages: 200,
        timeSpent: 30
      }
    }
  }
);
```

### Creating Educational Content
```typescript
// Create a book
const book = new Book({
  title: 'Mathematics Form 1',
  subject: 'Mathematics',
  level: 'secondary',
  publisher: 'KLB',
  fileUrl: 'books/math-form1.pdf'
});

// Create related quiz
const quiz = new Quiz({
  title: 'Chapter 1: Algebra',
  subject: 'Mathematics',
  level: 'secondary',
  questions: [/* quiz questions */]
});
```

## 🔧 Model Features

### Automatic Timestamps
All models include `createdAt` and `updatedAt` timestamps via Mongoose timestamps option.

### Virtual Fields
Many models include virtual fields for computed properties:
- User: `fullName`, `isOnline`
- Progress: `currentLevelProgress`, `completionRates`
- Assignment: `isOverdue`, `timeRemaining`

### Indexes
Optimized database indexes for:
- User queries by email, school, role
- Content filtering by subject, level, type
- Analytics by date ranges and user activity
- Search functionality across resources

### Validation
Built-in validation for:
- Email format and uniqueness
- Required fields and data types
- Enum values for categories
- File size and type restrictions

### Methods
Custom instance methods for:
- Progress tracking and updates
- Score calculations
- Achievement checking
- Activity logging

## 🚀 Getting Started

### Installation
```bash
npm install mongoose mongoose-paginate-v2
```

### Basic Setup
```typescript
import { connectModels, User, Progress } from './models';

// Initialize models
await connectModels();

// Use models
const user = await User.findById(userId);
const progress = await Progress.findOne({ userId });
```

### Environment Variables
Required for model functionality:
```env
MONGODB_URI=mongodb://localhost:27017/elimuconnect
JWT_SECRET=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket (for file storage)
```

## 📱 Kenya-Specific Features

### Education System Integration
- **KNEC**: Kenya National Examinations Council papers
- **Counties**: All 47 Kenyan counties supported
- **Curriculum**: 8-4-4 and Competency-Based Curriculum (CBC)
- **Languages**: English and Swahili support
- **Publishers**: Integration with local publishers (KLB, Longhorn, etc.)

### School Types
- Primary Schools
- Secondary Schools
- Technical and Vocational Education and Training (TVET)
- Universities and Colleges

### Subjects
Standard Kenyan curriculum subjects including:
- Mathematics, English, Kiswahili
- Sciences (Biology, Chemistry, Physics)
- Humanities (History, Geography, CRE/IRE/HRE)
- Technical subjects and vocational training

This comprehensive model structure supports the full educational ecosystem in Kenya, from individual learning tracking to institutional management and analytics.
