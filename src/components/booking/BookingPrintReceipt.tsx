import React from 'react';
import { Booking, Room } from '../../types';
import { formatDate, formatTimeRange } from '../../utils/formatters';
import { Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';

interface BookingPrintReceiptProps {
  booking: Booking | null;
  room?: Room;
  onClose: () => void;
}

export const BookingPrintReceipt: React.FC<BookingPrintReceiptProps> = ({
  booking,
  room,
  onClose,
}) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 p-4 sm:p-6 flex items-center justify-center">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden print:m-0 print:p-0 print:shadow-none print:border-none print:w-full">
        {/* Top Floating Control Bar (Hidden on print) */}
        <div className="no-print p-4 bg-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Pratonton Cetakan Surat Pengesahan Rasmi</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Cetak Sekarang
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Printable Document */}
        <div className="p-8 sm:p-12 space-y-6 text-slate-900">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-900 flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                MRB
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight uppercase text-blue-950">
                  SISTEM TEMPAHAN BILIK MESYUARAT
                </h1>
                <p className="text-xs font-semibold text-slate-600">
                  BAHAGIAN PENTADBIRAN & PENGURUSAN FASILITI
                </p>
                <p className="text-[11px] text-slate-400">
                  Kompleks Pentadbiran Kerajaan Persekutuan, Putrajaya, Malaysia
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                No. Rujukan Tempahan
              </span>
              <span className="font-mono text-sm font-extrabold text-blue-900">
                {booking.bookingId}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Tarikh Cetakan: {new Date().toLocaleDateString('ms-MY')}
              </span>
            </div>
          </div>

          {/* Title banner */}
          <div className="text-center py-2 bg-slate-50 border border-slate-200 rounded-lg">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              SURAT PENGESAHAN TEMPAHAN BILIK MESYUARAT
            </h2>
            <p className="text-[11px] text-slate-500">
              Dokumen ini mengesahkan bahawa tempahan fasiliti telah direkodkan dan diluluskan secara automatik.
            </p>
          </div>

          {/* Details Table */}
          <table className="w-full text-xs border border-slate-200">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-3 bg-slate-50 font-bold text-slate-600 w-1/3">Tajuk Mesyuarat</td>
                <td className="p-3 font-extrabold text-slate-900">{booking.meetingTitle}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-3 bg-slate-50 font-bold text-slate-600">Bilik Mesyuarat</td>
                <td className="p-3 font-bold text-blue-900">
                  {room?.name} — {room?.location}
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-3 bg-slate-50 font-bold text-slate-600">Tarikh Mesyuarat</td>
                <td className="p-3 font-semibold text-slate-800">{formatDate(booking.date, 'ms')}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-3 bg-slate-50 font-bold text-slate-600">Waktu Mesyuarat</td>
                <td className="p-3 font-semibold text-slate-800">
                  {formatTimeRange(booking.startTime, booking.endTime)}
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-3 bg-slate-50 font-bold text-slate-600">Pegawai Penganjur</td>
                <td className="p-3 text-slate-800">
                  {booking.organizer} ({booking.department})
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-3 bg-slate-50 font-bold text-slate-600">Emel & Telefon</td>
                <td className="p-3 text-slate-700">
                  {booking.organizerEmail} {booking.phoneNumber ? `• ${booking.phoneNumber}` : ''}
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-3 bg-slate-50 font-bold text-slate-600">Bilangan Peserta</td>
                <td className="p-3 text-slate-800">{booking.participants} orang</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-3 bg-slate-50 font-bold text-slate-600">Peralatan Ditempah</td>
                <td className="p-3 text-slate-800">{booking.equipment.join(', ') || 'Tiada'}</td>
              </tr>
              {booking.purpose && (
                <tr className="border-b border-slate-200">
                  <td className="p-3 bg-slate-50 font-bold text-slate-600">Tujuan / Agenda</td>
                  <td className="p-3 text-slate-700">{booking.purpose}</td>
                </tr>
              )}
              {booking.notes && (
                <tr>
                  <td className="p-3 bg-slate-50 font-bold text-slate-600">Catatan Khas</td>
                  <td className="p-3 text-slate-700">{booking.notes}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Stamp / Verification Section */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-xs border-t border-slate-200">
            <div>
              <p className="font-bold text-slate-800">Tandatangan Penganjur:</p>
              <div className="h-16 border-b border-dashed border-slate-300 mt-2"></div>
              <p className="text-[11px] text-slate-500 mt-1">({booking.organizer})</p>
            </div>

            <div className="text-right flex flex-col items-end">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-300 font-bold text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>PENGESAHAN SISTEM SAH</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                Dijana secara berkomputer melalui Sistem Tempahan Bilik Mesyuarat (MRB).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
