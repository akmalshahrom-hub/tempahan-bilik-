import React from 'react';
import { BookingStatus, RoomStatus } from '../../types';

interface StatusBadgeProps {
  status: BookingStatus | RoomStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toLowerCase();

  let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotClass = 'bg-slate-400';
  let label = status;

  switch (normalized) {
    case 'available':
      bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      dotClass = 'bg-emerald-500 animate-pulse';
      label = 'Tersedia';
      break;
    case 'booked':
      bgClass = 'bg-blue-50 text-blue-700 border-blue-200';
      dotClass = 'bg-blue-500';
      label = 'Ditempah';
      break;
    case 'in_progress':
    case 'in progress':
    case 'occupied':
      bgClass = 'bg-amber-50 text-amber-700 border-amber-200';
      dotClass = 'bg-amber-500 animate-ping';
      label = 'Sedang Berlangsung';
      break;
    case 'completed':
      bgClass = 'bg-slate-100 text-slate-600 border-slate-200';
      dotClass = 'bg-slate-400';
      label = 'Selesai';
      break;
    case 'cancelled':
      bgClass = 'bg-rose-50 text-rose-700 border-rose-200';
      dotClass = 'bg-rose-500';
      label = 'Dibatalkan';
      break;
    case 'maintenance':
      bgClass = 'bg-orange-50 text-orange-700 border-orange-200';
      dotClass = 'bg-orange-500';
      label = 'Penyelenggaraan';
      break;
    default:
      label = status;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${bgClass} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      <span>{label}</span>
    </span>
  );
};
