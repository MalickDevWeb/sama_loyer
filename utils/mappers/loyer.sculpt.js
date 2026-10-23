// ============================================================================
// SCULPT SCHEMA — LOYERS & TRANCHES DE PAIEMENT
// ============================================================================

export const LoyerSchema = {
  id: '@link.id',
  homeId: '@link.homeId',
  homeName: '@link.homeName',
  homeAddress: '@link.homeAddress',
  owner: '@link.owner',
  ownerPhone: '@link.ownerPhone',
  month: '@link.month',
  dueText: '@link.dueText',
  amount: '@link.amount',
  amountFormatted: (data) => {
    const a = data.amount || data.montant || 0;
    return String(a).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' F';
  },
  paidAmount: '@link.paidAmount',
  status: '@link.status', // 'paid' | 'pending' | 'late'
  statusLabel: (data) => {
    if (data.status === 'paid') return 'Payé';
    if (data.status === 'late') return 'En retard';
    return 'En attente';
  },
  paidAt: '@link.paidAt',
  tranches: (data) => Array.isArray(data.tranches) ? data.tranches : [],
  receiptNumber: '@link.receiptNumber',
  pdfUrl: '@link.pdfUrl',
};

