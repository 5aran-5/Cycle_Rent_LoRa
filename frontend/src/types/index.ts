// /types/index.ts

export interface Bicycle {
  id: number;
  device_id: string;
  status: "available" | "reserved" | "in_use" | "offline";
  latitude: number | null;
  longitude: number | null;
  last_update: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  rfid_tag: string | null;
  registered_date: string;
}

export interface Reservation {
  id: number;
  user: UserProfile;
  bicycle: Bicycle;
  reserved_at: string;
  status: "pending" | "confirmed" | "cancelled" | "expired";
  expiry_at: string;
}

export interface RentalLog {
  id: number;
  user: UserProfile;
  bicycle: Bicycle;
  start_time: string;
  end_time?: string | null;
  duration_minutes?: number | null;
  distance_km?: number | null;
  status: "ongoing" | "completed";
}
