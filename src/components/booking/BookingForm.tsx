import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Building, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Printer, 
  Download, 
  ArrowRight, 
  HelpCircle,
  Phone,
  Mail,
  User as UserIcon,
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react';
import { Booking, ConflictCheckResult, EquipmentItem, MeetingType, Room } from '../../types';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { downloadIcsCalendar } from '../../utils/calendarExport';
import { formatDate, formatTimeRange } from '../../utils/formatters';
import { Modal } from '../common/Modal';

interface BookingFormProps {
  rooms: Room[];
  initialRoomId?: string;
  onBookingSuccess: (booking: Booking) => void;
  onCancel: () => void;
  onViewBookingDetails: (booking: Booking) => void;
  onPrintBooking: (booking: Booking) => void;
}

const MEETING_TYPES: MeetingType[] = [
  'Meeting',
  'Discussion',
  'Training',
  'Presentation',
  'Interview',
  'Workshop',
  'Other',
];

const AVAILABLE_EQUIPMENT: EquipmentItem[] = [
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

const MALAYSIAN_DEPARTMENTS = [
  'Jabatan Perancangan Bandar dan Desa',
  'Jabatan Kejuruteraan',
  'Jabatan Pentadbiran & Sumber Manusia',
  'Bahagian Pengurusan Teknologi Maklumat',
  'Jabatan Kewangan & Perolehan',
  'Unit Integriti & Perundangan',
  'Pejabat Ketua Pengarah',
  'Unit Komunikasi Korporat',
];

// Standard working hours slots: 08:00 to 18:00
const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00'
];

