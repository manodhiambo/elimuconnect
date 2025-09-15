// libs/shared/utils/src/types.ts
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type EducationLevel = typeof EDUCATION_LEVELS[keyof typeof EDUCATION_LEVELS];
export type Subject = typeof SUBJECTS[keyof typeof SUBJECTS];
export type County = typeof KENYAN_COUNTIES[number];

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  school?: School;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface School {
  id: string;
  name: string;
  code: string;
  level: EducationLevel;
  county: County;
  verified: boolean;
}
