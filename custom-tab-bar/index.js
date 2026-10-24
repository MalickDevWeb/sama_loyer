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
      const child = this.selectComponent('#app-tab-bar');
      if (child && typeof child.syncTabs === 'function') {
        child.syncTabs(activeTab);
      }
    },

    syncTabs() {
      const child = this.selectComponent('#app-tab-bar');
      if (child && typeof child.syncTabs === 'function') {
        child.syncTabs(this.data.activeTab);
      }
    },

    setVisible(visible) {
      this.setData({ hidden: !visible });
    },
  },
});
