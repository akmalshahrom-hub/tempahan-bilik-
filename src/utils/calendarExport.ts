import { Booking, Room } from '../types';

/**
 * Generates an iCalendar (.ics) format string and triggers browser download.
 */
export const downloadIcsCalendar = (booking: Booking, room?: Room): void => {
  const formatIcsDateTime = (dateStr: string, timeStr: string): string => {
    // dateStr: YYYY-MM-DD, timeStr: HH:mm
    const dateFormatted = dateStr.replace(/-/g, '');
    const timeFormatted = timeStr.replace(/:/g, '') + '00';
    return `${dateFormatted}T${timeFormatted}`;
  };

  const startDt = formatIcsDateTime(booking.date, booking.startTime);
  const endDt = formatIcsDateTime(booking.date, booking.endTime);
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const roomLocation = room ? `${room.name}, ${room.location}` : 'Bilik Mesyuarat';
  const cleanSummary = (booking.meetingTitle || 'Mesyuarat').replace(/,/g, '\\,');
  const cleanDesc = (
    `Tempahan: ${booking.bookingId}\\n` +
    `Penganjur: ${booking.organizer} (${booking.department})\\n` +
    `Bilik: ${roomLocation}\\n` +
    `Tujuan: ${booking.purpose || 'Tiada'}\\n` +
    `Bilangan Peserta: ${booking.participants} orang`
  ).replace(/\n/g, '\\n');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sistem Tempahan Bilik Mesyuarat Malaysia//MY',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${booking.bookingId}@meetingroom.local`,
    `DTSTAMP:${now}`,
    `DTSTART:${startDt}`,
    `DTEND:${endDt}`,
    `SUMMARY:${cleanSummary}`,
    `DESCRIPTION:${cleanDesc}`,
    `LOCATION:${roomLocation}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `${booking.bookingId}-jadual.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
