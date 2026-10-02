import React from 'react';
import { 
  Building, 
  Calendar, 
  Clock, 
  Users, 
  Printer, 
  Download, 
  Edit3, 
  Trash2, 
  FileText, 
  Layers, 
  Mail, 
  Phone,
  CheckCircle2
} from 'lucide-react';
import { Booking, Room } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { EquipmentBadge } from '../common/EquipmentBadge';
import { Modal } from '../common/Modal';
import { formatDate, formatTimeRange } from '../../utils/formatters';
import { downloadIcsCalendar } from '../../utils/calendarExport';

interface BookingDetailsModalProps {
  booking: Booking | null;
  room?: Room;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
  onPrint?: (booking: Booking) => void;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  room,
  isOpen,
  onClose,
  onEdit,
  onCancel,
  onPrint,
}) => {
  if (!booking) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Maklumat Lengkap Tempahan Bilik"
      subtitle={`No. Rujukan: ${booking.bookingId}`}
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Status banner */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status Semasa:</span>
            <StatusBadge status={booking.status} size="sm" />
          </div>
          <span className="text-xs font-mono font-bold text-blue-700 bg-white px-2.5 py-1 rounded border border-blue-200">
            {booking.bookingId}
          </span>
        </div>

        {/* Meeting Title & Type */}
        <div>
          <span className="inline-block text-[11px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded mb-1">
            {booking.meetingType}
          </span>
          <h2 className="text-lg font-extrabold text-slate-900 leading-snug">
            {booking.meetingTitle}
          </h2>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold block">Bilik Mesyuarat:</span>
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-600" />
              {room?.name || 'Bilik Mesyuarat'}
            </p>
            <p className="text-[11px] text-slate-500">{room?.location}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold block">Tarikh & Waktu:</span>
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              {formatDate(booking.date, 'ms')}
            </p>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {formatTimeRange(booking.startTime, booking.endTime)}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold block">Pegawai Penganjur:</span>
            <p className="font-bold text-slate-800">{booking.organizer}</p>
            <p className="text-[11px] text-slate-500">{booking.department}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold block">Hubungan Penganjur:</span>
            <p className="text-slate-700 flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400" />
              {booking.organizerEmail}
            </p>
            {booking.phoneNumber && (
              <p className="text-slate-700 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                {booking.phoneNumber}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold block">Bilangan Peserta:</span>
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              {booking.participants} orang
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 font-semibold block">Dicipta Pada:</span>
            <p className="text-slate-700">
              {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('ms-MY') : '-'}
            </p>
          </div>
        </div>

        {/* Purpose */}
        {booking.purpose && (
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-700">Tujuan / Agenda Mesyuarat:</h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
              {booking.purpose}
            </p>
          </div>
        )}

        {/* Equipment */}
        {booking.equipment && booking.equipment.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-700">Peralatan Diperlukan:</h4>
            <div className="flex flex-wrap gap-1.5">
              {booking.equipment.map((item) => (
                <EquipmentBadge key={item} item={item} size="sm" />
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {booking.notes && (
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-700">Catatan Tambahan:</h4>
            <p className="text-xs text-slate-600 italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-200">
              {booking.notes}
            </p>
          </div>
        )}

        {/* Actions Footer */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadIcsCalendar(booking, room)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Simpan ke Kalendar (.ics)</span>
            </button>

            {onPrint && (
              <button
                onClick={() => onPrint(booking)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Cetak Slip</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {booking.status !== 'cancelled' && onCancel && (
              <button
                onClick={() => {
                  onCancel(booking);
                  onClose();
                }}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Batalkan Tempahan
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
