import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

// Define Paper interface
interface Paper {
  id: string;
  title: string;
  subject: string;
  level: string;
  examType: string;
  year: number;
  term?: string;
  fileUrl?: string;
  markingSchemeUrl?: string;
  downloadCount: number;
  uploadedBy: string;
  uploadedAt: Date;
  tags?: string[];
  description?: string;
  rating?: number;
  ratingCount?: number;
  isFavorite?: boolean;
}

// Define interfaces for additional entities
interface PaperAttempt {
  id: string;
  paperId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  answers: any[];
  score?: number;
  status: 'in-progress' | 'completed' | 'submitted';
}

interface PaperReview {
  id: string;
  paperId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

interface PaperCollection {
  id: string;
  name: string;
  description?: string;
  userId: string;
  paperIds: string[];
  createdAt: Date;
  isPublic: boolean;
}

interface StudySchedule {
  id: string;
  paperId: string;
  userId: string;
  scheduledFor: Date;
  completed: boolean;
  notes?: string;
}

interface PracticeTest {
  id: string;
  name: string;
  paperIds: string[];
  userId: string;
  timeLimit?: number;
  createdAt: Date;
}

interface RevisionNote {
  id: string;
  paperId: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock data stores - replace with actual database operations
let papers: Paper[] = [
  {
    id: '1',
    title: 'Mathematics Paper 1 - KCSE 2023',
    subject: 'Mathematics',
    level: 'Secondary',
    examType: 'KCSE',
    year: 2023,
    term: 'Main',
    fileUrl: '/uploads/math-paper-1-2023.pdf',
    markingSchemeUrl: '/uploads/math-paper-1-2023-marking.pdf',
    downloadCount: 150,
    uploadedBy: 'admin',
    uploadedAt: new Date('2023-11-15'),
    tags: ['mathematics', 'algebra', 'geometry'],
    description: 'Kenya Certificate of Secondary Education Mathematics Paper 1',
    rating: 4.5,
    ratingCount: 25
  }
];

let paperAttempts: PaperAttempt[] = [];
let paperReviews: PaperReview[] = [];
let paperCollections: PaperCollection[] = [];
let studySchedules: StudySchedule[] = [];
let practiceTests: PracticeTest[] = [];
let revisionNotes: RevisionNote[] = [];

export class PaperController {
  // Basic CRUD Operations
  getAllPapers = async (req: Request, res: Response) => {
    try {
      const { subject, level, examType, year, search } = req.query;
      
      let filteredPapers = papers;
      
      if (subject) {
        filteredPapers = filteredPapers.filter(paper => 
          paper.subject.toLowerCase().includes((subject as string).toLowerCase())
        );
      }
      
      if (level) {
        filteredPapers = filteredPapers.filter(paper => 
          paper.level.toLowerCase() === (level as string).toLowerCase()
        );
      }
      
      if (examType) {
        filteredPapers = filteredPapers.filter(paper => 
          paper.examType.toLowerCase() === (examType as string).toLowerCase()
        );
      }
      
      if (year) {
        filteredPapers = filteredPapers.filter(paper => 
          paper.year === parseInt(year as string)
        );
      }
      
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        filteredPapers = filteredPapers.filter(paper =>
          paper.title.toLowerCase().includes(searchTerm) ||
          paper.subject.toLowerCase().includes(searchTerm) ||
          paper.description?.toLowerCase().includes(searchTerm)
        );
      }
      
      filteredPapers.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
      
      res.status(200).json({
        success: true,
        count: filteredPapers.length,
        data: filteredPapers
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching papers', error });
    }
  };

  searchPapers = async (req: Request, res: Response) => {
    try {
      const { q, filters } = req.query;
      let results = papers;
      
      if (q) {
        const searchTerm = (q as string).toLowerCase();
        results = results.filter(paper =>
          paper.title.toLowerCase().includes(searchTerm) ||
          paper.subject.toLowerCase().includes(searchTerm) ||
          paper.description?.toLowerCase().includes(searchTerm)
        );
      }
      
      res.status(200).json({
        success: true,
        count: results.length,
        data: results
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error searching papers', error });
    }
  };

  getRecentPapers = async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const recentPapers = papers
        .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
        .slice(0, limit);
      
      res.status(200).json({
        success: true,
        count: recentPapers.length,
        data: recentPapers
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching recent papers', error });
    }
  };

  getPopularPapers = async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const popularPapers = papers
        .sort((a, b) => b.downloadCount - a.downloadCount)
        .slice(0, limit);
      
      res.status(200).json({
        success: true,
        count: popularPapers.length,
        data: popularPapers
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching popular papers', error });
    }
  };

  getPaperById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const paper = papers.find(p => p.id === id);
      
      if (!paper) {
        return res.status(404).json({ success: false, message: 'Paper not found' });
      }
      
      res.status(200).json({ success: true, data: paper });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching paper', error });
    }
  };

  getPaperPreview = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const paper = papers.find(p => p.id === id);
      
      if (!paper) {
        return res.status(404).json({ success: false, message: 'Paper not found' });
      }
      
      // Return limited preview data
      const preview = {
        id: paper.id,
        title: paper.title,
        subject: paper.subject,
        year: paper.year,
        level: paper.level,
        description: paper.description?.substring(0, 200) + '...'
      };
      
      res.status(200).json({ success: true, data: preview });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching paper preview', error });
    }
  };

