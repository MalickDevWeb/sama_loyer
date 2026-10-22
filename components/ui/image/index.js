/**
 * Image Component
 * Feature-rich image with lazy loading, automatic retry, local caching,
 * full-screen preview, and EventBus integration.
 *
 * @example
 * <app-image
 *   src="/assets/hero.png"
 *   mode="aspectFill"
 *   width="300rpx"
 *   height="300rpx"
 *   previewable
 *   retryCount="{{ 2 }}"
 * />
 *
 * @property {string} src - Image source URL
 * @property {string} fallbackSrc - Fallback URL on load failure
 * @property {string} mode - Image scaling mode (default: 'aspectFill')
 * @property {boolean} lazyLoad - Enable lazy loading (default: true)
 * @property {boolean} showMenuByLongpress - Show context menu on long press
 * @property {string} width - Image width (CSS value)
 * @property {string} height - Image height (CSS value)
 * @property {string} containerClass - Wrapper CSS class
 * @property {string} imageClass - Image element CSS class
 * @property {string} containerStyle - Wrapper inline styles
 * @property {string} imageStyle - Image element inline styles
 * @property {string} overlayClass - Overlay slot CSS class
 * @property {string} badge - Badge text displayed over the image
 * @property {string} badgeClass - Badge CSS class
 * @property {string} badgeStyle - Badge inline styles
 * @property {string} loadingText - Text shown while loading
 * @property {string} errorText - Text shown on error
 * @property {string} retryText - Text for retry action
 * @property {string} errorIcon - Icon shown on error (default: '⚠️')
 * @property {boolean} previewable - Enable full-screen preview on tap
 * @property {string[]} previewUrls - URLs for preview gallery
 * @property {number} retryCount - Max retry attempts (default: 3)
 * @property {number} retryDelay - Delay between retries in ms (default: 1000)
 * @property {string} cacheKey - Custom cache key (defaults to src)
 * @property {string} namespace - EventBus namespace (default: 'tc-image')
 *
 * @fires image:created - Component attached (detail: ImageInfo)
 * @fires image:destroyed - Component detached (detail: { id })
 * @fires image:loaded - Image loaded successfully (detail: ImageInfo)
 * @fires image:error - All retries exhausted (detail: ImageInfo)
 * @fires image:retry - Retry attempt started (detail: { count })
 * @fires image:load - Native load event (detail: { id, detail })
 * @fires image:tap - Image tapped (detail: ImageInfo)
 * @fires image:longpress - Image long-pressed (detail: ImageInfo)
 *
 * @method reload - Force reload the image from source
 * @method getImageInfo - Returns { id, src, loading, error }
 */
Component({
  options: {
    virtualHost: true,
    multipleSlots: true

  },

  properties: {
    // Core
    src: String,
    fallbackSrc: String,
    mode: { type: String, value: 'aspectFill' },
    lazyLoad: { type: Boolean, value: true },
    showMenuByLongpress: Boolean,

    // Styling
    width: String,
    height: String,
    containerClass: String,
    imageClass: String,
    containerStyle: String,
    imageStyle: String,
    overlayClass: String,
    badge: String,
    badgeClass: String,
    badgeStyle: String,

    // UX text
    loadingText: String,
    errorText: String,
    retryText: String,
    errorIcon: { type: String, value: '⚠️' },

    // Behavior
    previewable: Boolean,
    previewUrls: Array,
    retryCount: { type: Number, value: 3 },
    retryDelay: { type: Number, value: 1000 },

    // Integration
    cacheKey: String,
    namespace: { type: String, value: 'tc-image' }
  },

  data: {
    loading: true,
    error: false,
    currentRetry: 0,
    computedSrc: '',
    imageId: '',
    hasOverlay: false
  },

  observers: {
    'src': function (newSrc) {
      if (newSrc && newSrc !== this.data.computedSrc) {
        this.loadImage(newSrc);
      }
    }
  },

  lifetimes: {
    created() {
      this.data.imageId = `tc-image-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      this.eventBus = getApp().eventBus;
    },
  
    

    attached() {
      this.init();
      this.checkOverlaySlot();
      this.emit('image:created', this.getImageInfo());
    },

    detached() {
      this.emit('image:destroyed', { id: this.data.imageId });
    }
  },

  methods: {
    init() {
      const src = this.properties.src;
      if (src) {
        if (src !== this.data.computedSrc) {
          this.loadImage(src);
        }
      } else {
        this.setData({ loading: false, error: true });
      }
    },

    loadImage(src) {
      this.setData({
        computedSrc: src,
        loading: true,
        error: false,
      });
    },

    handleImageError() {
      const { currentRetry } = this.data;
      const { retryCount, retryDelay, fallbackSrc, src } = this.properties;

      if (currentRetry < retryCount) {
        this.setData({ currentRetry: currentRetry + 1 });
        setTimeout(() => {
          this.emit('image:retry', { count: this.data.currentRetry });
          this.loadImage(fallbackSrc || src);
        }, retryDelay);
      } else {
        this.setData({ loading: false, error: true });
        this.emit('image:error', this.getImageInfo());
      }
    },

    previewImage() {
      const urls = this.properties.previewUrls || [this.data.computedSrc];
      wx.previewImage({
        current: this.data.computedSrc,
        urls
      });
    },

    onImageLoad(e) {
      const cacheKey = this.properties.cacheKey || this.data.computedSrc;
      this.cacheImage(cacheKey);
      this.setData({ loading: false, error: false, currentRetry: 0 });
      this.emit('image:loaded', this.getImageInfo());
      this.emit('image:load', { id: this.data.imageId, detail: e.detail });
    },

    onImageError() {
      this.handleImageError();
    },

    onImageTap() {
      const imageInfo = this.getImageInfo();

      if (this.properties.previewable) {
        this.previewImage();
      }

      this.emit('image:tap', imageInfo);
      this.triggerEvent('imageTap', imageInfo, {
        bubbles: true,
        composed: true,
      });
    },

    onImageLongpress() {
      this.emit('image:longpress', this.getImageInfo());
    },

    onErrorTap() {
      this.setData({ loading: true, error: false, currentRetry: 0 });
      this.loadImage(this.properties.src);
    },

    checkOverlaySlot() {
      this.createSelectorQuery()
        .select('.tc-image-overlay')
        .boundingClientRect()
        .exec(res => {
          this.setData({ hasOverlay: res[0] !== null });
        });
    },

    cacheImage(key) {
      const cache = wx.getStorageSync('tc-image-cache') || {};
      cache[key] = { timestamp: Date.now() };
      wx.setStorageSync('tc-image-cache', cache);
    },

    emit(event, payload) {
      if (this.eventBus) {
        this.eventBus.emit(`${this.properties.namespace}:${event}`, payload);
      }
    },

    // Public API
    reload() {
      this.setData({ loading: true, error: false, currentRetry: 0 });
      this.loadImage(this.properties.src);
    },

    getImageInfo() {
      return {
        id: this.data.imageId,
        src: this.data.computedSrc,
        loading: this.data.loading,
        error: this.data.error
      };
    }
  }
});
