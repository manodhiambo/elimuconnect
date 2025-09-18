// File: shared/constants/src/education.ts

export const EDUCATION_LEVELS = {
  PRE_PRIMARY: 'pre_primary',
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  TERTIARY: 'tertiary',
  UNIVERSITY: 'university',
  VOCATIONAL: 'vocational'
} as const;

export const KENYAN_EDUCATION_SYSTEM = {
  PP1: 'PP1',
  PP2: 'PP2',
  GRADE_1: 'Grade 1',
  GRADE_2: 'Grade 2',
  GRADE_3: 'Grade 3',
  GRADE_4: 'Grade 4',
  GRADE_5: 'Grade 5',
  GRADE_6: 'Grade 6',
  GRADE_7: 'Grade 7',
  GRADE_8: 'Grade 8',
  GRADE_9: 'Grade 9',
  FORM_1: 'Form 1',
  FORM_2: 'Form 2',
  FORM_3: 'Form 3',
  FORM_4: 'Form 4'
} as const;

export const SUBJECTS = {
  MATHEMATICS: 'mathematics',
  ENGLISH: 'english',
  KISWAHILI: 'kiswahili',
  SCIENCE: 'science',
  SOCIAL_STUDIES: 'social_studies',
  CRE: 'cre',
  AGRICULTURE: 'agriculture',
  HOME_SCIENCE: 'home_science',
  ARTS_AND_CRAFTS: 'arts_and_crafts',
  PHYSICAL_EDUCATION: 'physical_education',
  BIOLOGY: 'biology',
  CHEMISTRY: 'chemistry',
  PHYSICS: 'physics',
  HISTORY: 'history',
  GEOGRAPHY: 'geography',
  BUSINESS_STUDIES: 'business_studies',
  COMPUTER_STUDIES: 'computer_studies',
  FRENCH: 'french',
  GERMAN: 'german',
  ARABIC: 'arabic'
} as const;

export const KENYAN_COUNTIES = [
  'Baringo',
  'Bomet',
  'Bungoma',
  'Busia',
  'Elgeyo-Marakwet',
  'Embu',
  'Garissa',
  'Homa Bay',
  'Isiolo',
  'Kajiado',
  'Kakamega',
  'Kericho',
  'Kiambu',
  'Kilifi',
  'Kirinyaga',
  'Kisii',
  'Kisumu',
  'Kitui',
  'Kwale',
  'Laikipia',
  'Lamu',
  'Machakos',
  'Makueni',
  'Mandera',
  'Marsabit',
  'Meru',
  'Migori',
  'Mombasa',
  'Murang\'a',
  'Nairobi',
  'Nakuru',
  'Nandi',
  'Narok',
  'Nyamira',
  'Nyandarua',
  'Nyeri',
  'Samburu',
  'Siaya',
  'Taita-Taveta',
  'Tana River',
  'Tharaka-Nithi',
  'Trans Nzoia',
  'Turkana',
  'Uasin Gishu',
  'Vihiga',
  'Wajir',
  'West Pokot'
] as const;

export const EXAM_TYPES = {
  CAT: 'cat',
  MIDTERM: 'midterm',
  ENDTERM: 'endterm',
  KCPE: 'kcpe',
  KCSE: 'kcse',
  MOCK: 'mock',
  REVISION: 'revision'
} as const;

export const SCHOOL_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  BOARDING: 'boarding',
  DAY: 'day',
  MIXED: 'mixed',
  BOYS_ONLY: 'boys_only',
  GIRLS_ONLY: 'girls_only'
} as const;
