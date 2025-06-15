import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [HttpClientModule, CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  apiData: any = null;
  loading: boolean = false;
  error: string = '';

  private readonly apiBaseUrl = 'https://perry-api.sawatzky-perry.workers.dev';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    // Automatically fetch data when component loads
    this.fetchHelloData();
  }

  fetchHelloData() {
    this.loading = true;
    this.error = '';

    this.http.get(`${this.apiBaseUrl}/hello`, { responseType: 'text' })
      .subscribe({
        next: (data) => {
          this.apiData = JSON.parse(data);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching hello data:', error);
          this.error = 'Error fetching data from backend';
          this.loading = false;
        }
      });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
