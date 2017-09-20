import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from "@angular/common/http";

//interfaces
import { EventbriteOrdersInterface } from "../interfaces/eventbrite-orders.interface";
import { EventbriteEventInterface } from "../interfaces/eventbrite-event.interface";
import { EventbriteVenueInterface } from "../interfaces/eventbrite-venue.interface";
import { Oauth2Interface } from "../interfaces/oauth2.interface";
import { EventbriteAccountInterface } from "../interfaces/eventbrite-account.interface";

@Injectable()
export class EventbriteService {

  private eventbrite_api:string = "https://www.eventbriteapi.com/v3/";
  private proxy_url:string = "https://eventbrite-node-server.herokuapp.com/";

  constructor(private _http: HttpClient) {}
  
  getEventbriteSession(auth_token) {
    var api_url:string = this.eventbrite_api + "users/me/?token=" + auth_token;
    var headers = new HttpHeaders().set('Authorization', 'Bearer ' + auth_token)
    
    return this._http
      .get<EventbriteAccountInterface>(api_url, 
        { headers: headers }
      )
  }

  getEvenbriteOrders(user_id, auth_token) {
    var api_url:string = this.eventbrite_api + "users/" + user_id + '/orders/';  
    var headers = new HttpHeaders().set('Authorization', 'Bearer ' + auth_token)
    
    return this._http
      .get<EventbriteOrdersInterface>(api_url, 
        { headers: headers }
      )
  }
    
  getEventbriteEvent(event_id, auth_token) {
    var api_url:string = this.eventbrite_api + "events/" + event_id + '/';
    var headers = new HttpHeaders().set('Authorization', 'Bearer ' + auth_token)

    return this._http
      .get<EventbriteEventInterface>(api_url, 
        { headers: headers }
      ) 
  }  

  getVenueLocation(venue_id, auth_token) {
    var api_url:string = this.eventbrite_api + "venues/" + venue_id + '/';
    var headers = new HttpHeaders().set('Authorization', 'Bearer ' + auth_token)
    
    return this._http
      .get<EventbriteVenueInterface>(api_url,
        { headers: headers }
      )
  }

  postOAuthToken(code) {
    var api_url:string = this.proxy_url;
    var body_str = "code=" + code;
    var headers = new HttpHeaders().set('Content-type', 'application/x-www-form-urlencoded');

    return this._http
      .post<Oauth2Interface>(api_url,
        body_str,
      { headers: headers }
    )
  }
}
