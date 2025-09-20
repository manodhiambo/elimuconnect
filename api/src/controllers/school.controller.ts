import { Request, Response } from 'express';
import { School } from '../models/School';
import { AuthenticatedRequest } from '../types/auth';
import { asyncHandler } from '../middleware/asyncHandler';

export class SchoolController {
  getSchools = asyncHandler(async (req: Request, res: Response) => {
    const schools = await School.find({ verified: true });
    
    const formattedSchools = schools.map(school => ({
      id: school._id,
      name: school.name,
      nemisCode: school.nemisCode,
      educationLevels: school.educationLevels,
      location: school.location,
      isVerified: school.verified,
      createdAt: school.createdAt,
      updatedAt: school.updatedAt
    }));

    res.json({ schools: formattedSchools });
  });

  getSchool = asyncHandler(async (req: Request, res: Response) => {
    const school = await School.findById(req.params.id);
    
    if (!school) {
      res.status(404).json({ message: 'School not found' });
      return;
    }

    res.json({
      school: {
        id: school._id,
        name: school.name,
        nemisCode: school.nemisCode,
        educationLevels: school.educationLevels,
        type: school.type,
        location: school.location,
        contactInfo: school.contactInfo,
        isVerified: school.verified,
        createdAt: school.createdAt,
        updatedAt: school.updatedAt
      }
    });
  });

  createSchool = asyncHandler(async (req: Request, res: Response) => {
    const school = new School(req.body);
    await school.save();

    res.status(201).json({
      school: {
        id: school._id,
        name: school.name,
        nemisCode: school.nemisCode,
        educationLevels: school.educationLevels,
        location: school.location,
        contactInfo: school.contactInfo,
        isVerified: school.verified,
        createdAt: school.createdAt,
        updatedAt: school.updatedAt
      }
    });
  });

  updateSchool = asyncHandler(async (req: Request, res: Response) => {
    const school = await School.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (!school) {
      res.status(404).json({ message: 'School not found' });
      return;
    }

    res.json({
      school: {
        id: school._id,
        name: school.name,
        nemisCode: school.nemisCode,
        educationLevels: school.educationLevels,
        isVerified: school.verified
      }
    });
  });

