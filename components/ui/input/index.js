/**
 * Input Component
 * Flexible input field with optional icon, text styling, and result dropdown support.
 * Supports left or right icon placement, placeholder styling, and optional date mode.
 *
 * @example
 * <app-input
 *   value="{{ query }}"
 *   placeholder="Search..."
 *   icon="search"
 *   iconPosition="left"
 *   fieldStyle="font-size: 28rpx;"
 *   placeholderStyle="color: #999;"
 *   bind:input="onInput"
 *   bind:iconTap="onSearch"
 * />
 *
 * @property {string} value - Current input value.
 * @property {string} placeholder - Placeholder text shown when the field is empty.
 * @property {'text'|'date'} type - Input type, currently supports 'text' and optional 'date' mode.
 * @property {boolean} readonly - Disable editing.
 * @property {string} containerClass - Additional CSS class(es) on the outer wrapper.
 * @property {string} fieldStyle - Inline style applied to the text input element.
 * @property {string} placeholderStyle - Inline style applied to the placeholder text.
 * @property {string} icon - Icon name passed to the internal `osn-icon` component.
 * @property {string} iconPosition - Icon placement: 'left' or 'right' (default: 'right').
 * @property {string} height - Icon height in rpx (default: '40').
 * @property {string} width - Icon width in rpx (default: '40').
 * @property {boolean} showResults - When true, renders the dropdown results panel.
 * @property {string} resultClass - CSS class applied to the results dropdown.
 * @property {Array} results - Result items for the dropdown slot.
 *
 * @fires input - Fired on every keystroke in text mode. Detail: { value }.
 * @fires iconTap - Fired when the icon is tapped.
 * @fires selectResult - Fired when a result item slot is selected.
 * @fires dateChanged - Fired when the date picker value changes. Detail: { value }.
 */
Component({
  options: {
    multipleSlots: true
  },
  properties: {
    value: String,
    placeholder: String,
    type: { type: String, value: 'text' },
    readonly: { type: Boolean, value: false },
    containerClass: String,
    fieldStyle: String,
    placeholderStyle: String,
    icon: String,
    iconPosition: { type: String, value: 'right' },
    height: { type: String, value: '40' },
    width: { type: String, value: '40' },
    showResults: { type: Boolean, value: false },
    resultClass: String,
    results: { type: Array, value: [] }
  },
  methods: {
    onInput(e) {
      this.triggerEvent('input', { value: e.detail.value });
    },
    onIconTap() {
      this.triggerEvent('iconTap');
    },
    onSelectResult(e) {
      // delegate to parent, pass data attributes
      this.triggerEvent('selectResult', e);
    },
    onDateChange(e) {
      this.triggerEvent('dateChanged', { value: e.detail.value });
    }
  }
});
