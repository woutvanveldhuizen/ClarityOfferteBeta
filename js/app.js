let state = Store.load();

const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char]));
}

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
}

function persist() {
  Store.save(state);
}

function normalizeLine(line = {}) {
  const description = line.descriptionRaw ?? line.description ?? '';

  return {
    id: line.id || uid(),
    descriptionRaw: description,
    sourceLang: line.sourceLang || state.settings.lang || 'de',
    description,
    price: line.price ?? '',
    saved: Boolean(line.saved)
  };
}

function ensureDocumentDefaults() {
  state.current = state.current || {};
  state.current.type = state.current.type || 'offer';

  if (!state.current.number) {
    state.current.number = makeNumber(state.current.type);
  }

  if (!state.current.date) {
    state.current.date = new Date().toISOString().slice(0, 10);
  }

  state.current.customer = {
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    ...(state.current.customer || {})
  };

  state.current.lines = Array.isArray(state.current.lines)
    ? state.current.lines.map(normalizeLine)
    : [];

  if (!state.current.lines.length) {
    state.current.lines.push(normalizeLine());
  }
}

function getValidLines() {
  return (state.current.lines || [])
    .map(normalizeLine)
    .filter(line => String(line.descriptionRaw || line.description || '').trim() || Number(line.price));
}

function getSubtotal() {
  return getValidLines().reduce((sum, line) => sum + (Number(line.price) || 0), 0);
}

function makeNumber(type) {
  const year = new Date().getFullYear();
  const key = type === 'invoice' ? 'nextInvoice' : 'nextOffer';
  const prefix = type === 'invoice' ? 'RE' : 'AN';
  return `${prefix}-${year}-${String(state.settings[key] || 1).padStart(4, '0')}`;
}

const LINE_DICTIONARY = {
  nl: {
    de: [
      ['vrijstaande garage', 'freistehende Garage'],
      ['losse garage', 'freistehende Garage'],
      ['garage', 'Garage'],
      ['keuken', 'Küche'],
      ['badkamer', 'Bad'],
      ['woonkamer', 'Wohnzimmer'],
      ['slaapkamer', 'Schlafzimmer'],
      ['kast', 'Schrank'],
      ['kasten', 'Schränke'],
      ['tafel', 'Tisch'],
      ['stoel', 'Stuhl'],
      ['stoelen', 'Stühle'],
      ['bank', 'Sofa'],
      ['bed', 'Bett'],
      ['matras', 'Matratze'],
      ['inhoud', 'Inhalt'],
      ['afvoeren', 'Entsorgung'],
      ['demonteren', 'Demontage'],
      ['ontruiming', 'Entrümpelung']
    ],
    pl: [
      ['vrijstaande garage', 'garaż wolnostojący'],
      ['losse garage', 'garaż wolnostojący'],
      ['garage', 'garaż'],
      ['keuken', 'kuchnia'],
      ['badkamer', 'łazienka'],
      ['woonkamer', 'salon'],
      ['slaapkamer', 'sypialnia'],
      ['kast', 'szafa'],
      ['kasten', 'szafy'],
      ['tafel', 'stół'],
      ['stoel', 'krzesło'],
      ['stoelen', 'krzesła'],
      ['bank', 'sofa'],
      ['bed', 'łóżko'],
      ['matras', 'materac'],
      ['inhoud', 'zawartość'],
      ['afvoeren', 'utylizacja'],
      ['demonteren', 'demontaż'],
      ['ontruiming', 'opróżnienie']
    ]
  },
  de: {
    nl: [
      ['freistehende Garage', 'vrijstaande garage'],
      ['Garage', 'garage'],
      ['Küche', 'keuken'],
      ['Bad', 'badkamer'],
      ['Wohnzimmer', 'woonkamer'],
      ['Schlafzimmer', 'slaapkamer'],
      ['Schränke', 'kasten'],
      ['Schrank', 'kast'],
      ['Tisch', 'tafel'],
      ['Stühle', 'stoelen'],
      ['Stuhl', 'stoel'],
      ['Sofa', 'bank'],
      ['Bett', 'bed'],
      ['Matratze', 'matras'],
      ['Inhalt', 'inhoud'],
      ['Entsorgung', 'afvoeren'],
      ['Demontage', 'demonteren'],
      ['Entrümpelung', 'ontruiming']
    ],
    pl: [
      ['freistehende Garage', 'garaż wolnostojący'],
      ['Garage', 'garaż'],
      ['Küche', 'kuchnia'],
      ['Bad', 'łazienka'],
      ['Wohnzimmer', 'salon'],
      ['Schlafzimmer', 'sypialnia'],
      ['Schränke', 'szafy'],
      ['Schrank', 'szafa'],
      ['Tisch', 'stół'],
      ['Stühle', 'krzesła'],
      ['Stuhl', 'krzesło'],
      ['Sofa', 'sofa'],
      ['Bett', 'łóżko'],
      ['Matratze', 'materac'],
      ['Inhalt', 'zawartość'],
      ['Entsorgung', 'utylizacja'],
      ['Demontage', 'demontaż'],
      ['Entrümpelung', 'opróżnienie']
    ]
  },
  pl: {
    de: [],
    nl: []
  }
};

