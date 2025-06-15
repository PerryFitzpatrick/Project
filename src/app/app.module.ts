import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

import { AboutComponent } from './about/about.component';

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    AboutComponent
  ],
  providers: [provideHttpClient()]
})
export class AppModule {}
