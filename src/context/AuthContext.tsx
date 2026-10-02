import React, { createContext, useContext, useEffect, useState } from 'react';
import { storageService } from '../services/storageService';
import { Role, User } from '../types';

interface AuthContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: Role) => void;
  switchUser: (userId: string) => void;
  users: User[];
  refreshUsers: () => void;
  language: 'ms' | 'en';
  setLanguage: (lang: 'ms' | 'en') => void;
  t: (key: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple bilingual dictionary for key interface labels
const TRANSLATIONS: Record<string, { ms: string; en: string }> = {
  appName: { ms: 'Sistem Tempahan Bilik Mesyuarat', en: 'Meeting Room Booking System' },
  appSubtitle: { ms: 'Portal Pengurusan Bilik Mesyuarat Organisasi', en: 'Organizational Meeting Room Management Portal' },
  dashboard: { ms: 'Papan Pemuka', en: 'Dashboard' },
  meetingRooms: { ms: 'Bilik Mesyuarat', en: 'Meeting Rooms' },
  calendar: { ms: 'Jadual Kalendar', en: 'Calendar' },
  newBooking: { ms: 'Tempahan Baharu', en: 'New Booking' },
  myBookings: { ms: 'Tempahan Saya', en: 'My Bookings' },
  reports: { ms: 'Laporan & Analisis', en: 'Reports & Analytics' },
  adminPanel: { ms: 'Pentadbiran', en: 'Administration' },
  totalRooms: { ms: 'Jumlah Bilik', en: 'Total Rooms' },
  availableToday: { ms: 'Bilik Tersedia Hari Ini', en: 'Available Rooms Today' },
  todayBookings: { ms: 'Tempahan Hari Ini', en: 'Today’s Bookings' },
  currentlyOccupied: { ms: 'Sedang Digunakan', en: 'Currently Occupied' },
  upcomingMeetings: { ms: 'Mesyuarat Akan Datang', en: 'Upcoming Meetings' },
  searchPlaceholder: { ms: 'Cari mesyuarat, bilik, penganjur, atau jabatan...', en: 'Search meeting, room, organizer, or department...' },
  bookNow: { ms: 'Tempah Sekarang', en: 'Book Now' },
  viewSchedule: { ms: 'Lihat Jadual', en: 'View Schedule' },
  successTitle: { ms: 'Tempahan berjaya!', en: 'Booking Successful!' },
  conflictError: {
    ms: 'Maaf, bilik ini telah ditempah pada waktu tersebut. Sila pilih masa atau bilik lain.',
    en: 'Sorry, this room is already booked at that time. Please choose another time or room.',
  },
  capacityExceeded: {
    ms: 'Bilangan peserta melebihi kapasiti maksimum bilik.',
    en: 'Number of participants exceeds maximum room capacity.',
  },
  cancelBookingConfirm: {
    ms: 'Adakah anda pasti ingin membatalkan tempahan ini?',
    en: 'Are you sure you want to cancel this booking?',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User>(() => storageService.getCurrentUser());
  const [users, setUsers] = useState<User[]>(() => storageService.getUsers());
  const [language, setLanguage] = useState<'ms' | 'en'>('ms');

  const refreshUsers = () => {
    setUsers(storageService.getUsers());
  };

  const setCurrentUser = (user: User) => {
    storageService.setCurrentUser(user);
    setCurrentUserState(user);
  };

  const switchRole = (role: Role) => {
    const targetUser = users.find((u) => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
    } else {
      // Create temporary profile with requested role
      const updated = {
        ...currentUser,
        role,
      };
      setCurrentUser(updated);
    }
  };

  const switchUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const t = (key: string): string => {
    if (TRANSLATIONS[key]) {
      return TRANSLATIONS[key][language] || TRANSLATIONS[key].ms;
    }
    return key;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        switchUser,
        users,
        refreshUsers,
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
