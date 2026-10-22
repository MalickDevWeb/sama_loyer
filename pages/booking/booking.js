const app = getApp();

import { formatPackagePrice } from '../../utils/formatters/index.js';
import { isValidPackageId, loadPackage } from '../../utils/helpers/catalog.js';
import { createReservation, isValidBookingDate } from '../../utils/helpers/reservations.js';
import { navigateToLocked } from '../../utils/helpers/navigation.js';
import { calculatePackagePrice } from '../../utils/helpers/pricing.js';
import { Bus } from '../../utils/event/index.js';

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function dateAfterDays(days) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  today.setDate(today.getDate() + days);
  return today;
}
function createFutureDates(minDays, count = 12) {
  const firstDate = dateAfterDays(minDays);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(firstDate);
    date.setDate(date.getDate() + index);
    return { day: DAYS[date.getDay()], date: String(date.getDate()), month: MONTHS[date.getMonth()], isoDate: formatDate(date) };
  });
}

Page({
  data: {
    destination: null,
    minDays: null,
    pricing: null,
    selectedDate: -1,
    selectedDateIso: '',
    minDate: '',
    canContinue: false,
    priceValid: false,
    priceError: '',
    adults: 1,
    children: 0,
    dates: [],
    adultLine: '',
    adultSubtotal: '',
    childrenLine: '',
    childrenSubtotal: '',
    totalPrice: '',
  },

  async onLoad(options = {}) {
    const rawId = options.destinationId;
    if (!isValidPackageId(rawId)) {
      wx.showToast({
        title: 'Destination invalide ou manquante',
        icon: 'none',
        duration: 2500,
      });
      setTimeout(() => {
        const pages = getCurrentPages();
        if (pages.length > 1) {
          wx.navigateBack();
        } else {
          wx.switchTab({ url: '/pages/home/home' });
        }
      }, 1500);
      return;
    }

    const bookingContext = Bus.getState('booking.package-context');
    Bus.removeState('booking.package-context');
    const destinations = Array.isArray(app.globalData.DESTINATIONS)
      ? app.globalData.DESTINATIONS
      : [];
    let destination = bookingContext && Number(bookingContext.id) === Number(rawId)
      ? bookingContext
      : destinations.find((item) => Number(item.id) === Number(rawId)) || null;
    if (!destination || !Number.isFinite(destination.minDays) || !destination.pricing) {
      try {
        destination = await loadPackage(rawId);
      } catch (error) {
        wx.showToast({ title: error.message || 'Destination introuvable dans le catalogue', icon: 'none', duration: 2500 });
        return;
      }
    }

    if (!destination) {
      wx.showToast({
        title: 'Destination introuvable dans le catalogue',
        icon: 'none',
        duration: 2500,
      });
      setTimeout(() => {
        const pages = getCurrentPages();
        if (pages.length > 1) {
          wx.navigateBack();
        } else {
          wx.switchTab({ url: '/pages/home/home' });
        }
      }, 1500);
      return;
    }

    if (!Number.isInteger(destination.minDays) || destination.minDays < 0) {
      wx.showToast({ title: 'Le délai minimal de réservation est indisponible', icon: 'none', duration: 2500 });
      return;
    }

    const dates = createFutureDates(destination.minDays);
    this.setData({
      destination,
      minDays: destination.minDays,
      pricing: destination.pricing,
      minDate: formatDate(dates[0] ? new Date(`${dates[0].isoDate}T00:00:00`) : dateAfterDays(destination.minDays)),
      dates,
    }, () => {
      this.updatePrice();
    });
  },

  selectDate(event) {
    const index = Number(event.currentTarget.dataset.index);
    const selected = this.data.dates[index];
    if (!selected || selected.isoDate < this.data.minDate) return;
    this.setData({
      selectedDate: index,
      selectedDateIso: selected.isoDate,
      canContinue: this.data.priceValid,
    });
  },

  onDatePickerChange(event) {
    const isoDate = event.detail.value;
    const date = new Date(`${isoDate}T00:00:00`);
    if (!isoDate || isoDate < this.data.minDate) return;
    const dates = this.data.dates;
    const existing = dates.findIndex((item) => item.isoDate === isoDate);
    if (existing >= 0) {
      this.setData({ selectedDate: existing, selectedDateIso: isoDate, canContinue: this.data.priceValid, showDatePicker: false });
      return;
    }
    this.setData({
      dates: [...dates, { day: DAYS[date.getDay()], date: String(date.getDate()), month: MONTHS[date.getMonth()], isoDate }],
      selectedDate: dates.length,
      selectedDateIso: isoDate,
      canContinue: this.data.priceValid,
      showDatePicker: false,
    });
  },

  decreaseAdult() {
    if (this.data.adults <= 1) {
      return;
    }

    this.setData({ adults: this.data.adults - 1 }, () => {
      this.updatePrice();
    });
  },

  increaseAdult() {
    this.setData({ adults: this.data.adults + 1 }, () => {
      this.updatePrice();
    });
  },

  decreaseChild() {
    if (this.data.children <= 0) {
      return;
    }

    this.setData({ children: this.data.children - 1 }, () => {
      this.updatePrice();
    });
  },

  increaseChild() {
    this.setData({ children: this.data.children + 1 }, () => {
      this.updatePrice();
    });
  },

  updatePrice() {
    const { adults, children, pricing, destination } = this.data;
    let price;
    try {
      price = calculatePackagePrice(pricing, adults, children);
    } catch (error) {
      this.setData({ priceValid: false, priceError: error.message, canContinue: false, adultLine: '', adultSubtotal: '', childrenLine: '', childrenSubtotal: '', totalPrice: '' });
      return;
    }

    this.setData({
      priceValid: true,
      priceError: '',
      canContinue: Boolean(this.data.selectedDateIso && this.data.selectedDateIso >= this.data.minDate),
      adultLine: `${adults} Adulte${adults > 1 ? 's' : ''} x ${formatPackagePrice(price.adultUnitPrice, destination && destination.currency)}`,
      adultSubtotal: formatPackagePrice(price.adultSubtotal, destination && destination.currency),
      childrenLine: children > 0
        ? `${children} Enfant${children > 1 ? 's' : ''} x ${formatPackagePrice(price.childUnitPrice, destination && destination.currency)}`
        : '',
      childrenSubtotal: children > 0 ? formatPackagePrice(price.childrenSubtotal, destination && destination.currency) : '',
      totalPrice: formatPackagePrice(price.total, destination && destination.currency),
      totalAmount: price.total,
    });
  },

  async handleReserve() {
    if (this._reserveLocked) return;
    if (!this.data.canContinue || !isValidBookingDate(this.data.selectedDateIso, new Date(), this.data.minDays)) {
      return;
    }

    const { adults, children, destination, selectedDateIso, totalAmount } = this.data;

    if (!destination || !isValidPackageId(destination.id)) {
      wx.showToast({ title: 'Destination non sélectionnée', icon: 'none' });
      return;
    }
    if (!this.data.priceValid || !Number.isFinite(totalAmount)) {
      wx.showToast({ title: 'Le tarif de ce package est indisponible', icon: 'none' });
      return;
    }

    this._reserveLocked = true;
    wx.showLoading({ title: 'Réservation...', mask: true });

    try {
      const txnid = "TXN-" + Date.now() + Math.floor(Math.random() * 1000);
      const created = await createReservation({
        package_id: Number(destination.id),
        date: selectedDateIso,
        travelersAdulte: adults,
        travelersEnfant: children,
        total: totalAmount,
        txnid
      }, destination);

      Bus.setState('booking.created.data', created);
      wx.hideLoading();

      // SIMULATEUR EDITEUR: Simulation du popup de paiement MaxIt
      wx.showModal({
        title: 'Simulation Paiement MaxIt',
        content: `Confirmer le paiement de ${formatPackagePrice(totalAmount, destination && destination.currency)} ?`,
        confirmText: 'Payer',
        confirmColor: '#FF6600',
        cancelText: 'Annuler',
        success: (res) => {
          if (res.confirm) {
            // Paiement validé
            Bus.setState('booking.status', 'confirmed');
            wx.redirectTo({
              url: '/pages/booking-confirmation/booking-confirmation'
            });
          } else {
            // Paiement annulé
            wx.showToast({ title: 'Paiement annulé', icon: 'none', duration: 2500 });
          }
        }
      });

      /* 
      =========================================================
      CODE DE PRODUCTION (À DÉCOMMENTER POUR TESTER SUR MOBILE)
      =========================================================
      
      // import { payWithProvider } from '../../utils/apis/native.js';
      
      // try {
      //   wx.showLoading({ title: 'Ouverture de MaxIt...', mask: true });
      //   const paymentResult = await payWithProvider('maxit', { 
      //     amount: totalAmount, 
      //     txnid,
      //     reference: created.reference
      //   });
      //   
      //   if (paymentResult && paymentResult.success) {
      //     Bus.setState('booking.status', 'confirmed');
      //     wx.redirectTo({ url: '/pages/booking-confirmation/booking-confirmation' });
      //   } else {
      //     wx.showToast({ title: 'Échec du paiement', icon: 'none' });
      //   }
      // } catch (payErr) {
      //   wx.showToast({ title: payErr.message || 'Erreur de paiement', icon: 'none' });
      // } finally {
      //   wx.hideLoading();
      // }
      
      =========================================================
      */

    } catch (error) {
      const message = error.message || 'Échec de la réservation. Réessayez.';
      wx.showToast({ title: message, icon: 'none', duration: 3000 });
      wx.hideLoading();
    } finally {
      this._reserveLocked = false;
    }
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
  }
});
