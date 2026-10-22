import { backendAPI } from '../apis/index.js';
import { reservationStorage } from '../storage/reservations.js';
import { Bus } from '../event/index.js';

const STATUS_LABELS = {
  pending_payment: 'En attente de paiement',
  confirmed: 'Confirmée',
  cancelled: 'Annulée',
  completed: 'Terminée',
};

export function isValidBookingDate(value, today = new Date(), minDays = 1) {
  if (!Number.isInteger(minDays) || minDays < 0) return false;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  const localDate = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  if (Number.isNaN(date.getTime()) || localDate !== value) return false;
  const earliestDate = new Date(today);
  earliestDate.setHours(0, 0, 0, 0);
  earliestDate.setDate(earliestDate.getDate() + minDays);
  return date >= earliestDate;
}

function getReservationStatusLabel(status, upcoming) {
  if (status && STATUS_LABELS[status]) {
    return STATUS_LABELS[status];
  }
  return upcoming ? 'À venir' : 'Terminé';
}

export function createReservation(payload, packageInfo) {
  const userData = Bus.getState("user.data") || {};
  const phone = payload.phone || userData.msisdn || "770000000";
  const name = payload.name || userData.fullName || "Malick Teuw";
  
  if (!phone) {
    throw new Error("Numéro de téléphone introuvable.");
  }
  
  const bookingPayload = {
    ...payload,
    phone: phone,
    name: name
  };

  return backendAPI.createBooking(bookingPayload).then((apiResult) => {
    if (!apiResult.bookingRef) throw new Error('La référence de réservation est absente de la réponse API');
    const reservation = {
      bookingRef: apiResult.bookingRef,
      package: {
        id: packageInfo.id,
        title: packageInfo.title,
        image: packageInfo.image || '',
        location: packageInfo.location || packageInfo.subtitle || '',
        currency: packageInfo.currency,
      },
      date: payload.date,
      travelers: payload.travelers,
      total: payload.total,
      status: apiResult.status || 'pending_payment',
      createdAt: new Date().toISOString(),
    };
    if (!reservationStorage.save(reservation)) throw new Error('Impossible de sauvegarder la réservation sur cet appareil');
    return reservation;
  });
}

export function getLocalReservations() {
  return reservationStorage.getAll();
}

function truncateTitle(title, maxLength = 15) {
  const characters = Array.from(String(title || ''));
  return characters.length > maxLength ? `${characters.slice(0, maxLength - 1).join('')}…` : characters.join('');
}

function isUpcoming(dateValue) {
  const date = dateValue ? new Date(`${dateValue}T00:00:00`) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Boolean(date && !Number.isNaN(date.getTime()) && date >= today);
}

function formatReservationDate(value) {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('fr-FR');
}

export function getLocalReservationCards() {
  return getLocalReservations().map((item) => {
    const upcoming = isUpcoming(item.date);
    const title = item.package && item.package.title || '';
    const status = item.status || (upcoming ? 'upcoming' : 'done');
    const statusLabel = getReservationStatusLabel(item.status, upcoming);

    return {
      id: item.bookingRef,
      bookingRef: item.bookingRef,
      image: item.package && item.package.image || '',
      title,
      cardTitle: truncateTitle(title),
      subtitle: item.package && item.package.location || '',
      dateLabel: formatReservationDate(item.date),
      travelersLabel: `${item.travelers || 0} voyageur${item.travelers > 1 ? 's' : ''}`,
      price: item.total === null || item.total === undefined ? '' : `${Number(item.total).toLocaleString('fr-FR')}${item.package && item.package.currency ? ` ${item.package.currency}` : ''}`,
      reference: item.bookingRef,
      status,
      statusLabel,
      showAction: upcoming && status !== 'cancelled',
      actionLabel: 'Gérer la réservation',
    };
  });
}

export function toReservationDetailView(reservation) {
  const upcoming = isUpcoming(reservation.date);
  const total = reservation.total === null || reservation.total === undefined ? '' : Number(reservation.total).toLocaleString('fr-FR');
  const currency = reservation.package && reservation.package.currency;
  const status = reservation.status || (upcoming ? 'upcoming' : 'done');
  const statusLabel = getReservationStatusLabel(reservation.status, upcoming);
  const reservationPackage = reservation.package || {};

  return {
    bookingRef: reservation.bookingRef,
    package: {
      id: reservationPackage.id,
      title: reservationPackage.title || reservation.packageTitle || '',
      image: reservationPackage.image || '',
      location: reservationPackage.location || '',
    },
    dateLabel: formatReservationDate(reservation.date),
    travelersLabel: `${reservation.travelers || 0} voyageur${reservation.travelers > 1 ? 's' : ''}`,
    note: reservation.note || '',
    totalLabel: total ? `${total}${currency ? ` ${currency}` : ''}` : '',
    statusLabel,
    statusClass: status,
    isUpcoming: upcoming && status !== 'cancelled',
  };
}

export function getReservationByReference(reference) {
  const local = reservationStorage.getByReference(reference);
  return backendAPI.getBooking(reference).then((remote) => {
    const app = getApp();
    const packageInApp = ((app && app.globalData && app.globalData.DESTINATIONS) || [])
      .find((item) => String(item.id) === String(local && local.package && local.package.id));
    const merged = {
      ...(local || {}),
      bookingRef: remote.bookingRef || reference,
      package: {
        ...((packageInApp && {
          id: packageInApp.id,
          title: packageInApp.title,
          image: packageInApp.image,
          location: packageInApp.location || packageInApp.subtitle,
          currency: packageInApp.currency,
        }) || {}),
        ...((local && local.package) || {}),
        title: (local && local.package && local.package.title) || remote.packageTitle,
        currency: (local && local.package && local.package.currency) || remote.currency,
      },
      date: remote.date || (local && local.date),
      travelers: remote.travelers !== undefined ? remote.travelers : local && local.travelers,
      total: local ? local.total : remote.total,
      status: remote.status || (local && local.status) || 'pending_payment',
      note: remote.note,
    };
    reservationStorage.update(merged);
    return { reservation: merged, fromApi: true };
  }).catch((error) => {
    if (!local) throw error;
    return { reservation: local, fromApi: false, error };
  });
}