  // Filter Methods
  getAllSubjects = async (req: Request, res: Response) => {
    try {
      const subjects = [...new Set(papers.map(paper => paper.subject))];
      res.status(200).json({ success: true, data: subjects });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching subjects', error });
    }
  };

  getPapersBySubject = async (req: Request, res: Response) => {
    try {
      const { subject } = req.params;
      const filteredPapers = papers.filter(paper => 
        paper.subject.toLowerCase() === subject.toLowerCase()
      );
      
      res.status(200).json({
        success: true,
        count: filteredPapers.length,
        data: filteredPapers
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching papers by subject', error });
    }
  };

  getAllYears = async (req: Request, res: Response) => {
    try {
      const years = [...new Set(papers.map(paper => paper.year))].sort((a, b) => b - a);
      res.status(200).json({ success: true, data: years });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching years', error });
    }
  };

  getPapersByYear = async (req: Request, res: Response) => {
    try {
      const { year } = req.params;
      const filteredPapers = papers.filter(paper => paper.year === parseInt(year));
      
      res.status(200).json({
        success: true,
        count: filteredPapers.length,
        data: filteredPapers
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching papers by year', error });
    }
  };

  getAllExamBoards = async (req: Request, res: Response) => {
    try {
      const examBoards = [...new Set(papers.map(paper => paper.examType))];
      res.status(200).json({ success: true, data: examBoards });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching exam boards', error });
    }
  };

  getPapersByExamBoard = async (req: Request, res: Response) => {
    try {
      const { examBoard } = req.params;
      const filteredPapers = papers.filter(paper => 
        paper.examType.toLowerCase() === examBoard.toLowerCase()
      );
      
      res.status(200).json({
        success: true,
        count: filteredPapers.length,
        data: filteredPapers
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching papers by exam board', error });
    }
  };

  getEducationLevels = async (req: Request, res: Response) => {
    try {
      const levels = [...new Set(papers.map(paper => paper.level))];
      res.status(200).json({ success: true, data: levels });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching education levels', error });
    }
  };

  getPapersByLevel = async (req: Request, res: Response) => {
    try {
      const { level } = req.params;
      const filteredPapers = papers.filter(paper => 
        paper.level.toLowerCase() === level.toLowerCase()
      );
      
      res.status(200).json({
        success: true,
        count: filteredPapers.length,
        data: filteredPapers
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching papers by level', error });
    }
  };

  getAllTerms = async (req: Request, res: Response) => {
    try {
      const terms = [...new Set(papers.map(paper => paper.term).filter(Boolean))];
      res.status(200).json({ success: true, data: terms });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching terms', error });
    }
  };

  getPapersByTerm = async (req: Request, res: Response) => {
    try {
      const { term } = req.params;
      const filteredPapers = papers.filter(paper => 
        paper.term?.toLowerCase() === term.toLowerCase()
      );
      
      res.status(200).json({
        success: true,
        count: filteredPapers.length,
        data: filteredPapers
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching papers by term', error });
    }
  };

  // CRUD Operations
  createPaper = async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }
      
      const newId = (papers.length + 1).toString();
      const newPaper: Paper = {
        id: newId,
        ...req.body,
        downloadCount: 0,
        uploadedAt: new Date(),
        rating: 0,
        ratingCount: 0
      };
      
      papers.push(newPaper);
      res.status(201).json({ success: true, data: newPaper });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error creating paper', error });
    }
  };

  updatePaper = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const paperIndex = papers.findIndex(p => p.id === id);
      
      if (paperIndex === -1) {
        return res.status(404).json({ success: false, message: 'Paper not found' });
      }
      
      papers[paperIndex] = { ...papers[paperIndex], ...req.body };
      res.status(200).json({ success: true, data: papers[paperIndex] });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating paper', error });
    }
  };

  deletePaper = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const paperIndex = papers.findIndex(p => p.id === id);
      
      if (paperIndex === -1) {
        return res.status(404).json({ success: false, message: 'Paper not found' });
      }
      
      const deletedPaper = papers.splice(paperIndex, 1)[0];
      res.status(200).json({ success: true, data: deletedPaper });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error deleting paper', error });
    }
  };

  // File Operations
  uploadPaperFile = async (req: Request, res: Response) => {
    try {
      // Mock file upload logic
      const fileUrl = `/uploads/${Date.now()}-${req.file?.originalname}`;
      res.status(200).json({ success: true, fileUrl });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error uploading file', error });
    }
  };

  uploadMarkingScheme = async (req: Request, res: Response) => {
    try {
      const fileUrl = `/uploads/marking-schemes/${Date.now()}-${req.file?.originalname}`;
      res.status(200).json({ success: true, fileUrl });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error uploading marking scheme', error });
    }
  };

  deletePaperFile = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      res.status(200).json({ success: true, message: 'File deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error deleting file', error });
    }
  };

  downloadPaper = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const paper = papers.find(p => p.id === id);
      
      if (!paper) {
        return res.status(404).json({ success: false, message: 'Paper not found' });
      }
      
      // Increment download count
      paper.downloadCount++;
      
      res.status(200).json({ 
        success: true, 
        downloadUrl: paper.fileUrl,
        message: 'Download initiated'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error downloading paper', error });
    }
  };

  getDownloadHistory = async (req: Request, res: Response) => {
    try {
      // Mock download history
      res.status(200).json({ success: true, data: [] });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching download history', error });
    }
  };

  // Favorites
  favoritePaper = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      res.status(200).json({ success: true, message: 'Paper added to favorites' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error adding to favorites', error });
    }
  };

  unfavoritePaper = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      res.status(200).json({ success: true, message: 'Paper removed from favorites' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error removing from favorites', error });
    }
  };

  getFavoritePapers = async (req: Request, res: Response) => {
    try {
      res.status(200).json({ success: true, data: [] });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching favorite papers', error });
    }
  };

  // Paper Attempts
  startPaperAttempt = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const newAttempt: PaperAttempt = {
        id: (paperAttempts.length + 1).toString(),
        paperId: id,
        userId: req.body.userId || 'user1',
        startedAt: new Date(),
        answers: [],
        status: 'in-progress'
      };
      
      paperAttempts.push(newAttempt);
      res.status(201).json({ success: true, data: newAttempt });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error starting paper attempt', error });
    }
  };

