/**
 * Input Spinner Component
 * Numeric stepper with plus/minus buttons and configurable range.
 *
 * @example
 * <app-input-spinner
 *   value="{{ quantity }}"
 *   min="{{ 1 }}"
 *   max="{{ 10 }}"
 *   name="qty"
 *   bind:change="onQuantityChange"
 * />
 *
 * @property {number} value - Current numeric value (default: 1)
 * @property {number} min - Minimum allowed value (default: 1)
 * @property {number} max - Maximum allowed value (default: 99)
 * @property {string} name - Field name included in change event
 * @property {string} containerClass - Wrapper CSS class
 * @property {string} iconClass - Plus/minus button CSS class
 * @property {string} valueClass - Value display CSS class
 *
 * @fires change - On value change (detail: { name, value })
 */
Component({
  properties: {
    value: { type: Number, value: 1 },
    min: { type: Number, value: 1 },
    max: { type: Number, value: 99 },
    name: String,
    containerClass: { type: String, value: '' },
    iconClass: { type: String, value: '' },
    valueClass: { type: String, value: '' }
  },
  data: {},
  methods: {
    minus() {
      if (this.data.value > this.data.min) {
        this.triggerEvent('change', { name: this.data.name, value: this.data.value - 1 });
      }
    },
    plus() {
      if (this.data.value < this.data.max) {
        this.triggerEvent('change', { name: this.data.name, value: this.data.value + 1 });
      }
    }
  }
});