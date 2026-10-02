import { Booking, ConflictCheckResult, Room, User } from '../types';

const STORAGE_KEYS = {
  ROOMS: 'mrb_rooms_v1',
  BOOKINGS: 'mrb_bookings_v1',
  USERS: 'mrb_users_v1',
  CURRENT_USER: 'mrb_current_user_v1',
};

// Realistic Malaysian seed data
const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-1',
    name: 'Bilik Mesyuarat Utama',
    location: 'Aras 3, Blok Pentadbiran, Putrajaya',
    capacity: 20,
    equipment: ['Projector', 'Television', 'Video Conference', 'Whiteboard', 'Microphone', 'Speaker'],
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80',
    description: 'Bilik mesyuarat utama untuk persidangan eksekutif, mesyuarat pengurusan tertinggi dan pelawat kehormat.',
    floor: 'Aras 3',
  },
  {
    id: 'room-2',
    name: 'Bilik Mesyuarat 1',
    location: 'Aras 2, Sayap Timur',
    capacity: 10,
    equipment: ['Television', 'Whiteboard', 'Video Conference'],
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    description: 'Sesuai untuk mesyuarat jawatankuasa, taklimat projek dan pembentangan unit.',
    floor: 'Aras 2',
  },
  {
    id: 'room-3',
    name: 'Bilik Mesyuarat 2',
    location: 'Aras 2, Sayap Barat',
    capacity: 8,
    equipment: ['Television', 'Whiteboard'],
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=800&q=80',
    description: 'Bilik mesyuarat kompak berhawa dingin untuk perbincangan rentas jabatan.',
    floor: 'Aras 2',
  },
  {
    id: 'room-4',
    name: 'Bilik Perbincangan',
    location: 'Aras 1, Ruang Kolaborasi',
    capacity: 6,
    equipment: ['Television', 'Whiteboard'],
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
    description: 'Ruang santai untuk perbincangan harian, temuduga ringkas atau sesi sumbang saran kumpulan kecil.',
    floor: 'Aras 1',
  },
  {
    id: 'room-5',
    name: 'Dewan Taklimat Seri Melati',
    location: 'Aras Bawah, Blok C',
    capacity: 50,
    equipment: ['Projector', 'PA System', 'Microphone', 'Speaker', 'Whiteboard', 'Video Conference'],
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=80',
    description: 'Dewan luas untuk seminar, bengkel jabatan, sesi taklimat umum dan kursus induksi.',
    floor: 'Aras Bawah',
  },
  {
    id: 'room-6',
    name: 'Bilik Mesyuarat Eksekutif Harmoni',
    location: 'Aras 4, Pejabat Pengarah',
    capacity: 14,
    equipment: ['Television', 'Video Conference', 'Smart Board', 'Microphone'],
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    description: 'Bilik eksklusif lengkap kemudahan audio visual pintar untuk rundingan strategik.',
    floor: 'Aras 4',
  },
];

const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Ahmad Faiz bin Mansor',
    email: 'admin@meetingroom.local',
    department: 'Jabatan Pentadbiran & Sumber Manusia',
    phone: '+6019-321 8844',
    role: 'Administrator',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'user-staff-1',
    name: 'Siti Nur Aisyah binti Rahman',
    email: 'staff@meetingroom.local',
    department: 'Jabatan Perancangan Bandar dan Desa',
    phone: '+6012-456 7890',
    role: 'Staff',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'user-staff-2',
    name: 'Mohd Safwan bin Ismail',
    email: 'safwan@meetingroom.local',
    department: 'Jabatan Kejuruteraan',
    phone: '+6013-889 1234',
    role: 'Staff',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'user-staff-3',
    name: 'Nurul Huda binti Abdullah',
    email: 'huda@meetingroom.local',
    department: 'Bahagian Pengurusan Teknologi Maklumat',
    phone: '+6017-654 3210',
    role: 'Staff',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  },
];