function replaceCaseInsensitive(text, from, to) {
  return text.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), match => {
    if (match === match.toUpperCase()) return to.toUpperCase();
    if (match[0] === match[0].toUpperCase()) return to.charAt(0).toUpperCase() + to.slice(1);
    return to;
  });
}

function translateManualDescription(line) {
  const source = line.sourceLang || state.settings.lang || 'de';
  const target = state.settings.lang || 'de';
  let text = String(line.descriptionRaw ?? line.description ?? '');

  if (!text || source === target) return text;

  const mappings = LINE_DICTIONARY[source]?.[target] || [];
  mappings.forEach(([from, to]) => {
    text = replaceCaseInsensitive(text, from, to);
  });

  return text;
}

function applyI18n() {
  document.documentElement.lang = state.settings.lang || 'de';

  $$('[data-i18n]').forEach(element => {
    element.textContent = t(element.dataset.i18n);
  });

  $('#appSubtitle').textContent = state.settings.lang === 'de'
    ? 'Angebote & Rechnungen'
    : state.settings.lang === 'pl'
      ? 'Oferty i faktury'
      : 'Offertes & facturen';

  $('#vatLabel').textContent = `${t('vat')} ${state.settings.vatRate || 0}%`;
  $('#language').value = state.settings.lang || 'de';
  $('#theme').value = state.settings.theme || 'dark';

  renderTypeButtons();
  renderCustomerSelect();
  renderLines();
  renderTotals();
  renderCustomers();
}

function renderTypeButtons() {
  const type = state.current.type || 'offer';
  $$('.segmented button').forEach(button => {
    button.classList.toggle('active', button.dataset.type === type);
  });
}

function renderDocumentFields() {
  $('#documentNumber').value = state.current.number || '';
  $('#documentDate').value = state.current.date || new Date().toISOString().slice(0, 10);

  const c = state.current.customer || {};
  $('#customerName').value = c.name || '';
  $('#customerEmail').value = c.email || '';
  $('#customerPhone').value = c.phone || '';
  $('#customerStreet').value = c.street || '';
  $('#customerCity').value = c.city || '';
}

function renderCustomerSelect() {
  const select = $('#customerSelect');
  const customerId = state.current.customer?.id || '';
  const currentName = state.current.customer?.name || '';

  select.innerHTML = `
    <option value="">${escapeHtml(t('manualCustomer'))}</option>
    ${(state.customers || []).map(customer => `
      <option value="${escapeHtml(customer.id)}">${escapeHtml(customer.name || '')}</option>
    `).join('')}
  `;

  const match = (state.customers || []).find(customer => customer.id === customerId || customer.name === currentName);
  select.value = match?.id || '';
}

function createLineElement(line, index) {
  const normalized = normalizeLine(line);
  state.current.lines[index] = normalized;

  const template = $('#lineTemplate').content.firstElementChild.cloneNode(true);
  template.dataset.id = normalized.id;

  const description = template.querySelector('.lineDesc');
  const price = template.querySelector('.linePrice');
  const remove = template.querySelector('.removeLine');
  const confirm = template.querySelector('.confirmLine');

  template.querySelectorAll('[data-i18n]').forEach(element => {
    element.textContent = t(element.dataset.i18n);
  });

  description.value = translateManualDescription(normalized);
  price.value = normalized.price ?? '';
  template.classList.toggle('savedLine', Boolean(normalized.saved));

  description.addEventListener('input', event => {
    state.current.lines[index].descriptionRaw = event.target.value;
    state.current.lines[index].description = event.target.value;
    state.current.lines[index].sourceLang = state.settings.lang || 'de';
    state.current.lines[index].saved = false;
    persist();
  });

  price.addEventListener('input', event => {
    state.current.lines[index].price = event.target.value;
    state.current.lines[index].saved = false;
    persist();
    renderTotals();
  });

  confirm.addEventListener('click', () => {
    const current = state.current.lines[index];
    if (!String(current.descriptionRaw || '').trim() && !Number(current.price)) return;

    current.saved = true;

    const next = state.current.lines[index + 1];
    const nextEmpty = next && !String(next.descriptionRaw || next.description || '').trim() && !Number(next.price);

    if (!nextEmpty) {
      state.current.lines.splice(index + 1, 0, normalizeLine());
    }

    persist();
    renderLines();
    $$('.lineDesc')[index + 1]?.focus();
  });

  remove.addEventListener('click', () => {
    state.current.lines.splice(index, 1);
    if (!state.current.lines.length) {
      state.current.lines.push(normalizeLine());
    }
    persist();
    renderLines();
    renderTotals();
  });

  return template;
}

