const app = getApp();
import { Bus } from '../../utils/event/index.js';
import { createReservation } from '../../utils/helpers/reservations.js';
import { formatPackagePrice, parsePrice } from '../../utils/formatters/index.js';
import { isValidPackageId, loadPackage } from '../../utils/helpers/catalog.js';
import { isValidBookingDate } from '../../utils/helpers/reservations.js';

function safeDecode(value) {
  if (!value) return '';
  try { return decodeURIComponent(value); } catch (error) { return value; }
}

Page({
  data: {
    reservation: { title: '', category: '', duration: '', amount: '' },
    reference: '',
    isPaying: false,
    packageId: '',
    date: '',
    travelers: 0,
    minDays: 1,
    total: 0,
    packageInfo: null,
    showPolicy: false,
    showTerms: false,
  },

  async onLoad(options = {}) {
    options = { ...options, ...(Bus.getState('booking.pending.data') || {}) };
    Bus.removeState('booking.pending.data');
    const destinations = Array.isArray(app.globalData.DESTINATIONS) ? app.globalData.DESTINATIONS : [];
    const rawId = options.destinationId || options.packageId;
    if (!isValidPackageId(rawId)) {
      wx.showToast({ title: 'Identifiant de destination invalide', icon: 'none' });
      return;
    }
    let destination = destinations.find((item) => Number(item.id) === Number(rawId));
    if (!destination || !destination.currency) {
      try {
        destination = await loadPackage(rawId);
      } catch (error) {
        wx.showToast({ title: error.message || 'Destination introuvable', icon: 'none' });
        return;
      }
    }

    if (!destination) {
      wx.showToast({ title: 'Destination introuvable', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }

    const parsedTotal = parsePrice(safeDecode(options.total));
    const total = parsedTotal;
    if (!Number.isFinite(total) || total < 0) {
      wx.showToast({ title: 'Montant de réservation invalide', icon: 'none' });
      return;
    }
    const amount = formatPackagePrice(total, destination.currency);

    this.setData({
      reservation: {
        title: destination.title,
        category: destination.category || destination.subtitle || '',
        duration: destination.duration || '',
        amount,
      },
      packageId: String(destination.id),
      date: options.dateIso || '',
      travelers: Math.max(0, Number(options.travelers) || (Number(options.adults) + Number(options.children))),
      adults: Number(options.adults) || 1,
      children: Number(options.children) || 0,
      minDays: Number.isInteger(Number(options.minDays)) && Number(options.minDays) >= 0 ? Number(options.minDays) : 1,
      total,
      packageInfo: {
        id: destination.id,
        title: destination.title,
        image: destination.image || '',
        location: destination.subtitle || '',
        currency: destination.currency,
      },
    });
  },

  openTerms() {
    this.setData({ showTerms: true });
  },

  closeTerms() {
    this.setData({ showTerms: false });
  },

  openPolicy() {
    this.setData({ showPolicy: true });
  },

  closePolicy() {
    this.setData({ showPolicy: false });
  },

  async handlePay() {
    if (this._payLocked) return;
    const { packageId, date, travelers, adults, children, minDays, total, packageInfo } = this.data;
    if (!isValidPackageId(packageId) || !isValidBookingDate(date, new Date(), minDays) || !travelers || !Number.isFinite(total) || total < 0) {
      wx.showToast({ title: 'Informations de réservation incomplètes', icon: 'none' });
      return;
    }

    this._payLocked = true;
    this.setData({ isPaying: true });
    try {
      const txnid = "TXN-" + Date.now() + Math.floor(Math.random() * 1000);
      const created = await createReservation({
        package_id: Number(packageId),
        date,
        travelersAdulte: adults,
        travelersEnfant: children,
        //travelers,
        total,
        txnid
      }, packageInfo);
      Bus.setState('booking.created.data', created);
      wx.redirectTo({
        url: `/pages/booking-confirmation/booking-confirmation`,
      });
    } catch (error) {
      const message = error.message || 'Échec de la réservation. Réessayez.';
      wx.showToast({ title: message, icon: 'none', duration: 3000 });
    } finally {
      this._payLocked = false;
      this.setData({ isPaying: false });
    }
  },
});
