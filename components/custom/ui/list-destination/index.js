// js

Component({
  properties: {
    destinations: {
      type: Array,
      value: []
    },
    loading: {
      type: Boolean,
      value: false
    },
    layout: {
      type: String,
      value: 'scroll'
    },
    columns: {
      type: Number,
      value: 2
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
    cardContainerStyle: {
      type: String,
      value: ''
    },
    imageRadius: {
      type: String,
      value: '44rpx'
    },
    gridItemWidth: {
      type: String,
      value: ''
    },
    showDetailsButton: {
      type: Boolean,
      value: true
    },
    containerClass: {
      type: String,
      value: ''
    }
  },

  data: {
    computedGridItemWidth: '100%',
    skeletonItems: [0, 1, 2, 3]
  },

  observers: {
    'columns, gridItemWidth': function () {
      this.updateGridItemWidth();
    }
  },

  lifetimes: {
    attached() {
      this.updateGridItemWidth();
    }
  },

  methods: {
    updateGridItemWidth() {
      const explicitWidth = this.properties.gridItemWidth;
      const columnsCount = Math.max(1, Number(this.properties.columns) || 1);
      const width = explicitWidth || (columnsCount > 1 ? `${100 / columnsCount}%` : '100%');
      this.setData({ computedGridItemWidth: width });
    },
    handleCardPress(e) {
      this.triggerEvent('onCardPress', e.detail, {
        bubbles: true,
        composed: true,
      });
    },

    handleToggleLike(e) {
      this.triggerEvent('toggleLike', e.detail, {
        bubbles: true,
        composed: true,
      });
    }
  }
});