function renderLines() {
  const list = $('#lineList');
  list.innerHTML = '';

  state.current.lines.forEach((line, index) => {
    list.appendChild(createLineElement(line, index));
  });
}

function renderTotals() {
  const subtotal = getSubtotal();
  const vat = subtotal * ((Number(state.settings.vatRate) || 0) / 100);
  const total = subtotal + vat;

  $('#subtotal').textContent = fmtMoney(subtotal);
  $('#vat').textContent = fmtMoney(vat);
  $('#total').textContent = fmtMoney(total);
  $('#vatLabel').textContent = `${t('vat')} ${state.settings.vatRate || 0}%`;
}

function getCustomerFromInputs() {
  return {
    id: $('#customerSelect').value || state.current.customer?.id || '',
    name: $('#customerName').value.trim(),
    email: $('#customerEmail').value.trim(),
    phone: $('#customerPhone').value.trim(),
    street: $('#customerStreet').value.trim(),
    city: $('#customerCity').value.trim()
  };
}

function syncDocumentInputs() {
  state.current.number = $('#documentNumber').value.trim();
  state.current.date = $('#documentDate').value || new Date().toISOString().slice(0, 10);
  state.current.customer = getCustomerFromInputs();
  persist();
}

function saveCurrentDocument(showMessage = true) {
  syncDocumentInputs();
  const subtotal = getSubtotal();
  const vat = subtotal * ((Number(state.settings.vatRate) || 0) / 100);
  const total = subtotal + vat;

  const document = {
    id: state.current.id || uid(),
    type: state.current.type,
    number: state.current.number || makeNumber(state.current.type),
    date: state.current.date,
    customer: { ...(state.current.customer || {}) },
    lines: getValidLines().map(line => ({ ...line, description: translateManualDescription(line) })),
    subtotal,
    vat,
    total,
    savedAt: new Date().toISOString()
  };

  document.pdfHtml = buildPrintHtml(document);

  const index = state.documents.findIndex(existing => existing.id === document.id);

  if (index >= 0) {
    state.documents[index] = document;
  } else {
    state.documents.unshift(document);
  }

  state.current.id = document.id;
  state.current.number = document.number;

  persist();
  renderCustomers();

  if (showMessage) {
    alert(t('saved'));
  }

  return document;
}

function resetDocument() {
  if (!confirm(t('confirmReset'))) return;

  const type = state.current.type || 'offer';
  state.current = {
    type,
    number: makeNumber(type),
    date: new Date().toISOString().slice(0, 10),
    customer: { name: '', email: '', phone: '', street: '', city: '' },
    lines: [normalizeLine()]
  };

  persist();
  renderDocumentFields();
  renderCustomerSelect();
  renderLines();
  renderTotals();
}

function renderCustomers() {
  const list = $('#customerList');

  if (!state.customers.length) {
    list.innerHTML = `<p class="muted">${escapeHtml(t('noCustomers'))}</p>`;
    $('#customerFolder')?.classList.add('hidden');
    return;
  }

  list.innerHTML = state.customers.map(customer => `
    <article class="customerItem" data-id="${escapeHtml(customer.id)}">
      <div>
        <b>${escapeHtml(customer.name || '')}</b>
        <small>${escapeHtml([customer.street, customer.city, customer.phone, customer.email].filter(Boolean).join(' · '))}</small>
      </div>
      <span class="folderHint">›</span>
    </article>
  `).join('');

  list.querySelectorAll('.customerItem').forEach(item => {
    item.addEventListener('click', () => openCustomerFolder(item.dataset.id));
  });
}

