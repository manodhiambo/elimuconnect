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

      // Check if school with same code already exists
      const existingSchool = await School.findOne({ code: schoolData.code });
      if (existingSchool) {
        throw new AppError('A school with this NEMIS code already exists', 409);
      }

      // Create the school
      const school = new School({
        ...schoolData,
        createdBy: userId,
        verified: false,
        status: 'pending'
      });

      await school.save();

      logger.info(`New school created: ${school.name} (${school.code}) by user ${userId}`);

      res.status(201).json({
        success: true,
        message: 'School created successfully. Verification pending.',
        school: {
          id: school.id,
          name: school.name,
          code: school.code,
          level: school.level,
          county: school.county,
          district: school.district,
          verified: school.verified,
          status: school.status,
          createdAt: school.createdAt
        }
      });
    } catch (error) {
      next(error);
    }
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

      const filter: Record<string, any> = { status: 'active' };

      // Search by name or code
      if (q) {
        filter.$or = [
          { name: { $regex: q, $options: 'i' } },
          { code: { $regex: q, $options: 'i' } }
        ];
      }

      // Filter by county
      if (county) {
        filter.county = county;
      }

      // Filter by education level
      if (level) {
        filter.level = { $in: [level] };
      }

      const skip = ((page as number) - 1) * (limit as number);

      const schools = await School.find(filter)
        .select('-createdBy -updatedBy')
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit as number)
        .populate('stats.totalStudents stats.totalTeachers');

      const total = await School.countDocuments(filter);
      const totalPages = Math.ceil(total / (limit as number));

      res.json({
        success: true,
        schools: schools.map(school => ({
          id: school.id,
          name: school.name,
          code: school.code,
          level: school.level,
          county: school.county,
          district: school.district,
          location: school.location,
          contact: school.contact,
          verified: school.verified,
          stats: school.stats,
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

  // Get school by ID
  getSchoolById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const school = await School.findById(id)
        .populate('stats.totalStudents stats.totalTeachers');

      if (!school) {
        throw new AppError('School not found', 404);
      }

      res.json({
        success: true,
        school: {
          id: school.id,
          name: school.name,
          code: school.code,
          level: school.level,
          county: school.county,
          district: school.district,
          location: school.location,
          contact: school.contact,
          verified: school.verified,
          status: school.status,
          stats: school.stats,
          createdAt: school.createdAt,
          updatedAt: school.updatedAt
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Update school
  updateSchool = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user?.id;

      const school = await School.findById(id);
      if (!school) {
        throw new AppError('School not found', 404);
      }

      // Check if user is authorized to update (school admin or system admin)
      if (req.user?.role !== 'admin' && req.user?.role !== 'school_admin') {
        throw new AppError('Insufficient permissions to update school', 403);
      }

      Object.assign(school, updateData);
      school.updatedBy = userId;
      school.updatedAt = new Date();

      await school.save();

      logger.info(`School updated: ${school.name} (${school.code}) by user ${userId}`);

      res.json({
        success: true,
        message: 'School updated successfully',
        school: {
          id: school.id,
          name: school.name,
          code: school.code,
          level: school.level,
          county: school.county,
          district: school.district,
          location: school.location,
          contact: school.contact,
          verified: school.verified,
          status: school.status,
          updatedAt: school.updatedAt
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Delete school (soft delete)
  deleteSchool = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Only admins can delete schools
      if (req.user?.role !== 'admin') {
        throw new AppError('Insufficient permissions to delete school', 403);
      }

      const school = await School.findById(id);
      if (!school) {
        throw new AppError('School not found', 404);
      }

      school.status = 'inactive';
      school.updatedBy = userId;
      school.updatedAt = new Date();

      await school.save();

      logger.warn(`School deleted: ${school.name} (${school.code}) by user ${userId}`);

      res.json({
        success: true,
        message: 'School deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  // Verify school
  verifySchool = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { schoolId } = req.body;
      const userId = req.user?.id;

      // Only admins can verify schools
      if (req.user?.role !== 'admin') {
        throw new AppError('Insufficient permissions to verify school', 403);
      }

      const school = await School.findById(schoolId);
      if (!school) {
        throw new AppError('School not found', 404);
      }

      school.verified = true;
      school.status = 'active';
      school.updatedBy = userId;
      school.updatedAt = new Date();

      await school.save();

      logger.info(`School verified: ${school.name} (${school.code}) by admin ${userId}`);

      res.json({
        success: true,
        message: 'School verified successfully',
        school: {
          id: school.id,
          name: school.name,
          verified: school.verified,
          status: school.status
        }
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

      if (!school.verified || school.status !== 'active') {
        throw new AppError('School is not verified or active', 400);
      }

      // Update user's school
      await User.findByIdAndUpdate(userId, {
        'profile.school': schoolId
      });

      logger.info(`User ${userId} joined school: ${school.name} (${school.code})`);

      res.json({
        success: true,
        message: `Successfully joined ${school.name}`,
        school: {
          id: school.id,
          name: school.name,
          code: school.code
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Leave school
  leaveSchool = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      const user = await User.findById(userId);
      if (!user || !user.profile.school) {
        throw new AppError('You are not currently enrolled in any school', 400);
      }

      const school = await School.findById(user.profile.school);

      // Update user's school to null
      await User.findByIdAndUpdate(userId, {
        'profile.school': null
      });

      logger.info(`User ${userId} left school: ${school?.name || 'Unknown'}`);

      res.json({
        success: true,
        message: 'Successfully left school'
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

      const school = await School.findById(id);
      if (!school) {
        throw new AppError('School not found', 404);
      }

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
      const totalPages = Math.ceil(total / (limit as number));

      res.json({
        success: true,
        school: {
          id: school.id,
          name: school.name
        },
        members: members.map(member => ({
          id: member.id,
          firstName: member.profile.firstName,
          lastName: member.profile.lastName,
          avatar: member.profile.avatar,
          role: member.role,
          verified: member.verified,
          createdAt: member.createdAt
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
}
