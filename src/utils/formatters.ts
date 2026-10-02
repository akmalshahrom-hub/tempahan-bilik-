// Date and time formatting helpers with Malaysian Malay & English localization

export const formatDate = (dateStr: string, locale: 'ms' | 'en' = 'ms'): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (locale === 'ms') {
    const days = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
      'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
    ];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  return date.toLocaleDateString('en-MY', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatShortDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export const formatTime12h = (time24: string): string => {
  if (!time24) return '';
  const [hourStr, minuteStr] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${String(hour).padStart(2, '0')}:${minuteStr} ${ampm}`;
};

export const formatTimeRange = (start24: string, end24: string): string => {
  return `${formatTime12h(start24)} - ${formatTime12h(end24)}`;
};

export const getDurationHours = (start24: string, end24: string): number => {
  const [sH, sM] = start24.split(':').map(Number);
  const [eH, eM] = end24.split(':').map(Number);
  const startMinutes = sH * 60 + sM;
  const endMinutes = eH * 60 + eM;
  return Math.max(0, (endMinutes - startMinutes) / 60);
};
