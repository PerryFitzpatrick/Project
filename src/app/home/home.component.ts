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
      // You could verify the token here if needed
      this.isLoggedIn = true;
      // For now, we'll just assume the user is logged in if token exists
    }
  }
} 