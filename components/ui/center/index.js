/**
 * Center Component
 * Flexbox centering wrapper with optional dimensions and inline mode.
 * Uses virtualHost to avoid an extra wrapper node in the tree.
 *
 * @example
 * <app-center width="200rpx" height="200rpx">
 *   <text>Centered content</text>
 * </app-center>
 *
 * @property {string} customClass - Additional CSS class
 * @property {string} width - Override width (any CSS value)
 * @property {string} height - Override height (any CSS value)
 * @property {boolean} inline - Use inline-flex instead of flex
 */
Component({
  options: {
    virtualHost: true
  },

  properties: {
    // Styling
    customClass: {
      type: String,
      value: ''
    },

    // Dimensions (optional overrides)
    width: {
      type: String,
      value: ''
    },

    height: {
      type: String,
      value: ''
    },

    // Inline centering (for text-like content)
    inline: {
      type: Boolean,
      value: false
    }
  },

  data: {
    computedStyle: ''
  },

  lifetimes: {
    attached() {
      this.updateStyles();
    }
  },

  observers: {
    'width, height, inline': function () {
      this.updateStyles();
    }
  },

  methods: {
    updateStyles() {
      const styles = [];

      if (this.properties.width) {
        styles.push(`width: ${this.properties.width}`);
      }

      if (this.properties.height) {
        styles.push(`height: ${this.properties.height}`);
      }

      if (this.properties.inline) {
        styles.push('display: inline-flex');
      }

      this.setData({
        computedStyle: styles.join('; ')
      });
    }
  }
});