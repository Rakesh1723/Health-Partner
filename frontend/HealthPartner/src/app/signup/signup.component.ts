import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserRegistrationDto, Gender } from '../models/user-registration.dto';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  passwordStrength = {
    strength: '' 
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.signupForm = this.fb.group({
      userName: ['', [Validators.required]],
      surName: ['', [Validators.required]],
      emailId: ['', [Validators.required, Validators.email]],
      age: ['', [Validators.required, Validators.min(1)]],
      gender: ['', Validators.required],
      height: ['', [Validators.required, Validators.min(1)]],
      weight: ['', [Validators.required, Validators.min(1)]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        this.passwordValidator()
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });

 
    this.signupForm.get('password')?.valueChanges.subscribe(password => {
      this.checkPasswordStrength(password);
    });
  }

  ngOnInit(): void {}

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  onSubmit() {
    if (this.signupForm.valid) {
      const registrationData: UserRegistrationDto = {
        userName: this.signupForm.value.userName,
        surName: this.signupForm.value.surName,
        password: this.signupForm.value.password,
        emailId: this.signupForm.value.emailId,
        age: this.signupForm.value.age,
        gender: this.signupForm.value.gender,
        height: this.signupForm.value.height,
        weight: this.signupForm.value.weight,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.http.post('http://localhost:9000/signup', registrationData)
        .subscribe({
          next: (response) => {
            alert('Registration successful! Please login.');
            this.router.navigate(['/login']);
          },
          error: (error) => {
            alert('Registration failed. Please try again.');
          }
        });
    }
  }

  private passwordValidator() {
    return (control: any) => {
      const password = control.value;
      if (!password) {
        return { required: true };
      }
      
      const hasLetter = /[a-zA-Z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      
      if (!hasLetter || !hasNumber || !hasSpecial) {
        return { weakPassword: true };
      }
      
      return null;
    };
  }

  private checkPasswordStrength(password: string) {
    if (!password) {
      this.passwordStrength.strength = '';
      return;
    }

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (hasLetter && hasNumber && hasSpecial) {
      this.passwordStrength.strength = 'strong';
    } else if ((hasLetter && hasNumber) || (hasLetter && hasSpecial) || (hasNumber && hasSpecial)) {
      this.passwordStrength.strength = 'medium';
    } else {
      this.passwordStrength.strength = 'weak';
    }
  }
}
