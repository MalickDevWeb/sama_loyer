import { storage } from '../storage.js';

const KEY = 'ats_local_reservations';

export const reservationStorage = {
  getAll() {
    const entries = storage.get(KEY, []);
    return Array.isArray(entries) ? entries : [];
  },
  getByReference(bookingRef) {
    return this.getAll().find((item) => item.bookingRef === bookingRef) || null;
  },
  save(reservation) {
    const entries = this.getAll();
    const existingIndex = entries.findIndex((item) => item.bookingRef === reservation.bookingRef);
    if (existingIndex >= 0) entries[existingIndex] = reservation;
    else entries.unshift(reservation);
    return storage.set(KEY, entries);
  },
  update(reservation) {
    const entries = this.getAll();
    const index = entries.findIndex((item) => item.bookingRef === reservation.bookingRef);
    if (index < 0) return false;
    entries[index] = reservation;
    return storage.set(KEY, entries);
  },
};
