import { getReservationByReference, toReservationDetailView } from '../../utils/helpers/reservations.js';
import { ERROR_MESSAGES } from '../../utils/constants/index.js';
import { isValidPackageId } from '../../utils/helpers/catalog.js';

function decodeBookingRef(value) {
  if (!value) return '';
  try { return decodeURIComponent(value); } catch (error) { return value; }
}

Page({
  data: {
    bookingRef: '',
    reservation: null,
    loading: true,
    error: false,
    localFallback: false,
  },

  onLoad(options = {}) {
    const bookingRef = decodeBookingRef(options.bookingRef);
    this.setData({ bookingRef });
    this.loadReservation();
  },

  async loadReservation() {
    const { bookingRef } = this.data;
    if (!bookingRef) {
      this.setData({ loading: false, error: true });
      return;
    }
    this.setData({ loading: true, error: false });
    try {
      const result = await getReservationByReference(bookingRef);
      this.setData({
        reservation: toReservationDetailView(result.reservation),
        localFallback: !result.fromApi,
        error: !result.fromApi,
        loading: false,
      });
    } catch (error) {
      this.setData({ loading: false, error: true, localFallback: false });
    }
  },

  retry() { this.loadReservation(); },

  callSupport() {
    wx.showToast({ title: 'Support téléphonique en cours de configuration', icon: 'none' });
  },

  sendEmail() {
    wx.showToast({ title: 'Support email en cours de configuration', icon: 'none' });
  },

  downloadTicket() {
    wx.showToast({ title: 'Billet en cours de préparation', icon: 'none' });
  },

  cancelReservation() {
    wx.showToast({ title: ERROR_MESSAGES.FEATURE_UNAVAILABLE, icon: 'none' });
  },

  rebook() {
    const packageId = this.data.reservation?.package?.id;
    if (!isValidPackageId(packageId)) {
      wx.showToast({ title: 'Destination introuvable pour rebooking', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: `/pages/booking/booking?destinationId=${encodeURIComponent(packageId)}`,
    });
  },
});
