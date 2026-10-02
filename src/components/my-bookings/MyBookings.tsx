import React, { useState } from 'react';
import { 
  BookmarkCheck, 
  Calendar, 
  Clock, 
  Building, 
  Trash2, 
  Eye, 
  Edit3, 
  Printer, 
  Download, 
  Search, 
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Booking, Room } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { formatDate, formatTimeRange } from '../../utils/formatters';
import { downloadIcsCalendar } from '../../utils/calendarExport';
import { useAuth } from '../../context/AuthContext';

interface MyBookingsProps {
  bookings: Booking[];
  rooms: Room[];
  onSelectBooking: (booking: Booking) => void;
  onCancelBooking: (bookingId: string, reason?: string) => void;
  onEditBooking: (booking: Booking) => void;
  onPrintBooking: (booking: Booking) => void;
  onNewBooking: () => void;
}

type TabCategory = 'all' | 'today' | 'upcoming' | 'past' | 'cancelled';

export const MyBookings: React.FC<MyBookingsProps> = ({
  bookings,
  rooms,
  onSelectBooking,
  onCancelBooking,
  onEditBooking,
  onPrintBooking,
  onNewBooking,
}) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser.role === 'Administrator';

  const [activeTab, setActiveTab] = useState<TabCategory>('all');
  const [search, setSearch] = useState('');
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const todayStr = '2026-10-02';

  const roomMap = new Map<string, Room>();
  rooms.forEach((r) => roomMap.set(r.id, r));

  // If user is staff, show bookings created by this staff or their department,
  // or allow toggle to view organization wide if needed.
  // We filter user's bookings first or show all if admin:
  const userBookings = bookings.filter((b) => {
    if (isAdmin) return true; // Administrator sees all bookings
    // For staff, match their email, name, or department
    return (
      b.organizerEmail.toLowerCase() === currentUser.email.toLowerCase() ||
      b.organizer.toLowerCase().includes(currentUser.name.toLowerCase()) ||
      b.department.toLowerCase() === currentUser.department.toLowerCase()
    );
  });

  // Categorize
  const categorized = userBookings.filter((b) => {
    // Search query
    const matchSearch =
      b.meetingTitle.toLowerCase().includes(search.toLowerCase()) ||
      b.bookingId.toLowerCase().includes(search.toLowerCase()) ||
      (roomMap.get(b.roomId)?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      b.organizer.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;

    if (activeTab === 'cancelled') {
      return b.status === 'cancelled';
    }

    if (activeTab === 'today') {
      return b.date === todayStr && b.status !== 'cancelled';
    }

    if (activeTab === 'upcoming') {
      return b.date > todayStr && b.status !== 'cancelled';
    }

    if (activeTab === 'past') {
      return b.date < todayStr || b.status === 'completed';
    }

    return true; // 'all'
  });

  const counts = {
    all: userBookings.length,
    today: userBookings.filter((b) => b.date === todayStr && b.status !== 'cancelled').length,
    upcoming: userBookings.filter((b) => b.date > todayStr && b.status !== 'cancelled').length,
    past: userBookings.filter((b) => b.date < todayStr || b.status === 'completed').length,
    cancelled: userBookings.filter((b) => b.status === 'cancelled').length,
  };

  const handleConfirmCancel = () => {
    if (cancelModalBooking) {
      onCancelBooking(cancelModalBooking.id, cancelReason);
      setCancelModalBooking(null);
      setCancelReason('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Pengurusan Tempahan Saya
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isAdmin
              ? 'Paparan semua rekod tempahan bilik mesyuarat di peringkat pentadbir organisasi.'
              : `Senarai tempahan bilik mesyuarat di bawah kendalian ${currentUser.name}.`}
          </p>
        </div>

        <button
          onClick={onNewBooking}
          className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          + Tempahan Baharu
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Semua Tempahan</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'all' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('today')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'today'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Hari Ini</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'today' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {counts.today}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'upcoming'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Akan Datang</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'upcoming' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {counts.upcoming}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('past')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'past'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Terdahulu</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'past' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {counts.past}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'cancelled'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Dibatalkan</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'cancelled' ? 'bg-rose-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {counts.cancelled}
            </span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari mengikut tajuk mesyuarat, bilik, atau ID tempahan (cth: MRB-2026-0001)..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-3">
        {categorized.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <BookmarkCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Tiada Rekod Tempahan</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Tiada tempahan ditemui di bawah kategori atau carian ini.
            </p>
            <button
              onClick={onNewBooking}
              className="mt-4 px-4 py-2 bg-blue-700 text-white rounded-xl text-xs font-semibold hover:bg-blue-800 transition-colors"
            >
              Tempah Bilik Baharu
            </button>
          </div>
        ) : (
          categorized.map((b) => {
            const room = roomMap.get(b.roomId);
            const isCancelled = b.status === 'cancelled';

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Booking Details */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {b.bookingId}
                      </span>
                      <StatusBadge status={b.status} size="sm" />
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {b.meetingType}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{b.meetingTitle}</h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Building className="w-3.5 h-3.5 text-blue-600" />
                        {room?.name || 'Bilik Mesyuarat'} ({room?.location})
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(b.date, 'ms')}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formatTimeRange(b.startTime, b.endTime)}
                      </span>

                      <span>•</span>
                      <span>{b.organizer} ({b.department})</span>
                      <span>•</span>
                      <span>{b.participants} peserta</span>
                    </div>

                    {b.notes && (
                      <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                        Catatan: {b.notes}
                      </p>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <button
                      onClick={() => onSelectBooking(b)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                      title="Lihat Maklumat Penuh"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Butiran</span>
                    </button>

                    <button
                      onClick={() => downloadIcsCalendar(b, room)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                      title="Simpan Kalendar"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">.ICS</span>
                    </button>

                    <button
                      onClick={() => onPrintBooking(b)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                      title="Cetak Surat Pengesahan"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Cetak</span>
                    </button>

                    {!isCancelled && (
                      <>
                        <button
                          onClick={() => onEditBooking(b)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors"
                          title="Kemaskini Tempahan"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Ubah</span>
                        </button>

                        <button
                          onClick={() => setCancelModalBooking(b)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition-colors"
                          title="Batalkan Tempahan Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Batal</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalBooking && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setCancelModalBooking(null)}
          onConfirm={handleConfirmCancel}
          title="Pengesahan Pembatalan Tempahan"
          message={`Adakah anda pasti ingin membatalkan tempahan "${cancelModalBooking.meetingTitle}" (${cancelModalBooking.bookingId}) pada ${formatDate(cancelModalBooking.date, 'ms')}? Bilik ini akan dibuka semula untuk tempahan staf lain.`}
          confirmLabel="Ya, Batalkan Tempahan"
          cancelLabel="Kembali"
          isDestructive={true}
        />
      )}
    </div>
  );
};
