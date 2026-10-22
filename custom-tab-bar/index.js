Component({
  data: {
    activeTab: 'home',
    hidden: false,
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

    setVisible(visible) {
      this.setData({ hidden: !visible });
    },
  },
});
