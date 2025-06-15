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

  constructor(private http: HttpClient) {}

  hey() {
    alert('Hey there :)');
  }

  callBackend() {
    console.log('hi there')
    // Call the Cloudflare Worker test endpoint
    this.http.get('http://localhost:8787/test', { responseType: 'text' })
      .subscribe(
        (data) => this.response = data,
        (error) => {
          console.error('Error calling backend:', error);
          this.response = 'Error calling backend';
        }
      );
  }

  callHello() {
    console.log('Hi')
    this.http.get('http://localhost:8787/hello', { responseType: 'text' })
      .subscribe(
        (data) => this.response = data,
        (error) => {
          console.error('Error calling hello endpoint:', error);
          this.response = 'Error calling hello endpoint';
        }
      );
  }
}
