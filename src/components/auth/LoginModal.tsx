import React, { useState } from 'react';
import { ShieldCheck, User, LogIn, Building2, Check } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { users, switchUser, currentUser } = useAuth();
  const [customEmail, setCustomEmail] = useState('');

  const adminUser = users.find((u) => u.email === 'admin@meetingroom.local') || users[0];
  const staffUser = users.find((u) => u.email === 'staff@meetingroom.local') || users[1];

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;

    const matched = users.find(
      (u) => u.email.toLowerCase() === customEmail.trim().toLowerCase()
    );
    if (matched) {
      switchUser(matched.id);
      onClose();
    } else {
      alert('Emel pengguna tidak ditemui dalam senarai pengguna berdaftar.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Masuk Sistem Tempahan"
      subtitle="Pilih akaun demo atau masukkan emel pengguna untuk meneruskan"
      maxWidth="md"
    >
      <div className="space-y-5">
        <div className="text-center pb-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-700 flex items-center justify-center text-white mx-auto mb-2 shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            Akses Staf & Pentadbiran Organisasi
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilih mod akaun untuk menguji fungsi sistem mengikut peranan
          </p>
        </div>

        {/* 1-Click Demo Accounts */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => {
              if (adminUser) switchUser(adminUser.id);
              onClose();
            }}
            className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
              currentUser.id === adminUser?.id
                ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">
                    {adminUser?.name || 'Ahmad Faiz (Admin)'}
                  </span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-bold">
                    Administrator
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  admin@meetingroom.local
                </p>
              </div>
            </div>

            {currentUser.id === adminUser?.id ? (
              <span className="text-xs font-bold text-blue-700 flex items-center gap-1">
                <Check className="w-4 h-4" />
                Aktif
              </span>
            ) : (
              <span className="text-xs text-blue-600 font-semibold">Pilih »</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (staffUser) switchUser(staffUser.id);
              onClose();
            }}
            className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
              currentUser.id === staffUser?.id
                ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">
                    {staffUser?.name || 'Siti Nur Aisyah (Staff)'}
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                    Staff
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  staff@meetingroom.local
                </p>
              </div>
            </div>

            {currentUser.id === staffUser?.id ? (
              <span className="text-xs font-bold text-blue-700 flex items-center gap-1">
                <Check className="w-4 h-4" />
                Aktif
              </span>
            ) : (
              <span className="text-xs text-blue-600 font-semibold">Pilih »</span>
            )}
          </button>
        </div>

        {/* Custom Email Form */}
        <div className="pt-2 border-t border-slate-200">
          <form onSubmit={handleCustomLogin} className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-600">
              Atau log masuk menggunakan emel staf berdaftar:
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="nama@meetingroom.local"
                className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Log Masuk
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};
