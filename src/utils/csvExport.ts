import { Booking, Room } from '../types';

export const exportBookingsToCSV = (bookings: Booking[], rooms: Room[]): void => {
  const roomMap = new Map<string, string>();
  rooms.forEach((r) => roomMap.set(r.id, r.name));

  const headers = [
    'No. Tempahan (Booking ID)',
    'Tajuk Mesyuarat',
    'Bilik Mesyuarat',
    'Tarikh',
    'Masa Mula',
    'Masa Tamat',
    'Penganjur',
    'Jabatan / Unit',
    'Emel',
    'No. Telefon',
    'Bil. Peserta',
    'Jenis Mesyuarat',
    'Peralatan',
    'Status',
    'Tujuan',
    'Catatan Tambahan',
    'Dicipta Pada',
  ];

  const escapeCSV = (str: string | number | undefined | null): string => {
    if (str === undefined || str === null) return '""';
    const stringVal = String(str).replace(/"/g, '""');
    return `"${stringVal}"`;
  };

  const rows = bookings.map((b) => [
    escapeCSV(b.bookingId),
    escapeCSV(b.meetingTitle),
    escapeCSV(roomMap.get(b.roomId) || b.roomId),
    escapeCSV(b.date),
    escapeCSV(b.startTime),
    escapeCSV(b.endTime),
    escapeCSV(b.organizer),
    escapeCSV(b.department),
    escapeCSV(b.organizerEmail),
    escapeCSV(b.phoneNumber || ''),
    escapeCSV(b.participants),
    escapeCSV(b.meetingType),
    escapeCSV(b.equipment.join(', ')),
    escapeCSV(b.status.toUpperCase()),
    escapeCSV(b.purpose),
    escapeCSV(b.notes || ''),
    escapeCSV(b.createdAt ? b.createdAt.substring(0, 10) : ''),
  ]);

  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Microsoft Excel compatibility
    [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().split('T')[0];
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `Laporan_Tempahan_Bilik_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
