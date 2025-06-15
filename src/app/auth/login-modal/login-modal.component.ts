import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss']
})
export class LoginModalComponent {
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<any>();

  // Form data
  loginData = {
    email: '',
    password: ''
  };

  registerData = {
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  };

  // UI state
  activeTab: 'login' | 'register' = 'login';
  loading = false;
  error = '';
  success = '';

  private readonly apiBaseUrl = 'https://perry-api.sawatzky-perry.workers.dev';

  constructor(private http: HttpClient) {}

  onClose() {
    this.closeModal.emit();
    this.resetForm();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  switchTab(tab: 'login' | 'register') {
    this.activeTab = tab;
    this.resetForm();
  }

  async onLogin() {
    if (!this.loginData.email || !this.loginData.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      const response: any = await this.http.post(`${this.apiBaseUrl}/auth/login`, {
        email: this.loginData.email,
        password: this.loginData.password
      }).toPromise();

      if (response.status === 'success') {
        // Store token
        localStorage.setItem('authToken', response.token);
        this.success = 'Login successful!';
        
        // Decode JWT to get user info
        const userData = this.decodeJwt(response.token);
        
        // Emit success event with user data
        this.loginSuccess.emit({
          token: response.token,
          user: {
            username: userData?.username || this.loginData.email,
            email: userData?.email || this.loginData.email
          }
        });

        // Close modal after short delay
        setTimeout(() => {
          this.onClose();
        }, 1000);
      } else {
        this.error = response.message || 'Login failed';
      }
    } catch (error: any) {
      console.error('Login error:', error);
      this.error = error.error?.message || 'Login failed. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async onRegister() {
    if (!this.registerData.email || !this.registerData.username || !this.registerData.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    if (this.registerData.password.length < 6) {
      this.error = 'Password must be at least 6 characters long';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      const response: any = await this.http.post(`${this.apiBaseUrl}/auth/register`, {
        email: this.registerData.email,
        username: this.registerData.username,
        password: this.registerData.password
      }).toPromise();

      if (response.status === 'success') {
        this.success = 'Account created successfully! Please log in.';
        // Switch to login tab
        setTimeout(() => {
          this.activeTab = 'login';
          this.loginData.email = this.registerData.email;
          this.resetForm();
        }, 1500);
      } else {
        this.error = response.message || 'Registration failed';
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      this.error = error.error?.message || 'Registration failed. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  private decodeJwt(token: string): any {
    try {
      // JWT tokens have 3 parts separated by dots
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  private resetForm() {
    this.loginData = { email: '', password: '' };
    this.registerData = { email: '', username: '', password: '', confirmPassword: '' };
    this.error = '';
    this.success = '';
  }
}
