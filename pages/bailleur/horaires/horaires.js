const HOMES = ['Chambre salon · Icotaf', 'Studio · Pikine Rue 10', 'Chambre · Pikine Est'];
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const HOURS = ['9 h', '10 h', '11 h', '12 h', '16 h', '17 h', '18 h', '19 h'];

// Semaine type de départ (index du jour -> heures)
const START = { 0: ['18 h'], 2: ['17 h', '18 h'], 4: ['17 h', '18 h'], 5: ['10 h', '12 h', '16 h'], 6: ['11 h'] };
const OPEN = { 0: true, 2: true, 4: true, 5: true, 6: true };
const EXTRA_BLOCKS = ['Mardi 3 novembre', 'Samedi 7 novembre', 'Mardi 10 novembre', 'Samedi 14 novembre'];

Page({
  data: {
    statusBarHeight: 20,
    homes: HOMES,
    home: 0,
    week: [],
    totalText: '',
    blocks: ['Dimanche 1er novembre'],
    remote: true,
    saved: false
  },

  onLoad() {
    try {
      const sys = wx.getSystemInfoSync();
      this.setData({ statusBarHeight: sys.statusBarHeight || 20 });
    } catch (e) {}

    this.hours = {};
    this.open = { ...OPEN };
    DAYS.forEach((d, i) => { this.hours[i] = (START[i] || []).slice(); });
    this.refresh();
  },

  refresh(patch = {}) {
    const week = DAYS.map((name, i) => ({
      name,
      open: !!this.open[i],
      hours: HOURS.map((h) => ({ label: h, on: this.hours[i].indexOf(h) >= 0 }))
    }));
    const total = DAYS.reduce((sum, d, i) => sum + (this.open[i] ? this.hours[i].length : 0), 0);
    this.setData({ week, totalText: `${total} créneaux par semaine`, ...patch });
  },

  onBack() {
    wx.navigateBack({ fail: () => wx.reLaunch({ url: '/pages/bailleur/demandes/demandes' }) });
  },

  onPickHome(e) {
    this.setData({ home: Number(e.currentTarget.dataset.index) });
  },

  onToggleDay(e) {
    const i = Number(e.currentTarget.dataset.index);
    this.open[i] = !this.open[i];
    this.refresh({ saved: false });
  },

  onToggleHour(e) {
    const { day, hour } = e.currentTarget.dataset;
    const list = this.hours[day];
    const k = list.indexOf(hour);
    if (k >= 0) list.splice(k, 1);
    else list.push(hour);
    this.refresh({ saved: false });
  },

  onAddBlock() {
    const next = EXTRA_BLOCKS.find((b) => this.data.blocks.indexOf(b) < 0);
    if (!next) {
      wx.showToast({ title: 'Assez de jours bloqués pour la démo', icon: 'none' });
      return;
    }
    this.setData({ blocks: [...this.data.blocks, next], saved: false });
  },

  onRemoveBlock(e) {
    const i = Number(e.currentTarget.dataset.index);
    const blocks = this.data.blocks.slice();
    blocks.splice(i, 1);
    this.setData({ blocks, saved: false });
  },

  onToggleRemote() {
    this.setData({ remote: !this.data.remote, saved: false });
  },

  onSave() {
    this.setData({ saved: true });
  }
});
