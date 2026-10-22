export function waitForAppInit(app) {
  const initPromise = app && app.globalData && app.globalData.initPromise;

  return initPromise && typeof initPromise.then === 'function'
    ? initPromise
    : Promise.resolve();
}
