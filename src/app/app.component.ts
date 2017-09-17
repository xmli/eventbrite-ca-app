import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from "@angular/common/http";

import { EventbriteService } from "./services/eventbrite.service";
import { EventbriteOrderInterface } from "./interfaces/eventbrite-order.interface";
import { EventbriteVenueInterface } from "./interfaces/eventbrite-venue.interface";
import { IcalendarInfoInterface } from "./interfaces/icalendar-info.interface";
import { EventbriteEventInterface } from "./interfaces/eventbrite-event.interface";

import {DataSource} from '@angular/cdk/collections';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/forkJoin'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  sort_NewToOld = true;
  my_orders:EventbriteOrderInterface[];
  my_calevents:IcalendarInfoInterface[] = [];
  my_events = [{}];

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
        this.createDownloadOptions(this.my_orders);
      }
    );    
  }

  createDownloadOptions(orders:EventbriteOrderInterface[]) {  
    let observableBatch = [];    
    orders.forEach(( element ) => {
      observableBatch.push( this._eventbriteService.getEventbriteEvent(element.event_id) );
    });

    var subs = Observable.forkJoin(observableBatch)
    .subscribe(
      data => {
        this.my_events = data;
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log('An error occurred:', err.error.message);
        } else {
          console.log(`Backend returned code ${err.status}, body was: ${err.error}`);
        }
      },
      () => {
        let observableBatchInner = [];    
        this.my_events.forEach(( elem:EventbriteEventInterface ) => {
          if(elem.venue_id !== null) {
            observableBatchInner.push( this._eventbriteService.getVenueLocation(elem.venue_id));
          } else {
            observableBatchInner.push( Observable.of({}));            
          }
        });
        var subsInner = Observable.forkJoin(observableBatchInner).subscribe(
          data => {
            // console.log(data);
            for (var i = 0; i < this.my_events.length; i++) {
              var ev = this.my_events[i];
              var loc = data[i];
              
              this.buildCalendarEvent(ev, loc);
              
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
            this.my_calevents.sort(this.sortNewToOld);
            console.log("Data loaded.")    
          } 
        );            
      }
    );
  }

  sortUpdate() {
    if(this.sort_NewToOld) {
      this.my_calevents.sort(this.sortOldToNew);      
    } else {
      this.my_calevents.sort(this.sortNewToOld);      
    }
    this.sort_NewToOld = !this.sort_NewToOld;
  }

  sortOldToNew(a,b) {
    var dateA = new Date(a.eventdate).getTime();
    var dateB = new Date(b.eventdate).getTime();
    return dateA > dateB ? 1 : -1;  
  }

  sortNewToOld(a,b) {
    var dateA = new Date(a.eventdate).getTime();
    var dateB = new Date(b.eventdate).getTime();
    return dateA > dateB ? -1 : 1;  
  }

  buildCalendarEvent(ev, loc){    
    var event:EventbriteEventInterface = ev;
    var location:EventbriteVenueInterface = loc;

    var file_begin = "BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT";
    var file_end = "END:VEVENT\nEND:VCALENDAR";    
    
    var text = file_begin+"\n" 
    + "URL:" + event.url + "\n" 
    + "DTSTART:" + this.parseDate(event.start.utc) + "\n" 
    + "DTEND:" + this.parseDate(event.end.utc)+"\n" 
    + "SUMMARY:" + event.name.text+"\n" 
    + "LOCATION:"

    if(this.isEmpty(location)){
      text += '\n'
    } else {
      if(location.name !== null) {
        text += location.name;  
        if(location.address.localized_address_display !== null) {
          text += ' - ' + location.address.localized_address_display + '\n';            
        }   
      } else {
        if(location.address.localized_address_display !== null) {
          text += location.address.localized_address_display + '\n';            
        } 
      }
    }

    text += "DESCRIPTION:" + event.description.text + "\n"                
    + file_end;
    
    this.my_calevents.push({
      filename:event.name.text+".ics",
      eventname:event.name.text,
      eventdate:event.start.utc,
      calbody:text,
      description:event.description.text,
      url:event.url
    });
  }

  isEmpty(obj) {
    for(var key in obj) {
      if(obj.hasOwnProperty(key))
        return false;
    }
    return true;
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