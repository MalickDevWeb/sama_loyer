/**
 * Modal Component
 * Versatile dialog with center/bottom sheet placement, backdrop blur,
 * and multiple slots (header, content, footer). Uses apply-shared for
 * page-level utility class inheritance.
 *
 * @example
 * <app-modal
 *   visible="{{ showModal }}"
 *   placement="bottom"
 *   size="lg"
 *   hasHeader
 *   hasContent
 *   bind:close="onClose"
 * >
 *   <view slot="header">Title</view>
 *   <view slot="content">Body text</view>
 *   <view slot="footer">
 *     <app-button bind:onPress="onClose">Close</app-button>
 *   </view>
 * </app-modal>
 *
 * @property {boolean} visible - Show/hide the modal
 * @property {string} overlayColor - Backdrop hex color (default: '#000')
 * @property {number} overlayOpacity - Backdrop opacity 0-1 (default: 0.5)
 * @property {'center'|'bottom'} placement - Dialog position (default: 'center')
 * @property {'sm'|'md'|'lg'|'full'} size - Dialog width preset (default: 'md')
 * @property {number} blur - Backdrop blur in px (default: 6)
 * @property {string} containerClass - Dialog wrapper CSS class
 * @property {string} overlayClass - Backdrop CSS class
 * @property {boolean} backdropClosable - Close on backdrop tap (default: true)
 * @property {boolean} hasHeader - Enable header slot
 * @property {boolean} hasContent - Enable content slot
 * @property {boolean} hasFooter - Enable footer slot
 *
 * @fires close - When the modal requests to close (backdrop tap)
 */
Component({
  options: {
    multipleSlots: true,
    styleIsolation: 'apply-shared',
  },

  properties: {
    visible: { type: Boolean, value: false },
    overlayColor: { type: String, value: '#000' },
    overlayOpacity: { type: Number, value: 0.5 },
    placement: { type: String, value: 'center' }, // 'center' | 'bottom'
    size: { type: String, value: 'md' }, // 'sm', 'md', 'lg', 'full'
    blur: { type: Number, value: 6 },
    containerClass: String,
    overlayClass: String,
    backdropClosable: { type: Boolean, value: true },
    hasHeader: { type: Boolean, value: false },
    hasContent: { type: Boolean, value: false },
    hasFooter: { type: Boolean, value: false },
  },

  data: {
    overlayRGBA: '',
    computedStyle: '',
  },

  lifetimes: {
    attached() {
      this.computeOverlay();
      this.computeStyle();
    },
  },

  observers: {
    'overlayColor, overlayOpacity': function () {
      this.computeOverlay();
    },
    'placement, size': function () {
      this.computeStyle();
    },
  },

  methods: {
    computeOverlay() {
      const { overlayColor, overlayOpacity } = this.properties;
      const alpha = Math.min(Math.max(overlayOpacity, 0), 1);
      this.setData({
        overlayRGBA: this.hexToRGBA(overlayColor, alpha),
      });
    },

    computeStyle() {
      const { placement, size } = this.properties;
      const isAtBottom = placement === 'bottom';

      let justify = isAtBottom ? 'flex-end' : 'center';
      let width = '80%';

      if (size === 'sm') width = '60%';
      else if (size === 'lg') width = '90%';
      else if (size === 'full') width = '100%';

      const bottomStyles = isAtBottom ? 'border-bottom-left-radius: 0 !important; border-bottom-right-radius: 0 !important;' : '';
      const styles = `width: ${width} !important; align-self: ${justify};`;

      this.setData({
        computedStyle: styles + bottomStyles,
      });
    },

    onOverlayTap() {
      if (this.properties.backdropClosable) {
        this.triggerEvent('close');
      }
    },

    noop() {},

    hexToRGBA(hex, alpha = 1) {
      let r = 0, g = 0, b = 0;

      if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
      } else if (hex.length === 7) {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
      }

      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },
  },
});
