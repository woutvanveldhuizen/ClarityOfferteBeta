const VERSION = 'v3.0dev2';

const DEFAULT_STATE = {
  settings: {
    lang: 'de',
    theme: 'dark',
    vatRate: 19,
    companyName: 'Clarity Entrümpelung',
    companyOwner: 'Rafal Maciocha',
    companyAddress: 'Neuweg 49\n55130 Mainz',
    companyPhone: '+49 172 5168515',
    companyEmail: 'info@clarityentrumpelung.de',
    companyWeb: 'www.clarityentrumpelung.de',
    bankIban: 'DE05 5519 0000 0130 8270 25',
    bankBic: 'MVBMDE55',
    bankName: 'Volksbank Darmstadt Mainz eG',
    nextOffer: 1,
    nextInvoice: 1
  },
  current: {
    type: 'offer',
    number: '',
    date: new Date().toISOString().slice(0, 10),
    customer: {
      name: 'Silke Bernadi',
      email: '',
      phone: '',
      street: 'Engasse 2a',
      city: '55296 Harxheim'
    },
    lines: [
      { id: 'line-1', description: '', price: '' }
    ]
  },
  customers: [
    {
      id: 'silke-bernadi',
      name: 'Silke Bernadi',
      email: '',
      phone: '',
      street: 'Engasse 2a',
      city: '55296 Harxheim'
    }
  ],
  documents: []
};

const Store = {
  key: 'clarity.v3',

  clone(value) {
    return typeof structuredClone === 'function'
      ? structuredClone(value)
      : JSON.parse(JSON.stringify(value));
  },

  load() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.key) || '{}');
      const base = this.clone(DEFAULT_STATE);

      return {
        ...base,
        ...saved,
        settings: { ...base.settings, ...(saved.settings || {}) },
        current: {
          ...base.current,
          ...(saved.current || {}),
          customer: { ...base.current.customer, ...((saved.current || {}).customer || {}) },
          lines: Array.isArray((saved.current || {}).lines) && saved.current.lines.length
            ? saved.current.lines
            : base.current.lines
        },
        customers: Array.isArray(saved.customers) ? saved.customers : base.customers,
        documents: Array.isArray(saved.documents) ? saved.documents : base.documents
      };
    } catch (error) {
      console.warn('Kon opslag niet laden:', error);
      return this.clone(DEFAULT_STATE);
    }
  },

  save(state) {
    localStorage.setItem(this.key, JSON.stringify(state));
  },

  export(state) {
    return JSON.stringify({ version: VERSION, exportedAt: new Date().toISOString(), state }, null, 2);
  },

  import(json) {
    const parsed = JSON.parse(json);
    return parsed.state || parsed;
  }
};
