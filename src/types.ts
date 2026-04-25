export interface Place {
  place_id: string;
  name: string;
  category: string;
  tags: string[];
  description: string;
  location: {
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
    coordinates?: {
      lat: number;
      lng: number;
    }
  };
  accessibility: string[];
  average_rating: number;
  likes: number;
  reviews_count: number;
  appropriate_time: string[];
  budget: string;
  group_type: string;
  image?: string;
  source?: string;
}

export interface TravelPreference {
  user_id: string;
  destinations: string[];
  travel_dates: string;
  accessibility_needs: string[];
  budget: 'low' | 'medium' | 'high' | 'luxury';
  group_type: string;
  categories: string[];
  tags: string[];
  notification_preferences?: {
    followers: boolean;
    messages: boolean;
    recommendations: boolean;
  };
  updatedAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  preferences: {
    categories: string[];
    tags: string[];
  };
  saved_places: string[];
  createdAt: any;
}