// Helper to get formatted date string for today, tomorrow, etc.
const getFormattedDateOffset = (offsetDays: number = 0): string => {
  // Center around 2026-10-02 (the current context date)
  const base = new Date(2026, 9, 2); // 2 Oct 2026 (month index 9 is October)
  base.setDate(base.getDate() + offsetDays);
  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, '0');
  const day = String(base.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b-1',
    bookingId: 'MRB-2026-0001',
    meetingTitle: 'Mesyuarat Penyelarasan Pelan Struktur Bandar 2030',
    organizer: 'Siti Nur Aisyah binti Rahman',
    organizerEmail: 'staff@meetingroom.local',
    department: 'Jabatan Perancangan Bandar dan Desa',
    phoneNumber: '+6012-456 7890',
    roomId: 'room-1',
    date: getFormattedDateOffset(0), // Today
    startTime: '09:00',
    endTime: '11:00',
    participants: 16,
    meetingType: 'Meeting',
    purpose: 'Perbincangan terperinci mengenai draf laporan zon pembangunan perbandaran baharu bersama perunding teknikal.',
    equipment: ['Projector', 'Video Conference', 'Whiteboard'],
    notes: 'Sila sediakan air mineral dan mikrofon meja.',
    status: 'booked',
    createdAt: '2026-09-28T08:30:00.000Z',
    updatedAt: '2026-09-28T08:30:00.000Z',
  },
  {
    id: 'b-2',
    bookingId: 'MRB-2026-0002',
    meetingTitle: 'Taklimat Audit Keselamatan Siber Sektor Awam',
    organizer: 'Nurul Huda binti Abdullah',
    organizerEmail: 'huda@meetingroom.local',
    department: 'Bahagian Pengurusan Teknologi Maklumat',
    phoneNumber: '+6017-654 3210',
    roomId: 'room-2',
    date: getFormattedDateOffset(0), // Today
    startTime: '10:00',
    endTime: '12:00',
    participants: 9,
    meetingType: 'Presentation',
    purpose: 'Taklimat persediaan menghadapi audit ISO 27001 dan pengukuhan kata laluan staf.',
    equipment: ['Television', 'Whiteboard'],
    notes: 'Kabel HDMI diperlukan.',
    status: 'booked',
    createdAt: '2026-09-29T10:15:00.000Z',
    updatedAt: '2026-09-29T10:15:00.000Z',
  },
  {
    id: 'b-3',
    bookingId: 'MRB-2026-0003',
    meetingTitle: 'Perbincangan Teknikal Tender Projek Jambatan',
    organizer: 'Mohd Safwan bin Ismail',
    organizerEmail: 'safwan@meetingroom.local',
    department: 'Jabatan Kejuruteraan',
    phoneNumber: '+6013-889 1234',
    roomId: 'room-1',
    date: getFormattedDateOffset(0), // Today
    startTime: '14:30',
    endTime: '16:30',
    participants: 14,
    meetingType: 'Discussion',
    purpose: 'Penilaian dokumen tender kejuruteraan awam dan spesifikasi beban struktur.',
    equipment: ['Projector', 'Video Conference'],
    notes: 'Wakil JKR negeri akan turut serta secara hybrid video conference.',
    status: 'booked',
    createdAt: '2026-09-30T14:00:00.000Z',
    updatedAt: '2026-09-30T14:00:00.000Z',
  },
  {
    id: 'b-4',
    bookingId: 'MRB-2026-0004',
    meetingTitle: 'Temuduga Kenaikan Pangkat Pegawai Tadbir N41',
    organizer: 'Ahmad Faiz bin Mansor',
    organizerEmail: 'admin@meetingroom.local',
    department: 'Jabatan Pentadbiran & Sumber Manusia',
    phoneNumber: '+6019-321 8844',
    roomId: 'room-4',
    date: getFormattedDateOffset(0), // Today
    startTime: '09:00',
    endTime: '13:00',
    participants: 5,
    meetingType: 'Interview',
    purpose: 'Sesi temuduga calon kenaikan pangkat secara lantikan khas.',
    equipment: ['Whiteboard'],
    notes: 'Papan tanda "Sesi Temuduga Sedang Berlangsung" di pintu bilik.',
    status: 'in_progress',
    createdAt: '2026-09-25T09:00:00.000Z',
    updatedAt: '2026-09-25T09:00:00.000Z',
  },
  {
    id: 'b-5',
    bookingId: 'MRB-2026-0005',
    meetingTitle: 'Bengkel Transformasi Digital & Pengautomatan Rekod',
    organizer: 'Nurul Huda binti Abdullah',
    organizerEmail: 'huda@meetingroom.local',
    department: 'Bahagian Pengurusan Teknologi Maklumat',
    phoneNumber: '+6017-654 3210',
    roomId: 'room-5',
    date: getFormattedDateOffset(1), // Tomorrow
    startTime: '09:00',
    endTime: '17:00',
    participants: 40,
    meetingType: 'Workshop',
    purpose: 'Latihan amali penggunaan sistem tanpa kertas (paperless) untuk ketua-ketua unit.',
    equipment: ['Projector', 'PA System', 'Microphone', 'Speaker'],
    notes: 'Susunan meja gaya kelas (classroom style).',
    status: 'booked',
    createdAt: '2026-09-27T11:00:00.000Z',
    updatedAt: '2026-09-27T11:00:00.000Z',
  },
  {
    id: 'b-6',
    bookingId: 'MRB-2026-0006',
    meetingTitle: 'Mesyuarat Lembaga Kewangan Suku Ketiga',
    organizer: 'Ahmad Faiz bin Mansor',
    organizerEmail: 'admin@meetingroom.local',
    department: 'Jabatan Pentadbiran & Sumber Manusia',
    phoneNumber: '+6019-321 8844',
    roomId: 'room-6',
    date: getFormattedDateOffset(3),
    startTime: '10:00',
    endTime: '12:30',
    participants: 12,
    meetingType: 'Meeting',
    purpose: 'Pembentangan prestasi perbelanjaan bajet mengurus dan pembangunan.',
    equipment: ['Television', 'Video Conference', 'Smart Board'],
    notes: 'Rakaman minit mesyuarat audio-visual.',
    status: 'booked',
    createdAt: '2026-09-28T16:00:00.000Z',
    updatedAt: '2026-09-28T16:00:00.000Z',
  },
  {
    id: 'b-7',
    bookingId: 'MRB-2026-0007',
    meetingTitle: 'Sesi Sembang Santai & Kaunseling Kerjaya',
    organizer: 'Siti Nur Aisyah binti Rahman',
    organizerEmail: 'staff@meetingroom.local',
    department: 'Jabatan Perancangan Bandar dan Desa',
    phoneNumber: '+6012-456 7890',
    roomId: 'room-3',
    date: getFormattedDateOffset(-2), // Past
    startTime: '15:00',
    endTime: '16:00',
    participants: 4,
    meetingType: 'Discussion',
    purpose: 'Sesi perkongsian haluan kerjaya staf kontrak baharu.',
    equipment: ['Whiteboard'],
    status: 'completed',
    createdAt: '2026-09-24T10:00:00.000Z',
    updatedAt: '2026-09-30T16:00:00.000Z',
  },
  {
    id: 'b-8',
    bookingId: 'MRB-2026-0008',
    meetingTitle: 'Perbincangan Bajet Pembaikan Lif Blok B',
    organizer: 'Mohd Safwan bin Ismail',
    organizerEmail: 'safwan@meetingroom.local',
    department: 'Jabatan Kejuruteraan',
    phoneNumber: '+6013-889 1234',
    roomId: 'room-2',
    date: getFormattedDateOffset(-1),
    startTime: '11:00',
    endTime: '12:00',
    participants: 6,
    meetingType: 'Meeting',
    purpose: 'Perbincangan sebut harga kontraktor pembekal komponen lif.',
    equipment: ['Television'],
    status: 'cancelled',
    notes: 'Dibatalkan atas arahan pengarah kerana tarikh lawatan tapak dipinda.',
    createdAt: '2026-09-26T14:30:00.000Z',
    updatedAt: '2026-10-01T09:00:00.000Z',
  },
];

