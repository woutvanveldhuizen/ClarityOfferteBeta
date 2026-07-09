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

function getValidLines() {
  return (state.current.lines || [])
    .filter(line => String(line.description || '').trim() || Number(line.price));
}

function getSubtotal() {
  return getValidLines().reduce((sum, line) => sum + (Number(line.price) || 0), 0);
}

function makeNumber(type) {
  const year = new Date().getFullYear();
  const key = type === 'invoice' ? 'nextInvoice' : 'nextOffer';
  const prefix = type === 'invoice' ? 'RE' : 'AN';
  const number = `${prefix}-${year}-${String(state.settings[key] || 1).padStart(4, '0')}`;
  return number;
}

function ensureDocumentDefaults() {
  if (!state.current.number) {
    state.current.number = makeNumber(state.current.type || 'offer');
  }

  if (!state.current.date) {
    state.current.date = new Date().toISOString().slice(0, 10);
  }

  if (!Array.isArray(state.current.lines) || !state.current.lines.length) {
    state.current.lines = [{ id: uid(), description: '', price: '' }];
  }
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
  renderArchive();
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
  const currentName = state.current.customer?.name || '';

  select.innerHTML = `
    <option value="">${escapeHtml(t('manualCustomer'))}</option>
    ${(state.customers || []).map(customer => `
      <option value="${escapeHtml(customer.id)}">${escapeHtml(customer.name || '')}</option>
    `).join('')}
  `;

  const match = (state.customers || []).find(customer => customer.name === currentName);
  select.value = match?.id || '';
}

function createLineElement(line, index) {
  const template = $('#lineTemplate').content.firstElementChild.cloneNode(true);
  template.dataset.id = line.id;

  const description = template.querySelector('.lineDesc');
  const price = template.querySelector('.linePrice');
  const remove = template.querySelector('.removeLine');

  template.querySelectorAll('[data-i18n]').forEach(element => {
    element.textContent = t(element.dataset.i18n);
  });

  description.value = line.description || '';
  price.value = line.price ?? '';

  description.addEventListener('input', event => {
    state.current.lines[index].description = event.target.value;
    persist();
  });

  price.addEventListener('input', event => {
    state.current.lines[index].price = event.target.value;
    persist();
    renderTotals();
  });

  remove.addEventListener('click', () => {
    state.current.lines.splice(index, 1);
    if (!state.current.lines.length) {
      state.current.lines.push({ id: uid(), description: '', price: '' });
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

function addLine() {
  state.current.lines.push({ id: uid(), description: '', price: '' });
  persist();
  renderLines();
  const inputs = $$('.lineDesc');
  inputs[inputs.length - 1]?.focus();
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
    lines: getValidLines().map(line => ({ ...line })),
    subtotal,
    vat,
    total,
    savedAt: new Date().toISOString()
  };

  const index = state.documents.findIndex(existing => existing.id === document.id);

  if (index >= 0) {
    state.documents[index] = document;
  } else {
    state.documents.unshift(document);
  }

  state.current.id = document.id;
  state.current.number = document.number;

  persist();
  renderArchive();

  if (showMessage) {
    alert(t('saved'));
  }
}

function resetDocument() {
  if (!confirm(t('confirmReset'))) return;

  const type = state.current.type || 'offer';
  state.current = {
    type,
    number: makeNumber(type),
    date: new Date().toISOString().slice(0, 10),
    customer: { name: '', email: '', phone: '', street: '', city: '' },
    lines: [{ id: uid(), description: '', price: '' }]
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
    return;
  }

  list.innerHTML = state.customers.map(customer => `
    <article class="customerItem" data-id="${escapeHtml(customer.id)}">
      <div>
        <b>${escapeHtml(customer.name || '')}</b>
        <small>${escapeHtml([customer.street, customer.city, customer.phone, customer.email].filter(Boolean).join(' · '))}</small>
      </div>
    </article>
  `).join('');

  list.querySelectorAll('.customerItem').forEach(item => {
    item.addEventListener('click', () => openCustomerForm(item.dataset.id));
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
}

function deleteCustomer() {
  const id = $('#customerEditId').value;
  if (!id || !confirm(t('confirmDelete'))) return;

  state.customers = state.customers.filter(customer => customer.id !== id);
  persist();
  $('#customerForm').classList.add('hidden');
  renderCustomers();
  renderCustomerSelect();
}

function renderArchive() {
  const list = $('#archiveList');

  if (!state.documents.length) {
    list.innerHTML = `<p class="muted">${escapeHtml(t('noDocuments'))}</p>`;
    return;
  }

  list.innerHTML = state.documents.map(document => `
    <article class="archiveItem" data-id="${escapeHtml(document.id)}">
      <div>
        <b>${escapeHtml(document.number || '')} · ${escapeHtml(document.type === 'invoice' ? t('invoice') : t('offer'))}</b>
        <small>${escapeHtml([document.customer?.name, fmtDate(document.date)].filter(Boolean).join(' · '))}</small>
      </div>
      <span class="amount">${escapeHtml(fmtMoney(document.total))}</span>
    </article>
  `).join('');

  list.querySelectorAll('.archiveItem').forEach(item => {
    item.addEventListener('click', () => loadDocument(item.dataset.id));
  });
}

function loadDocument(id) {
  const document = state.documents.find(item => item.id === id);
  if (!document) return;

  state.current = Store.clone(document);
  state.current.lines = document.lines.length
    ? document.lines.map(line => ({ ...line }))
    : [{ id: uid(), description: '', price: '' }];

  persist();
  goToPage('document');
  renderTypeButtons();
  renderDocumentFields();
  renderCustomerSelect();
  renderLines();
  renderTotals();
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

  $('#addLine').addEventListener('click', addLine);
  $('#resetDocument').addEventListener('click', resetDocument);
  $('#saveDocument').addEventListener('click', () => saveCurrentDocument(true));
  $('#exportPdf').addEventListener('click', exportPdf);
}

function exportJson() {
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

function importJson(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      state = Store.import(reader.result);
      persist();
      location.reload();
    } catch (error) {
      alert('Import mislukt.');
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
  $('#exportJson').addEventListener('click', exportJson);
  $('#importJson').addEventListener('change', event => importJson(event.target.files[0]));
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