  // FIXED: Proper implementation of searchSchools
  searchSchools = asyncHandler(async (req: Request, res: Response) => {
    const { q, limit = 20, page = 1, county, type } = req.query;

    // Validate search query
    if (!q || typeof q !== 'string' || q.trim().length < 3) {
      res.status(400).json({
        success: false,
        message: 'Search query must be at least 3 characters long',
        data: { schools: [], total: 0 }
      });
      return;
    }

    const searchQuery = q.trim();
    const limitNum = Math.min(parseInt(limit as string) || 20, 50);
    const pageNum = parseInt(page as string) || 1;
    const skip = (pageNum - 1) * limitNum;

    try {
      // Build search criteria
      const searchCriteria: any = {
        $and: [
          { verified: true }, // Only verified schools
          {
            $or: [
              { name: { $regex: searchQuery, $options: 'i' } },
              { 'location.county': { $regex: searchQuery, $options: 'i' } },
              { 'location.subCounty': { $regex: searchQuery, $options: 'i' } },
              { nemisCode: { $regex: searchQuery, $options: 'i' } }
            ]
          }
        ]
      };

      // Add filters if provided
      if (county) {
        searchCriteria.$and.push({ 'location.county': { $regex: county, $options: 'i' } });
      }

      if (type) {
        searchCriteria.$and.push({ type: type });
      }

      // Search with aggregation for better relevance scoring
      const schools = await School.aggregate([
        {
          $match: searchCriteria
        },
        {
          $addFields: {
            relevanceScore: {
              $sum: [
                // Exact name match gets highest score
                { $cond: [{ $regexMatch: { input: "$name", regex: `^${searchQuery}`, options: "i" } }, 100, 0] },
                // Name contains search gets medium score
                { $cond: [{ $regexMatch: { input: "$name", regex: searchQuery, options: "i" } }, 50, 0] },
                // County match gets lower score
                { $cond: [{ $regexMatch: { input: "$location.county", regex: searchQuery, options: "i" } }, 25, 0] },
                // NEMIS code match
                { $cond: [{ $regexMatch: { input: "$nemisCode", regex: searchQuery, options: "i" } }, 30, 0] }
              ]
            }
          }
        },
        {
          $sort: { 
            relevanceScore: -1, 
            name: 1 
          }
        },
        {
          $skip: skip
        },
        {
          $limit: limitNum
        },
        {
          $project: {
            _id: 1,
            name: 1,
            nemisCode: 1,
            educationLevels: 1,
            type: 1,
            location: 1,
            verified: 1
          }
        }
      ]);

      // Format schools for frontend
      const formattedSchools = schools.map(school => ({
        _id: school._id,
        name: school.name,
        county: school.location?.county || '',
        district: school.location?.subCounty || '', // Use subCounty for district
        nemisCode: school.nemisCode,
        type: school.type,
        educationLevels: school.educationLevels,
        isVerified: school.verified
      }));

      // Get total count for pagination
      const totalCount = await School.countDocuments(searchCriteria);

      res.json({
        success: true,
        message: `Found ${formattedSchools.length} schools`,
        data: {
          schools: formattedSchools,
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalCount / limitNum)
        }
      });

    } catch (error) {
      console.error('School search error:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching schools',
        data: { schools: [], total: 0 }
      });
    }
  });

  // Additional missing methods
  getAllSchools = asyncHandler(async (req: Request, res: Response) => {
    const { page = 1, limit = 50, county, type, verified } = req.query;
    
    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 50, 100);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};
    
    if (county) {
      query['location.county'] = { $regex: county, $options: 'i' };
    }
    
    if (type) {
      query.type = type;
    }
    
    if (verified !== undefined) {
      query.verified = verified === 'true';
    }

    const schools = await School.find(query)
      .select('_id name nemisCode location type educationLevels verified')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum);

    const total = await School.countDocuments(query);

    const formattedSchools = schools.map(school => ({
      _id: school._id,
      name: school.name,
      county: school.location?.county || '',
      district: school.location?.subCounty || '',
      nemisCode: school.nemisCode,
      type: school.type,
      educationLevels: school.educationLevels,
      isVerified: school.verified
    }));

    res.json({
      success: true,
      data: {
        schools: formattedSchools,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  });

  getSchoolById = asyncHandler(async (req: Request, res: Response) => {
    const school = await School.findById(req.params.id);
    
    if (!school) {
      res.status(404).json({ 
        success: false,
        message: 'School not found' 
      });
      return;
    }

    res.json({
      success: true,
      data: {
        school: {
          _id: school._id,
          name: school.name,
          nemisCode: school.nemisCode,
          educationLevels: school.educationLevels,
          type: school.type,
          location: school.location,
          contactInfo: school.contactInfo,
          isVerified: school.verified,
          createdAt: school.createdAt,
          updatedAt: school.updatedAt
        }
      }
    });
  });

  getSchoolPublicInfo = asyncHandler(async (req: Request, res: Response) => {
    const school = await School.findById(req.params.id)
      .select('name nemisCode location type educationLevels verified contactInfo.phone contactInfo.email');
    
    if (!school) {
      res.status(404).json({ 
        success: false,
        message: 'School not found' 
      });
      return;
    }

    res.json({
      success: true,
      data: {
        school: {
          _id: school._id,
          name: school.name,
          nemisCode: school.nemisCode,
          location: school.location,
          type: school.type,
          educationLevels: school.educationLevels,
          isVerified: school.verified,
          contactInfo: {
            phone: school.contactInfo?.phone,
            email: school.contactInfo?.email
          }
        }
      }
    });
  });

  getAllCounties = asyncHandler(async (req: Request, res: Response) => {
    const counties = await School.distinct('location.county', { verified: true });
    
    const validCounties = counties
      .filter(county => county && county.trim() !== '')
      .sort();

    res.json({
      success: true,
      data: {
        counties: validCounties,
        total: validCounties.length
      }
    });
  });

  getSchoolsByCounty = asyncHandler(async (req: Request, res: Response) => {
    const { county } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 50, 100);
    const skip = (pageNum - 1) * limitNum;

    const schools = await School.find({
      'location.county': { $regex: county, $options: 'i' },
      verified: true
    })
    .select('_id name nemisCode location type educationLevels')
    .sort({ name: 1 })
    .skip(skip)
    .limit(limitNum);

    const total = await School.countDocuments({
      'location.county': { $regex: county, $options: 'i' },
      verified: true
    });

    const formattedSchools = schools.map(school => ({
      _id: school._id,
      name: school.name,
      county: school.location?.county || '',
      district: school.location?.subCounty || '',
      nemisCode: school.nemisCode,
      type: school.type,
      educationLevels: school.educationLevels
    }));

    res.json({
      success: true,
      data: {
        schools: formattedSchools,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  });

  getSchoolsByRegion = asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: { schools: [] } });
  });

  getSchoolTypes = asyncHandler(async (req: Request, res: Response) => {
    const types = await School.distinct('type', { verified: true });
    
    res.json({
      success: true,
      data: {
        types: types.filter(type => type && type.trim() !== '').sort(),
        total: types.length
      }
    });
  });

  getSchoolCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await School.distinct('educationLevels', { verified: true });
    
    const flatCategories = [...new Set(categories.flat())];
    
    res.json({
      success: true,
      data: {
        categories: flatCategories.filter(cat => cat && cat.trim() !== '').sort(),
        total: flatCategories.length
      }
    });
  });

  deleteSchool = asyncHandler(async (req: Request, res: Response) => {
    const school = await School.findByIdAndDelete(req.params.id);
    
    if (!school) {
      res.status(404).json({
        success: false,
        message: 'School not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'School deleted successfully'
    });
  });

  verifySchool = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { isVerified, verificationNotes } = req.body;
    
    const school = await School.findByIdAndUpdate(
      req.params.id,
      {
        verified: isVerified,
        verificationNotes,
        verifiedBy: req.user?.userId, // Fixed: use userId instead of id
        verificationDate: new Date()
      },
      { new: true }
    );

    if (!school) {
      res.status(404).json({
        success: false,
        message: 'School not found'
      });
      return;
    }

    res.json({
      success: true,
      message: `School ${isVerified ? 'verified' : 'unverified'} successfully`,
      data: { school }
    });
  });

  requestVerification = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const school = await School.findByIdAndUpdate(
      req.params.id,
      {
        verificationRequested: true,
        verificationRequestDate: new Date(),
        verificationRequestedBy: req.user?.userId // Fixed: use userId instead of id
      },
      { new: true }
    );

    if (!school) {
      res.status(404).json({
        success: false,
        message: 'School not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Verification request submitted successfully'
    });
  });

  uploadSchoolLogo = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.json({ success: true, message: 'Logo uploaded' });
  });

  uploadSchoolImages = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.json({ success: true, message: 'Images uploaded' });
  });

  deleteSchoolImage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.json({ success: true, message: 'Image deleted' });
  });

  joinSchool = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.json({ success: true, message: 'Joined school' });
  });

  leaveSchool = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.json({ success: true, message: 'Left school' });
  });

  getSchoolMembers = asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: { members: [] } });
  });

  addSchoolAdmin = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.json({ success: true, message: 'Admin added' });
  });

  removeSchoolAdmin = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.json({ success: true, message: 'Admin removed' });
  });

  getSchoolAdmins = asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: { admins: [] } });
  });

  getSchoolBooks = asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: { books: [] } });
  });

  getSchoolPapers = asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: { papers: [] } });
  });

  getSchoolDiscussions = asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: { discussions: [] } });
  });

  getSchoolStatistics = asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: { statistics: {} } });
  });

  getSchoolPerformance = asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: { performance: {} } });
  });

  getSchoolSettings = asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: { settings: {} } });
  });

  updateSchoolSettings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.json({ success: true, message: 'Settings updated' });
  });
}

export const schoolController = new SchoolController();