function clearCustomerForm() {
  $('#customerEditId').value = '';
  $('#editCustomerName').value = '';
  $('#editCustomerEmail').value = '';
  $('#editCustomerPhone').value = '';
  $('#editCustomerStreet').value = '';
  $('#editCustomerCity').value = '';
  $('#deleteCustomer').classList.add('hidden');
}

function openCustomerForm(id = '') {
  clearCustomerForm();

  if (id) {
    const customer = state.customers.find(item => item.id === id);
    if (customer) {
      $('#customerEditId').value = customer.id;
      $('#editCustomerName').value = customer.name || '';
      $('#editCustomerEmail').value = customer.email || '';
      $('#editCustomerPhone').value = customer.phone || '';
      $('#editCustomerStreet').value = customer.street || '';
      $('#editCustomerCity').value = customer.city || '';
      $('#deleteCustomer').classList.remove('hidden');
    }
  }

  $('#customerForm').classList.remove('hidden');
  $('#editCustomerName').focus();
}

function saveCustomer() {
  const id = $('#customerEditId').value || uid();
  const customer = {
    id,
    name: $('#editCustomerName').value.trim(),
    email: $('#editCustomerEmail').value.trim(),
    phone: $('#editCustomerPhone').value.trim(),
    street: $('#editCustomerStreet').value.trim(),
    city: $('#editCustomerCity').value.trim()
  };

  if (!customer.name) return;

  const index = state.customers.findIndex(item => item.id === id);

  if (index >= 0) {
    state.customers[index] = customer;
  } else {
    state.customers.push(customer);
  }

  persist();
  $('#customerForm').classList.add('hidden');
  renderCustomers();
  renderCustomerSelect();
  openCustomerFolder(id);
}

function deleteCustomer() {
  const id = $('#customerEditId').value;
  if (!id || !confirm(t('confirmDelete'))) return;

  state.customers = state.customers.filter(customer => customer.id !== id);
  persist();
  $('#customerForm').classList.add('hidden');
  $('#customerFolder').classList.add('hidden');
  renderCustomers();
  renderCustomerSelect();
}

function documentsForCustomer(customer) {
  return (state.documents || []).filter(document => {
    const c = document.customer || {};
    return c.id === customer.id || (c.name && c.name === customer.name);
  });
}

function renderDocumentMini(document) {
  return `
    <article class="folderDocument">
      <div>
        <b>${escapeHtml(document.number || '')}</b>
        <small>${escapeHtml([fmtDate(document.date), fmtMoney(document.total)].join(' · '))}</small>
      </div>
      <div class="folderDocActions">
        <button class="smallButton" data-open-pdf="${escapeHtml(document.id)}">PDF</button>
        <button class="smallButton" data-edit-doc="${escapeHtml(document.id)}">${escapeHtml(t('edit'))}</button>
      </div>
    </article>
  `;
}

function openCustomerFolder(id) {
  const customer = state.customers.find(item => item.id === id);
  if (!customer) return;

  $('#customerFolder').dataset.id = customer.id;
  $('#folderCustomerName').textContent = customer.name || t('customer');
  $('#folderCustomerMeta').textContent = [customer.street, customer.city, customer.phone, customer.email].filter(Boolean).join(' · ');

  const docs = documentsForCustomer(customer);
  const offers = docs.filter(document => document.type !== 'invoice');
  const invoices = docs.filter(document => document.type === 'invoice');

  $('#folderOffers').innerHTML = offers.length
    ? offers.map(renderDocumentMini).join('')
    : `<p class="muted">${escapeHtml(t('noDocuments'))}</p>`;

  $('#folderInvoices').innerHTML = invoices.length
    ? invoices.map(renderDocumentMini).join('')
    : `<p class="muted">${escapeHtml(t('noDocuments'))}</p>`;

  $('#customerFolder').classList.remove('hidden');

  $('#customerFolder').querySelectorAll('[data-edit-doc]').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      loadDocument(button.dataset.editDoc);
    });
  });

  $('#customerFolder').querySelectorAll('[data-open-pdf]').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      openStoredPdf(button.dataset.openPdf);
    });
  });
}

function loadDocument(id) {
  const document = state.documents.find(item => item.id === id);
  if (!document) return;

  state.current = Store.clone(document);
  state.current.lines = document.lines.length
    ? document.lines.map(normalizeLine)
    : [normalizeLine()];

  persist();
  goToPage('document');
  renderTypeButtons();
  renderDocumentFields();
  renderCustomerSelect();
  renderLines();
  renderTotals();
}

