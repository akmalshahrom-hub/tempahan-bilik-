import React, { useState } from 'react';
import { 
  ShieldCheck, 
  DoorClosed, 
  Calendar, 
  Users, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Booking, Room, User, Role } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { formatDate, formatTimeRange } from '../../utils/formatters';
import { exportBookingsToCSV } from '../../utils/csvExport';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';

interface AdminPanelProps {
  rooms: Room[];
  bookings: Booking[];
  users: User[];
  onSaveRoom: (room: Room) => void;
  onDeleteRoom: (roomId: string) => void;
  onSaveBooking: (booking: Booking) => void;
  onCancelBooking: (bookingId: string, reason?: string) => void;
  onDeleteBooking: (bookingId: string) => void;
  onSaveUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onResetDemoData: () => void;
  onSelectBooking: (booking: Booking) => void;
}

type AdminTab = 'bookings' | 'rooms' | 'users';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  rooms,
  bookings,
  users,
  onSaveRoom,
  onDeleteRoom,
  onSaveBooking,
  onCancelBooking,
  onDeleteBooking,
  onSaveUser,
  onDeleteUser,
  onResetDemoData,
  onSelectBooking,
}) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('bookings');

  // Bookings Filter State
  const [bookingSearch, setBookingSearch] = useState('');
  const [filterRoom, setFilterRoom] = useState('all');
  const [filterDept, setFilterDept] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  // Modals
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    department: 'Jabatan Pentadbiran & Sumber Manusia',
    phone: '',
    role: 'Staff',
  });

  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const roomMap = new Map<string, Room>();
  rooms.forEach((r) => roomMap.set(r.id, r));

  const departments = Array.from(new Set(bookings.map((b) => b.department))).filter(Boolean);

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.meetingTitle.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.organizer.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.bookingId.toLowerCase().includes(bookingSearch.toLowerCase());
    const matchesRoom = filterRoom === 'all' || b.roomId === filterRoom;
    const matchesDept = filterDept === 'all' || b.department === filterDept;
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchesDate = !filterDate || b.date === filterDate;

    return matchesSearch && matchesRoom && matchesDept && matchesStatus && matchesDate;
  });

  // User Actions
  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserFormData({
      name: '',
      email: '',
      department: 'Jabatan Pentadbiran & Sumber Manusia',
      phone: '+601',
      role: 'Staff',
    });
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormData({ ...user });
    setUserModalOpen(true);
  };

  const handleSaveUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name?.trim() || !userFormData.email?.trim()) {
      alert('Sila lengkapkan nama dan emel pengguna.');
      return;
    }

    const toSave: User = {
      id: editingUser ? editingUser.id : `user-${Date.now()}`,
      name: userFormData.name.trim(),
      email: userFormData.email.trim(),
      department: userFormData.department || 'Jabatan Pentadbiran',
      phone: userFormData.phone || '',
      role: userFormData.role || 'Staff',
      avatarUrl:
        userFormData.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    };

    onSaveUser(toSave);
    setUserModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Akses Pentadbir Sistem (Administrator)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Panel Pengurusan Pentadbiran
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kawalan penuh ke atas bilik mesyuarat, kelulusan/status tempahan dan akaun pengguna.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            title="Muat semula data contoh sistem"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Data Demo</span>
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center bg-slate-200/70 p-1.5 rounded-xl max-w-md">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'bookings'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Urus Tempahan ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rooms')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'rooms'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <DoorClosed className="w-3.5 h-3.5" />
          <span>Urus Bilik ({rooms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Pengguna ({users.length})</span>
        </button>
      </div>

      {/* Tab 1: Bookings Management */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Filters Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                placeholder="Cari tajuk, penganjur, ID..."
                className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Room filter */}
              <select
                value={filterRoom}
                onChange={(e) => setFilterRoom(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
              >
                <option value="all">Semua Bilik</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>

              {/* Status filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700"
              >
                <option value="all">Semua Status</option>
                <option value="booked">Ditempah</option>
                <option value="in_progress">Sedang Berlangsung</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>

              {/* Date Filter */}
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-700"
              />

              {filterDate && (
                <button
                  onClick={() => setFilterDate('')}
                  className="text-xs text-rose-600 font-semibold hover:underline"
                >
                  Padam Tarikh
                </button>
              )}

              <button
                onClick={() => exportBookingsToCSV(filteredBookings, rooms)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Eksport CSV</span>
              </button>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">No. Tempahan</th>
                  <th className="py-3 px-4">Mesyuarat & Penganjur</th>
                  <th className="py-3 px-4">Bilik</th>
                  <th className="py-3 px-4">Tarikh & Waktu</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Tiada rekod tempahan sepadan dengan tapisan.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => {
                    const room = roomMap.get(b.roomId);
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                          {b.bookingId}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{b.meetingTitle}</p>
                          <p className="text-[11px] text-slate-500">
                            {b.organizer} • {b.department}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">
                          {room?.name || b.roomId}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-800">{formatDate(b.date, 'ms')}</p>
                          <p className="text-[11px] text-slate-500">
                            {formatTimeRange(b.startTime, b.endTime)}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={b.status} size="sm" />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onSelectBooking(b)}
                              className="px-2 py-1 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded font-medium"
                              title="Lihat Butiran"
                            >
                              Butiran
                            </button>

                            {b.status !== 'cancelled' && (
                              <button
                                onClick={() => onCancelBooking(b.id, 'Dibatalkan oleh Pentadbir')}
                                className="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded font-medium"
                                title="Batalkan Tempahan"
                              >
                                Batal
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (confirm(`Padam rekod ${b.bookingId} sepenuhnya daripada sistem?`)) {
                                  onDeleteBooking(b.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-700 rounded"
                              title="Hapus Rekod"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Rooms Management */}
      {activeTab === 'rooms' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Senarai Bilik Mesyuarat Organisasi</h3>
              <p className="text-xs text-slate-500">Kawal status ketersediaan dan penyelenggaraan setiap bilik.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{room.name}</h4>
                    <p className="text-xs text-slate-500">{room.location}</p>
                  </div>
                  <StatusBadge status={room.status} size="sm" />
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p><span className="font-semibold">Kapasiti:</span> {room.capacity} orang</p>
                  <p><span className="font-semibold">Peralatan:</span> {room.equipment.join(', ')}</p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <button
                    onClick={() => {
                      const nextStatus = room.status === 'maintenance' ? 'available' : 'maintenance';
                      onSaveRoom({ ...room, status: nextStatus });
                    }}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                      room.status === 'maintenance'
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    }`}
                  >
                    {room.status === 'maintenance' ? 'Aktifkan Bilik' : 'Set Penyelenggaraan'}
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Adakah anda pasti ingin memadam ${room.name}?`)) {
                        onDeleteRoom(room.id);
                      }
                    }}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
                    title="Padam Bilik"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: User Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Senarai Pengguna & Staf Berdaftar</h3>
              <p className="text-xs text-slate-500">Tetapkan peranan (Administrator atau Staff) bagi setiap pegawai.</p>
            </div>

            <button
              onClick={handleOpenAddUser}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Daftar Pengguna Baharu</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Nama Pegawai</th>
                  <th className="py-3 px-4">Emel & No Telefon</th>
                  <th className="py-3 px-4">Jabatan</th>
                  <th className="py-3 px-4">Peranan (Role)</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-slate-800">{u.email}</p>
                      <p className="text-slate-400 text-[11px]">{u.phone}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{u.department}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          u.role === 'Administrator'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditUser(u)}
                          className="p-1 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded"
                          title="Kemaskini"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {u.id !== currentUser.id && (
                          <button
                            onClick={() => setDeleteConfirmUser(u)}
                            className="p-1 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded"
                            title="Padam"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title={editingUser ? 'Kemaskini Akaun Pengguna' : 'Daftar Pengguna Baharu'}
        subtitle="Maklumat pegawai dan penetapan hak peranan sistem"
        maxWidth="md"
      >
        <form onSubmit={handleSaveUserSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Penuh Pegawai *
            </label>
            <input
              type="text"
              required
              value={userFormData.name || ''}
              onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
              placeholder="cth. Ahmad Faiz bin Mansor"
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alamat Emel *
            </label>
            <input
              type="email"
              required
              value={userFormData.email || ''}
              onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
              placeholder="nama@meetingroom.local"
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Peranan (Role) *
              </label>
              <select
                value={userFormData.role || 'Staff'}
                onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as Role })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600"
              >
                <option value="Staff">Staff</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                No. Telefon
              </label>
              <input
                type="text"
                value={userFormData.phone || ''}
                onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                placeholder="+6012-345 6789"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Jabatan / Bahagian
            </label>
            <input
              type="text"
              value={userFormData.department || ''}
              onChange={(e) => setUserFormData({ ...userFormData, department: e.target.value })}
              placeholder="cth. Jabatan Perancangan Bandar dan Desa"
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:bg-white"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setUserModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
            >
              {editingUser ? 'Kemaskini' : 'Daftar Pengguna'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirmation */}
      {deleteConfirmUser && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setDeleteConfirmUser(null)}
          onConfirm={() => {
            onDeleteUser(deleteConfirmUser.id);
            setDeleteConfirmUser(null);
          }}
          title="Hapus Akaun Pengguna"
          message={`Adakah anda pasti ingin memadam akaun "${deleteConfirmUser.name}" (${deleteConfirmUser.email})?`}
          confirmLabel="Ya, Padam Akaun"
          cancelLabel="Batal"
        />
      )}

      {/* Reset Demo Data Confirmation */}
      {resetConfirmOpen && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setResetConfirmOpen(false)}
          onConfirm={() => {
            onResetDemoData();
            setResetConfirmOpen(false);
          }}
          title="Reset Semula Data Demo Sistem"
          message="Tindakan ini akan menetapkan semula bilik, tempahan dan pengguna kepada data contoh asal sistem. Adakah anda ingin meneruskan?"
          confirmLabel="Ya, Reset Data Demo"
          cancelLabel="Batal"
          isDestructive={true}
        />
      )}
    </div>
  );
};
