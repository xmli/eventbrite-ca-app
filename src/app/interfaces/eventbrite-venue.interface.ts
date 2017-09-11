export interface EventbriteVenueInterface {
    address : {
        address_1 : string, 
        address_2 : string, 
        city : string, 
        region : string, 
        postal_code : string, 
        country : string, 
        latitude : string, 
        longitude : string, 
        localized_address_display : string, 
        localized_area_display : string, 
        localized_multi_line_address_display : string[]
    }, 
    resource_uri : string 
    id : string, 
    name : string, 
    latitude : string, 
    longitude : string
}
