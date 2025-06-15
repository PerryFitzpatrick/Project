import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginModalComponent } from '../auth/login-modal/login-modal.component';
import { UserProfileModalComponent } from '../auth/user-profile-modal/user-profile-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule, LoginModalComponent, UserProfileModalComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  isLoggedIn = false;
  currentUser: any = null;
  showLoginModal = false;
  showUserProfileModal = false;
  response = '';
  uploadStatus = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check if user is already logged in
    this.checkAuthStatus();
  }

  hey() {
    console.log('Hey!');
  }

  callBackend() {
    this.http.get('https://perry-api.sawatzky-perry.workers.dev/hello', { responseType: 'text' })
      .subscribe({
        next: (data) => {
          this.response = data;
        },
        error: (error) => {
          console.error('Error:', error);
          this.response = 'Error calling backend';
        }
      });
  }

  navigateToAbout() {
    this.router.navigate(['/about']);
  }

  openLoginModal() {
    console.log('openLoginModal called');
    this.showLoginModal = true;
  }

  closeLoginModal() {
    this.showLoginModal = false;
  }

  openUserProfileModal() {
    console.log('openUserProfileModal called');
    console.log('Current showUserProfileModal:', this.showUserProfileModal);
    console.log('Current user:', this.currentUser);
    this.showUserProfileModal = true;
    console.log('New showUserProfileModal:', this.showUserProfileModal);
  }

  closeUserProfileModal() {
    console.log('closeUserProfileModal called');
    this.showUserProfileModal = false;
  }

  onLoginSuccess(userData: any) {
    console.log('onLoginSuccess called with:', userData);
    this.isLoggedIn = true;
    this.currentUser = userData.user;
    this.showLoginModal = false;
    console.log('Login successful:', userData);
  }

  onUserUpdated(user: any) {
    this.currentUser = user;
    console.log('User updated:', user);
  }

  logout() {
    localStorage.removeItem('authToken');
    this.isLoggedIn = false;
    this.currentUser = null;
  }

  handleUpload() {
    console.log('Upload button clicked! User:', this.currentUser?.username);
    // TODO: Implement actual file upload functionality
  }

  handleFileUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      this.uploadStatus = 'Please select an image file';
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.uploadStatus = 'File size must be less than 5MB';
      return;
    }

    this.uploadStatus = 'Uploading...';
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', this.currentUser?.username || '');

    this.http.post('https://perry-click-backend.pfitzpatrick.workers.dev/upload', formData)
      .subscribe({
        next: (response: any) => {
          this.uploadStatus = 'Upload successful!';
          console.log('Upload response:', response);
          // Clear the file input
          event.target.value = '';
          // Clear status after 3 seconds
          setTimeout(() => {
            this.uploadStatus = '';
          }, 3000);
        },
        error: (error) => {
          this.uploadStatus = 'Upload failed: ' + (error.error?.message || 'Unknown error');
          console.error('Upload error:', error);
          // Clear status after 5 seconds
          setTimeout(() => {
            this.uploadStatus = '';
          }, 5000);
        }
      });
  }

  private checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        // Decode JWT token to get user info
        const userData = this.decodeJwt(token);
        if (userData && userData.username) {
          this.isLoggedIn = true;
          this.currentUser = {
            username: userData.username,
            email: userData.email
          };
          console.log('User logged in:', this.currentUser);
        }
      } catch (error) {
        console.error('Error decoding JWT:', error);
        // If token is invalid, remove it
        localStorage.removeItem('authToken');
      }
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
} 