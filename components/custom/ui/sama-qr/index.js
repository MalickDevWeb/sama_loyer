// components/custom/ui/sama-qr
// QR code SAMA LOYER : dessiné sur un canvas 2D caché, puis affiché en image
// (un canvas est un calque natif qui ne suit pas toujours le défilement).
// <sama-qr id="qr" text="{{ link }}" size="220" />
// Le parent récupère l'image avec this.selectComponent('#qr').toTempFile()
import { getCanvas, drawQr, exportCanvas } from '../../../../utils/helpers/qr-canvas';

Component({
  properties: {
    text: { type: String, value: '' },
    size: { type: Number, value: 220 }, // côté en px CSS
    color: { type: String, value: '#0F1E3D' }
  },

  data: {
    image: '', // PNG exporté, affiché à la place du canvas
    failed: false
  },

  observers: {
    'text, size, color'() {
      if (this.ready) this.render();
    }
  },

  lifetimes: {
    ready() {
      this.ready = true;
      this.render();
    }
  },

  methods: {
    render() {
      if (!this.data.text) return;
      // Le canvas doit exister pour dessiner : on le remet le temps du rendu
      this.setData({ image: '', failed: false }, () => {
        // 3× : image nette à l'écran comme une fois enregistrée
        getCanvas(this, '#sama-qr-canvas', 3)
          .then(({ canvas, ctx, width }) => {
            drawQr(ctx, this.data.text, 0, 0, width, this.data.color);
            return exportCanvas(canvas);
          })
          .then((image) => this.setData({ image }))
          .catch(() => this.setData({ failed: true }));
      });
    },

    /** Image PNG du QR code (à enregistrer ou partager) */
    toTempFile() {
      return this.data.image ? Promise.resolve(this.data.image) : Promise.reject(new Error('QR_NOT_READY'));
    }
  }
});
