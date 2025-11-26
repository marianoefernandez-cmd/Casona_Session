export enum RegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CHECKED_IN = 'CHECKED_IN'
}

export interface Registration {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: RegistrationStatus;
  registrationDate: string;
  ticketCode: string; // Unique string for QR
  welcomeMessage?: string; // AI generated
  paymentProofUrl?: string; // Mocked for now
}

export interface EventStats {
  total: number;
  pending: number;
  approved: number;
  checkedIn: number;
}
