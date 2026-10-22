// js
Component({
  properties: {
    destination: {
      type: Object,
      value: {
        image: '',
        title: 'bakary',
        subtitle: '',
        price: '',
        buttonLabel: '',
        buttonClass: 'btn-details',
        loading: false,
      },
    },
    cardWidth: {
      type: String,
      value: '480rpx'
    },
    imageHeight: {
      type: String,
      value: '285rpx'
    },
    cardPaddingClass: {
      type: String,
      value: 'p-3'
    },
    cardStyle: {
      type: String,
      value: ''
    },
    cardPaddingStyle: {
      type: String,
      value: ''
    },
    cardContainerStyle: {
      type: String,
      value: ''
    },
    imageRadius: {
      type: String,
      value: '44rpx'
    },
    showDetailsButton: {
      type: Boolean,
      value: true
    }
  },
  data: {
    isLiked: false,
    resolvedCardStyle: ''
  },
  observers: {
    destination(destination) {
      this.setData({
        isLiked: Boolean(destination && destination.like),
      });
    },

    'cardPaddingClass, cardStyle, cardPaddingStyle': function (cardPaddingClass, cardStyle, cardPaddingStyle) {
      this.setData({
        resolvedCardStyle: this.buildCardStyle(cardPaddingClass, cardStyle, cardPaddingStyle),
      });
    }
  },
  lifetimes: {
    attached() {
      this.setData({
        resolvedCardStyle: this.buildCardStyle(
          this.properties.cardPaddingClass,
          this.properties.cardStyle,
          this.properties.cardPaddingStyle
        ),
      });
    },
  },
  methods: {
    buildCardStyle(cardPaddingClass, cardStyle, cardPaddingStyle) {
      const baseStyle = this.normalizeStyle(cardStyle);
      const explicitPadding = this.normalizeStyle(cardPaddingStyle);
      const mappedPadding = this.styleHasPadding(baseStyle)
        ? ''
        : this.getPaddingStyle(cardPaddingClass);

      return [mappedPadding, baseStyle, explicitPadding]
        .filter(Boolean)
        .map((style) => (style.endsWith(';') ? style : `${style};`))
        .join(' ');
    },

    normalizeStyle(style) {
      return typeof style === 'string' ? style.trim() : '';
    },

    styleHasPadding(style) {
      return /(^|;)\s*padding(?:-[a-z]+)?\s*:/i.test(style || '');
    },

    getPaddingStyle(cardPaddingClass) {
      const paddingMap = {
        'p-0': 'padding: 0 !important',
        'p-1': 'padding: 16rpx !important',
        'p-2': 'padding: 24rpx !important',
        'p-3': 'padding: 32rpx !important',
        'p-4': 'padding: 48rpx !important',
        'p-5': 'padding: 64rpx !important',
        'card-padding': 'padding: 24rpx 24rpx 32rpx 24rpx !important',
      };

      const tokens = String(cardPaddingClass || '').split(/\s+/);
      return tokens.reduce((style, token) => paddingMap[token] || style, '');
    },

    emitCardPress() {
      this.triggerEvent('onCardPress', {
        destination: this.properties.destination,
      }, {
        bubbles: true,
        composed: true,
      });
    },

    handleCardTap() {
      this.emitCardPress();
    },

    handleLikeTap() {
      const nextLiked = !this.data.isLiked;
      this.setData({
        isLiked: nextLiked,
      });

      this.triggerEvent('toggleLike', {
        destination: this.properties.destination,
        like: nextLiked,
      }, {
        bubbles: true,
        composed: true,
      });
    },

    handleSubmit() {
      this.emitCardPress();
    },
  },
});
