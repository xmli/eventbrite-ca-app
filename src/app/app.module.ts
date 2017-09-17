import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AngularMaterialModule } from "./angular-material.module";

//import HttpClientModule
import { HttpClientModule } from "@angular/common/http";

//import components
import { AppComponent } from './app.component';

//import services
import { EventbriteService } from "./services/eventbrite.service";
import { OrderByPipe } from './pipes/order-by.pipe';

@NgModule({
  declarations: [
    AppComponent,
    OrderByPipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AngularMaterialModule
  ],
  providers: [EventbriteService],
  bootstrap: [AppComponent]
})
export class AppModule { }
