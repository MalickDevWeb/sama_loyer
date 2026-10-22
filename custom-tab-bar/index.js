Component({
  data: {
    activeTab: 'home',
  },

  methods: {
    handleChange(event) {
      const { tab } = event.detail || {};

      if (tab) {
        this.setActiveTab(tab);
      }
    },

    setActiveTab(activeTab) {
      this.setData({ activeTab });
    },
  },
});
