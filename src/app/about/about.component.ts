import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {
  photos: any[] = [];
  bunnyUploads: any[] = [];
  loading = true;
  error = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPhotos();
    this.loadBunnyUploads();
  }

  goBack() {
    this.router.navigate(['/'], { replaceUrl: true });
  }

  loadPhotos() {
    this.loading = true;
    this.error = '';

    this.http.get('https://perry-api.sawatzky-perry.workers.dev/photos')
      .subscribe({
        next: (response: any) => {
          this.photos = response.data || [];
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load photos: ' + (error.error?.message || 'Unknown error');
          this.loading = false;
          console.error('Error loading photos:', error);
        }
      });
  }

  loadBunnyUploads() {
    this.http.get('https://perry-api.sawatzky-perry.workers.dev/bunny-uploads')
      .subscribe({
        next: (response: any) => {
          this.bunnyUploads = response.data || [];
        },
        error: (error) => {
          console.error('Error loading Bunny.net uploads:', error);
        }
      });
  }

  getPhotoUrl(photoId: number): string {
    return `https://perry-api.sawatzky-perry.workers.dev/photo/${photoId}`;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
