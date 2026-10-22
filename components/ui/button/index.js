/**
 * Button Component
 * Primary/secondary variants with loading state and press animation.
 *
 * @example
 * <app-button type="primary" bind:onPress="handleTap">
 *   Submit
 * </app-button>
 *
 * @property {boolean} disabled - Prevents interaction when true
 * @property {boolean} loading - Shows loading spinner, prevents interaction
 * @property {'primary'|'secondary'} type - Visual variant (default: 'primary')
 *
 * @fires onPress - When button is tapped (only if not disabled/loading)
 */
Component({
  properties: {
    disabled: {
      type: Boolean,
      value: false,
    },
    loading: {
      type: Boolean,
      value: false,
    },
    type: {
      type: String,
      value: 'primary', // 'primary' | 'secondary'
    },
    buttonClass: {
      type: String,
      value: '',
    },
    buttonStyle: {
      type: String,
      value: '',
    },
  },

  data: {
    pressed: false,
  },

  methods: {
    executionAction() {
      if (!this.properties.disabled && !this.properties.loading) {
        this.triggerEvent('onPress');
      }
    },
    onPressStart() {
      if (!this.properties.disabled) {
        this.setData({ pressed: true });
      }
    },
    onPressEnd() {
      this.setData({ pressed: false });
    },
  },
});
