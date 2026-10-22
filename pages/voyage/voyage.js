import { MAIN_TABS } from '../../utils/constants/index';
import { setCustomTabBarActive } from '../../utils/helpers/tab-bar';
import { getLocalReservationCards } from '../../utils/helpers/reservations.js';

Page({
  data: {
    activeTab: 'voyages',
    tabs: MAIN_TABS,
    reservations: [],
    loading: true,
    resultsLabel: '0 réservation',
  },

  onLoad() {
    this.refreshReservations();
  },

  onShow() {
    setCustomTabBarActive(this, 'voyages');
    this.refreshReservations();
  },

  refreshReservations() {
    this.setData({ loading: true });
    const reservations = getLocalReservationCards();
    const total = reservations.length;

    this.setData({
      reservations,
      loading: false,
      resultsLabel: `${total} réservation${total > 1 ? 's' : ''}`,
    });
  },

  openReservationDetails(event) {
    const bookingRef = event.detail.bookingRef;
    if (!bookingRef) return;
    wx.navigateTo({ url: `/pages/reservation-detail/reservation-detail?bookingRef=${encodeURIComponent(bookingRef)}` });
  },
});
