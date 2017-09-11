import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

//import HttpClientModule
import { HttpClientModule } from "@angular/common/http";

//import components
import { AppComponent } from './app.component';

//import services
import { EventbriteService } from "./services/eventbrite.service";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [EventbriteService],
  bootstrap: [AppComponent]
})
export class AppModule { }
