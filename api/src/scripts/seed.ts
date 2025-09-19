import { User, UserRole, EducationLevel } from '../models/User';
import { School } from '../models/School';
import { connectDB } from '../config/database';

async function seedDatabase() {
  await connectDB();
  
  console.log('Seeding database...');
  
  // Create sample users
  const user = new User({
    email: 'admin@elimuconnect.com',
    password: 'hashedpassword',
    role: UserRole.ADMIN,
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      level: EducationLevel.SECONDARY
    }
  });
  
  await user.save();
  console.log('Sample user created');
  
  // Create sample school
  const school = new School({
    name: 'Sample High School',
    nemisCode: 'SHS001',
    type: 'Public',
    level: 'Secondary',
    educationLevels: ['Secondary'],
    location: {
      county: 'Nairobi',
      subCounty: 'Westlands',
      ward: 'Parklands'
    },
    contactInfo: {
      email: 'info@samplehs.ac.ke'
    }
  });
  
  await school.save();
  console.log('Sample school created');
}

seedDatabase().catch(console.error);