class StorageService {
  private rooms: Room[] = [];
  private bookings: Booking[] = [];
  private users: User[] = [];
  private currentUser: User = INITIAL_USERS[0];

  constructor() {
    this.init();
  }

  private init() {
    try {
      const storedRooms = localStorage.getItem(STORAGE_KEYS.ROOMS);
      this.rooms = storedRooms ? JSON.parse(storedRooms) : INITIAL_ROOMS;

      const storedBookings = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      this.bookings = storedBookings ? JSON.parse(storedBookings) : INITIAL_BOOKINGS;

      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      this.users = storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS;

      const storedCurrentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      this.currentUser = storedCurrentUser ? JSON.parse(storedCurrentUser) : INITIAL_USERS[0];

      // Save initial back if first time
      if (!storedRooms) localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(this.rooms));
      if (!storedBookings) localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(this.bookings));
      if (!storedUsers) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      if (!storedCurrentUser) localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
    } catch (e) {
      console.error('Storage initialization failed, using in-memory data', e);
      this.rooms = INITIAL_ROOMS;
      this.bookings = INITIAL_BOOKINGS;
      this.users = INITIAL_USERS;
      this.currentUser = INITIAL_USERS[0];
    }
  }

  // --- Rooms ---
  getRooms(): Room[] {
    return [...this.rooms];
  }

  getRoomById(id: string): Room | undefined {
    return this.rooms.find((r) => r.id === id);
  }

  saveRoom(room: Room): Room {
    const index = this.rooms.findIndex((r) => r.id === room.id);
    if (index >= 0) {
      this.rooms[index] = room;
    } else {
      this.rooms.push(room);
    }
    this.persistRooms();
    return room;
  }

  deleteRoom(id: string): boolean {
    const initialLen = this.rooms.length;
    this.rooms = this.rooms.filter((r) => r.id !== id);
    if (this.rooms.length !== initialLen) {
      this.persistRooms();
      return true;
    }
    return false;
  }

  private persistRooms() {
    try {
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(this.rooms));
    } catch (e) {
      console.error('Failed to persist rooms', e);
    }
  }

  // --- Bookings ---
  getBookings(): Booking[] {
    return [...this.bookings];
  }

  getBookingById(id: string): Booking | undefined {
    return this.bookings.find((b) => b.id === id || b.bookingId === id);
  }

  // Generate next unique Booking ID: MRB-2026-XXXX
  getNextBookingId(): string {
    const year = '2026';
    const numbers = this.bookings
      .map((b) => {
        const match = b.bookingId.match(/MRB-\d{4}-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
    const nextSeq = String(maxNum + 1).padStart(4, '0');
    return `MRB-${year}-${nextSeq}`;
  }

  /**
   * Conflict Detection Logic
   * A booking conflicts when:
   * existingStart < newEnd AND existingEnd > newStart
   * on the SAME room and SAME date (excluding cancelled bookings and self if editing)
   */
  checkConflict(
    roomId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): ConflictCheckResult {
    // Only check active/confirmed bookings
    const activeBookingsOnSameDate = this.bookings.filter(
      (b) =>
        b.roomId === roomId &&
        b.date === date &&
        b.status !== 'cancelled' &&
        b.id !== excludeBookingId
    );

    for (const b of activeBookingsOnSameDate) {
      // Time string comparison 'HH:mm' works correctly with standard 24h format e.g. "09:00" < "11:00"
      const existingStart = b.startTime;
      const existingEnd = b.endTime;

      if (existingStart < endTime && existingEnd > startTime) {
        return {
          hasConflict: true,
          conflictingBooking: b,
          message: `Maaf, bilik ini telah ditempah pada waktu tersebut (${b.startTime} - ${b.endTime}: "${b.meetingTitle}" oleh ${b.organizer}). Sila pilih masa atau bilik lain.`,
        };
      }
    }

    return { hasConflict: false };
  }

  saveBooking(booking: Booking): Booking {
    const index = this.bookings.findIndex((b) => b.id === booking.id);
    if (index >= 0) {
      this.bookings[index] = {
        ...booking,
        updatedAt: new Date().toISOString(),
      };
    } else {
      this.bookings.push({
        ...booking,
        createdAt: booking.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    this.persistBookings();
    return booking;
  }

  cancelBooking(id: string, reason?: string): boolean {
    const booking = this.bookings.find((b) => b.id === id);
    if (booking) {
      booking.status = 'cancelled';
      if (reason) {
        booking.notes = booking.notes
          ? `${booking.notes} [Batal: ${reason}]`
          : `[Batal: ${reason}]`;
      }
      booking.updatedAt = new Date().toISOString();
      this.persistBookings();
      return true;
    }
    return false;
  }

  deleteBooking(id: string): boolean {
    const initialLen = this.bookings.length;
    this.bookings = this.bookings.filter((b) => b.id !== id);
    if (this.bookings.length !== initialLen) {
      this.persistBookings();
      return true;
    }
    return false;
  }

  private persistBookings() {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(this.bookings));
    } catch (e) {
      console.error('Failed to persist bookings', e);
    }
  }

  // --- Users & Auth ---
  getUsers(): User[] {
    return [...this.users];
  }

  getCurrentUser(): User {
    return this.currentUser;
  }

  setCurrentUser(user: User): void {
    this.currentUser = user;
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to set current user', e);
    }
  }

  saveUser(user: User): User {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      this.users[index] = user;
    } else {
      this.users.push(user);
    }
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    } catch (e) {
      console.error('Failed to persist users', e);
    }
    // Update currentUser if modified
    if (this.currentUser.id === user.id) {
      this.setCurrentUser(user);
    }
    return user;
  }

  deleteUser(id: string): boolean {
    if (this.currentUser.id === id) {
      return false; // Cannot delete self
    }
    this.users = this.users.filter((u) => u.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
      return true;
    } catch (e) {
      console.error('Failed to delete user', e);
      return false;
    }
  }

  // Reset demo data
  resetDemoData(): void {
    this.rooms = [...INITIAL_ROOMS];
    this.bookings = [...INITIAL_BOOKINGS];
    this.users = [...INITIAL_USERS];
    this.currentUser = INITIAL_USERS[0];
    localStorage.removeItem(STORAGE_KEYS.ROOMS);
    localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    this.init();
  }
}

export const storageService = new StorageService();
