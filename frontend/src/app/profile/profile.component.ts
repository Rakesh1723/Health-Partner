import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from '../shared/nav-bar/nav-bar.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserDto } from '../models/user.dto';
import { UserProfileDto } from '../models/user-profile.dto';
import { Gender, BMICategory } from '../models/user.dto';
import { firstValueFrom } from 'rxjs';

const API_URL = 'http://localhost:9000/api/v1/users';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [CommonModule, NavBarComponent, FormsModule],
})
export class ProfileComponent implements OnInit {
  isEditing = false;
  profileImageUrl = 'assets/default-profile.jpg';
  Gender = Gender;

  profileData: UserProfileDto = {
    userId: 0,
    userName: '',
    surName: '',
    emailId: '',
    address: '',
    mobileNo: '',
    age: 0,
    gender: Gender.PREFER_NOT_TO_SAY,
    height: 0,
    weight: 0,
    bmiIndex: 0,
    bmiCategory: BMICategory.NORMAL,
    profilePicUrl: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  private originalProfileData: UserProfileDto | null = null;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  async loadUserProfile() {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        this.router.navigate(['/login']);
        return;
      }

      this.http.get<UserDto>(`${API_URL}/${userId}`).subscribe({
        next: (response) => {
          console.log('API Response:', response);
          this.profileData = {
            userId: response.userId,
            userName: response.userName,
            surName: response.surName,
            emailId: response.emailId,
            mobileNo: response.mobileNo || '',
            age: response.age || 0,
            gender: this.mapGender(response.gender),
            height: response.height || 0,
            weight: response.weight || 0,
            bmiIndex: response.bmiIndex || 0,
            bmiCategory: this.mapBMICategory(response.bmiCategory || 'NORMAL'),
            address: response.address || '',
            profilePicUrl: response.profilePicUrl || '',
            createdAt: new Date(response.createdAt),
            updatedAt: new Date(response.updatedAt),
          };
          console.log('Mapped Profile Data:', this.profileData);
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
        },
      });
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
  }

  mapGender(gender: string | undefined): Gender {
    if (!gender) return Gender.PREFER_NOT_TO_SAY;
    const upperGender = gender.toUpperCase();
    switch (upperGender) {
      case 'MALE':
        return Gender.MALE;
      case 'FEMALE':
        return Gender.FEMALE;
      case 'PREFER_NOT_TO_SAY':
        return Gender.PREFER_NOT_TO_SAY;
      default:
        return Gender.PREFER_NOT_TO_SAY;
    }
  }

  mapBMICategory(category: string): BMICategory {
    switch (category.toUpperCase()) {
      case 'UNDERWEIGHT':
        return BMICategory.UNDERWEIGHT;
      case 'NORMAL':
        return BMICategory.NORMAL;
      case 'OVERWEIGHT':
        return BMICategory.OVERWEIGHT;
      case 'OBESITY':
        return BMICategory.OBESITY;
      default:
        return BMICategory.NORMAL;
    }
  }

  calculateBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'UNDERWEIGHT';
    if (bmi < 25) return 'NORMAL';
    if (bmi < 30) return 'OVERWEIGHT';
    return 'OBESITY';
  }

  onHeightWeightChange() {
    if (this.profileData.height && this.profileData.weight) {
      const heightInMeters = this.profileData.height;
      this.profileData.bmiIndex = Number(
        (this.profileData.weight / (heightInMeters * heightInMeters)).toFixed(1)
      );
      this.profileData.bmiCategory = this.mapBMICategory(
        this.calculateBMICategory(this.profileData.bmiIndex)
      );
    }
  }

  toggleEdit() {
    if (!this.isEditing) {
      
      this.originalProfileData = { ...this.profileData };
    } else {
      
      if (this.originalProfileData) {
        this.profileData = { ...this.originalProfileData };
      }
    }
    this.isEditing = !this.isEditing;
  }

  async saveChanges() {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        this.router.navigate(['/login']);
        return;
      }

      const updatedProfile = {
        userId: this.profileData.userId,
        userName: this.profileData.userName,
        surName: this.profileData.surName,
        emailId: this.profileData.emailId,
        address: this.profileData.address,
        mobileNo: this.profileData.mobileNo,
        age: this.profileData.age,
        gender: Gender[this.profileData.gender],
        height: this.profileData.height,
        weight: this.profileData.weight,
        bmiIndex: this.profileData.bmiIndex,
        bmiCategory: this.profileData.bmiCategory.toString(),
        profilePicUrl: this.profileData.profilePicUrl,
        createdAt: this.profileData.createdAt,
        updatedAt: new Date(),
      };

      console.log('Update Request Body:', updatedProfile);

      this.http
        .put<UserProfileDto>(
          `${API_URL}/updateProfile/${userId}`,
          updatedProfile
        )
        .subscribe({
          next: (response) => {
            console.log('Profile update response:', response);
            this.profileData = {
              ...response,
              gender: this.mapGender(response.gender),
              bmiCategory: this.mapBMICategory(response.bmiCategory),
            };
            this.isEditing = false;
          },
          error: (error) => {
            console.error('Error updating profile:', error);
          },
        });
    } catch (error) {
      console.error('Error in saveChanges:', error);
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  getBMINeedleRotation(): number {
    const minBMI = 15;
    const maxBMI = 35;
    const degrees =
      ((this.profileData.bmiIndex - minBMI) / (maxBMI - minBMI)) * 270;
    return Math.min(Math.max(degrees, 0), 270);
  }

  private async getUserId(): Promise<number> {
    try {
      const token = sessionStorage.getItem('hp-token');
      if (!token) {
        throw new Error('No token found');
      }

      const userEmail = await firstValueFrom(
        this.http.get(`http://localhost:9000/jwtToken/${token}`, { 
          responseType: 'text'
        })
      );

      if (!userEmail) {
        throw new Error('No email found');
      }

      const userId = await firstValueFrom(
        this.http.get<number>(`http://localhost:9000/api/v1/users/userId/${userEmail}`)
      );

      if (userId === undefined || userId === null) {
        throw new Error('No user ID found');
      }

      return userId;
    } catch (error) {
      console.error('Error getting user ID:', error);
      this.router.navigate(['/login']);
      return 0;
    }
  }
}
