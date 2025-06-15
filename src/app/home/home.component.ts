import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginModalComponent } from '../auth/login-modal/login-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule, LoginModalComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  response: string = '';
  showLoginModal = false;
  isLoggedIn = false;
  currentUser: any = null;

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
    this.showLoginModal = true;
  }

  closeLoginModal() {
    this.showLoginModal = false;
  }

  onLoginSuccess(userData: any) {
    this.isLoggedIn = true;
    this.currentUser = userData.user;
    this.showLoginModal = false;
    console.log('Login successful:', userData);
  }

  logout() {
    localStorage.removeItem('authToken');
    this.isLoggedIn = false;
    this.currentUser = null;
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