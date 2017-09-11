import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from "@angular/common/http";

import { EventbriteOrdersInterface } from "../interfaces/eventbrite-orders.interface";
import { EventbriteEventInterface } from "../interfaces/eventbrite-event.interface";
import { EventbriteVenueInterface } from "../interfaces/eventbrite-venue.interface";

@Injectable()
export class EventbriteService {

  private eventbrite_api:string = "https://www.eventbriteapi.com/v3/";
  private user_id:string = "114380353799";
  private my_auth_token:string = "EZ5QEQTRHJSYBEMGZHTB";

  constructor(private _http: HttpClient) {}
  
  getEvenbriteOrders() {
    var api_url:string = this.eventbrite_api + "users/" + this.user_id + '/orders/';    
    //http call
    return this._http
      .get<EventbriteOrdersInterface>(api_url, {
        headers: new HttpHeaders().set('Authorization', 'Bearer ' + this.my_auth_token)
      })
  }
    
  getEventbriteEvent(event_id) {
    var api_url:string = this.eventbrite_api + "events/" + event_id + '/';
    return this._http
      .get<EventbriteEventInterface>(api_url, {
        headers: new HttpHeaders().set('Authorization', 'Bearer ' + this.my_auth_token)
      }) 
  }  

  getVenueLocation(venue_id) {
    var api_url:string = this.eventbrite_api + "venues/" + venue_id + '/';
    return this._http
      .get<EventbriteVenueInterface>(api_url, {
        headers: new HttpHeaders().set('Authorization', 'Bearer ' + this.my_auth_token)
      })
  }
}