export const BookingForm: React.FC<BookingFormProps> = ({
  rooms,
  initialRoomId,
  onBookingSuccess,
  onCancel,
  onViewBookingDetails,
  onPrintBooking,
}) => {
  const { currentUser } = useAuth();

  // Reference date: 2026-10-02
  const defaultDate = '2026-10-02';

  const [roomId, setRoomId] = useState<string>(
    initialRoomId || (rooms.length > 0 ? rooms[0].id : '')
  );
  const [meetingTitle, setMeetingTitle] = useState('');
  const [organizer, setOrganizer] = useState(currentUser.name || 'Ahmad Faiz bin Mansor');
  const [organizerEmail, setOrganizerEmail] = useState(currentUser.email || 'admin@meetingroom.local');
  const [department, setDepartment] = useState(currentUser.department || MALAYSIAN_DEPARTMENTS[0]);
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phone || '+6012-345 6789');
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [participants, setParticipants] = useState<number>(6);
  const [meetingType, setMeetingType] = useState<MeetingType>('Meeting');
  const [purpose, setPurpose] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem[]>([
    'Projector',
    'Whiteboard',
  ]);
  const [notes, setNotes] = useState('');

  // Conflict state
  const [conflictResult, setConflictResult] = useState<ConflictCheckResult>({ hasConflict: false });
  const [capacityError, setCapacityError] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);

  // Confirmation Summary Modal state
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Success Notification Modal state
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  const selectedRoom = rooms.find((r) => r.id === roomId);

  // Real-time conflict & capacity validation check
  useEffect(() => {
    if (!roomId || !date || !startTime || !endTime) return;

    // Check time sanity
    if (startTime >= endTime) {
      setTimeError('Masa tamat mestilah lebih lewat daripada masa mula mesyuarat.');
      setConflictResult({ hasConflict: false });
      return;
    } else {
      setTimeError(null);
    }

    // Check capacity
    if (selectedRoom && participants > selectedRoom.capacity) {
      setCapacityError(
        `Kapasiti bilik maksimum untuk ${selectedRoom.name} adalah ${selectedRoom.capacity} orang sahaja.`
      );
    } else {
      setCapacityError(null);
    }

    // Check room schedule conflict
    const result = storageService.checkConflict(roomId, date, startTime, endTime);
    setConflictResult(result);
  }, [roomId, date, startTime, endTime, participants, selectedRoom]);

  const handleToggleEquipment = (item: EquipmentItem) => {
    if (selectedEquipment.includes(item)) {
      setSelectedEquipment(selectedEquipment.filter((e) => e !== item));
    } else {
      setSelectedEquipment([...selectedEquipment, item]);
    }
  };

  const handleOpenSummary = (e: React.FormEvent) => {
    e.preventDefault();

    if (!meetingTitle.trim() || !organizer.trim() || !roomId || !date) {
      alert('Sila lengkapkan semua ruangan mandatori bertanda (*)');
      return;
    }

    if (timeError || capacityError || conflictResult.hasConflict) {
      return;
    }

    setShowSummaryModal(true);
  };

  const handleConfirmAndSave = () => {
    // Final check before save
    const finalCheck = storageService.checkConflict(roomId, date, startTime, endTime);
    if (finalCheck.hasConflict) {
      setConflictResult(finalCheck);
      setShowSummaryModal(false);
      return;
    }

    const uniqueId = storageService.getNextBookingId();
    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      bookingId: uniqueId,
      meetingTitle: meetingTitle.trim(),
      organizer: organizer.trim(),
      organizerEmail: organizerEmail.trim(),
      department: department.trim(),
      phoneNumber: phoneNumber.trim(),
      roomId,
      date,
      startTime,
      endTime,
      participants: Number(participants) || 1,
      meetingType,
      purpose: purpose.trim(),
      equipment: selectedEquipment,
      notes: notes.trim(),
      status: 'booked',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = storageService.saveBooking(newBooking);
    setShowSummaryModal(false);
    setCreatedBooking(saved);
    onBookingSuccess(saved);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Borang Rasmi Tempahan Ruang</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Tempahan Bilik Mesyuarat Baharu
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Sila isi borang di bawah untuk menyemak ketersediaan dan membuat tempahan rasmi.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 self-start sm:self-auto px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            Kembali ke Papan Pemuka
          </button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleOpenSummary} className="space-y-6">
        {/* Section 1: Meeting & Room Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            <span>1. Maklumat Bilik & Masa Mesyuarat</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Meeting Room */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pilih Bilik Mesyuarat *
              </label>
              <select
                required
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full text-xs font-medium px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-600 focus:bg-white"
              >
                {rooms.map((r) => (
                  <option
                    key={r.id}
                    value={r.id}
                    disabled={r.status === 'maintenance'}
                  >
                    {r.name} — ({r.location}) [Kapasiti: {r.capacity} orang]
                    {r.status === 'maintenance' ? ' (Penyelenggaraan)' : ''}
                  </option>
                ))}
              </select>

              {selectedRoom && (
                <div className="mt-2.5 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{selectedRoom.name}</span>
                    <span>•</span>
                    <span className="text-blue-700">{selectedRoom.location}</span>
                  </div>
                  <div className="font-semibold text-blue-800">
                    Kapasiti Maksimum: {selectedRoom.capacity} orang
                  </div>
                </div>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tarikh Mesyuarat *
              </label>
              <div className="relative">
                <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Participants */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bilangan Peserta *
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min={1}
                  max={selectedRoom ? selectedRoom.capacity : 100}
                  required
                  value={participants}
                  onChange={(e) => setParticipants(parseInt(e.target.value, 10) || 1)}
                  className={`w-full pl-10 pr-3.5 py-2 text-xs font-medium bg-slate-50 border rounded-xl focus:outline-hidden ${
                    capacityError ? 'border-rose-400 focus:border-rose-600' : 'border-slate-300 focus:border-blue-600'
                  }`}
                />
              </div>
              {capacityError && (
                <p className="text-[11px] text-rose-600 mt-1 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {capacityError}
                </p>
              )}
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Masa Mula *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-600"
                >
                  {TIME_SLOTS.map((time) => (
                    <option key={`start-${time}`} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* End Time */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Masa Tamat *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={`w-full pl-10 pr-3.5 py-2 text-xs font-medium bg-slate-50 border rounded-xl focus:outline-hidden ${
                    timeError ? 'border-rose-400' : 'border-slate-300 focus:border-blue-600'
                  }`}
                >
                  {TIME_SLOTS.map((time) => (
                    <option key={`end-${time}`} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              {timeError && (
                <p className="text-[11px] text-rose-600 mt-1 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {timeError}
                </p>
              )}
            </div>
          </div>

          {/* Real-Time Conflict Alert Status Bar */}
          <div className="pt-2">
            {conflictResult.hasConflict ? (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-900">
                      Konflik Jadual Dikesan!
                    </h4>
                    <p className="text-xs mt-1 leading-relaxed">
                      {conflictResult.message}
                    </p>
                    <p className="text-[11px] text-rose-700 font-semibold mt-2">
                      Sila tukar masa mesyuarat atau pilih bilik lain yang tersedia.
                    </p>
                  </div>
                </div>
              </div>
            ) : !timeError && !capacityError && roomId && date ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold">
                  Bilik ini bersedia dan tersedia pada tarikh & waktu yang dipilih ({startTime} - {endTime}).
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Section 2: Meeting Title, Type & Purpose */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>2. Butiran Tajuk & Tujuan Mesyuarat</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tajuk Mesyuarat *
            </label>
            <input
              type="text"
              required
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder="cth. Mesyuarat Penyelarasan Bajet Suku Keempat 2026"
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-600 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jenis Mesyuarat *
              </label>
              <select
                value={meetingType}
                onChange={(e) => setMeetingType(e.target.value as MeetingType)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-600"
              >
                {MEETING_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jabatan / Unit Penganjur *
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-600"
              >
                {MALAYSIAN_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tujuan / Keterangan Mesyuarat
            </label>
            <textarea
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Nyatakan agenda utama atau objektif mesyuarat..."
              className="w-full text-xs px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-600 focus:bg-white"
            />
          </div>
        </div>

        {/* Section 3: Organizer Contact Information */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-blue-600" />
            <span>3. Maklumat Pegawai Penganjur</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Penganjur / Pegawai *
              </label>
              <input
                type="text"
                required
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="cth. Ahmad Faiz bin Mansor"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alamat Emel Rasmi *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={organizerEmail}
                  onChange={(e) => setOrganizerEmail(e.target.value)}
                  placeholder="pegawai@organisasi.gov.my"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                No. Telefon / Sambungan *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+6012-345 6789"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Equipment & Special Requests */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>4. Peralatan & Keperluan Khas</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Peralatan Diperlukan:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {AVAILABLE_EQUIPMENT.map((eq) => {
                const checked = selectedEquipment.includes(eq);
                return (
                  <label
                    key={eq}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                      checked
                        ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold shadow-xs'
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Tambahan (cth. Susunan Meja / Minuman)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Susunan meja berbentuk U, perlukan air mineral botol untuk 12 orang..."
              className="w-full text-xs px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-600"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={conflictResult.hasConflict || !!timeError || !!capacityError}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white shadow-md transition-all ${
              conflictResult.hasConflict || !!timeError || !!capacityError
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-blue-700 hover:bg-blue-800 shadow-blue-700/20 active:scale-95'
            }`}
          >
            <span>Semak Ringkasan & Sahkan Tempahan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Confirmation Summary Modal (Step 9 before final save) */}
      <Modal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        title="Ringkasan & Pengesahan Tempahan"
        subtitle="Sila semak maklumat tempahan sebelum pengesahan muktamad"
        maxWidth="xl"
      >
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Tajuk Mesyuarat:</span>
              <span className="font-bold text-slate-900 text-right">{meetingTitle}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Bilik Dipilih:</span>
              <span className="font-bold text-blue-700">{selectedRoom?.name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Tarikh:</span>
              <span className="font-semibold text-slate-800">{formatDate(date, 'ms')}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Waktu:</span>
              <span className="font-semibold text-slate-800">{formatTimeRange(startTime, endTime)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Pegawai Penganjur:</span>
              <span className="font-semibold text-slate-800">{organizer} ({department})</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Bilangan Peserta:</span>
              <span className="font-semibold text-slate-800">{participants} orang</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Peralatan:</span>
              <span className="font-semibold text-slate-800">
                {selectedEquipment.join(', ') || 'Tiada'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tiada konflik jadual. Bilik ini sah tersedia untuk anda tempah.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setShowSummaryModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Ubah Maklumat
            </button>
            <button
              type="button"
              onClick={handleConfirmAndSave}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs transition-colors"
            >
              Sahkan & Simpan Tempahan
            </button>
          </div>
        </div>
      </Modal>

      {/* Success Notification Modal (Section 9 & 18) */}
      {createdBooking && (
        <Modal
          isOpen={true}
          onClose={() => setCreatedBooking(null)}
          title="Tempahan berjaya!"
          subtitle="Permohonan tempahan bilik mesyuarat telah berjaya direkodkan dalam sistem"
          maxWidth="lg"
          showCloseButton={false}
        >
          <div className="space-y-5 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-emerald-700">
                Pengesahan Tempahan Bilik
              </p>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                {createdBooking.bookingId}
              </h3>
            </div>

            {/* Booking Details Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Tajuk Mesyuarat:</span>
                <span className="font-bold text-slate-800 text-right">{createdBooking.meetingTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bilik:</span>
                <span className="font-bold text-blue-700">{selectedRoom?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tarikh:</span>
                <span className="font-semibold text-slate-800">{formatDate(createdBooking.date, 'ms')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Masa:</span>
                <span className="font-semibold text-slate-800">
                  {formatTimeRange(createdBooking.startTime, createdBooking.endTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Penganjur:</span>
                <span className="font-semibold text-slate-800">
                  {createdBooking.organizer} ({createdBooking.department})
                </span>
              </div>
            </div>

            {/* Notification actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  downloadIcsCalendar(createdBooking, selectedRoom);
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Simpan ke Kalendar (.ics)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onPrintBooking(createdBooking);
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Cetak Slip Rasmi</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const b = createdBooking;
                  setCreatedBooking(null);
                  onViewBookingDetails(b);
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                <span>Lihat Maklumat Tempahan</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
