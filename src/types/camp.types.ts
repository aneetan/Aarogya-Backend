type StatusProps = "upcoming" | "active" | "expired"

export interface CampAttributes {
   id: number;
   name: string;
   location: string;
   organizer: string;
   contact: string;
   description: string;
   date: Date;
   days: number;
   starting_time: string,
   ending_time: string,
   lat: number;
   lng: number;
   status: StatusProps; 
}

export type CampFormData = Omit<CampAttributes, 'id'>;