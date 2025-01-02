import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Modal } from 'bootstrap';

interface JwtToken {
  jwtToken: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  resetPasswordForm: FormGroup;
  modal: Modal | undefined;
  showPassword = false;
  loginError: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      userEmail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.resetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
   
    const modalElement = document.getElementById('forgotPasswordModal');
    if (modalElement) {
      this.modal = new Modal(modalElement);
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null
      : { passwordMismatch: true };
  }

  openForgotPasswordModal(event: Event) {
    event.preventDefault();
    this.modal?.show();
  }

  onResetPassword() {
    if (this.resetPasswordForm.valid) {
      const email = this.resetPasswordForm.get('email')?.value;
      const newPassword = this.resetPasswordForm.get('newPassword')?.value;

    
      this.http.put(`http://localhost:9000/updatePassword/${email}/${newPassword}`, {})
        .subscribe({
          next: (response) => {
           
            alert('Password updated successfully');
            this.modal?.hide();
            this.resetPasswordForm.reset();
           
            this.loginForm.reset();
          },
          error: (error) => {
          
            alert('Failed to update password. Please try again.');
            console.error('Error updating password:', error);
          }
        });
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Login Data:', this.loginForm.value);
      
      const apiUrl = 'http://localhost:9000/login';
      
      this.http.post<JwtToken>(apiUrl, this.loginForm.value).subscribe({
        next: (response) => {
          console.log('Login Success:', response.jwtToken);
          this.loginError = '';
          sessionStorage.setItem('hp-token',response.jwtToken);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Login failed:', error);
          this.loginError = 'Invalid credentials';
          this.loginForm.get('password')?.setValue('');
        }
      });
    } else {
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
