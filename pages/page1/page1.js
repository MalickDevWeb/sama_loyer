import { Bus } from '../../utils/event/index';

Page({
  data: {
    magasinEstOuvert: false,
    rapport: {
      nom_clee: '',
      heure: '',
      ancienneValeur: '',
      valeur: ''
    }
  },

  onLoad() {
    // On allume la radio au chargement
    Bus.on('Test_bus',()=>{
      console.log('Test_bus reçu');
    });

     this.telecommande= Bus.onState('magasinEstOuvert', (dossier) => {
      let heureLisible = new Date(dossier.timestamp).toLocaleTimeString();
      this.setData({
        magasinEstOuvert: dossier.value,
        rapport: {
          nom_clee: dossier.key,
          heure: heureLisible,
          ancienneValeur: dossier.oldValue,
          valeur: dossier.value
        }
      }, () => {
        console.log(`Bus: Le magasin est maintenant ${dossier.value ? 'ouvert' : 'fermé'} (${heureLisible})`);
        console.log('rapport:', this.data.rapport);
      });
    });
  },

  onUnload() {
    if (this.telecommande) {
      this.telecommande(); // Déconnexion de la télécommande
      console.log('Bus: Déconnexion de la télécommande');
    }
  },

  direBonjour() {
    Bus.emit('Test_bus');
    //console.log('On ma cliquer');
  },
  quitterLaPiece() {
    wx.reLaunch(
      {
      url: '/pages/home/home',
    }
    )
    console.log('Le magasin est maintenant fermé');
  },
  fermerLeMagasin() {
    Bus.setState('magasinEstOuvert', false);
    console.log('Le magasin est maintenant fermé');
  },
  ouvrirLeMagasin() {
    Bus.setState('magasinEstOuvert', true);
    console.log('Le magasin est maintenant ouvert');
  }
  
});