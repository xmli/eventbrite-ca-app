export interface EventbriteEventInterface {
     name : {
         text : string, 
         html : string
    }, 
     description : {
        text:string,
        html:string
    }, 
     id : string, 
     url : string, 
     start : {
         timezone : string, 
         local : string, 
         utc : string
    }, 
     end : {
         timezone : string, 
         local : string, 
         utc : string
    }, 
     created : string, 
     changed : string, 
     capacity : number, 
     capacity_is_custom : boolean, 
     status : string, 
     currency : string, 
     listed : boolean, 
     shareable : boolean, 
     online_event : boolean, 
     tx_time_limit : number, 
     hide_start_date : boolean, 
     hide_end_date : boolean, 
     locale : string, 
     is_locked : boolean, 
     privacy_setting : string, 
     is_series : boolean, 
     is_series_parent : boolean, 
     is_reserved_seating : boolean, 
     source : string, 
     is_free : boolean, 
     version : string, 
     logo_id : string, 
     organizer_id : string, 
     venue_id : string, 
     category_id : string, 
     subcategory_id : string, 
     format_id : string, 
     resource_uri : string, 
     logo : {
         crop_mask : string, 
         original : {
             url : string, 
             width : string, 
             height : string
        }, 
         id : string, 
         url : string, 
         aspect_ratio : string, 
         edge_color : string, 
         edge_color_set : boolean
    }
}
