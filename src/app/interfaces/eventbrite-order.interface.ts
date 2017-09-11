export interface EventbriteOrderInterface {
    costs : {
            base_price : {
                display : string, 
                currency : string, 
                value : number, 
                major_value : string
        }, 
            eventbrite_fee : {
                display : string, 
                currency : string, 
                value : number, 
                major_value : string
        }, 
            gross : {
                display : string, 
                currency : string, 
                value : number, 
                major_value : string
        }, 
            payment_fee : {
                display : string, 
                currency : string, 
                value : number, 
                major_value : string
        }, 
            tax : {
                display : string, 
                currency : string, 
                value : number, 
                major_value : string
        }
    }, 
    resource_uri : string, 
    id : string, 
    changed : string, 
    created : string, 
    name : string, 
    first_name : string, 
    last_name : string, 
    email : string, 
    status : string, 
    time_remaining : string, 
    event_id : string
}
