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
  
  ngOnInit() { }

  getDataFromEventbrite() {
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
  }

  buildEvent(url, raw_dtstart, raw_dtend, summary, desc, venue_id){
    var file_begin = "BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT";
    var file_end = "END:VEVENT\nEND:VCALENDAR";    
    
    var text = file_begin+"\n" 
    + "URL:" + url + "\n" 
    + "DTSTART:" + this.parseDate(raw_dtstart) + "\n" 
    + "DTEND:" + this.parseDate(raw_dtend)+"\n" 
    + "SUMMARY:" + summary+"\n" 
    + "LOCATION:"
    
    this._eventbriteService.getVenueLocation(venue_id)
    .subscribe(
      data => {
        if(data.name !== null) {
          var loc = data.name;
          if(data.address.localized_address_display !== null) {
            loc += ', ' + data.address.localized_address_display;     
          }     
        }
        console.log(loc);
        
        text += loc + '\n' 
        + "DESCRIPTION:" + desc + "\n"                
        + file_end;
        this.my_events.push({
          filename:summary+".ics",
          eventname:summary,
          eventdate:raw_dtstart,
          body:text,
          url:url
        })
        console.log(text);
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

  downloadCalendar(event:IcalendarInfoInterface) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(event.body));
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

  title = 'Eventbrite Calendar App';
}