  updatePaperAttempt = async (req: Request, res: Response) => {
    try {
      const { attemptId } = req.params;
      const attemptIndex = paperAttempts.findIndex(a => a.id === attemptId);
      
      if (attemptIndex === -1) {
        return res.status(404).json({ success: false, message: 'Attempt not found' });
      }
      
      paperAttempts[attemptIndex] = { ...paperAttempts[attemptIndex], ...req.body };
      res.status(200).json({ success: true, data: paperAttempts[attemptIndex] });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating attempt', error });
    }
  };

  submitPaperAttempt = async (req: Request, res: Response) => {
    try {
      const { attemptId } = req.params;
      const attemptIndex = paperAttempts.findIndex(a => a.id === attemptId);
      
      if (attemptIndex === -1) {
        return res.status(404).json({ success: false, message: 'Attempt not found' });
      }
      
      paperAttempts[attemptIndex].status = 'submitted';
      paperAttempts[attemptIndex].completedAt = new Date();
      
      res.status(200).json({ success: true, data: paperAttempts[attemptIndex] });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error submitting attempt', error });
    }
  };

  getPaperAttempt = async (req: Request, res: Response) => {
    try {
      const { attemptId } = req.params;
      const attempt = paperAttempts.find(a => a.id === attemptId);
      
      if (!attempt) {
        return res.status(404).json({ success: false, message: 'Attempt not found' });
      }
      
      res.status(200).json({ success: true, data: attempt });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching attempt', error });
    }
  };

