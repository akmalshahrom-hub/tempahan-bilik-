import React, { useState } from 'react';
import { 
  Users, 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  ArrowRight, 
  Wrench, 
  Search, 
  Filter,
  CheckCircle2,
  Building
} from 'lucide-react';
import { Room, EquipmentItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { EquipmentBadge } from '../common/EquipmentBadge';
import { Modal } from '../common/Modal';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { useAuth } from '../../context/AuthContext';

interface RoomListProps {
  rooms: Room[];
  onBookRoom: (roomId: string) => void;
  onViewSchedule: (roomId: string) => void;
  onSaveRoom: (room: Room) => void;
  onDeleteRoom: (roomId: string) => void;
}

const ALL_EQUIPMENT: EquipmentItem[] = [
  'Projector',
  'Television',
  'Video Conference',
  'Whiteboard',
  'Microphone',
  'Speaker',
  'PA System',
  'Smart Board',
  'Other',
];

export const RoomList: React.FC<RoomListProps> = ({
  rooms,
  onBookRoom,
  onViewSchedule,
  onSaveRoom,
  onDeleteRoom,
}) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser.role === 'Administrator';

  const [search, setSearch] = useState('');
  const [selectedCapacityFilter, setSelectedCapacityFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deleteConfirmRoomId, setDeleteConfirmRoomId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Room>>({
    name: '',
    location: '',
    capacity: 10,
    equipment: ['Television', 'Whiteboard'],
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80',
    description: '',
    floor: 'Aras 2',
  });

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setFormData({
      name: '',
      location: 'Aras 2, Blok Pentadbiran',
      capacity: 12,
      equipment: ['Television', 'Whiteboard'],
      status: 'available',
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      description: '',
      floor: 'Aras 2',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({ ...room });
    setIsFormOpen(true);
  };

  const handleToggleEquipment = (eq: EquipmentItem) => {
    const current = formData.equipment || [];
    if (current.includes(eq)) {
      setFormData({ ...formData, equipment: current.filter((e) => e !== eq) });
    } else {
      setFormData({ ...formData, equipment: [...current, eq] });
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.location?.trim() || !formData.capacity) {
      alert('Sila lengkapkan nama bilik, lokasi dan kapasiti.');
      return;
    }

    const roomToSave: Room = {
      id: editingRoom ? editingRoom.id : `room-${Date.now()}`,
      name: formData.name.trim(),
      location: formData.location.trim(),
      capacity: Number(formData.capacity) || 10,
      equipment: formData.equipment || [],
      status: formData.status || 'available',
      imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80',
      description: formData.description?.trim() || '',
      floor: formData.floor?.trim() || 'Aras 2',
    };

    onSaveRoom(roomToSave);
    setIsFormOpen(false);
  };

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase()) ||
      r.equipment.some((eq) => eq.toLowerCase().includes(search.toLowerCase()));

    let matchesCapacity = true;
    if (selectedCapacityFilter === 'small') matchesCapacity = r.capacity <= 8;
    else if (selectedCapacityFilter === 'medium') matchesCapacity = r.capacity > 8 && r.capacity <= 15;
    else if (selectedCapacityFilter === 'large') matchesCapacity = r.capacity > 15;

    return matchesSearch && matchesCapacity;
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Senarai Bilik Mesyuarat
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pengurusan dan maklumat kemudahan bilik mesyuarat di premis organisasi.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Bilik Baharu</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari bilik atau kemudahan..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-500 font-medium shrink-0">Kapasiti:</span>
          <select
            value={selectedCapacityFilter}
            onChange={(e) => setSelectedCapacityFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700 w-full md:w-auto focus:outline-hidden"
          >
            <option value="all">Semua Kapasiti ({rooms.length})</option>
            <option value="small">Kecil (≤ 8 orang)</option>
            <option value="medium">Sederhana (9 - 15 orang)</option>
            <option value="large">Besar (&gt; 15 orang)</option>
          </select>
        </div>
      </div>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <div
            key={room.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-lg transition-all flex flex-col group"
          >
            {/* Card Image Banner */}
            <div className="relative h-48 bg-slate-100 overflow-hidden">
              <img
                src={room.imageUrl}
                alt={room.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  // Fallback image
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

              {/* Status Badge in corner */}
              <div className="absolute top-3 right-3">
                <StatusBadge status={room.status} size="sm" />
              </div>

              {/* Capacity overlay */}
              <div className="absolute bottom-3 left-3 text-white flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-semibold">
                <Users className="w-3.5 h-3.5 text-blue-300" />
                <span>Kapasiti: {room.capacity} orang</span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {room.name}
                  </h3>
                </div>

                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{room.location}</span>
                </p>

                {room.description && (
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {room.description}
                  </p>
                )}

                {/* Equipment Badges */}
                <div className="mt-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Kemudahan / Peralatan
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {room.equipment.map((item) => (
                      <EquipmentBadge key={item} item={item} size="sm" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onBookRoom(room.id)}
                    disabled={room.status === 'maintenance'}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      room.status === 'maintenance'
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-700 hover:bg-blue-800 text-white shadow-blue-700/20 active:scale-95'
                    }`}
                  >
                    <span>Tempah Sekarang</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onViewSchedule(room.id)}
                    className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                    title="Lihat Jadual Bilik Ini"
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Jadual</span>
                  </button>
                </div>

                {/* Admin controls */}
                {isAdmin && (
                  <div className="flex items-center justify-end gap-1.5 pt-1 text-slate-400">
                    <button
                      onClick={() => handleOpenEdit(room)}
                      className="p-1.5 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-colors text-xs flex items-center gap-1 font-medium"
                      title="Kemaskini Bilik"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Kemaskini</span>
                    </button>
                    <button
                      onClick={() => setDeleteConfirmRoomId(room.id)}
                      className="p-1.5 rounded-lg hover:text-rose-600 hover:bg-rose-50 transition-colors text-xs flex items-center gap-1 font-medium"
                      title="Padam Bilik"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Padam</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Tiada Bilik Ditemui</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Sila semak kata kunci carian atau tetapan tapisan kapasiti anda.
          </p>
        </div>
      )}

      {/* Add / Edit Room Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingRoom ? 'Kemaskini Maklumat Bilik' : 'Tambah Bilik Mesyuarat Baharu'}
        subtitle="Sila isi butiran lengkap bilik mesyuarat di bawah"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Bilik Mesyuarat *
            </label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="cth. Bilik Mesyuarat Utama"
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lokasi / Aras *
              </label>
              <input
                type="text"
                required
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="cth. Aras 3, Blok Pentadbiran"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kapasiti Maksimum (Orang) *
              </label>
              <input
                type="number"
                min={1}
                max={500}
                required
                value={formData.capacity || 10}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Status Bilik
              </label>
              <select
                value={formData.status || 'available'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:bg-white"
              >
                <option value="available">Tersedia (Available)</option>
                <option value="maintenance">Dalam Penyelenggaraan (Maintenance)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pautan Gambar (Image URL)
              </label>
              <input
                type="url"
                value={formData.imageUrl || ''}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Keterangan Bilik
            </label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Keterangan ringkas kegunaan bilik..."
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-600 focus:bg-white"
            />
          </div>

          {/* Equipment Checkboxes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Peralatan Tersedia
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_EQUIPMENT.map((eq) => {
                const checked = formData.equipment?.includes(eq);
                return (
                  <label
                    key={eq}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-colors ${
                      checked
                        ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleEquipment(eq)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>{eq}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
            >
              {editingRoom ? 'Simpan Perubahan' : 'Daftar Bilik'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={deleteConfirmRoomId !== null}
        onClose={() => setDeleteConfirmRoomId(null)}
        onConfirm={() => {
          if (deleteConfirmRoomId) {
            onDeleteRoom(deleteConfirmRoomId);
            setDeleteConfirmRoomId(null);
          }
        }}
        title="Hapus Bilik Mesyuarat"
        message="Adakah anda pasti ingin memadam bilik mesyuarat ini daripada sistem? Semua rekod berkaitan bilik ini tidak dapat dikembalikan."
        confirmLabel="Ya, Padam Bilik"
        cancelLabel="Batal"
      />
    </div>
  );
};
