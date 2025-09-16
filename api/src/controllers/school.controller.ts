import { Request, Response, NextFunction } from 'express';
import { School } from '../models/School';
import { User } from '../models/User';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export class SchoolController {
  // Create a new school
  createSchool = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schoolData = req.body;
      const userId = req.user?.id;

      // Check if school with same nemis code already exists (assuming your model uses nemisCode)
      const existingSchool = await School.findOne({ nemisCode: schoolData.code || schoolData.nemisCode });
      if (existingSchool) {
        throw new AppError('A school with this NEMIS code already exists', 409);
      }

      // Create the school - adapt to your model structure
      const school = new School({
        ...schoolData,
        createdBy: userId,
        isVerified: false
      });

      await school.save();

      logger.info(`New school created: ${school.name} by user ${userId}`);

      res.status(201).json({
        success: true,
        message: 'School created successfully. Verification pending.',
        school: {
          id: school.id,
          name: school.name,
          nemisCode: school.nemisCode || school.code,
          educationLevels: school.educationLevels || school.level,
          county: school.county,
          isVerified: school.isVerified,
          createdAt: school.createdAt
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Get all schools (alias for getSchools)
  getAllSchools = async (req: Request, res: Response, next: NextFunction) => {
    return this.getSchools(req, res, next);
  };

  // Get all schools with search and filtering
  getSchools = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { 
        q, 
        county, 
        level, 
        page = 1, 
        limit = 20 
      } = req.query;

      const filter: Record<string, any> = {};

      // Search by name or nemis code
      if (q) {
        filter.$or = [
          { name: { $regex: q, $options: 'i' } },
          { nemisCode: { $regex: q, $options: 'i' } }
        ];
      }

      // Filter by county
      if (county) {
        filter.county = county;
      }

      // Filter by education level
      if (level) {
        filter.educationLevels = { $in: [level] };
      }

      const skip = ((page as number) - 1) * (limit as number);

      const schools = await School.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit as number);

      const total = await School.countDocuments(filter);
      const totalPages = Math.ceil(total / (limit as number));

      res.json({
        success: true,
        schools: schools.map(school => ({
          id: school.id,
          name: school.name,
          nemisCode: school.nemisCode,
          educationLevels: school.educationLevels,
          county: school.county,
          location: school.location,
          isVerified: school.isVerified,
          createdAt: school.createdAt
        })),
        pagination: {
          page: page as number,
          limit: limit as number,
          total,
          totalPages,
          hasNextPage: (page as number) < totalPages,
          hasPrevPage: (page as number) > 1
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Search schools (alias for getSchools with search functionality)
  searchSchools = async (req: Request, res: Response, next: NextFunction) => {
    return this.getSchools(req, res, next);
  };

  // Get school by ID
  getSchoolById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const school = await School.findById(id);

      if (!school) {
        throw new AppError('School not found', 404);
      }

      res.json({
        success: true,
        school: {
          id: school.id,
          name: school.name,
          nemisCode: school.nemisCode,
          educationLevels: school.educationLevels,
          county: school.county,
          location: school.location,
          contactInfo: school.contactInfo,
          isVerified: school.isVerified,
          createdAt: school.createdAt,
          updatedAt: school.updatedAt
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Get school public info (limited info for public access)
  getSchoolPublicInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const school = await School.findById(id).select('name nemisCode educationLevels county location isVerified createdAt');

      if (!school) {
        throw new AppError('School not found', 404);
      }

      res.json({
        success: true,
        school: {
          id: school.id,
          name: school.name,
          nemisCode: school.nemisCode,
          educationLevels: school.educationLevels,
          county: school.county,
          isVerified: school.isVerified
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Get all counties
  getAllCounties = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const counties = await School.distinct('county');
      
      res.json({
        success: true,
        counties: counties.sort()
      });
    } catch (error) {
      next(error);
    }
  };

  // Get schools by county
  getSchoolsByCounty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { county } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const skip = ((page as number) - 1) * (limit as number);

      const schools = await School.find({ county })
        .select('name nemisCode educationLevels isVerified')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit as number);

      const total = await School.countDocuments({ county });
      const totalPages = Math.ceil(total / (limit as number));

      res.json({
        success: true,
        county,
        schools,
        pagination: {
          page: page as number,
          limit: limit as number,
          total,
          totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Get schools by region (alias for county)
  getSchoolsByRegion = async (req: Request, res: Response, next: NextFunction) => {
    return this.getSchoolsByCounty(req, res, next);
  };

  // Get school types
  getSchoolTypes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const types = await School.distinct('educationLevels');
      
      res.json({
        success: true,
        types: types.sort()
      });
    } catch (error) {
      next(error);
    }
  };

  // Get school categories (alias for types)
  getSchoolCategories = async (req: Request, res: Response, next: NextFunction) => {
    return this.getSchoolTypes(req, res, next);
  };

  // Update school
  updateSchool = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const school = await School.findById(id);
      if (!school) {
        throw new AppError('School not found', 404);
      }

      // Check if user is authorized to update
      if (req.user?.role !== 'admin' && req.user?.role !== 'school_admin') {
        throw new AppError('Insufficient permissions to update school', 403);
      }

      Object.assign(school, updateData);
      school.updatedAt = new Date();

      await school.save();

      logger.info(`School updated: ${school.name} by user ${req.user?.id}`);

      res.json({
        success: true,
        message: 'School updated successfully',
        school
      });
    } catch (error) {
      next(error);
    }
  };

  // Delete school
  deleteSchool = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (req.user?.role !== 'admin') {
        throw new AppError('Insufficient permissions to delete school', 403);
      }

      await School.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'School deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Request verification
  requestVerification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const school = await School.findByIdAndUpdate(id, {
        verificationStatus: 'pending'
      });

      if (!school) {
        throw new AppError('School not found', 404);
      }

      res.json({
        success: true,
        message: 'Verification request submitted'
      });
    } catch (error) {
      next(error);
    }
  };

  // Verify school
  verifySchool = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { schoolId } = req.body;

      if (req.user?.role !== 'admin') {
        throw new AppError('Insufficient permissions', 403);
      }

      const school = await School.findByIdAndUpdate(schoolId, {
        isVerified: true,
        verificationStatus: 'verified'
      }, { new: true });

      if (!school) {
        throw new AppError('School not found', 404);
      }

      res.json({
        success: true,
        message: 'School verified successfully',
        school
      });
    } catch (error) {
      next(error);
    }
  };

  // Upload school logo
  uploadSchoolLogo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      res.json({
        success: true,
        message: 'Logo upload functionality not implemented yet'
      });
    } catch (error) {
      next(error);
    }
  };

  // Upload school images
  uploadSchoolImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      res.json({
        success: true,
        message: 'Image upload functionality not implemented yet'
      });
    } catch (error) {
      next(error);
    }
  };

  // Delete school image
  deleteSchoolImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, imageId } = req.params;
      
      res.json({
        success: true,
        message: 'Image deletion functionality not implemented yet'
      });
    } catch (error) {
      next(error);
    }
  };

  // Join school
  joinSchool = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { schoolId } = req.body;
      const userId = req.user?.id;

      const school = await School.findById(schoolId);
      if (!school) {
        throw new AppError('School not found', 404);
      }

      await User.findByIdAndUpdate(userId, {
        'profile.school': schoolId
      });

      res.json({
        success: true,
        message: `Successfully joined ${school.name}`
      });
    } catch (error) {
      next(error);
    }
  };

  // Leave school
  leaveSchool = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      await User.findByIdAndUpdate(userId, {
        'profile.school': null
      });

      res.json({
        success: true,
        message: 'Successfully left school'
      });
    } catch (error) {
      next(error);
    }
  };

  // Add school admin
  addSchoolAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        message: 'School admin functionality not implemented yet'
      });
    } catch (error) {
      next(error);
    }
  };

  // Remove school admin
  removeSchoolAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        message: 'Remove admin functionality not implemented yet'
      });
    } catch (error) {
      next(error);
    }
  };

  // Get school admins
  getSchoolAdmins = async (req: Request, res: Response, next: NextFunction) => {
    try {
  // Get school admins
  getSchoolAdmins = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        admins: []
      });
    } catch (error) {
      next(error);
    }
  };

  // Get school members
  getSchoolMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { role, page = 1, limit = 20 } = req.query;

      const filter: Record<string, any> = {
        'profile.school': id
      };

      if (role) {
        filter.role = role;
      }

      const skip = ((page as number) - 1) * (limit as number);

      const members = await User.find(filter)
        .select('-password -verification')
        .sort({ 'profile.firstName': 1 })
        .skip(skip)
        .limit(limit as number);

      const total = await User.countDocuments(filter);

      res.json({
        success: true,
        members,
        total
      });
    } catch (error) {
      next(error);
    }
  };

  // Get school books
  getSchoolBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        books: []
      });
    } catch (error) {
      next(error);
    }
  };

  // Get school papers
  getSchoolPapers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        papers: []
      });
    } catch (error) {
      next(error);
    }
  };

  // Get school discussions
  getSchoolDiscussions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        discussions: []
      });
    } catch (error) {
      next(error);
    }
  };

  // Get school statistics
  getSchoolStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const totalStudents = await User.countDocuments({
        'profile.school': id,
        role: 'student'
      });

      const totalTeachers = await User.countDocuments({
        'profile.school': id,
        role: 'teacher'
      });

      res.json({
        success: true,
        statistics: {
          totalStudents,
          totalTeachers,
          totalMembers: totalStudents + totalTeachers
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Get school performance
  getSchoolPerformance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        performance: {
          averageScore: 0,
          totalTests: 0,
          improvementRate: 0
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Get school settings
  getSchoolSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        settings: {}
      });
    } catch (error) {
      next(error);
    }
  };

  // Update school settings
  updateSchoolSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        message: 'Settings updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}

  // Get school members
  getSchoolMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { role, page = 1, limit = 20 } = req.query;

      const filter: Record<string, any> = {
        'profile.school': id
      };

      if (role) {
        filter.role = role;
      }

      const skip = ((page as number) - 1) * (limit as number);

      const members = await User.find(filter)
        .select('-password -verification')
        .sort({ 'profile.firstName': 1 })
        .skip(skip)
        .limit(limit as number);

      const total = await User.countDocuments(filter);

      res.json({
        success: true,
        members,
        total
      });
    } catch (error) {
      next(error);
    }
  };

  // Get school books
  getSchoolBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        books: []
      });
    } catch (error) {
      next(error);
    }
  };

  // Get school papers
  getSchoolPapers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        papers: []
      });
    } catch (error) {
      next(error);
    }
  };

  // Get school discussions
  getSchoolDiscussions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        discussions: []
      });
    } catch (error) {
      next(error);
    }
  };

  // Get school statistics
  getSchoolStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const totalStudents = await User.countDocuments({
        'profile.school': id,
        role: 'student'
      });

      const totalTeachers = await User.countDocuments({
        'profile.school': id,
        role: 'teacher'
      });

      res.json({
        success: true,
        statistics: {
          totalStudents,
          totalTeachers,
          totalMembers: totalStudents + totalTeachers
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Get school performance
  getSchoolPerformance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        performance: {
          averageScore: 0,
          totalTests: 0,
          improvementRate: 0
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Get school settings
  getSchoolSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        settings: {}
      });
    } catch (error) {
      next(error);
    }
  };

  // Update school settings
  updateSchoolSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        message: 'Settings updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
      res.json({
        success: true,
        admins: []
      });
    } catch (error) {
      next(error);
    }
  };

  // Get school members
  getSchoolMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { role, page = 1, limit = 20 } = req.query;

      const filter: Record<string, any> = {
        'profile.school': id
      };

      if (role) {
        filter.role = role;
      }

      const skip = ((page as number) - 1) * (limit as number);

      const members = await User.find(filter)
        .select('-password -verification')
        .sort({ 'profile.firstName': 1 })
        .skip(skip)
        .limit(limit as number);

      const total = await User.countDocuments(filter);

      res.json({
        success: true,
        members,
        total
      });
    } catch (error) {
      next(error);
    }
  };

  // Get school books
  getSchoolBooks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        books: []
      });
    } catch (error) {
      next(error);
    }
  };

  // Get school papers
  getSchoolPapers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        papers: []
      });
    } catch (error) {
      next(error);
    }
  };

  // Get school discussions
  getSchoolDiscussions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        discussions: []
      });
    } catch (error) {
      next(error);
    }
  };

  // Get school statistics
  getSchoolStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const totalStudents = await User.countDocuments({
        'profile.school': id,
        role: 'student'
      });

      const totalTeachers = await User.countDocuments({
        'profile.school': id,
        role: 'teacher'
      });

      res.json({
        success: true,
        statistics: {
          totalStudents,
          totalTeachers,
          totalMembers: totalStudents + totalTeachers
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Get school performance
  getSchoolPerformance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        performance: {
          averageScore: 0,
          totalTests: 0,
          improvementRate: 0
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Get school settings
  getSchoolSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        settings: {}
      });
    } catch (error) {
      next(error);
    }
  };

  // Update school settings
  updateSchoolSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        message: 'Settings updated successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
