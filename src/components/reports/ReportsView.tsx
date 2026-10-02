import React from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  TrendingUp, 
  PieChart, 
  Calendar, 
  Building, 
  Users, 
  CheckCircle2, 
  XCircle,
  Clock
} from 'lucide-react';
import { Booking, Room } from '../../types';
import { exportBookingsToCSV } from '../../utils/csvExport';
import { getDurationHours } from '../../utils/formatters';

interface ReportsViewProps {
  rooms: Room[];
  bookings: Booking[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ rooms, bookings }) => {
  const roomMap = new Map<string, Room>();
  rooms.forEach((r) => roomMap.set(r.id, r));

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter((b) => b.status !== 'cancelled');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');
  const cancelledRate = totalBookings > 0 ? ((cancelledBookings.length / totalBookings) * 100).toFixed(1) : '0';

  // Calculate total meeting hours booked
  const totalHoursBooked = activeBookings.reduce((acc, b) => {
    return acc + getDurationHours(b.startTime, b.endTime);
  }, 0);

  // Total available operational hours in month (e.g. 22 working days * 9 hours/day * rooms.length)
  const totalCapacityHours = 22 * 9 * Math.max(1, rooms.length);
  const utilizationRate = Math.min(100, (totalHoursBooked / totalCapacityHours) * 100).toFixed(1);

  // Bookings by Room
  const roomCountMap = new Map<string, number>();
  rooms.forEach((r) => roomCountMap.set(r.id, 0));
  bookings.forEach((b) => {
    roomCountMap.set(b.roomId, (roomCountMap.get(b.roomId) || 0) + 1);
  });

  const roomStats = Array.from(roomCountMap.entries())
    .map(([roomId, count]) => ({
      room: roomMap.get(roomId),
      count,
      percent: totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Bookings by Department
  const deptCountMap = new Map<string, number>();
  bookings.forEach((b) => {
    const dept = b.department || 'Lain-lain';
    deptCountMap.set(dept, (deptCountMap.get(dept) || 0) + 1);
  });

  const departmentStats = Array.from(deptCountMap.entries())
    .map(([department, count]) => ({
      department,
      count,
      percent: totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Bookings by Meeting Type
  const typeCountMap = new Map<string, number>();
  bookings.forEach((b) => {
    typeCountMap.set(b.meetingType, (typeCountMap.get(b.meetingType) || 0) + 1);
  });

  const typeStats = Array.from(typeCountMap.entries())
    .map(([type, count]) => ({
      type,
      count,
      percent: totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header with Export & Print */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Laporan & Statistik Penggunaan Bilik</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Laporan Prestasi & Analisis Penggunaan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Analisis data tempahan bilik mesyuarat, kadar penggunaan dan taburan aktiviti jabatan.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => exportBookingsToCSV(bookings, rooms)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Eksport CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* High-level Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Jumlah Tempahan</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-3">{totalBookings}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Keseluruhan sesi direkodkan</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Kadar Penggunaan Bilik</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 mt-3">{utilizationRate}%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Purata waktu beroperasi</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Jumlah Jam Digunakan</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-indigo-600 mt-3">{totalHoursBooked.toFixed(1)} Jam</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Masa mesyuarat aktif</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Kadar Pembatalan</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-600 mt-3">{cancelledRate}%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{cancelledBookings.length} tempahan dibatalkan</p>
        </div>
      </div>

      {/* Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Bookings by Room / Room Utilization */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Kekerapan Penggunaan Mengikut Bilik</h3>
              <p className="text-xs text-slate-500">Bilik paling kerap ditempah oleh kakitangan</p>
            </div>
            <Building className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-4 pt-1">
            {roomStats.map((item, idx) => (
              <div key={item.room?.id || idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    {item.room?.name || 'Bilik Mesyuarat'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{item.count} tempahan</span>
                    <span className="font-bold text-blue-700 w-10 text-right">{item.percent}%</span>
                  </div>
                </div>

                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-700 to-indigo-600 rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(item.percent, 3)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Bookings by Department */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Taburan Tempahan Mengikut Jabatan</h3>
              <p className="text-xs text-slate-500">Bahagian dan unit paling aktif menganjurkan mesyuarat</p>
            </div>
            <Users className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-4 pt-1">
            {departmentStats.map((item, idx) => (
              <div key={item.department || idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 truncate max-w-[240px]">
                    {item.department}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-500">{item.count} tempahan</span>
                    <span className="font-bold text-indigo-700 w-10 text-right">{item.percent}%</span>
                  </div>
                </div>

                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-sky-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(item.percent, 3)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Meeting Type Distribution */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Taburan Mengikut Kategori Mesyuarat (Meeting Types)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
          {typeStats.map((item) => (
            <div
              key={item.type}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
            >
              <p className="text-xs font-semibold text-slate-500">{item.type}</p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{item.count} sesi</p>
              <div className="mt-2 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${Math.max(item.percent, 4)}%` }}
                />
              </div>
              <p className="text-[10px] text-blue-700 font-bold mt-1 text-right">{item.percent}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
