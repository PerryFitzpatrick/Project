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
        
        // Emit success event
        this.loginSuccess.emit({
          token: response.token,
          user: {
            email: this.loginData.email
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

  private resetForm() {
    this.loginData = { email: '', password: '' };
    this.registerData = { email: '', username: '', password: '', confirmPassword: '' };
    this.error = '';
    this.success = '';
  }
}
