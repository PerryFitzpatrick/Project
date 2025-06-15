import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,             // ✅ mark as standalone
  imports: [HttpClientModule],  // Use the actual module
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Project';
  response: string = '';

  // Use environment-based URLs
  private readonly apiBaseUrl = 'https://perry-api.sawatzky-perry.workers.dev'; // Production URL
  // private readonly apiBaseUrl = 'http://localhost:8787'; // Development URL

  constructor(private http: HttpClient) {}

  hey() {
    alert('Hey there :)');
  }

  callBackend() {
    console.log('Calling backend...');
    this.http.get(`${this.apiBaseUrl}/test`, { responseType: 'text' })
      .subscribe(
        (data) => this.response = data,
        (error) => {
          console.error('Error calling backend:', error);
          this.response = 'Error calling backend';
        }
      );
  }

  callHello() {
    console.log('Calling hello...');
    this.http.get(`${this.apiBaseUrl}/hello`, { responseType: 'text' })
      .subscribe(
        (data) => this.response = data,
        (error) => {
          console.error('Error calling hello endpoint:', error);
          this.response = 'Error calling hello endpoint';
        }
      );
  }
}
// test
