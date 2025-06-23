import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginModalComponent } from '../auth/login-modal/login-modal.component';
import { UserProfileModalComponent } from '../auth/user-profile-modal/user-profile-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, LoginModalComponent, UserProfileModalComponent],
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
  
  // Bunny.net upload properties
  bunnyUploadStatus = '';
  bunnyUploadStatusClass = '';
  
  // Email properties
  emailMessage = '';
  emailSending = false;
  emailStatus = '';
  emailStatusClass = '';
  
  // Email Photos properties
  photoRecipientEmail = '';
  photoEmailMessage = '';
  emailingPhotos = false;
  photoEmailStatus = '';
  photoEmailStatusClass = '';

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

    this.http.post('https://perry-api.sawatzky-perry.workers.dev/upload', formData)
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

  handleBunnyFileUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type - allow more formats for Bunny.net
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'image/webp',
      'image/heic', 'image/heif', 'image/cr2', 'image/nef', 'image/arw', 'image/dng',
      'video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/wmv', 'video/flv', 'video/webm',
      'video/m4v', 'video/3gp', 'video/mts', 'video/m2ts', 'video/ts'
    ];

    if (!allowedTypes.includes(file.type.toLowerCase())) {
      this.bunnyUploadStatus = 'Please select a supported photo or video file';
      this.bunnyUploadStatusClass = 'error';
      return;
    }

    // Check file size (max 100MB for Bunny.net)
    if (file.size > 100 * 1024 * 1024) {
      this.bunnyUploadStatus = 'File size must be less than 100MB';
      this.bunnyUploadStatusClass = 'error';
      return;
    }

    this.bunnyUploadStatus = 'Uploading to Bunny.net...';
    this.bunnyUploadStatusClass = 'loading';
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', this.currentUser?.username || '');

    this.http.post('https://perry-api.sawatzky-perry.workers.dev/bunny-upload', formData)
      .subscribe({
        next: (response: any) => {
          this.bunnyUploadStatus = 'Upload successful! File available at: ' + response.cdnUrl;
          this.bunnyUploadStatusClass = 'success';
          console.log('Bunny.net upload response:', response);
          // Clear the file input
          event.target.value = '';
          // Clear status after 8 seconds (longer to show CDN URL)
          setTimeout(() => {
            this.bunnyUploadStatus = '';
            this.bunnyUploadStatusClass = '';
          }, 8000);
        },
        error: (error) => {
          this.bunnyUploadStatus = 'Upload failed: ' + (error.error?.message || 'Unknown error');
          this.bunnyUploadStatusClass = 'error';
          console.error('Bunny.net upload error:', error);
          // Clear status after 5 seconds
          setTimeout(() => {
            this.bunnyUploadStatus = '';
            this.bunnyUploadStatusClass = '';
          }, 5000);
        }
      });
  }

  sendEmail() {
    if (!this.emailMessage.trim()) {
      return;
    }

    this.emailSending = true;
    this.emailStatus = 'Sending email...';
    this.emailStatusClass = 'loading';

    const emailData = {
      message: this.emailMessage
    };

    // Call the Go backend email endpoint
    this.http.post('http://localhost:8080/email', emailData)
      .subscribe({
        next: (response: any) => {
          this.emailSending = false;
          if (response.success) {
            this.emailStatus = 'Email sent successfully!';
            this.emailStatusClass = 'success';
            this.emailMessage = ''; // Clear the message
          } else {
            this.emailStatus = 'Failed to send email: ' + response.message;
            this.emailStatusClass = 'error';
          }
          
          // Clear status after 5 seconds
          setTimeout(() => {
            this.emailStatus = '';
            this.emailStatusClass = '';
          }, 5000);
        },
        error: (error) => {
          this.emailSending = false;
          this.emailStatus = 'Failed to send email: ' + (error.error?.message || 'Network error');
          this.emailStatusClass = 'error';
          console.error('Email error:', error);
          
          // Clear status after 5 seconds
          setTimeout(() => {
            this.emailStatus = '';
            this.emailStatusClass = '';
          }, 5000);
        }
      });
  }

  emailPhotos() {
    if (!this.photoRecipientEmail.trim() || !this.photoEmailMessage.trim()) {
      return;
    }

    this.emailingPhotos = true;
    this.photoEmailStatus = 'Sending photos...';
    this.photoEmailStatusClass = 'loading';

    const emailData = {
      recipientEmail: this.photoRecipientEmail,
      message: this.photoEmailMessage
    };

    // Get the auth token
    const token = localStorage.getItem('authToken');
    if (!token) {
      this.photoEmailStatus = 'Authentication required';
      this.photoEmailStatusClass = 'error';
      this.emailingPhotos = false;
      return;
    }

    // Call the Cloudflare Worker email photos endpoint
    this.http.post('https://perry-api.sawatzky-perry.workers.dev/email-photos', emailData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .subscribe({
        next: (response: any) => {
          this.emailingPhotos = false;
          if (response.status === 'success') {
            this.photoEmailStatus = `Photos emailed successfully! (${response.photosCount} photos sent)`;
            this.photoEmailStatusClass = 'success';
            this.photoRecipientEmail = ''; // Clear the email
            this.photoEmailMessage = ''; // Clear the message
          } else {
            this.photoEmailStatus = 'Failed to send photos: ' + response.message;
            this.photoEmailStatusClass = 'error';
          }
          
          // Clear status after 8 seconds (longer to show photo count)
          setTimeout(() => {
            this.photoEmailStatus = '';
            this.photoEmailStatusClass = '';
          }, 8000);
        },
        error: (error) => {
          this.emailingPhotos = false;
          this.photoEmailStatus = 'Failed to send photos: ' + (error.error?.message || 'Network error');
          this.photoEmailStatusClass = 'error';
          console.error('Email photos error:', error);
          
          // Clear status after 5 seconds
          setTimeout(() => {
            this.photoEmailStatus = '';
            this.photoEmailStatusClass = '';
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