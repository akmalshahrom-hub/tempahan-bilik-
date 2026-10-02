import React from 'react';
import { 
  LayoutDashboard, 
  DoorClosed, 
  Calendar as CalendarIcon, 
  PlusCircle, 
  BookmarkCheck, 
  BarChart3, 
  Settings, 
  X, 
  ShieldCheck,
  Building2,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavTab = 
  | 'dashboard'
  | 'rooms'
  | 'calendar'
  | 'booking'
  | 'my-bookings'
  | 'reports'
  | 'admin';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  todayBookingsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  todayBookingsCount,
}) => {
  const { currentUser, t } = useAuth();

  const navItems: { id: NavTab; label: string; icon: any; adminOnly?: boolean; badge?: string | number }[] = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'rooms', label: t('meetingRooms'), icon: DoorClosed },
    { id: 'calendar', label: t('calendar'), icon: CalendarIcon },
    { id: 'booking', label: t('newBooking'), icon: PlusCircle },
    { id: 'my-bookings', label: t('myBookings'), icon: BookmarkCheck, badge: todayBookingsCount > 0 ? todayBookingsCount : undefined },
    { id: 'reports', label: t('reports'), icon: BarChart3 },
    { id: 'admin', label: t('adminPanel'), icon: Settings, adminOnly: true },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Sidebar Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">MRB MALAYSIA</h2>
            <p className="text-[10px] text-blue-400 font-medium">Bilik Mesyuarat Organisasi</p>
          </div>
        </div>
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Tutup menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Action Button */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={() => handleNavClick('booking')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs transition-all shadow-md shadow-blue-600/30 active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ {t('newBooking')}</span>
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Menu Utama
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          const isAdminOnly = item.adminOnly;
          const isAdmin = currentUser.role === 'Administrator';

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {isAdminOnly && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                      isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Admin
                  </span>
                )}
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white text-blue-700' : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Organization Status Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <div className="text-left">
            <p className="text-[11px] font-semibold text-slate-300">Waktu Sistem Rasmi</p>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
              <Clock className="w-3 h-3" />
              <span>Zon Masa: GMT+8 (Malaysia)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 z-40">
        {navContent}
      </aside>

      {/* Mobile Drawer (Overlay) */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