function openStoredPdf(id) {
  const storedDocument = state.documents.find(item => item.id === id);
  if (!storedDocument) return;

  let root = document.getElementById('printRoot');

  if (!root) {
    root = document.createElement('div');
    root.id = 'printRoot';
    document.body.appendChild(root);
  }

  root.innerHTML = storedDocument.pdfHtml || buildPrintHtml(storedDocument);
  window.setTimeout(() => window.print(), 80);
}

function fillSettings() {
  const s = state.settings;
  [
    'language', 'theme', 'companyName', 'companyOwner', 'companyPhone',
    'companyEmail', 'companyWeb', 'companyAddress', 'vatRate',
    'bankIban', 'bankBic', 'bankName'
  ].forEach(id => {
    const element = $('#' + id);
    if (!element) return;
    const key = id === 'language' ? 'lang' : id;
    element.value = s[key] ?? '';
  });
}

function bindSettings() {
  $('#language').addEventListener('change', event => {
    state.settings.lang = event.target.value;
    persist();
    applyI18n();
  });

  $('#theme').addEventListener('change', event => {
    state.settings.theme = event.target.value;
    document.body.classList.toggle('light', state.settings.theme === 'light');
    persist();
  });

  [
    'companyName', 'companyOwner', 'companyPhone', 'companyEmail',
    'companyWeb', 'companyAddress', 'vatRate', 'bankIban', 'bankBic', 'bankName'
  ].forEach(id => {
    $('#' + id).addEventListener('input', event => {
      state.settings[id] = event.target.value;
      persist();
      if (id === 'vatRate') renderTotals();
    });
  });
}

function goToPage(pageId) {
  $$('.tabs button').forEach(button => button.classList.toggle('active', button.dataset.page === pageId));
  $$('.page').forEach(page => page.classList.toggle('active', page.id === pageId));
}

function bindNavigation() {
  $$('.tabs button').forEach(button => {
    button.addEventListener('click', () => goToPage(button.dataset.page));
  });
}

function bindDocument() {
  $$('.segmented button').forEach(button => {
    button.addEventListener('click', () => {
      const previous = state.current.type;
      state.current.type = button.dataset.type;

      if (!state.current.number || state.current.number === makeNumber(previous)) {
        state.current.number = makeNumber(state.current.type);
      }

      persist();
      renderTypeButtons();
      renderDocumentFields();
    });
  });

  $('#documentNumber').addEventListener('input', syncDocumentInputs);
  $('#documentDate').addEventListener('input', syncDocumentInputs);

  ['customerName', 'customerEmail', 'customerPhone', 'customerStreet', 'customerCity'].forEach(id => {
    $('#' + id).addEventListener('input', syncDocumentInputs);
  });

  $('#customerSelect').addEventListener('change', event => {
    const customer = state.customers.find(item => item.id === event.target.value);
    if (!customer) return;
    state.current.customer = { ...customer };
    persist();
    renderDocumentFields();
  });

  $('#resetDocument').addEventListener('click', resetDocument);
  $('#saveDocument').addEventListener('click', () => saveCurrentDocument(true));
  $('#exportPdf').addEventListener('click', exportPdf);
}

function exportBackup() {
  const blob = new Blob([Store.export(state)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `clarity-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function importBackup(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      state = Store.import(reader.result);
      persist();
      location.reload();
    } catch (error) {
      alert(t('importFailed'));
    }
  };
  reader.readAsText(file);
}

function bind() {
  window.setTimeout(() => $('#splash')?.classList.add('hide'), 1200);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(console.warn);
  }

  bindNavigation();
  bindDocument();
  bindSettings();

  $('#newCustomer').addEventListener('click', () => openCustomerForm());
  $('#saveCustomer').addEventListener('click', saveCustomer);
  $('#cancelCustomer').addEventListener('click', () => $('#customerForm').classList.add('hidden'));
  $('#deleteCustomer').addEventListener('click', deleteCustomer);
  $('#editFolderCustomer').addEventListener('click', () => openCustomerForm($('#customerFolder').dataset.id));
  $('#exportJson').addEventListener('click', exportBackup);
  $('#importJson').addEventListener('change', event => importBackup(event.target.files[0]));
}

function init() {
  ensureDocumentDefaults();
  document.body.classList.toggle('light', state.settings.theme === 'light');
  bind();
  fillSettings();
  renderDocumentFields();
  applyI18n();
  persist();
}

init();
