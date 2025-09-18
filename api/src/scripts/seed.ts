import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { UserRole, EducationLevel } from '../models/User';
import School from '../models/School';

dotenv.config();

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.DATABASE_URL!);
    console.log('Connected to database');

    // Clear existing data
    await User.deleteMany({});
    await School.deleteMany({});

    // Create sample schools
    const schools = await School.create([
      {
        name: 'Nairobi High School',
        code: 'NHS001',
        level: 'Secondary',
        county: 'Nairobi',
        district: 'Nairobi Central'
      },
      {
        name: 'Mombasa Primary School', 
        code: 'MPS001',
        level: 'Primary',
        county: 'Mombasa',
        district: 'Mombasa Central'
      }
    ]);

    // Create admin user
    const admin = await User.create({
      email: 'admin@elimuconnect.com',
      password: 'admin123',
      role: UserRole.ADMIN,
      verified: true,
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        level: EducationLevel.SECONDARY,
        subjects: ['Mathematics', 'Science']
      }
    });

    console.log('Database seeded successfully');
    console.log('Admin user created:', admin.email);

  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
