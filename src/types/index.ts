export interface Booking {
  id?: string;
  name: string;
  email: string;
  telefon?: string;
  reisedatum_von: string;
  reisedatum_bis: string;
  personen: number;
  paket?: string;
  nachricht?: string;
  status?: string;
  created_at?: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  nachricht: string;
  gelesen?: boolean;
  created_at?: string;
}

export interface Package {
  id?: string;
  name: string;
  beschreibung?: string;
  preis?: number;
  dauer?: string;
  highlights?: string[];
  aktiv?: boolean;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: unknown;
}
