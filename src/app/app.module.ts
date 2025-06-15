import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';

@NgModule({
  imports: [
    BrowserModule
  ],
  providers: [provideHttpClient()] // Keep this if you have other providers
})
export class AppModule {}
