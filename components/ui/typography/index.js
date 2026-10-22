/**
 * Typography Component
 * Renders styled text via slot (preferred) or message prop (fallback).
 * Short aliases (size, weight, color) override full property names when set.
 *
 * @example
 * <!-- Slot pattern (preferred) -->
 * <app-typography size="16" weight="700" color="#333">
 *   Hello World
 * </app-typography>
 *
 * <!-- Message prop pattern -->
 * <app-typography message="Hello World" fontSize="32rpx" />
 *
 * @property {string} message - Text content (fallback when not using slot)
 * @property {string} align - Text alignment (default: 'left')
 * @property {string} fontWeight - Font weight (default: 'normal')
 * @property {string} colour - Text color, full name (default: '#000000')
 * @property {string} fontSize - Font size as CSS value (e.g. '28rpx')
 * @property {string} textDecoration - Text decoration (default: 'none')
 * @property {boolean} ellipsis - Truncate with ellipsis on overflow
 * @property {string} lineHeight - Line height (default: '1.4')
 * @property {string} size - Short alias: numeric size, auto-converted to rpx (x2)
 * @property {string} weight - Short alias for fontWeight
 * @property {string} color - Short alias for colour
 */
Component({
  properties: {
    // Content (fallback when not using slot)
    message: { type: String, value: '' },
    containerClass: { type: String, value: '' },
    containerStyle: { type: String, value: '' },

    // Full property names
    align:          { type: String, value: 'left' },
    fontWeight:     { type: String, value: 'normal' },
    colour:         { type: String, value: '#000000' },
    fontSize:       { type: String, value: '' },
    textDecoration: { type: String, value: 'none' },
    ellipsis:       { type: Boolean, value: false },
    lineHeight:     { type: String, value: '1.4' },

    // Short aliases (override full names when provided)
    size:   { type: String, value: '' },
    weight: { type: String, value: '' },
    color:  { type: String, value: '' },
  },

  data: {
    computedColor: '#000000',
    computedWeight: 'normal',
    computedSize: '28rpx',
  },

  lifetimes: {
    attached() {
      this._computeStyles();
    },
  },

  observers: {
    'colour, color, fontWeight, weight, fontSize, size': function () {
      this._computeStyles();
    },
  },

  methods: {
    _computeStyles() {
      const { colour, color, fontWeight, weight, fontSize, size } = this.properties;

      // Short aliases take priority
      const computedColor = color || colour || '#000000';
      const computedWeight = weight || fontWeight || 'normal';

      // Size: short alias "size" is a number (e.g. "16"), convert to rpx
      // Full "fontSize" can be any CSS value (e.g. "28rpx", "16px")
      let computedSize = '28rpx';
      if (size) {
        computedSize = `${Number(size) * 2}rpx`;
      } else if (fontSize) {
        computedSize = fontSize;
      }

      this.setData({ computedColor, computedWeight, computedSize });
    },
  },
});
