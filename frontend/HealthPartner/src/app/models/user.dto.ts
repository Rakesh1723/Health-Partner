export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY'
}

export enum BMICategory {
  UNDERWEIGHT = 'UNDERWEIGHT',
  NORMAL = 'NORMAL',
  OVERWEIGHT = 'OVERWEIGHT',
  OBESITY = 'OBESITY'
}

export interface UserDto {
  userId: number;
  userName: string;
  surName: string;
  emailId: string;
  password: string;
  address: string | null;
  mobileNo: string | null;
  age: number;
  gender: string;
  height: number;
  weight: number;
  bmiIndex: number;
  bmiCategory: string;
  profilePicUrl: string | null;
  createdAt: string;
  updatedAt: string;
} 