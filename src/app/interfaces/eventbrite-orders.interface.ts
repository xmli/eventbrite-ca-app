import { EventbriteOrderInterface } from "./eventbrite-order.interface";

export interface EventbriteOrdersInterface {
    pagination : {
        object_count : number, 
        page_number : number, 
        page_size : number, 
        page_count : number, 
        has_more_items : boolean
    }, 
    orders : EventbriteOrderInterface[]
}
