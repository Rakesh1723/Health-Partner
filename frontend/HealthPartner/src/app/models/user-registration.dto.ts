export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export interface UserRegistrationDto {
  userName: string;
  surName: string;
  password: string;
  emailId: string;
  age: number;
  gender: Gender;
  height: number;
  weight: number;
  createdAt?: Date;
  updatedAt?: Date;
} 