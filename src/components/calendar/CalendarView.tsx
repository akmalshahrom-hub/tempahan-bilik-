import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Filter, 
  Clock, 
  Building, 
  User, 
  Plus, 
  Layers,
  CheckCircle2
} from 'lucide-react';
import { Booking, Room } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate, formatTimeRange } from '../../utils/formatters';

interface CalendarViewProps {
  rooms: Room[];
  bookings: Booking[];
  onSelectBooking: (booking: Booking) => void;
  onNewBookingForDate?: (dateStr: string, roomId?: string) => void;
}

type ViewMode = 'day' | 'week' | 'month';

export const CalendarView: React.FC<CalendarViewProps> = ({
  rooms,
  bookings,
  onSelectBooking,
  onNewBookingForDate,
}) => {
  // Center around 2026-10-02
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 2));
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  const roomMap = new Map<string, Room>();
  rooms.forEach((r) => roomMap.set(r.id, r));

  // Departments list for filter
  const departments = Array.from(new Set(bookings.map((b) => b.department))).filter(Boolean);

  // Active bookings filter
  const filteredBookings = bookings.filter((b) => {
    if (b.status === 'cancelled') return false;
    const matchesRoom = selectedRoomId === 'all' || b.roomId === selectedRoomId;
    const matchesDept = selectedDepartment === 'all' || b.department === selectedDepartment;
    return matchesRoom && matchesDept;
  });

  // Helpers to navigate date
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'day') next.setDate(next.getDate() - 1);
    else if (viewMode === 'week') next.setDate(next.getDate() - 7);
    else next.setMonth(next.getMonth() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'day') next.setDate(next.getDate() + 1);
    else if (viewMode === 'week') next.setDate(next.getDate() + 7);
    else next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 9, 2));
  };

  const formatDateKey = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Color generator for room chips in calendar
  const getRoomColorClasses = (roomId: string) => {
    const colors = [
      'bg-blue-100 text-blue-900 border-blue-200 hover:bg-blue-200',
      'bg-indigo-100 text-indigo-900 border-indigo-200 hover:bg-indigo-200',
      'bg-sky-100 text-sky-900 border-sky-200 hover:bg-sky-200',
      'bg-teal-100 text-teal-900 border-teal-200 hover:bg-teal-200',
      'bg-purple-100 text-purple-900 border-purple-200 hover:bg-purple-200',
      'bg-amber-100 text-amber-900 border-amber-200 hover:bg-amber-200',
    ];
    let hash = 0;
    for (let i = 0; i < roomId.length; i++) {
      hash = roomId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % colors.length;
    return colors[idx];
  };

  // Month View Grid Calculation
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const calendarCells: { dateStr: string; dayNum: number; isCurrentMonth: boolean; dateObj: Date }[] = [];

    // Prev month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const dateObj = new Date(year, month - 1, d);
      calendarCells.push({
        dateStr: formatDateKey(dateObj),
        dayNum: d,
        isCurrentMonth: false,
        dateObj,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(year, month, i);
      calendarCells.push({
        dateStr: formatDateKey(dateObj),
        dayNum: i,
        isCurrentMonth: true,
        dateObj,
      });
    }

    // Next month leading days to complete grid (42 cells = 6 weeks)
    const remaining = 42 - calendarCells.length;
    for (let i = 1; i <= remaining; i++) {
      const dateObj = new Date(year, month + 1, i);
      calendarCells.push({
        dateStr: formatDateKey(dateObj),
        dayNum: i,
        isCurrentMonth: false,
        dateObj,
      });
    }

    const dayHeaders = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center">
          {dayHeaders.map((dh, idx) => (
            <div
              key={dh}
              className={`py-2.5 text-xs font-bold ${
                idx === 5 || idx === 6 ? 'text-blue-700' : 'text-slate-700'
              }`}
            >
              {dh}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
          {calendarCells.map((cell) => {
            const dayBookings = filteredBookings.filter((b) => b.date === cell.dateStr);
            const isToday = cell.dateStr === '2026-10-02';

            return (
              <div
                key={cell.dateStr}
                className={`min-h-[105px] sm:min-h-[125px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors ${
                  cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/50 text-slate-400'
                } ${isToday ? 'ring-2 ring-blue-600 ring-inset bg-blue-50/20' : ''}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                        isToday
                          ? 'bg-blue-600 text-white shadow-xs'
                          : cell.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {onNewBookingForDate && cell.isCurrentMonth && (
                      <button
                        onClick={() => onNewBookingForDate(cell.dateStr, selectedRoomId !== 'all' ? selectedRoomId : undefined)}
                        className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-slate-400 hover:text-blue-600 p-0.5 rounded transition-opacity"
                        title="Tambah tempahan pada tarikh ini"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Day Bookings chips */}
                  <div className="mt-1 space-y-1">
                    {dayBookings.slice(0, 3).map((b) => {
                      const room = roomMap.get(b.roomId);
                      const colorClass = getRoomColorClasses(b.roomId);
                      return (
                        <div
                          key={b.id}
                          onClick={() => onSelectBooking(b)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium border cursor-pointer truncate transition-colors ${colorClass}`}
                          title={`${b.startTime} - ${b.endTime}: ${b.meetingTitle} (${room?.name})`}
                        >
                          <span className="font-bold">{b.startTime}</span> {b.meetingTitle}
                        </div>
                      );
                    })}

                    {dayBookings.length > 3 && (
                      <div
                        onClick={() => {
                          setCurrentDate(cell.dateObj);
                          setViewMode('day');
                        }}
                        className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer px-1"
                      >
                        +{dayBookings.length - 3} lagi tempahan
                      </div>
                    )}
                  </div>
                </div>

                {isToday && (
                  <span className="text-[9px] font-extrabold text-blue-700 tracking-wider uppercase mt-1">
                    Hari Ini
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Week View
  const renderWeekView = () => {
    // Calculate start of week (Sunday)
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      weekDays.push(d);
    }

    const hours = [
      '08:00', '09:00', '10:00', '11:00', '12:00',
      '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
    ];

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Week headers */}
        <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50 text-center">
          <div className="py-3 text-xs font-bold text-slate-500 border-r border-slate-200">
            Waktu
          </div>
          {weekDays.map((d) => {
            const dateKey = formatDateKey(d);
            const isToday = dateKey === '2026-10-02';
            return (
              <div
                key={dateKey}
                className={`py-3 text-xs font-bold border-r border-slate-100 last:border-r-0 ${
                  isToday ? 'bg-blue-50/50 text-blue-700' : 'text-slate-800'
                }`}
              >
                <div>{d.toLocaleDateString('ms-MY', { weekday: 'short' })}</div>
                <div className="text-sm font-extrabold mt-0.5">{d.getDate()}</div>
              </div>
            );
          })}
        </div>

        {/* Hour Rows */}
        <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 min-h-[55px]">
              <div className="p-2 text-xs font-semibold text-slate-400 border-r border-slate-200 text-center bg-slate-50/30">
                {hour}
              </div>
              {weekDays.map((d) => {
                const dateKey = formatDateKey(d);
                const currentHourNum = parseInt(hour.split(':')[0], 10);

                // Find bookings active during this hour
                const activeBookings = filteredBookings.filter((b) => {
                  if (b.date !== dateKey) return false;
                  const bStart = parseInt(b.startTime.split(':')[0], 10);
                  const bEnd = parseInt(b.endTime.split(':')[0], 10);
                  return currentHourNum >= bStart && currentHourNum < bEnd;
                });

                return (
                  <div
                    key={`${dateKey}-${hour}`}
                    className="p-1 border-r border-slate-100 last:border-r-0 hover:bg-slate-50/60 transition-colors relative"
                  >
                    {activeBookings.map((b) => {
                      const colorClass = getRoomColorClasses(b.roomId);
                      const isFirstHour = parseInt(b.startTime.split(':')[0], 10) === currentHourNum;
                      if (!isFirstHour) return null; // Only render card once at start hour

                      return (
                        <div
                          key={b.id}
                          onClick={() => onSelectBooking(b)}
                          className={`p-1.5 rounded-lg border text-[11px] cursor-pointer shadow-2xs truncate ${colorClass}`}
                        >
                          <div className="font-bold truncate">{b.meetingTitle}</div>
                          <div className="text-[10px] text-slate-600 truncate">
                            {b.startTime} - {b.endTime}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Day View
  const renderDayView = () => {
    const dateKey = formatDateKey(currentDate);
    const dayBookings = filteredBookings
      .filter((b) => b.date === dateKey)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {formatDate(dateKey, 'ms')}
            </h3>
            <p className="text-xs text-slate-500">
              {dayBookings.length} tempahan bilik berdaftar pada tarikh ini
            </p>
          </div>

          {onNewBookingForDate && (
            <button
              onClick={() => onNewBookingForDate(dateKey, selectedRoomId !== 'all' ? selectedRoomId : undefined)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 text-white rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tempah Pada Tarikh Ini</span>
            </button>
          )}
        </div>

        {dayBookings.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-70" />
            <p className="text-sm font-semibold text-slate-800">
              Semua bilik lapang pada tarikh ini
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Tiada sebarang mesyuarat dijadualkan. Sedia untuk ditempah!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayBookings.map((b) => {
              const room = roomMap.get(b.roomId);
              return (
                <div
                  key={b.id}
                  onClick={() => onSelectBooking(b)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white cursor-pointer transition-all shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-4">
                      <div className="w-24 shrink-0 text-center py-2 px-2 bg-blue-50 border border-blue-100 rounded-lg">
                        <p className="text-sm font-extrabold text-blue-900">{b.startTime}</p>
                        <p className="text-[10px] text-blue-600 font-medium">hingga {b.endTime}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 hover:text-blue-700">
                          {b.meetingTitle}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="font-semibold text-slate-700 flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-blue-600" />
                            {room?.name || 'Bilik Mesyuarat'}
                          </span>
                          <span>•</span>
                          <span>{b.organizer}</span>
                          <span>•</span>
                          <span className="text-slate-400">{b.department}</span>
                          <span>•</span>
                          <span>{b.participants} peserta</span>
                        </div>
                      </div>
                    </div>

                    <StatusBadge status={b.status} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Jadual & Kalendar Mesyuarat
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Paparan jadual harian, mingguan dan bulanan bilik mesyuarat secara langsung.
          </p>
        </div>

        {/* View Mode Switcher (Day, Week, Month) */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'day'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Harian (Day)
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'week'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mingguan (Week)
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'month'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulanan (Month)
          </button>
        </div>
      </div>

      {/* Date Navigation & Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              aria-label="Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              aria-label="Seterusnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-100 text-blue-700"
          >
            Hari Ini
          </button>

          <span className="text-sm font-extrabold text-slate-800 ml-2">
            {currentDate.toLocaleDateString('ms-MY', {
              month: 'long',
              year: 'numeric',
              ...(viewMode === 'day' ? { day: 'numeric', weekday: 'long' } : {}),
            })}
          </span>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Room Filter */}
          <div className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="all">Semua Bilik ({rooms.length})</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="all">Semua Jabatan</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Calendar View Content */}
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'day' && renderDayView()}
    </div>
  );
};
