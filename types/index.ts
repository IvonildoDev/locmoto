export interface Motorcycle {
  id: string;
  brand: string;
  model: string;
  year: number;
  plate?: string;
  dailyRate: number;
  imageUrl: string;
  images?: string[];
  specs: {
    cc: number;
    transmission: 'Manual' | 'Automática';
    consumption: string;
    brakes: string;
  };
  rating: number;
  reviewCount: number;
  description: string;
  available: boolean;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  distance: string;
  isOpen: boolean;
  hours: string;
  type: 'store' | 'partner';
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface Reservation {
  id: string;
  motorcycle: Motorcycle;
  pickupDate: Date;
  returnDate: Date;
  pickupLocation: Location;
  returnLocation: Location;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  totalDays: number;
  dailyRate: number;
  insurance: number;
  serviceFee: number;
  totalAmount: number;
  kmType: 'free' | 'limited';
  paymentOption: 'full' | 'partial';
  amountPaid: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  cnh: string;
  avatar?: string;
  createdAt: Date;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'pix';
  cardNumber?: string;
  cardName?: string;
  cardExpiry?: string;
  isDefault: boolean;
}

export type RootStackParamList = {
  '(tabs)': undefined;
  'onboarding': undefined;
  'login': undefined;
  'register': undefined;
  'moto-details': { id: string };
  'checkout': { motorcycleId: string; pickupDate: string; returnDate: string };
};