  getUserAttempts = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const userAttempts = paperAttempts.filter(a => a.userId === userId);
      res.status(200).json({ success: true, data: userAttempts });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching user attempts', error });
    }
  };

  // Reviews and Ratings
  addPaperReview = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const newReview: PaperReview = {
        id: (paperReviews.length + 1).toString(),
        paperId: id,
        userId: req.body.userId || 'user1',
        rating: req.body.rating,
        comment: req.body.comment,
        createdAt: new Date()
      };
      
      paperReviews.push(newReview);
      res.status(201).json({ success: true, data: newReview });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error adding review', error });
    }
  };

  getPaperReviews = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const reviews = paperReviews.filter(r => r.paperId === id);
      res.status(200).json({ success: true, data: reviews });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching reviews', error });
    }
  };

  updatePaperReview = async (req: Request, res: Response) => {
    try {
      const { reviewId } = req.params;
      const reviewIndex = paperReviews.findIndex(r => r.id === reviewId);
      
      if (reviewIndex === -1) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }
      
      paperReviews[reviewIndex] = { ...paperReviews[reviewIndex], ...req.body };
      res.status(200).json({ success: true, data: paperReviews[reviewIndex] });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating review', error });
    }
  };

  deletePaperReview = async (req: Request, res: Response) => {
    try {
      const { reviewId } = req.params;
      const reviewIndex = paperReviews.findIndex(r => r.id === reviewId);
      
      if (reviewIndex === -1) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }
      
      const deletedReview = paperReviews.splice(reviewIndex, 1)[0];
      res.status(200).json({ success: true, data: deletedReview });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error deleting review', error });
    }
  };

  ratePaper = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { rating } = req.body;
      
      const paper = papers.find(p => p.id === id);
      if (!paper) {
        return res.status(404).json({ success: false, message: 'Paper not found' });
      }
      
      // Update paper rating (simplified logic)
      paper.rating = rating;
      paper.ratingCount = (paper.ratingCount || 0) + 1;
      
      res.status(200).json({ success: true, message: 'Paper rated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error rating paper', error });
    }
  };

  // Sharing
  sharePaper = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const shareUrl = `${req.protocol}://${req.get('host')}/papers/${id}`;
      res.status(200).json({ success: true, shareUrl });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error sharing paper', error });
    }
  };

  getSharedPapers = async (req: Request, res: Response) => {
    try {
      res.status(200).json({ success: true, data: [] });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching shared papers', error });
    }
  };

  // Study Scheduling
  scheduleStudy = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const newSchedule: StudySchedule = {
        id: (studySchedules.length + 1).toString(),
        paperId: id,
        userId: req.body.userId || 'user1',
        scheduledFor: new Date(req.body.scheduledFor),
        completed: false,
        notes: req.body.notes
      };
      
      studySchedules.push(newSchedule);
      res.status(201).json({ success: true, data: newSchedule });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error scheduling study', error });
    }
  };

  getScheduledPapers = async (req: Request, res: Response) => {
    try {
      const { userId } = req.query;
      const scheduled = studySchedules.filter(s => s.userId === userId);
      res.status(200).json({ success: true, data: scheduled });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching scheduled papers', error });
    }
  };

  updateStudySchedule = async (req: Request, res: Response) => {
    try {
      const { scheduleId } = req.params;
      const scheduleIndex = studySchedules.findIndex(s => s.id === scheduleId);
      
      if (scheduleIndex === -1) {
        return res.status(404).json({ success: false, message: 'Schedule not found' });
      }
      
      studySchedules[scheduleIndex] = { ...studySchedules[scheduleIndex], ...req.body };
      res.status(200).json({ success: true, data: studySchedules[scheduleIndex] });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating schedule', error });
    }
  };

  removeFromSchedule = async (req: Request, res: Response) => {
    try {
      const { scheduleId } = req.params;
      const scheduleIndex = studySchedules.findIndex(s => s.id === scheduleId);
      
      if (scheduleIndex === -1) {
        return res.status(404).json({ success: false, message: 'Schedule not found' });
      }
      
      const deletedSchedule = studySchedules.splice(scheduleIndex, 1)[0];
      res.status(200).json({ success: true, data: deletedSchedule });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error removing from schedule', error });
    }
  };

  // Collections
  createPaperCollection = async (req: Request, res: Response) => {
    try {
      const newCollection: PaperCollection = {
        id: (paperCollections.length + 1).toString(),
        name: req.body.name,
        description: req.body.description,
        userId: req.body.userId || 'user1',
        paperIds: [],
        createdAt: new Date(),
        isPublic: req.body.isPublic || false
      };
      
      paperCollections.push(newCollection);
      res.status(201).json({ success: true, data: newCollection });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error creating collection', error });
    }
  };

  getUserCollections = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const collections = paperCollections.filter(c => c.userId === userId);
      res.status(200).json({ success: true, data: collections });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching collections', error });
    }
  };

  getPaperCollection = async (req: Request, res: Response) => {
    try {
      const { collectionId } = req.params;
      const collection = paperCollections.find(c => c.id === collectionId);
      
      if (!collection) {
        return res.status(404).json({ success: false, message: 'Collection not found' });
      }
      
      res.status(200).json({ success: true, data: collection });
    } catch (error) {
      resstatus(500).json({ success: false, message: 'Error fetching collection', error });
    }
  };

  updatePaperCollection = async (req: Request, res: Response) => {
    try {
      const { collectionId } = req.params;
      const collectionIndex = paperCollections.findIndex(c => c.id === collectionId);
      
      if (collectionIndex === -1) {
        return res.status(404).json({ success: false, message: 'Collection not found' });
      }
      
      paperCollections[collectionIndex] = { ...paperCollectionsctionIndex], ...req.body };
      res.status(200).json({ success: true, data: paperCollections[collectionIndex] });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating collection', error });
    }
  };

  deletePaperCollection = async (req: Request, res: Response) => {
    try {
      const { collectionId } = req.params;
      const collectionIndex = paperCollections.findIndex(c => c.id === collectionId);
      
      if (collectionIndex === -1) {
        return res.ss(404).json({ success: false, message: 'Collection not found' });
      }
      
      const deletedCollection = paperCollections.splice(collectionIndex, 1)[0];
      res.status(200).json({ success: true, data: deletedCollection });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error deleting collection', error });
    }
  };

  addPaperToCollection = async (req: Request, res: Response) => {
    try {
      const { collectionId, paperId } = req.params;
      const collection =paperCollections.find(c => c.id === collectionId);
      
      if (!collection) {
        return res.status(404).json({ success: false, message: 'Collection not found' });
      }
      
      if (!collection.paperIds.includes(paperId)) {
        collection.paperIds.push(paperId);
      }
      
      res.status(200).json({ success: true, data: collection });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error adding paper to collection', error });
    }
  };

  removePaperFrection = async (req: Request, res: Response) => {
    try {
      const { collectionId, paperId } = req.params;
      const collection = paperCollections.find(c => c.id === collectionId);
      
      if (!collection) {
        return res.status(404).json({ success: false, message: 'Collection not found' });
      }
      
      collection.paperIds = collection.paperIds.filter(id => id !== paperId);
      res.status(200).json({ success: true, data: collection });
    } catch (error) {
      res.status(500).n({ success: false, message: 'Error removing paper from collection', error });
    }
  };

  // Practice Tests
  createPracticeTest = async (req: Request, res: Response) => {
    try {
      const newTest: PracticeTest = {
        id: (practiceTests.length + 1).toString(),
        name: req.body.name,
        paperIds: req.body.paperIds || [],
        userId: req.body.userId || 'user1',
        timeLimit: req.body.timeLimit,
        createdAt: new Date()
      };
      
      practiceTests.push(newTest);
  es.status(201).json({ success: true, data: newTest });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error creating practice test', error });
    }
  };

  getPracticeTests = async (req: Request, res: Response) => {
    try {
      const { userId } = req.query;
      const tests = practiceTests.filter(t => t.userId === userId);
      res.status(200).json({ success: true, data: tests });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetchingpractice tests', error });
    }
  };

  startPracticeTest = async (req: Request, res: Response) => {
    try {
      const { testId } = req.params;
      const test = practiceTests.find(t => t.id === testId);
      
      if (!test) {
        return res.status(404).json({ success: false, message: 'Practice test not found' });
      }
      
      res.status(200).json({ 
        success: true, 
        data: { 
          testId,
          startTime: new Date(),
          timeLimit: test.timeLimit
        }
    });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error starting practice test', error });
    }
  };

  getPracticeTestResults = async (req: Request, res: Response) => {
    try {
      const { testId } = req.params;
      // Mock results
      const results = {
        testId,
        score: 85,
        totalQuestions: 50,
        correctAnswers: 42,
        timeTaken: '45 minutes',
        completedAt: new Date()
      };
      
      res.status(200).json({ success: trudata: results });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching test results', error });
    }
  };

  // Analytics
  getPaperAnalytics = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const paper = papers.find(p => p.id === id);
      
      if (!paper) {
        return res.status(404).json({ success: false, message: 'Paper not found' });
      }
      
      const analytics = {
        paperId: id,
        totalDownlo: paper.downloadCount,
        averageRating: paper.rating,
        totalReviews: paper.ratingCount,
        viewCount: Math.floor(Math.random() * 1000) + paper.downloadCount,
        popularityRank: Math.floor(Math.random() * 100) + 1
      };
      
      res.status(200).json({ success: true, data: analytics });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching paper analytics', error });
    }
  };

  getPerformanceAnalytics = async (req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const analytics = {
        userId,
        totalAttempts: paperAttempts.filter(a => a.userId === userId).length,
        averageScore: 75.5,
        improvementRate: 12.3,
        strongSubjects: ['Mathematics', 'Physics'],
        weakSubjects: ['Chemistry', 'Biology'],
        studyStreak: 7
      };
      
      res.status(200).json({ success: true, data: analytics });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erroing performance analytics', error });
    }
  };

  getProgressAnalytics = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const progress = {
        userId,
        completedPapers: 25,
        totalScheduled: 50,
        completionRate: 50,
        weeklyProgress: [
          { week: 'Week 1', completed: 3 },
          { week: 'Week 2', completed: 5 },
          { week: 'Week 3', completed: 4 },
          { week: 'Week 4', completed: 6 }
        ]
      };
      res.status(200).json({ success: true, data: progress });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching progress analytics', error });
    }
  };

  // Revision Notes
  getRevisionNotes = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const notes = revisionNotes.filter(n => n.paperId === id);
      res.status(200).json({ success: true, data: notes });
    } catch (error) {
      res.status(500).json({ success: false, age: 'Error fetching revision notes', error });
    }
  };

  createRevisionNote = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const newNote: RevisionNote = {
        id: (revisionNotes.length + 1).toString(),
        paperId: id,
        userId: req.body.userId || 'user1',
        title: req.body.title,
        content: req.body.content,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      revisionNotes.push(newNote);
      res.status(201).json({ success: true, data: newNote });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error creating revision note', error });
    }
  };

  updateRevisionNote = async (req: Request, res: Response) => {
    try {
      const { noteId } = req.params;
      const noteIndex = revisionNotes.findIndex(n => n.id === noteId);
      
      if (noteIndex === -1) {
        return res.status(404).json({ success: false, message: 'Revision note not found' });
      }
      
      ionNotes[noteIndex] = { 
        ...revisionNotes[noteIndex], 
        ...req.body, 
        updatedAt: new Date() 
      };
      res.status(200).json({ success: true, data: revisionNotes[noteIndex] });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating revision note', error });
    }
  };

  deleteRevisionNote = async (req: Request, res: Response) => {
    try {
      const { noteId } = req.params;
      const noteIndex = revisionNotes.findIndex(n => n.id === noteId);
      
      if (noteIndex === -1) {
        return res.status(404).json({ success: false, message: 'Revision note not found' });
      }
      
      const deletedNote = revisionNotes.splice(noteIndex, 1)[0];
      res.status(200).json({ success: true, data: deletedNote });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error deleting revision note', error });
    }
  };
}

// Export both the class and an instance
export const paperController = new PaperController();
exporault PaperController;
