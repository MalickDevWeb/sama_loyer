import { copyToClipboard } from "../../utils/helpers/whatsappBridge.js";

Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    title: {
      type: String,
      value: "Support Client"
    },
    qrImage: {
      type: String,
      value: ""
    },
    whatsappUrl: {
      type: String,
      value: ""
    },
    hintText: {
      type: String,
      value: "Maintenez le doigt sur le code pour ouvrir WhatsApp"
    }
  },

  methods: {
    preventClose() {
      // Interrompt la propagation du clic pour ne pas fermer la modale
    },

    handleClose() {
      this.triggerEvent("close");
    },

    handleOverlayTap() {
      this.triggerEvent("close");
    },

    async handleCopyLink() {
      const url = this.data.whatsappUrl;
      if (!url) return;
      await copyToClipboard(url, "Lien copié !");
    }
  }
});
