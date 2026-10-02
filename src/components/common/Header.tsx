import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Menu, 
  UserCircle, 
  ShieldCheck, 
  User as UserIcon, 
  CheckCheck, 
  Globe, 
  RefreshCw,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Booking } from '../../types';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onSelectBooking?: (booking: Booking) => void;
  bookings: Booking[];
  onOpenLoginModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onSearchChange,
  searchQuery,
  onSelectBooking,
  bookings,
  onOpenLoginModal,
}) => {
  const { currentUser, switchRole, switchUser, users, language, setLanguage, t } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Recent 5 active bookings as notification items
  const recentNotifications = bookings.slice(0, 4);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Brand info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
            aria-label="Buka menu navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            {/* Malaysian Corporate / Jata inspired clean emblem badge */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-900 via-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0 ring-2 ring-blue-100">
              <span className="font-extrabold text-sm tracking-wider">MRB</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none uppercase">
                {t('appName')}
              </h1>
              <p className="text-[11px] text-blue-700 font-medium tracking-wide mt-0.5">
                Sistem Tempahan Bilik Mesyuarat
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search input */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right actions: Language, Notifications, Role badge & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'ms' ? 'en' : 'ms')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            title="Tukar Bahasa / Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserDropdown(false);
              }}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Pemberitahuan"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Pemberitahuan Terkini
                  </h4>
                  <span className="text-[11px] text-blue-600 font-medium">Hari Ini</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {recentNotifications.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => {
                        if (onSelectBooking) onSelectBooking(b);
                        setShowNotifications(false);
                      }}
                      className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                          {b.meetingTitle}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0">{b.startTime}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {b.organizer} • {b.department}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium">
                        <CheckCheck className="w-3 h-3" />
                        <span>Tempahan disahkan ({b.bookingId})</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-slate-100 text-center">
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-slate-500 hover:text-blue-600 font-medium"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Role Switcher Pill (Great for Demoing) */}
          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => switchRole('Administrator')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all font-medium ${
                currentUser.role === 'Administrator'
                  ? 'bg-blue-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
            <button
              onClick={() => switchRole('Staff')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all font-medium ${
                currentUser.role === 'Staff'
                  ? 'bg-blue-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Staff</span>
            </button>
          </div>

          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="relative">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200"
                  />
                ) : (
                  <UserCircle className="w-8 h-8 text-slate-500" />
                )}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                    currentUser.role === 'Administrator' ? 'bg-indigo-600' : 'bg-emerald-500'
                  }`}
                />
              </div>

              <div className="hidden xl:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-slate-500 leading-tight truncate max-w-[130px]">
                  {currentUser.department}
                </p>
              </div>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        currentUser.role === 'Administrator'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {currentUser.role === 'Administrator' ? (
                        <ShieldCheck className="w-3 h-3" />
                      ) : (
                        <UserIcon className="w-3 h-3" />
                      )}
                      Peranan: {currentUser.role}
                    </span>
                  </div>
                </div>

                {/* Switch user demo selector */}
                <div className="p-2">
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Tukar Akaun Demo (Staff / Admin)
                  </p>
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-left transition-colors ${
                        u.id === currentUser.id
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="truncate font-medium">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.role} • {u.department}</p>
                      </div>
                      {u.id === currentUser.id && (
                        <span className="text-blue-600 shrink-0 text-[10px] font-bold">Aktif</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="p-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenLoginModal();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Log Masuk Demo Lain / Log Keluar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
