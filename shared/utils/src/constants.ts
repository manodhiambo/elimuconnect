// libs/shared/utils/src/constants.ts
export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin'
} as const;

export const EDUCATION_LEVELS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary'
} as const;

export const SUBJECTS = {
  MATHEMATICS: 'Mathematics',
  ENGLISH: 'English',
  KISWAHILI: 'Kiswahili',
  SCIENCE: 'Science',
  SOCIAL_STUDIES: 'Social Studies',
  PHYSICS: 'Physics',
  CHEMISTRY: 'Chemistry',
  BIOLOGY: 'Biology',
  GEOGRAPHY: 'Geography',
  HISTORY: 'History',
  COMPUTER_SCIENCE: 'Computer Science',
  BUSINESS_STUDIES: 'Business Studies'
} as const;

export const KENYAN_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
  'Thika', 'Malindi', 'Kitale', 'Garissa', 'Kakamega',
  'Machakos', 'Meru', 'Nyeri', 'Kericho'
] as const;
