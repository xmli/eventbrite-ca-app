export interface EventbriteAccountInterface {
    emails: [
        {
            email: string, 
            verified: boolean, 
            primary: boolean
        }
    ], string
    id: string, 
    name: string, 
    first_name: string, 
    last_name: string, 
    is_public: boolean, 
    image_id: string
}
