/**
 * Radio Group Component
 * Single-selection option group with customizable styling per state.
 * Inherits page-level utility classes via apply-shared.
 *
 * @example
 * <app-radio-group
 *   options="{{ [{ label: 'Small', value: 'sm' }, { label: 'Large', value: 'lg' }] }}"
 *   value="{{ selectedSize }}"
 *   bind:change="onSizeChange"
 * />
 *
 * @property {Array<{label: string, value: string}>} options - Selectable items
 * @property {string} value - Currently selected value
 * @property {string} containerClass - Wrapper CSS class
 * @property {string} itemClass - Each option CSS class
 * @property {string} activeClass - Selected option CSS class
 * @property {string} inactiveClass - Unselected option CSS class
 *
 * @fires change - On selection change (detail: { value })
 */
Component({
  options: {
    multipleSlots: true
  },
  properties: {
    options: Array,
    value: String,
    containerClass: { type: String, value: '' },
    itemClass: { type: String, value: '' },
    activeClass: { type: String, value: '' },
    inactiveClass: { type: String, value: '' }
  },
  methods: {
    onSelect(e) {
      const value = e.currentTarget.dataset.value;
      this.triggerEvent('change', { value });
    }
  }
});