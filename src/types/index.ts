export type Role = 'Administrator' | 'Staff';

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  phone: string;
  role: Role;
  avatarUrl?: string;
}

export type RoomStatus = 'available' | 'maintenance' | 'occupied';

export type EquipmentItem = 
  | 'Projector'
  | 'Television'
  | 'Video Conference'
  | 'Whiteboard'
  | 'Microphone'
  | 'Speaker'
  | 'PA System'
  | 'Smart Board'
  | 'Other';

export interface Room {
  id: string;
  name: string;
  location: string;
  capacity: number;
  equipment: EquipmentItem[];
  status: RoomStatus;
  imageUrl: string;
  description?: string;
  floor?: string;
}

export type BookingStatus = 
  | 'available'
  | 'booked'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type MeetingType = 
  | 'Meeting'
  | 'Discussion'
  | 'Training'
  | 'Presentation'
  | 'Interview'
  | 'Workshop'
  | 'Other';

export interface Booking {
  id: string;
  bookingId: string; // e.g. MRB-2026-0001
  meetingTitle: string;
  organizer: string;
  organizerEmail: string;
  department: string;
  phoneNumber?: string;
  roomId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  participants: number;
  meetingType: MeetingType;
  purpose: string;
  equipment: EquipmentItem[];
  notes?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingBooking?: Booking;
  message?: string;
}
