// shared/constants/src/education.ts
export const EDUCATION_LEVELS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary'
} as const;

export const PRIMARY_GRADES = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;
export const SECONDARY_GRADES = ['1', '2', '3', '4'] as const;

export const SUBJECTS = {
  PRIMARY: [
    'Mathematics',
    'English',
    'Kiswahili',
    'Science',
    'Social Studies',
    'Christian Religious Education',
    'Islamic Religious Education',
    'Hindu Religious Education',
    'Physical Education',
    'Music',
    'Art and Craft'
  ],
  SECONDARY: [
    'Mathematics',
    'English',
    'Kiswahili',
    'Biology',
    'Chemistry',
    'Physics',
    'Geography',
    'History',
    'Christian Religious Education',
    'Islamic Religious Education',
    'Business Studies',
    'Agriculture',
    'Home Science',
    'Computer Studies',
    'French',
    'German',
    'Arabic',
    'Music',
    'Art and Design',
    'Physical Education'
  ]
} as const;

export const EXAM_TYPES = {
  KCPE: 'Kenya Certificate of Primary Education',
  KCSE: 'Kenya Certificate of Secondary Education',
  CAT: 'Continuous Assessment Test',
  END_TERM: 'End of Term Exam',
  MOCK: 'Mock Examination',
  FORM_4_TRIAL: 'Form 4 Trial Examination'
} as const;

export const ACADEMIC_TERMS = {
  TERM_1: 'Term 1',
  TERM_2: 'Term 2',
  TERM_3: 'Term 3'
} as const;

export const ACHIEVEMENT_BADGES = {
  FIRST_LOGIN: {
    name: 'Welcome Aboard',
    description: 'Completed first login',
    icon: 'welcome',
    points: 10
  },
  BOOK_READER: {
    name: 'Book Worm',
    description: 'Read 10 books',
    icon: 'book',
    points: 50
  },
  QUIZ_MASTER: {
    name: 'Quiz Master',
    description: 'Completed 25 quizzes',
    icon: 'quiz',
    points: 75
  },
  HELPER: {
    name: 'Helpful Student',
    description: 'Helped 10 classmates',
    icon: 'help',
    points: 100
  },
  STREAK_WEEK: {
    name: 'Weekly Warrior',
    description: '7-day learning streak',
    icon: 'streak',
    points: 25
  },
  STREAK_MONTH: {
    name: 'Monthly Champion',
    description: '30-day learning streak',
    icon: 'champion',
    points: 100
  },
  TOP_SCORER: {
    name: 'Top Scorer',
    description: 'Scored 90% or above in 5 quizzes',
    icon: 'trophy',
    points: 150
  }
} as const;

export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
} as const;
