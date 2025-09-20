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
  
  // Comprehensive list of Kenyan schools
  const schools = [
    // Nairobi County Schools
    {
      name: 'Alliance High School',
      nemisCode: 'AHS001',
      type: 'Public',
      level: 'Secondary',
      educationLevels: ['Secondary'],
      location: {
        county: 'Kiambu',
        subCounty: 'Kikuyu',
        ward: 'Kikuyu'
      },
      contactInfo: {
        email: 'info@alliancehigh.ac.ke',
        phone: '+254722123456'
      },
      verified: true
    },
    {
      name: 'Kenya High School',
      nemisCode: 'KHS001',
      type: 'Public',
      level: 'Secondary',
      educationLevels: ['Secondary'],
      location: {
        county: 'Nairobi',
        subCounty: 'Starehe',
        ward: 'Nairobi Central'
      },
      contactInfo: {
        email: 'admin@kenyahigh.ac.ke',
        phone: '+254733654321'
      },
      verified: true
    },
    {
      name: 'Starehe Boys Centre',
      nemisCode: 'SBC001',
      type: 'Private',
      level: 'Secondary',
      educationLevels: ['Secondary'],
      location: {
        county: 'Nairobi',
        subCounty: 'Starehe',
        ward: 'Nairobi Central'
      },
      contactInfo: {
        email: 'info@stareheboyscentre.ac.ke',
        phone: '+254700111222'
      },
      verified: true
    },
    {
      name: 'Loreto Convent Valley Road',
      nemisCode: 'LCV001',
      type: 'Private',
      level: 'Both',
      educationLevels: ['Primary', 'Secondary'],
      location: {
        county: 'Nairobi',
        subCounty: 'Westlands',
        ward: 'Westlands'
      },
      contactInfo: {
        email: 'info@loretovalleyroad.ac.ke',
        phone: '+254711222333'
      },
      verified: true
    },
    {
      name: 'Moi Girls High School Nairobi',
      nemisCode: 'MGN001',
      type: 'Public',
      level: 'Secondary',
      educationLevels: ['Secondary'],
      location: {
        county: 'Nairobi',
        subCounty: 'Starehe',
        ward: 'Nairobi Central'
      },
      contactInfo: {
        email: 'info@moigirlsnairobi.ac.ke',
        phone: '+254722333444'
      },
      verified: true
    },
    {
      name: 'Lenana School',
      nemisCode: 'LEN001',
      type: 'Public',
      level: 'Secondary',
      educationLevels: ['Secondary'],
      location: {
        county: 'Nairobi',
        subCounty: 'Lang\'ata',
        ward: 'Lang\'ata'
      },
      contactInfo: {
        email: 'info@lenanaschool.ac.ke',
        phone: '+254722666777'
      },
      verified: true
    },
    {
      name: 'Brookhouse School',
      nemisCode: 'BHS001',
      type: 'International',
      level: 'Both',
      educationLevels: ['Primary', 'Secondary'],
      location: {
        county: 'Nairobi',
        subCounty: 'Lang\'ata',
        ward: 'Karen'
      },
      contactInfo: {
        email: 'admissions@brookhouse.ac.ke',
        phone: '+254700777888'
      },
      verified: true
    },
    {
      name: 'St. Mary\'s School Nairobi',
      nemisCode: 'SMS001',
      type: 'Private',
      level: 'Both',
      educationLevels: ['Primary', 'Secondary'],
      location: {
        county: 'Nairobi',
        subCounty: 'Westlands',
        ward: 'Kitisuru'
      },
      contactInfo: {
        email: 'info@stmarysnairobi.ac.ke',
        phone: '+254711888999'
      },
      verified: true
    },
    {
      name: 'Precious Blood Riruta',
      nemisCode: 'PBR001',
      type: 'Private',
      level: 'Both',
      educationLevels: ['Primary', 'Secondary'],
      location: {
        county: 'Nairobi',
        subCounty: 'Dagoretti North',
        ward: 'Riruta'
      },
      contactInfo: {
        email: 'info@pbriruta.ac.ke',
        phone: '+254711555666'
      },
      verified: true
    },
    {
      name: 'Aga Khan High School',
      nemisCode: 'AKH001',
      type: 'Private',
      level: 'Secondary',
      educationLevels: ['Secondary'],
      location: {
        county: 'Nairobi',
        subCounty: 'Parklands',
        ward: 'Parklands'
      },
      contactInfo: {
        email: 'info@agakhanschool.ac.ke',
        phone: '+254722111333'
      },
      verified: true
    },

    // Kiambu County Schools
    {
      name: 'Mang\'u High School',
      nemisCode: 'MHS001',
      type: 'Public',
      level: 'Secondary',
      educationLevels: ['Secondary'],
      location: {
        county: 'Kiambu',
        subCounty: 'Thika West',
        ward: 'Kamenu'
      },
      contactInfo: {
        email: 'info@manguhigh.ac.ke',
        phone: '+254733444555'
      },
      verified: true
    },
    {
      name: 'Kiambu High School',
      nemisCode: 'KHS002',
      type: 'Public',
      level: 'Secondary',
      educationLevels: ['Secondary'],
      location: {
        county: 'Kiambu',
        subCounty: 'Kiambu',
        ward: 'Kiambu'
      },
      contactInfo: {
        email: 'info@kiambuhigh.ac.ke',
        phone: '+254722555666'
      },
      verified: true
    },
    {
      name: 'Thika High School',
      nemisCode: 'THS001',
      type: 'Public',
      level: 'Secondary',
      educationLevels: ['Secondary'],
      location: {
        county: 'Kiambu',
        subCounty: 'Thika Town',
        ward: 'Township'
      },
      contactInfo: {
        email: 'info@thikahigh.ac.ke',
        phone: '+254711777888'
      },
      verified: true
    },

    // Nakuru County Schools
    {
      name: 'Moi High School Kabarak',
      nemisCode: 'MHK001',
      type: 'Private',
      level: 'Secondary',
      educationLevels: ['Secondary'],
      location: {
        county: 'Nakuru',
        subCounty: 'Nakuru North',
        ward: 'Kabarak'
      },
      contactInfo: {
        email: 'info@kabarak.ac.ke',
        phone: '+254722999000'
      },
      verified: true
    },
    {
      name: 'Menengai High School',
      nemisCode: 'MEN001',
      type: 'Public',
      level: 'Secondary',
      educationLevels: ['Secondary'],
      location: {
        county: 'Nakuru',
        subCounty: 'Nakuru East',
        ward: 'Menengai'
      },
      contactInfo: {
        email: 'info@menengaihigh.ac.ke',
        phone: '+254733111222'
      },
      verified: true
    },

    // Meru County Schools
    {
      name: 'Meru School',
      nemisCode: 'MER001',
      type: 'Public',
      level: 'Secondary',
      educationLevels: ['Secondary'],
      location: {
        county: 'Meru',
        subCounty: 'Imenti South',
        ward: 'Meru'
      },
      contactInfo: {
        email: 'info@meruschool.ac.ke',
        phone: '+254733000111'
      },
      verified: true
    },
    {
      name: 'Chogoria Girls High School',
      nemisCode: 'CGH001',
      type: 'Public',
      level: 'Secondary',
      educationLevels: ['Secondary'],
      location: {
        county: 'Meru',
        subCounty: 'Maara',
        ward: 'Chogoria'
      },
      contactInfo: {
        email: 'info@chogoriagirlshigh.ac.ke',
        phone: '+254722333555'
      },
      verified: true
    },

    // Kisumu County Schools
    {
      name: 'Kisumu Day High School',
      nemisCode: 'KDH001',
      type: 'Public',
      level: 'Secondary',
      educationLevels: ['Secondary'],
      location: {
        county: 'Kisumu',
        subCounty: 'Kisumu Central',
        ward: 'Market Milimani'
      },
      contactInfo: {
        email: 'info@kisumudayhigh.ac.ke',
        phone: '+254700222333'
      },
      verified: true
    },
    {
      name: 'Tom Mboya Labour College',
      nemisCode: 'TML001',
      type: 'Public',
      level: 'Secondary',
      educationLevels: ['Secondary'],
      location: {
        county: 'Kisumu',
        subCounty: 'Kisumu East',
        ward: 'Kolwa East'
      },
      contactInfo: {
        email: 'info@tommboyacollege.ac.ke',
        phone: '+254711444555'
      },
      verified: true
    },

    // Mombasa County Schools
    {
      name: 'Mombasa Academy',
      nemisCode: 'MAC001',
      type: 'Private',
      level: 'Both',
      educationLevels: ['Primary', 'Secondary'],
      location: {
        county: 'Mombasa',
        subCounty: 'Nyali',
        ward: 'Frere Town'
      },
      contactInfo: {
        email: 'info@mombasaacademy.ac.ke',
        phone: '+254711333444'
      },
      verified: true
    },
    {
      name: 'Coast Girls High School',
      nemisCode: 'CGH002',
      type: 'Public',
      level: 'Secondary',
      educationLevels: ['Secondary'],
      location: {
        county: 'Mombasa',
        subCounty: 'Mvita',
        ward: 'Majengo'
      },
      contactInfo: {
        email: 'info@coastgirlshigh.ac.ke',
        phone: '+254722555777'
      },
      verified: true
    },

    // Uasin Gishu County Schools
    {
      name: 'Eldoret High School',
      nemisCode: 'EHS001',
      type: 'Public',
      level: 'Secondary',
      educationLevels: ['Secondary'],
      location: {
        county: 'Uasin Gishu',
        subCounty: 'Eldoret East',
        ward: 'Eldoret East'
      },
      contactInfo: {
        email: 'info@eldorethigh.ac.ke',
        phone: '+254722444555'
      },
      verified: true
    },
    {
      name: 'Moi University Secondary School',
      nemisCode: 'MUS001',
      type: 'Public',
      level: 'Secondary',
      educationLevels: ['Secondary'],
      location: {
        county: 'Uasin Gishu',
        subCounty: 'Eldoret East',
        ward: 'Kapsaret'
      },
      contactInfo: {
        email: 'info@muschool.ac.ke',
        phone: '+254733666777'
      },
      verified: true
    },

    // Machakos County Schools
    {
      name: 'Machakos School',
      nemisCode: 'MCS001',
      type: 'Public',
      level: 'Secondary',
      educationLevels: ['Secondary'],
      location: {
        county: 'Machakos',
        subCounty: 'Machakos',
        ward: 'Machakos Central'
      },
      contactInfo: {
        email: 'info@machakosschool.ac.ke',
        phone: '+254722777888'
      },
      verified: true
    },

    // Nyeri County Schools
    {
      name: 'Nyeri High School',
      nemisCode: 'NHS001',
      type: 'Public',
      level: 'Secondary',
      educationLevels: ['Secondary'],
      location: {
        county: 'Nyeri',
        subCounty: 'Nyeri Central',
        ward: 'Nyeri Town'
      },
      contactInfo: {
        email: 'info@nyerihigh.ac.ke',
        phone: '+254711888999'
      },
      verified: true
    },
    {
      name: 'Tumutumu Girls High School',
      nemisCode: 'TGH001',
      type: 'Public',
      level: 'Secondary',
      educationLevels: ['Secondary'],
      location: {
        county: 'Nyeri',
        subCounty: 'Mathira',
        ward: 'Konyu'
      },
      contactInfo: {
        email: 'info@tumutumugirlshigh.ac.ke',
        phone: '+254722999111'
      },
      verified: true
    },

    // Kakamega County Schools
    {
      name: 'Kakamega High School',
      nemisCode: 'KAK001',
      type: 'Public',
      level: 'Secondary',
      educationLevels: ['Secondary'],
      location: {
        county: 'Kakamega',
        subCounty: 'Lurambi',
        ward: 'Butsotso Central'
      },
      contactInfo: {
        email: 'info@kakamegahigh.ac.ke',
        phone: '+254733222333'
      },
      verified: true
    },

    // Kericho County Schools
    {
      name: 'Kericho High School',
      nemisCode: 'KER001',
      type: 'Public',
      level: 'Secondary',
      educationLevels: ['Secondary'],
      location: {
        county: 'Kericho',
        subCounty: 'Ainamoi',
        ward: 'Ainamoi'
      },
      contactInfo: {
        email: 'info@kerichohigh.ac.ke',
        phone: '+254722444666'
      },
      verified: true
    },

    // Primary Schools
    {
      name: 'Olympic Primary School',
      nemisCode: 'OPS001',
      type: 'Public',
      level: 'Primary',
      educationLevels: ['Primary'],
      location: {
        county: 'Nairobi',
        subCounty: 'Kibra',
        ward: 'Kibra'
      },
      contactInfo: {
        email: 'info@olympicprimary.ac.ke',
        phone: '+254711999000'
      },
      verified: true
    },
    {
      name: 'Kilimani Primary School',
      nemisCode: 'KPS001',
      type: 'Public',
      level: 'Primary',
      educationLevels: ['Primary'],
      location: {
        county: 'Nairobi',
        subCounty: 'Dagoretti North',
        ward: 'Kilimani'
      },
      contactInfo: {
        email: 'info@kilimaniprimary.ac.ke',
        phone: '+254722111444'
      },
      verified: true
    },
    {
      name: 'Parklands Primary School',
      nemisCode: 'PPS001',
      type: 'Public',
      level: 'Primary',
      educationLevels: ['Primary'],
      location: {
        county: 'Nairobi',
        subCounty: 'Westlands',
        ward: 'Parklands'
      },
      contactInfo: {
        email: 'info@parklandsprimary.ac.ke',
        phone: '+254733555666'
      },
      verified: true
    }
  ];
  
  // Insert schools in batches to avoid overwhelming the database
  const batchSize = 10;
  let createdCount = 0;
  
  for (let i = 0; i < schools.length; i += batchSize) {
    const batch = schools.slice(i, i + batchSize);
    
    try {
      // Check if schools already exist to avoid duplicates
      const existingSchools = await School.find({
        nemisCode: { $in: batch.map(school => school.nemisCode) }
      });
      
      const existingCodes = existingSchools.map(school => school.nemisCode);
      const newSchools = batch.filter(school => !existingCodes.includes(school.nemisCode));
      
      if (newSchools.length > 0) {
        await School.insertMany(newSchools);
        createdCount += newSchools.length;
        console.log(`Created ${newSchools.length} schools in batch ${Math.floor(i / batchSize) + 1}`);
      } else {
        console.log(`Batch ${Math.floor(i / batchSize) + 1}: All schools already exist`);
      }
      
    } catch (error) {
      console.error(`Error creating batch ${Math.floor(i / batchSize) + 1}:`, error);
    }
  }
  
  console.log(`\nDatabase seeding completed!`);
  console.log(`Total schools created: ${createdCount}`);
  console.log(`Total schools in database: ${await School.countDocuments()}`);
  
  // Display summary by county
  const countsByCounty = await School.aggregate([
    { $group: { _id: '$location.county', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  console.log('\nSchools by county:');
  countsByCounty.forEach(county => {
    console.log(`${county._id}: ${county.count} schools`);
  });
}

seedDatabase().catch(console.error);
