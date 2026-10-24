export const setCustomTabBarActive = (page, activeTab) => {
  const tabBar = page && typeof page.getTabBar === 'function'
    ? page.getTabBar()
    : null;

  if (tabBar) {
    if (typeof tabBar.setActiveTab === 'function') {
      tabBar.setActiveTab(activeTab);
    } else if (typeof tabBar.setData === 'function') {
      tabBar.setData({ activeTab });
    }
    if (typeof tabBar.syncTabs === 'function') {
      tabBar.syncTabs(activeTab);
    }
  }
};
