import React, { useState } from 'react';
import { 
  Building, 
  CheckCircle, 
  Calendar, 
  Users, 
  Clock, 
  ArrowRight, 
  PlusCircle, 
  Sparkles,
  MapPin,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Booking, Room } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { EquipmentBadge } from '../common/EquipmentBadge';
import { formatDate, formatTimeRange } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

interface DashboardProps {
  rooms: Room[];
  bookings: Booking[];
  onNavigateToBooking: (roomId?: string) => void;
  onNavigateToCalendar: () => void;
  onNavigateToRooms: () => void;
  onSelectBooking: (booking: Booking) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  rooms,
  bookings,
  onNavigateToBooking,
  onNavigateToCalendar,
  onNavigateToRooms,
  onSelectBooking,
}) => {
  const { t } = useAuth();
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('all');

  // Center around 2026-10-02 (the system reference date)
  const todayStr = '2026-10-02';

  // Metrics
  const totalRooms = rooms.length;

  const todayBookings = bookings.filter(
    (b) => b.date === todayStr && b.status !== 'cancelled'
  );

  const currentlyOccupiedBookings = todayBookings.filter(
    (b) => b.status === 'in_progress'
  );
  const currentlyOccupiedRoomsCount = new Set(
    currentlyOccupiedBookings.map((b) => b.roomId)
  ).size;

  // Available rooms today (rooms with no bookings right now, not in maintenance)
  const availableRoomsCount = rooms.filter(
    (r) => r.status !== 'maintenance' && !currentlyOccupiedBookings.some((b) => b.roomId === r.id)
  ).length;

  // Upcoming meetings (today after current time or upcoming dates)
  const upcomingMeetings = bookings.filter(
    (b) => b.date >= todayStr && b.status === 'booked'
  );

  // Filter today's bookings by room if selected
  const filteredTodayBookings = todayBookings
    .filter((b) => selectedRoomFilter === 'all' || b.roomId === selectedRoomFilter)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const roomMap = new Map<string, Room>();
  rooms.forEach((r) => roomMap.set(r.id, r));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6 sm:p-8 shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold backdrop-blur-xs mb-3 border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>Portal Rasmi Organisasi • {formatDate(todayStr, 'ms')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Datang ke Sistem Tempahan Bilik
            </h2>
            <p className="mt-2 text-sm text-blue-100/90 leading-relaxed">
              Semak kekosongan bilik secara langsung, tempah ruang mesyuarat tanpa pertindihan jadual, dan pantau mesyuarat harian organisasi anda dengan cekap.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateToBooking()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-900 font-bold text-xs sm:text-sm hover:bg-blue-50 transition-all shadow-md active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-blue-700" />
              <span>Tempah Bilik Sekarang</span>
            </button>
            <button
              onClick={onNavigateToCalendar}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-700/60 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm border border-blue-400/40 backdrop-blur-xs transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Lihat Kalendar</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Total Rooms */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t('totalRooms')}</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalRooms}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Ruang berdaftar</p>
          </div>
        </div>

        {/* Card 2: Available Today */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t('availableToday')}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{availableRoomsCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Sedia untuk ditempah</p>
          </div>
        </div>

        {/* Card 3: Today's Bookings */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t('todayBookings')}</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600">{todayBookings.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Sesi berjadual</p>
          </div>
        </div>

        {/* Card 4: Currently Occupied */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t('currentlyOccupied')}</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">{currentlyOccupiedRoomsCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Bilik sedang diguna</p>
          </div>
        </div>

        {/* Card 5: Upcoming Meetings */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t('upcomingMeetings')}</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-800">{upcomingMeetings.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Sepanjang bulan ini</p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Today's Schedule Timeline */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Jadual Tempahan Hari Ini</span>
                <span className="text-xs font-normal text-slate-500">
                  ({filteredTodayBookings.length} sesi)
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Susunan mesyuarat untuk hari ini ({formatDate(todayStr, 'ms')})
              </p>
            </div>

            {/* Room Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedRoomFilter}
                onChange={(e) => setSelectedRoomFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden focus:border-blue-500"
              >
                <option value="all">Semua Bilik ({rooms.length})</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bookings Timeline List */}
          <div className="mt-4 divide-y divide-slate-100">
            {filteredTodayBookings.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2 opacity-60" />
                <p className="text-sm font-semibold text-slate-700">
                  Tiada tempahan untuk kriteria ini hari ini
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Bilik mesyuarat lapang dan bersedia untuk digunakan.
                </p>
                <button
                  onClick={() => onNavigateToBooking()}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Buat Tempahan Sekarang</span>
                </button>
              </div>
            ) : (
              filteredTodayBookings.map((b) => {
                const room = roomMap.get(b.roomId);
                return (
                  <div
                    key={b.id}
                    onClick={() => onSelectBooking(b)}
                    className="py-3.5 sm:py-4 px-2 -mx-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start gap-3">
                        {/* Time block badge */}
                        <div className="shrink-0 text-center w-20 py-1.5 px-2 bg-blue-50 border border-blue-100 rounded-lg">
                          <p className="text-xs font-extrabold text-blue-900 leading-tight">
                            {b.startTime}
                          </p>
                          <p className="text-[10px] text-blue-600 font-medium">hingga {b.endTime}</p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                              {b.meetingTitle}
                            </h4>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                              {b.bookingId}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                            <span className="font-semibold text-slate-700 flex items-center gap-1">
                              <Building className="w-3.5 h-3.5 text-blue-600" />
                              {room?.name || 'Bilik Mesyuarat'}
                            </span>
                            <span>•</span>
                            <span>{b.organizer}</span>
                            <span>•</span>
                            <span className="text-slate-400">{b.department}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center shrink-0 mt-1 sm:mt-0">
                        <StatusBadge status={b.status} size="sm" />
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all hidden sm:block" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Quick Room Status & Capacity */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Status Semasa Bilik</h3>
              <button
                onClick={onNavigateToRooms}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Lihat Semua
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {rooms.slice(0, 4).map((r) => {
                const isOccupied = todayBookings.some(
                  (b) => b.roomId === r.id && b.status === 'in_progress'
                );

                return (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{r.name}</h4>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {r.location}
                        </p>
                      </div>
                      <StatusBadge
                        status={
                          r.status === 'maintenance'
                            ? 'maintenance'
                            : isOccupied
                            ? 'in_progress'
                            : 'available'
                        }
                        size="sm"
                      />
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-200/50">
                      <span className="font-medium">Kapasiti: {r.capacity} orang</span>
                      <button
                        onClick={() => onNavigateToBooking(r.id)}
                        className="text-blue-600 hover:text-blue-800 font-bold hover:underline"
                      >
                        Tempah »
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Help Card */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-4 sm:p-5 rounded-2xl shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Peraturan Penggunaan Bilik
            </h4>
            <ul className="mt-2 text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>Tempahan hendaklah dibuat sekurang-kurangnya 1 jam awal.</li>
              <li>Sila pastikan peralatan ditutup selepas selesai mesyuarat.</li>
              <li>Batalkan tempahan jika mesyuarat ditangguhkan.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
