/** Separate projections for reservation creation and reservation details. */

export const ReservationSchema = {
  bookingRef: '@link.booking_ref',
  status: '@link.status',
};

export const ReservationDetailSchema = {
  bookingRef: '@link.booking_ref',
  status: '@link.status',
  date: '@link.date',
  travelers: '@link.travelers',
  packageTitle: '@link.package',
  total: '@link.total',
  currency: '@link.currency',
  note: '@link.note',
};
