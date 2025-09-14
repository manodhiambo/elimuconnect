import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import { School } from '../models/School';
import { User } from '../models/User';
import { UserRole, EducationLevel } from '@elimuconnect/shared/types';
import { logger } from '@elimuconnect/shared/utils';

dotenv.config();

async function seedDatabase() {
  try {
    await connectDatabase();
    
    logger.info('🌱 Starting database seeding...');

    // Seed some schools
    const schools = [
      {
        name: 'Starehe Boys Centre',
        code: '01010001',
        level: [EducationLevel.SECONDARY],
        county: 'Nairobi',
        district: 'Starehe',
        verified: true,
        contact: {
          phone: '+254712345678',
          email: 'info@stareheboyscentre.ac.ke'
        }
      },
      {
        name: 'Alliance High School',
        code: '01010002',
        level: [EducationLevel.SECONDARY],
        county: 'Kiambu',
        district: 'Kikuyu',
        verified: true,
        contact: {
          phone: '+254712345679',
          email: 'info@alliancehigh.ac.ke'
        }
      },
      {
        name: 'Jamhuri High School',
        code: '01010003',
        level: [EducationLevel.SECONDARY],
        county: 'Nairobi',
        district: 'Embakasi',
        verified: true,
        contact: {
          phone: '+254712345680',
          email: 'info@jamhurihigh.ac.ke'
        }
      }
    ];

    for (const schoolData of schools) {
      const existingSchool = await School.findOne({ code: schoolData.code });
      if (!existingSchool) {
        await School.create(schoolData);
        logger.info(`✅ Created school: ${schoolData.name}`);
      }
    }

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@elimuconnect.com' });
    if (!adminExists) {
      await User.create({
        email: 'admin@elimuconnect.com',
        password: 'Admin123!@#',
        role: UserRole.ADMIN,
        verified: true,
        profile: {
          firstName: 'System',
          lastName: 'Administrator',
          level: EducationLevel.SECONDARY,
          grade: '4',
          subjects: []
        },
        verification: {
          adminCode: 'ADMIN001'
        },
        preferences: {
          language: 'en',
          theme: 'light',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        },
        progress: {
          totalPoints: 0,
          badges: [],
          streakDays: 0,
          booksRead: 0,
          testsCompleted: 0,
          level: 1,
          experience: 0
        }
      });
      logger.info('✅ Created admin user: admin@elimuconnect.com');
    }

    logger.info('🎉 Database seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
