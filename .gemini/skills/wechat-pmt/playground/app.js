import { Outbox } from './utils/offline/outbox';

App({
  onLaunch() {
    console.log('[Playground] Lancement du Showcase Sonatel Max It / WeChat PMT...');

    // Initialisation de la synchronisation automatique hors-ligne
    Outbox.initAutoSync();

    // Handler de démonstration pour l'Outbox
    Outbox.registerHandler('DEMO_FEEDBACK', async (payload, id) => {
      console.log(`[Playground] Synchronisation réussie pour l'action ${id} :`, payload);
      return Promise.resolve({ success: true });
    });
  }
});

