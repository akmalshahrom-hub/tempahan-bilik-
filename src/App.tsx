/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { storageService } from './services/storageService';
import { Booking, Room, User } from './types';
import { Header } from './components/common/Header';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { RoomList } from './components/rooms/RoomList';
import { CalendarView } from './components/calendar/CalendarView';
import { BookingForm } from './components/booking/BookingForm';
import { MyBookings } from './components/my-bookings/MyBookings';
import { ReportsView } from './components/reports/ReportsView';
import { AdminPanel } from './components/admin/AdminPanel';
import { BookingDetailsModal } from './components/booking/BookingDetailsModal';
import { BookingPrintReceipt } from './components/booking/BookingPrintReceipt';
import { LoginModal } from './components/auth/LoginModal';

function MainLayout() {
  const { currentUser, users, refreshUsers } = useAuth();

  // App-level state
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [rooms, setRooms] = useState<Room[]>(() => storageService.getRooms());
  const [bookings, setBookings] = useState<Booking[]>(() => storageService.getBookings());

  // Interactive UI states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [prefilledBookingRoomId, setPrefilledBookingRoomId] = useState<string | undefined>(undefined);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);
  const [printingBooking, setPrintingBooking] = useState<Booking | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Sync rooms & bookings with storageService
  const refreshData = () => {
    setRooms(storageService.getRooms());
    setBookings(storageService.getBookings());
    refreshUsers();
  };

  // Handlers for Rooms
  const handleSaveRoom = (room: Room) => {
    storageService.saveRoom(room);
    refreshData();
  };

  const handleDeleteRoom = (roomId: string) => {
    storageService.deleteRoom(roomId);
    refreshData();
  };

  // Handlers for Bookings
  const handleBookingSuccess = (newBooking: Booking) => {
    refreshData();
  };

  const handleCancelBooking = (bookingId: string, reason?: string) => {
    storageService.cancelBooking(bookingId, reason);
    refreshData();
  };

  const handleDeleteBooking = (bookingId: string) => {
    storageService.deleteBooking(bookingId);
    refreshData();
  };

  const handleSaveBooking = (booking: Booking) => {
    storageService.saveBooking(booking);
    refreshData();
  };

  // Handlers for Users
  const handleSaveUser = (user: User) => {
    storageService.saveUser(user);
    refreshData();
  };

  const handleDeleteUser = (userId: string) => {
    storageService.deleteUser(userId);
    refreshData();
  };

  const handleResetDemoData = () => {
    storageService.resetDemoData();
    refreshData();
  };

  // Navigation shortcuts
  const handleNavigateToBooking = (roomId?: string) => {
    setPrefilledBookingRoomId(roomId);
    setCurrentTab('booking');
  };

  const handleNavigateToRooms = () => {
    setCurrentTab('rooms');
  };

  const handleNavigateToCalendar = () => {
    setCurrentTab('calendar');
  };

  const handleOpenBookingDetails = (booking: Booking) => {
    setSelectedBookingForDetails(booking);
  };

  const handlePrintBooking = (booking: Booking) => {
    setPrintingBooking(booking);
  };

  const selectedBookingRoom = selectedBookingForDetails
    ? rooms.find((r) => r.id === selectedBookingForDetails.roomId)
    : undefined;

  const printingBookingRoom = printingBooking
    ? rooms.find((r) => r.id === printingBooking.roomId)
    : undefined;

  // Today count for badge
  const todayStr = '2026-10-02';
  const todayBookingsCount = bookings.filter(
    (b) => b.date === todayStr && b.status !== 'cancelled'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        todayBookingsCount={todayBookingsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onSearchChange={setSearchQuery}
          searchQuery={searchQuery}
          bookings={bookings}
          onSelectBooking={handleOpenBookingDetails}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
        />

        {/* Global Search Results overlay if active */}
        {searchQuery.trim().length > 1 ? (
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  Hasil Carian untuk: &quot;{searchQuery}&quot;
                </h3>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Padam Carian
                </button>
              </div>

              {/* Matching Bookings */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Tempahan Sepadan
                </h4>
                {bookings.filter(
                  (b) =>
                    b.meetingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    b.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    b.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    b.bookingId.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">Tiada tempahan sepadan.</p>
                ) : (
                  bookings
                    .filter(
                      (b) =>
                        b.meetingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        b.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        b.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        b.bookingId.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((b) => (
                      <div
                        key={b.id}
                        onClick={() => {
                          handleOpenBookingDetails(b);
                          setSearchQuery('');
                        }}
                        className="p-3 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-200 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{b.meetingTitle}</span>
                            <span className="text-[10px] font-mono text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                              {b.bookingId}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {b.organizer} • {b.department} • {b.date} ({b.startTime} - {b.endTime})
                          </p>
                        </div>
                        <span className="text-xs text-blue-600 font-semibold">Lihat Butiran »</span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </main>
        ) : (
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {currentTab === 'dashboard' && (
              <Dashboard
                rooms={rooms}
                bookings={bookings}
                onNavigateToBooking={handleNavigateToBooking}
                onNavigateToCalendar={handleNavigateToCalendar}
                onNavigateToRooms={handleNavigateToRooms}
                onSelectBooking={handleOpenBookingDetails}
              />
            )}

            {currentTab === 'rooms' && (
              <RoomList
                rooms={rooms}
                onBookRoom={(roomId) => handleNavigateToBooking(roomId)}
                onViewSchedule={(roomId) => {
                  setCurrentTab('calendar');
                }}
                onSaveRoom={handleSaveRoom}
                onDeleteRoom={handleDeleteRoom}
              />
            )}

            {currentTab === 'calendar' && (
              <CalendarView
                rooms={rooms}
                bookings={bookings}
                onSelectBooking={handleOpenBookingDetails}
                onNewBookingForDate={(dateStr, roomId) => {
                  setPrefilledBookingRoomId(roomId);
                  setCurrentTab('booking');
                }}
              />
            )}

            {currentTab === 'booking' && (
              <BookingForm
                rooms={rooms}
                initialRoomId={prefilledBookingRoomId}
                onBookingSuccess={handleBookingSuccess}
                onCancel={() => setCurrentTab('dashboard')}
                onViewBookingDetails={handleOpenBookingDetails}
                onPrintBooking={handlePrintBooking}
              />
            )}

            {currentTab === 'my-bookings' && (
              <MyBookings
                bookings={bookings}
                rooms={rooms}
                onSelectBooking={handleOpenBookingDetails}
                onCancelBooking={handleCancelBooking}
                onEditBooking={(b) => {
                  handleOpenBookingDetails(b);
                }}
                onPrintBooking={handlePrintBooking}
                onNewBooking={() => handleNavigateToBooking()}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsView rooms={rooms} bookings={bookings} />
            )}

            {currentTab === 'admin' && (
              <AdminPanel
                rooms={rooms}
                bookings={bookings}
                users={users}
                onSaveRoom={handleSaveRoom}
                onDeleteRoom={handleDeleteRoom}
                onSaveBooking={handleSaveBooking}
                onCancelBooking={handleCancelBooking}
                onDeleteBooking={handleDeleteBooking}
                onSaveUser={handleSaveUser}
                onDeleteUser={handleDeleteUser}
                onResetDemoData={handleResetDemoData}
                onSelectBooking={handleOpenBookingDetails}
              />
            )}
          </main>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBookingForDetails && (
        <BookingDetailsModal
          booking={selectedBookingForDetails}
          room={selectedBookingRoom}
          isOpen={true}
          onClose={() => setSelectedBookingForDetails(null)}
          onCancel={(b) => handleCancelBooking(b.id, 'Dibatalkan oleh staf')}
          onPrint={(b) => handlePrintBooking(b)}
        />
      )}

      {/* Official Print Receipt Modal */}
      {printingBooking && (
        <BookingPrintReceipt
          booking={printingBooking}
          room={printingBookingRoom}
          onClose={() => setPrintingBooking(null)}
        />
      )}

      {/* Demo Switch Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
