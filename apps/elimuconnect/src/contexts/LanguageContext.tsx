import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// Translation keys
const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    library: 'Library',
    pastPapers: 'Past Papers',
    forum: 'Forum',
    studyGroups: 'Study Groups',
    messages: 'Messages',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
    
    // Auth
    signInToAccount: 'Sign in to your account',
    signUpHere: 'Sign up here',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    signInHere: 'Sign in here',
    createAccount: 'Create Account',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    enterEmail: 'Enter your email',
    enterPassword: 'Enter your password',
    confirmYourPassword: 'Confirm your password',
    emailRequired: 'Email is required',
    emailInvalid: 'Please enter a valid email',
    passwordRequired: 'Password is required',
    passwordMinLength: 'Password must be at least 6 characters',
    confirmPasswordRequired: 'Please confirm your password',
    passwordsDoNotMatch: 'Passwords do not match',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    signIn: 'Sign In',
    tryDemo: 'Try Demo Accounts',
    loginAs: 'Login as',
    termsAndConditions: 'By continuing, you agree to our Terms of Service and Privacy Policy',
    
    // Registration
    basicInformation: 'Basic Information',
    schoolInformation: 'School Information',
    securitySettings: 'Security Settings',
    firstName: 'First Name',
    lastName: 'Last Name',
    phoneNumber: 'Phone Number',
    role: 'Role',
    firstNameRequired: 'First name is required',
    lastNameRequired: 'Last name is required',
    enterFirstName: 'Enter your first name',
    enterLastName: 'Enter your last name',
    phoneRequired: 'Phone number is required',
    roleRequired: 'Please select a role',
    selectRole: 'Select your role',
    student: 'Student',
    teacher: 'Teacher',
    admin: 'Admin',
    searchSchool: 'Search School',
    typeSchoolName: 'Type school name to search',
    searchingSchools: 'Searching schools...',
    schoolRequired: 'Please select a school',
    level: 'Level',
    grade: 'Grade',
    studentId: 'Student ID',
    tscNumber: 'TSC Number',
    levelRequired: 'Please select a level',
    gradeRequired: 'Please select a grade',
    studentIdRequired: 'Student ID is required',
    tscNumberRequired: 'TSC number is required',
    enterStudentId: 'Enter your student ID',
    enterTscNumber: 'Enter your TSC number',
    selectLevel: 'Select level',
    selectGrade: 'Select grade',
    primary: 'Primary',
    secondary: 'Secondary',
    agreeToTerms: 'I agree to the',
    termsOfService: 'Terms of Service',
    and: 'and',
    privacyPolicy: 'Privacy Policy',
    mustAgreeTerms: 'You must agree to the terms',
    registrationHelp: 'Need help with registration? Contact support.',
    
    // Dashboard
    welcome: 'Welcome',
    readyToLearn: 'Ready to learn today?',
    points: 'points',
    dayStreak: 'day streak',
    currentTime: 'Current Time',
    quickActions: 'Quick Actions',
    recentActivity: 'Recent Activity',
    noRecentActivity: 'No recent activity yet. Start learning!',
    studyProgress: 'Study Progress',
    weeklyGoal: 'Weekly Goal',
    booksRead: 'Books Read',
    testsCompleted: 'Tests Completed',
    studyHours: 'Study Hours',
    achievements: 'Achievements',
    upcomingDeadlines: 'Upcoming Deadlines',
    noUpcomingDeadlines: 'No upcoming deadlines',
    keepItUp: 'Keep it up!',
    
    // Notifications
    notifications: 'Notifications',
    markAllRead: 'Mark all read',
    noNotifications: 'No notifications yet',
    viewAllNotifications: 'View all notifications',
    justNow: 'Just now',
    minutesAgo: 'm ago',
    hoursAgo: 'h ago',
    daysAgo: 'd ago',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    download: 'Download',
    upload: 'Upload',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    
    // Actions
    browseLibrary: 'Browse Library',
    joinDiscussion: 'Join Discussion',
    changeLanguage: 'Change Language',
    toggleTheme: 'Toggle Theme',
    
    // Achievements
    firstLogin: 'First Login',
    bookworm: 'Bookworm',
    socialLearner: 'Social Learner',
    weekWarrior: 'Week Warrior',
  },
  
  sw: {
    // Navigation
    dashboard: 'Dashibodi',
    library: 'Maktaba',
    pastPapers: 'Karatasi za Zamani',
    forum: 'Jukwaa',
    studyGroups: 'Vikundi vya Masomo',
    messages: 'Ujumbe',
    profile: 'Profaili',
    settings: 'Mipangilio',
    logout: 'Ondoka',
    login: 'Ingia',
    register: 'Jisajili',
    
    // Auth
    signInToAccount: 'Ingia kwenye akaunti yako',
    signUpHere: 'Jisajili hapa',
    dontHaveAccount: 'Huna akaunti?',
    email: 'Barua pepe',
    password: 'Nywila',
    enterEmail: 'Ingiza barua pepe yako',
    enterPassword: 'Ingiza nywila yako',
    emailRequired: 'Barua pepe inahitajika',
    emailInvalid: 'Tafadhali ingiza barua pepe halali',
    passwordRequired: 'Nywila inahitajika',
    passwordMinLength: 'Nywila lazima iwe na angalau herufi 6',
    rememberMe: 'Nikumbuke',
    forgotPassword: 'Umesahau nywila?',
    signIn: 'Ingia',
    tryDemo: 'Jaribu Akaunti za Onyesho',
    loginAs: 'Ingia kama',
    termsAndConditions: 'Kwa kuendelea, unakubali Sheria zetu za Huduma na Sera ya Faragha',
    
    // Dashboard
    welcome: 'Karibu',
    readyToLearn: 'Uko tayari kujifunza leo?',
    points: 'alama',
    dayStreak: 'siku za mfululizo',
    currentTime: 'Wakati wa Sasa',
    quickActions: 'Vitendo vya Haraka',
    recentActivity: 'Shughuli za Karibuni',
    noRecentActivity: 'Hakuna shughuli za karibuni. Anza kujifunza!',
    studyProgress: 'Maendeleo ya Masomo',
    weeklyGoal: 'Lengo la Kila Wiki',
    booksRead: 'Vitabu Vilivyosomwa',
    testsCompleted: 'Mitihani Iliyokamilika',
    studyHours: 'Masaa ya Masomo',
    achievements: 'Mafanikio',
    upcomingDeadlines: 'Tarehe za Mwisho Zinazokuja',
    noUpcomingDeadlines: 'Hakuna tarehe za mwisho zinazokuja',
    keepItUp: 'Endelea hivyo!',
    
    // Common
    loading: 'Inapakia...',
    error: 'Hitilafu',
    success: 'Mafanikio',
    save: 'Hifadhi',
    cancel: 'Ghairi',
    delete: 'Futa',
    edit: 'Hariri',
    view: 'Ona',
    download: 'Pakua',
    upload: 'Pakia',
    search: 'Tafuta',
    filter: 'Chuja',
    sort: 'Panga',
    back: 'Rudi',
    next: 'Ijayo',
    previous: 'Iliyotangulia',
    
    // Actions
    browseLibrary: 'Vinjari Maktaba',
    joinDiscussion: 'Jiunge na Mjadala',
    changeLanguage: 'Badilisha Lugha',
    toggleTheme: 'Badilisha Mandhari',
    
    // Achievements
    firstLogin: 'Kuingia kwa Kwanza',
    bookworm: 'Mpenzi wa Vitabu',
    socialLearner: 'Mjifunzaji wa Kijamii',
    weekWarrior: 'Shujaa wa Wiki',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Get language from localStorage or default to 'en'
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
    translations: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
