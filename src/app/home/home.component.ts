import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  response: string = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

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
} 