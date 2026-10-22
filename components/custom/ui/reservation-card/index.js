Component({
  properties: {
    reservation: { type: Object, value: {} },
  },
  methods: {
    handleTap() {
      this.triggerEvent('select', { bookingRef: this.properties.reservation.bookingRef });
    },
  },
});
