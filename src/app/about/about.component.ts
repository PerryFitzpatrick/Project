import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {
  photos: any[] = [];
  loading = true;
  error = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPhotos();
  }

  goBack() {
    this.router.navigate(['/'], { replaceUrl: true });
  }

  loadPhotos() {
    this.loading = true;
    this.error = '';

    this.http.get('https://perry-click-backend.pfitzpatrick.workers.dev/photos')
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

  getPhotoUrl(photoId: number): string {
    return `https://perry-click-backend.pfitzpatrick.workers.dev/photo/${photoId}`;
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
