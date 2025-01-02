import { Gender, BMICategory } from './user.dto';

export interface UserProfileDto {
  userId: number;
  userName: string;
  surName: string;
  emailId: string;
  address: string | null;
  mobileNo: string | null;
  age: number;
  gender: Gender;
  height: number;
  weight: number;
  bmiIndex: number;
  bmiCategory: BMICategory;
  profilePicUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
} 