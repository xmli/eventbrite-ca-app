import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from "@angular/common/http";

import { EventbriteService } from "./services/eventbrite.service";
import { EventbriteOrderInterface } from "./interfaces/eventbrite-order.interface";
import { EventbriteVenueInterface } from "./interfaces/eventbrite-venue.interface";
import { IcalendarInfoInterface } from "./interfaces/icalendar-info.interface";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  my_orders:EventbriteOrderInterface[];
  my_venue:string = "";
  my_events:IcalendarInfoInterface[] = [];

  constructor(private _eventbriteService: EventbriteService) { }
  
  ngOnInit() {
    console.log("Getting data from Eventbrite...");
    this._eventbriteService.getEvenbriteOrders()
    .subscribe(
      data => { 
        this.my_orders = data.orders;
        this.createDownloadOptions(data.orders);
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log('An error occurred:', err.error.message);
        } else {
          console.log(`Backend returned code ${err.status}, body was: ${err.error}`);
        }
      }
    );
  }

  createDownloadOptions(orders:EventbriteOrderInterface[]) {
    orders.forEach(element => {
      var ev_id = element.event_id;
      this._eventbriteService.getEventbriteEvent(ev_id)
      .subscribe(
        data => {
          // var ev_url = data.url;
          // var ev_dtstart = this.parseDate(data.start.utc);
          // var ev_dtend = this.parseDate(data.end.utc);
          // var ev_summary = data.name.text;
          // var ev_desc = data.description.text;
          // if(data.venue_id !== null) {
          //   this.getVenueLoc(data.venue_id);
          //   console.log(this.my_venue);
          // }
          this.buildEvent(data.url, this.parseDate(data.start.utc), this.parseDate(data.end.utc), data.name.text, data.description.text, "");
          
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            console.log('An error occurred:', err.error.message);
          } else {
            console.log(`Backend returned code ${err.status}, body was: ${err.error}`);
          }
        }
      );
      // console.log(element);
    });
  }

  getVenueLoc(venue_id) {
    this._eventbriteService.getVenueLocation(venue_id)
    .subscribe(
      data => {
        this.my_venue = data['name']
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log('An error occurred:', err.error.message);
        } else {
          console.log(`Backend returned code ${err.status}, body was: ${err.error}`);
        }
      }
    );
  }

  // setMyVenueLoc(venue:EventbriteVenueInterface) {
  //   this.my_venue = venue['name'] + venue['address']['localized_address_display'];
  // }

  // getMyVenueLoc() {
  //   return this.my_venue;
  // }

  parseDate(utc_str) {
    var parsed_date = utc_str.replace(/-|:/g, "");
    return parsed_date;
  }

  buildEvent(url, dtstart, dtend, summary, desc, loc){
    var text = this.createiCalEvent(url, dtstart, dtend, summary, desc, loc);
    this.my_events.push({
      filename:summary+".ics",
      eventdate:dtstart,
      body:text
    })
  }

  createiCalEvent(url, dtstart, dtend, summary, desc, loc) {
    var file_begin = "BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT";
    var file_end = "END:VEVENT\nEND:VCALENDAR";
    return file_begin+"\n" 
    + "URL:" + url + "\n" 
    + "DTSTART:" + dtstart + "\n" 
    + "DTEND:" + dtend+"\n" 
    + "SUMMARY:" + summary+"\n" 
    + "DESCRIPTION:" + desc+"\n" 
    + "LOCATION:" + loc+"\n" 
    + file_end;
  }
  
  downloadCalendar(event:IcalendarInfoInterface) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(event.body));
    element.setAttribute('download', event.filename);
    element.style.display = 'none';
    // document.body.appendChild(element);
    element.click();
    // document.body.removeChild(element);
  }

  title = 'Eventbrite Calendar App';
}
