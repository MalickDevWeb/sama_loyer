Component({
  options: {
    virtualHost: true,
  },
  properties: {
    loading: {
      type: Boolean,
      value: true,
    },
    count: {
      type: Number,
      value: 1,
    },
  },
});
