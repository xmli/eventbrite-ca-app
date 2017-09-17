import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from "@angular/common/http";

import { EventbriteService } from "./services/eventbrite.service";
import { EventbriteOrderInterface } from "./interfaces/eventbrite-order.interface";
import { EventbriteVenueInterface } from "./interfaces/eventbrite-venue.interface";
import { IcalendarInfoInterface } from "./interfaces/icalendar-info.interface";

import {DataSource} from '@angular/cdk/collections';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  my_orders:EventbriteOrderInterface[];
  my_events:IcalendarInfoInterface[] = [];

  constructor(private _eventbriteService: EventbriteService) { }
  
  ngOnInit() { }

  getDataFromEventbrite() {
    console.log("Getting data from Eventbrite...");
    this._eventbriteService.getEvenbriteOrders()
    .subscribe(
      data => { //callback function
        this.my_orders = data.orders;        
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log('An error occurred:', err.error.message);
        } else {
          console.log(`Backend returned code ${err.status}, body was: ${err.error}`);
        }
      },
      () => { //complete
        console.log("Data loaded.")
        this.createDownloadOptions(this.my_orders);
      }
    );    
  }

  createDownloadOptions(orders:EventbriteOrderInterface[]) {
    orders.forEach(element => {
      var ev_id = element.event_id;
      this._eventbriteService.getEventbriteEvent(ev_id)
      .subscribe(
        data => {
          if(data.venue_id !== null) {
            this.buildEvent(data.url, data.start.utc, data.end.utc, data.name.text, data.description.text, data.venue_id);
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log('An error occurred:', err.error.message);
          } else {
            console.log(`Backend returned code ${err.status}, body was: ${err.error}`);
          }
        }
      );
    });
    console.log("EVENTS:");
    console.log(this.my_events);
  }

  buildEvent(url, raw_dtstart, raw_dtend, summary, desc, venue_id){
    var loc;
    this._eventbriteService.getVenueLocation(venue_id)
    .subscribe(
      data => {
        if(data.name !== null) {
          loc = data.name;
          if(data.address.localized_address_display !== null) {
            loc += ', ' + data.address.localized_address_display;     
          }     
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log('An error occurred:', err.error.message);
        } else {
          console.log(`Backend returned code ${err.status}, body was: ${err.error}`);
        }
      },
      () => {
        var file_begin = "BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT";
        var file_end = "END:VEVENT\nEND:VCALENDAR";    
        
        var text = file_begin+"\n" 
        + "URL:" + url + "\n" 
        + "DTSTART:" + this.parseDate(raw_dtstart) + "\n" 
        + "DTEND:" + this.parseDate(raw_dtend)+"\n" 
        + "SUMMARY:" + summary+"\n" 
        + "LOCATION:"

        if(loc == null) loc = "";
        text += loc + '\n' 
        + "DESCRIPTION:" + desc + "\n"                
        + file_end;
        this.my_events.push({
          filename:summary+".ics",
          eventname:summary,
          eventdate:raw_dtstart,
          calbody:text,
          description:desc,
          url:url
        });
      }
    );
  }

  downloadCalendar(event:IcalendarInfoInterface) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(event.calbody));
    element.setAttribute('download', event.filename);
    element.style.display = 'none';
    // document.body.appendChild(element);
    element.click();
    // document.body.removeChild(element);
  }

  parseDate(utc_str) {
    var parsed_date = utc_str.replace(/-|:/g, "");
    return parsed_date;
  }

  truncateDescription(desc_str) {
    return desc_str.substring(0,200) + "..."
  }

  title = 'My App';
}