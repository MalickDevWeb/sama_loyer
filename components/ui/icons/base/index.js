/**
 * Icon Component
 * Renders an icon image from the global assets directory with optional
 * circular background. Icon files are resolved from /assets/icons/global/.
 *
 * @example
 * <app-icon icon="home" width="{{ 32 }}" height="{{ 32 }}" enableBg />
 *
 * @property {string} containerClass - Additional CSS class for wrapper
 * @property {string} bgColor - Background circle color (default: '#F3F3F3')
 * @property {boolean} enableBg - Show background circle behind icon
 * @property {string} icon - Icon filename (without path or extension)
 * @property {number} width - Icon width in rpx (default: 50)
 * @property {number} height - Icon height in rpx (default: 50)
 * @property {string} containerStyle - Inline styles for the icon wrapper
 */
Component({
  properties: {
    containerClass: String,
    containerStyle: String,
    bgColor: {
      type: String,
      value: '#F3F3F3',
    },
    enableBg: {
      type: Boolean,
      value: false,
    },
    icon: String,
    width: {
      type: Number,
      value: 50,
    },
    height: {
      type: Number,
      value: 50,
    },
  },

  data: {
    BASE_URL: '/assets/icons/global/',
    CONTAINER: {},
  },

  lifetimes: {
    attached() {
      this.setData({
        CONTAINER: {
          HEIGHT: this.properties.height,
          WIDTH: this.properties.width,
        },
      });
    },
  },

  methods: {
    handleTap() {
      this.triggerEvent('iconTap', {}, {
        bubbles: true,
        composed: true,
      });
    },
  },
});
