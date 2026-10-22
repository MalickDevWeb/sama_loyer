/**
 * Card Component
 * Slot-based content container with optional custom class.
 * Includes local utility fallbacks because iOS mini-program engines can be
 * stricter about page styles crossing component boundaries.
 *
 * @example
 * <app-card containerClass="p-3 br-10">
 *   <view>Card content here</view>
 * </app-card>
 *
 * @property {string} containerClass - Additional CSS class for the card wrapper
 */
Component({
  options: {
    addGlobalClass: true,
    styleIsolation: 'apply-shared',
  },

  properties: {
    containerClass: String,
    containerStyle: {
      type: String,
      value: '',
    },
  },

  data: {},

  methods: {},
});
