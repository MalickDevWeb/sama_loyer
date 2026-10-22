export const setCustomTabBarActive = (page, activeTab) => {
  const tabBar = page && typeof page.getTabBar === 'function'
    ? page.getTabBar()
    : null;

  if (tabBar && typeof tabBar.setActiveTab === 'function') {
    tabBar.setActiveTab(activeTab);
  } else if (tabBar && typeof tabBar.setData === 'function') {
    tabBar.setData({ activeTab });
  }
};
