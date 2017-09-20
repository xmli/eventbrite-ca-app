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

  //boolean flag for html table
  sort_NewToOld = true;

  //boolean flag for refreshing data
  did_get_data = false;

  //boolean for authentication
  is_authenticated:boolean;

  //variables for storing data from API
  my_orders:EventbriteOrderInterface[];
  my_calevents:IcalendarInfoInterface[] = [];
  my_events = [{}];

  //redirect site for authorization
  my_redirect = "https://www.eventbrite.com/oauth/authorize?response_type=code&client_id=URU55POLUBEJYWBHQF";

  //authorization code
  my_code = "";

  //html data button
  data_button = "Get Data";

  constructor(private _eventbriteService: EventbriteService) { }
  
  ngOnInit() {
    this.authenticate();
    if(localStorage['curr_auth_token'] !== 'undefined') {
      this.is_authenticated = true;                       
    }
    if(localStorage['cached_calendar'] !== "undefined") {      
      this.did_get_data = true;          
      this.data_button = "Refresh";        
      this.my_calevents = JSON.parse(localStorage['cached_calendar']);
    }
  }

  getDataFromEventbriteHelper() {    
    if(!this.did_get_data) {      
      if(localStorage['curr_auth_token'] !== 'undefined') {
        this.my_calevents = [];        
        this.getDataFromEventbrite(localStorage['curr_auth_token']);
        this.did_get_data = true;    
        this.data_button = "Refresh";  
      } else{
        alert("Please authenticate first!");
      }
    } else {
      this.my_calevents = [];
      this.getDataFromEventbrite(localStorage['curr_auth_token']);
    }
  }

  getDataFromEventbrite(auth_token:string) {
    console.log("Getting data from Eventbrite...");
    this._eventbriteService.getEventbriteSession(auth_token)
    .subscribe(
      data => {
        var user_id = data.id;

        this._eventbriteService.getEvenbriteOrders(user_id, auth_token)
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
    ) 
  }

  createDownloadOptions(orders:EventbriteOrderInterface[]) {  
    let observableBatch = [];    
    orders.forEach(( element ) => {
      observableBatch.push( this._eventbriteService.getEventbriteEvent(element.event_id, localStorage['curr_auth_token']) );
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
            observableBatchInner.push( this._eventbriteService.getVenueLocation(elem.venue_id, localStorage['curr_auth_token']));
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
            console.log("Data loaded.");
            localStorage['cached_calendar'] = JSON.stringify(this.my_calevents);            
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
          text += ' - ' + this.parseVenue(location.address.localized_address_display) + '\n';            
        }   
      } else {
        if(location.address.localized_address_display !== null) {
          text += this.parseVenue(location.address.localized_address_display) + '\n';            
        } 
      }
    }

    text += "DESCRIPTION:" + this.parseDescription(this.removeFirstNewLine(event.description.text)) + "\n"                
    + file_end;
    
    this.my_calevents.push({
      filename:this.removeLastFileNameSpace(event.name.text)+".ics",
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

  parseVenue(venue) {
    return venue.replace(/,/g, " ");
  }

  parseDescription(desc:string) {
    var firstNewLine = desc.indexOf('\n');
    return desc.substring(0, firstNewLine);
  }

  truncateDescription(desc_str) {
    return desc_str.substring(0,250) + "..."
  }

  removeLastFileNameSpace(fn) {
    return fn.replace(/\s+$/, '');
  }

  removeFirstNewLine(desc:string) {
    for (var i = 0; i < desc.length || i < 3; i++) {
      if (desc.indexOf('\n') == 0) {
        desc = desc.substring(1);
      }
    }
    return desc;
  }

  authenticate() {
    if(window.location.search.indexOf("?error=access_denied") == -1) {
      var index = window.location.search.indexOf("?code=");
      this.my_code = window.location.search.substring(index + 6);
      if(this.my_code !== "") {
        this._eventbriteService.postOAuthToken(this.my_code)
        .subscribe(
          data => {
            localStorage['curr_auth_token'] = data.access_token;
            if(localStorage['curr_auth_token'] !== "undefined") alert("AUTHENTICATED!");
            window.location.href = window.location.href.substring(0, index);                        
          },
          (err) => console.error(err),
          () => {
            this.is_authenticated = true;                 
          }  
        )
      }
    }
  }

  redirect() {
    if(localStorage['curr_auth_token'] == 'undefined') {            
      window.location.href = "https://www.eventbrite.com/oauth/authorize?response_type=code&client_id=URU55POLUBEJYWBHQF"; 
    } else {
      alert("You are already authenticated.");
    }
  }

  logout() {
    localStorage['curr_auth_token'] = "undefined";
    localStorage['cached_calendar'] = "undefined";
    this.my_calevents = [];
    this.did_get_data = false;
    this.data_button = "Get Data";
    this.is_authenticated = false;
    if(window.location.href !== "http://localhost:4200/") {      
      window.location.href = "http://localhost:4200/";      
    }
    alert("You have successfully logged out.");    
  }
 
  title = 'Quick Eventbrite Download';
}