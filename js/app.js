let state = Store.load();
ensureItems();

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

function slugify(value) {
  return String(value || 'item')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50) || `item_${Date.now()}`;
}

function quoteSubtotal() {
  return (state.quote || []).reduce((sum, line) => {
    return sum + (Number(line.price) || 0) * (Number(line.qty) || 1);
  }, 0);
}

function persist() {
  Store.save(state);
}

function activePageKey() {
  const id = $('.page.active')?.id;
  if (id === 'database') return 'database';
  if (id === 'settings') return 'settings';
  if (id === 'customers') return 'customers';
  return 'quote';
}

function renderAppName() {
  const name = t('appName');
  document.title = name;

  const splashTitle = $('#splashTitle');
  if (splashTitle) splashTitle.textContent = name;

  const brand = $('#brandTitle');
  if (brand) {
    const parts = name.split(' ');
    brand.innerHTML = `${escapeHtml(parts[0] || 'Clarity')}<br><span>${escapeHtml(parts.slice(1).join(' ') || 'Offertemaker')}</span>`;
  }
}

function renderTypeOptions() {
  const select = $('#itemType');
  if (!select) return;

  const oldValue = select.value || 'building';
  select.innerHTML = Object.keys(TYPE_LABELS.nl)
    .map(key => `<option value="${key}">${typeLabel(key)}</option>`)
    .join('');
  select.value = TYPE_LABELS.nl[oldValue] ? oldValue : 'building';
}

function setPlaceholders() {
  const ph = {
    nl: {
      job: 'Vrijstaand huis van 63 m². Losse garage en parkeren voor de deur.',
      title: 'Vrijstaand huis',
      description: 'Woning met eigen toegang',
      keywords: 'huis, woning, vrijstaand'
    },
    de: {
      job: 'Freistehendes Haus mit 63 m². Freistehende Garage und Parken direkt vor der Tür.',
      title: 'Freistehendes Haus',
      description: 'Wohnung mit eigenem Zugang',
      keywords: 'Haus, Wohnung, freistehend'
    },
    pl: {
      job: 'Dom wolnostojący 63 m². Wolnostojący garaż i parking przed drzwiami.',
      title: 'Dom wolnostojący',
      description: 'Dom z osobnym wejściem',
      keywords: 'dom, mieszkanie, wolnostojący'
    }
  }[state.settings.lang] || {};

  if ($('#jobText')) $('#jobText').placeholder = ph.job;
  if ($('#itemTitle')) $('#itemTitle').placeholder = ph.title;
  if ($('#itemDescription')) $('#itemDescription').placeholder = ph.description;
  if ($('#itemKeywords')) $('#itemKeywords').placeholder = ph.keywords;
}

function applyI18n() {
  document.documentElement.lang = state.settings.lang;

  $$('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });

  $$('[data-help]').forEach(el => {
    el.title = t(el.dataset.help);
  });

  $('#pageTitle').textContent = t(activePageKey());
  $('#language').value = state.settings.lang;
  $('#themeSelect').value = state.settings.theme || 'dark';

  renderAppName();
  renderTypeOptions();
  updatePriceModeVisibility();
  setPlaceholders();
  renderQuote();
  renderDb();
  renderCustomers();
  renderCustomerSelect();
  renderManualList();
  updateVatLabel();
}

function updateVatLabel() {
  const lang = state.settings.lang;
  const vatWord = lang === 'de' ? 'MwSt.' : lang === 'pl' ? 'VAT' : 'BTW';
  const label = $('#vatLabel');
  if (label) label.textContent = `${vatWord} ${state.settings.vatRate || 21}%`;
}

function quoteLineTitle(line) {
  return line.title || itemTitle(line);
}

function quoteLineDescription(line) {
  return line.description || itemDescription(line);
}

function renderQuote() {
  const box = $('#quoteLines');
  if (!box) return;

  box.innerHTML = '';

  (state.quote || []).forEach((line, index) => {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'quoteLineClean';
    row.dataset.quoteEdit = index;
    row.innerHTML = `
      <span class="quoteLineCopy">
        <b>${escapeHtml(quoteLineTitle(line))}</b>
        ${quoteLineDescription(line) ? `<small>${escapeHtml(quoteLineDescription(line))}</small>` : ''}
      </span>
      <b class="quoteLineAmount">${fmtMoney((line.qty || 1) * line.price)}</b>
    `;
    box.appendChild(row);
  });

  const sub = quoteSubtotal();
  const vat = sub * (Number(state.settings.vatRate || 21) / 100);
  const grand = sub + vat;

  $('#subtotal').textContent = fmtMoney(sub);
  $('#vat').textContent = fmtMoney(vat);
  $('#grandTotal').textContent = fmtMoney(grand);
  $('#lineCount').textContent = `${(state.quote || []).length} ${state.settings.lang === 'de' ? 'Zeilen' : state.settings.lang === 'pl' ? 'pozycji' : 'regels'}`;
  updateVatLabel();
}

function sortedItems() {
  const order = {
    building: 1,
    garage: 2,
    parking: 3,
    kitchen: 4,
    furniture: 5,
    bathroom: 6,
    outdoor: 7,
    floor: 8,
    labor: 9,
    surcharge: 10,
    extra: 11
  };

  return state.items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const typeDiff = (order[a.item.type] || 99) - (order[b.item.type] || 99);
      if (typeDiff) return typeDiff;
      return itemTitle(a.item).localeCompare(itemTitle(b.item), state.settings.lang);
    });
}

function renderDb() {
  const box = $('#dbList');
  if (!box) return;

  box.innerHTML = '';
  const groups = {};

  sortedItems().forEach(entry => {
    (groups[entry.item.type] || (groups[entry.item.type] = [])).push(entry);
  });

  Object.keys(groups).forEach((type, index) => {
    const details = document.createElement('details');
    details.className = 'dbGroup';
    details.open = index < 2;
    details.innerHTML = `
      <summary>
        <span>${escapeHtml(typeLabel(type))}</span>
        <b>${groups[type].length}</b>
      </summary>
      <div class="dbGroupItems"></div>
    `;

    const inner = details.querySelector('.dbGroupItems');

    groups[type].forEach(({ item, index: originalIndex }) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'dbItem compactItem databaseRow';
      row.innerHTML = `
        <div class="dbItemMain">
          <b>${escapeHtml(itemTitle(item))}</b>
          <small>${escapeHtml(itemDescription(item) || itemValueLabel(item))}</small>
        </div>
        <div class="dbItemPrice">${escapeHtml(itemPriceLabel(item))}</div>
        <div class="dbItemChevron" aria-hidden="true">›</div>
      `;
      row.onclick = () => openEditItem(originalIndex);
      inner.appendChild(row);
    });

    box.appendChild(details);
  });
}

function manualValueFor(item) {
  const input = document.querySelector(`[data-manual-value="${CSS.escape(item.id)}"]`);
  if (!input) return defaultValueForItem(item);
  const value = input.value === '' ? defaultValueForItem(item) : Number(input.value);
  return Number.isFinite(value) ? value : defaultValueForItem(item);
}

function quoteItemFromManual(item) {
  const matchedValue = manualValueFor(item);
  return quoteLineFromItem(item, matchedValue, true);
}

function upsertManualQuote(item) {
  const existing = (state.quote || []).findIndex(line => line.id === item.id && line.manual);
  const line = quoteItemFromManual(item);
  if (existing >= 0) state.quote[existing] = line;
  else state.quote.push(line);
}

function removeManualQuote(id) {
  state.quote = (state.quote || []).filter(line => !(line.id === id && line.manual));
}

function itemNeedsManualValue(item) {
  return item.priceMode === 'table' && (item.priceRows || []).length > 0;
}

function renderManualList() {
  const box = $('#manualList');
  if (!box) return;

  box.innerHTML = '';
  const groups = {};
  sortedItems().forEach(entry => {
    (groups[entry.item.type] || (groups[entry.item.type] = [])).push(entry.item);
  });

  Object.keys(groups).forEach((type, index) => {
    const details = document.createElement('details');
    details.className = 'manualGroup';
    details.open = index < 2;
    details.innerHTML = `
      <summary><span>${escapeHtml(typeLabel(type))}</span><b>${groups[type].length}</b></summary>
      <div class="manualGroupItems"></div>
    `;
    const inner = details.querySelector('.manualGroupItems');

    groups[type].forEach(item => {
      const selected = (state.quote || []).some(line => line.id === item.id && line.manual);
      const current = selected
        ? ((state.quote || []).find(line => line.id === item.id && line.manual)?.matchedValue ?? defaultValueForItem(item))
        : defaultValueForItem(item);
      const needsValue = itemNeedsManualValue(item);
      const row = document.createElement('label');
      row.className = 'manualItem';
      row.innerHTML = `
        <input type="checkbox" data-manual-check="${escapeHtml(item.id)}" ${selected ? 'checked' : ''}>
        <span>
          <b>${escapeHtml(itemTitle(item))}</b>
          <small>${escapeHtml(itemDescription(item) || itemPriceLabel(item))}</small>
        </span>
        ${needsValue ? `<input class="manualValue" data-manual-value="${escapeHtml(item.id)}" type="number" inputmode="decimal" value="${escapeHtml(current)}">` : ''}
      `;
      inner.appendChild(row);
    });

    box.appendChild(details);
  });

  box.querySelectorAll('[data-manual-check]').forEach(check => {
    check.onchange = () => {
      const item = state.items.find(x => x.id === check.dataset.manualCheck);
      if (!item) return;
      if (check.checked) upsertManualQuote(item);
      else removeManualQuote(item.id);
      persist();
      renderQuote();
      renderManualList();
    };
  });

  box.querySelectorAll('[data-manual-value]').forEach(input => {
    input.oninput = () => {
      const item = state.items.find(x => x.id === input.dataset.manualValue);
      if (!item) return;
      const check = box.querySelector(`[data-manual-check="${CSS.escape(item.id)}"]`);
      if (check && check.checked) {
        upsertManualQuote(item);
        persist();
        renderQuote();
      }
    };
  });
}

function setQuoteMode(mode) {
  $$('.modeTile').forEach(button => {
    button.classList.toggle('active', button.dataset.mode === mode);
  });

  $('#writePanel')?.classList.toggle('active', mode === 'write');
  $('#checkPanel')?.classList.toggle('active', mode === 'check');
  if (mode === 'check') renderManualList();
}

function rowValueParts(row = {}) {
  if (row.minValue != null || row.maxValue != null) {
    const min = row.minValue ?? '';
    const max = row.maxValue ?? row.minValue ?? '';
    return { minValue: min, maxValue: max };
  }

  const range = parseValueRange(row.value || '');
  if (range) return { minValue: range.min, maxValue: range.max };
  return { minValue: '', maxValue: '' };
}

function renderPriceRows(rows = []) {
  const box = $('#priceRows');
  if (!box) return;

  box.innerHTML = '';
  (rows.length ? rows : []).forEach(row => addPriceRow(row));
}

function addPriceRow(row = { minValue: '', maxValue: '', minPrice: '', maxPrice: '' }) {
  const box = $('#priceRows');
  if (!box) return;

  const parts = rowValueParts(row);
  const minPrice = row.minPrice ?? '';
  const maxPrice = row.maxPrice ?? row.minPrice ?? '';
  const el = document.createElement('div');
  el.className = 'priceRow';
  el.innerHTML = `
    <input class="rowMinValue" type="number" inputmode="decimal" placeholder="10" value="${escapeHtml(parts.minValue)}">
    <input class="rowMaxValue" type="number" inputmode="decimal" placeholder="20" value="${escapeHtml(parts.maxValue)}">
    <input class="rowMinPrice" type="number" inputmode="decimal" placeholder="600" value="${escapeHtml(minPrice)}">
    <input class="rowMaxPrice" type="number" inputmode="decimal" placeholder="900" value="${escapeHtml(maxPrice)}">
    <button type="button" class="rowDelete" aria-label="Delete">×</button>
  `;
  el.querySelector('.rowDelete').onclick = () => el.remove();
  box.appendChild(el);
}

function addFixedPriceRow() {
  addPriceRow({ minValue: 1, maxValue: 1, minPrice: '', maxPrice: '' });
  $('#priceRowChooser')?.classList.add('hidden');
}

function addRangePriceRow() {
  addPriceRow({ minValue: 10, maxValue: 20, minPrice: '', maxPrice: '' });
  $('#priceRowChooser')?.classList.add('hidden');
}

function readPriceRows() {
  return $$('#priceRows .priceRow')
    .map(row => {
      const minValueRaw = row.querySelector('.rowMinValue').value.trim();
      const maxValueRaw = row.querySelector('.rowMaxValue').value.trim();
      const minValue = Number(minValueRaw.replace(',', '.'));
      const maxValue = maxValueRaw === '' ? minValue : Number(maxValueRaw.replace(',', '.'));
      const minPrice = Number(row.querySelector('.rowMinPrice').value) || 0;
      const maxPriceRaw = row.querySelector('.rowMaxPrice').value;
      const maxPrice = maxPriceRaw === '' ? minPrice : Number(maxPriceRaw) || minPrice;
      return {
        minValue,
        maxValue,
        minPrice,
        maxPrice,
        value: Number.isFinite(minValue) && Number.isFinite(maxValue)
          ? (minValue === maxValue ? String(minValue) : `${minValue}-${maxValue}`)
          : ''
      };
    })
    .filter(row => row.value);
}

function togglePriceTableBody(open) {
  const body = $('#priceTableBody');
  if (!body) return;
  const shouldOpen = open ?? body.classList.contains('hidden');
  body.classList.toggle('hidden', !shouldOpen);
  const button = $('#togglePriceTable');
  if (button) button.textContent = shouldOpen ? t('closePriceTable') : t('openPriceTable');
}

function updatePriceModeVisibility() {
  const mode = $('#priceMode')?.value || 'table';
  $('#fixedPriceWrap')?.classList.toggle('hidden', mode !== 'fixed');
  $('#priceTableWrap')?.classList.toggle('hidden', mode !== 'table');
}

function fillSettings() {
  const settings = state.settings;

  [
    'companyName',
    'companyEmail',
    'companyPhone',
    'companyWeb',
    'companyAddress',
    'vatRate',
    'validDays',
    'customerName',
    'customerStreet',
    'customerPostcodeCity',
    'customerCountry',
    'customerEmail',
    'customerPhone'
  ].forEach(id => {
    const input = $('#' + id);
    if (input) input.value = settings[id] ?? '';
  });

  $('#language').value = settings.lang || 'nl';
  $('#themeSelect').value = settings.theme || 'dark';
  renderCustomerSelect();
}

function clearItemForm() {
  [
    'editIndex',
    'itemKey',
    'itemTitle',
    'itemDescription',
    'itemKeywords',
    'itemFixedPrice'
  ].forEach(id => {
    const el = $('#' + id);
    if (el) el.value = '';
  });

  $('#itemType').value = 'building';
  $('#priceMode').value = 'table';
  renderPriceRows();
  togglePriceTableBody(false);
  updatePriceModeVisibility();

  const deleteButton = $('#deleteItem');
  if (deleteButton) deleteButton.classList.add('hidden');
}

function showItemForm() {
  $('#itemForm').classList.remove('hidden');
  renderTypeOptions();
  setPlaceholders();
  updatePriceModeVisibility();
  setTimeout(() => $('#itemTitle').focus(), 50);
}

function openEditItem(index) {
  const item = state.items[index];
  if (!item) return;

  showItemForm();
  $('#editIndex').value = index;
  $('#itemKey').value = item.id || '';
  $('#itemType').value = item.type || 'building';
  $('#itemTitle').value = item.titleRaw || itemTitle(item);
  $('#itemDescription').value = item.descriptionRaw || itemDescription(item);
  $('#itemKeywords').value = kwList(item).join(', ');
  $('#priceMode').value = item.priceMode || 'table';
  $('#itemFixedPrice').value = item.price ?? '';
  renderPriceRows(item.priceRows || []);
  togglePriceTableBody(false);
  updatePriceModeVisibility();

  const deleteButton = $('#deleteItem');
  if (deleteButton) deleteButton.classList.remove('hidden');
}

function saveItem() {
  const editIndex = $('#editIndex').value;
  const old = editIndex !== '' ? state.items[Number(editIndex)] : null;
  const titleRaw = $('#itemTitle').value.trim() || 'Nieuwe post';
  const descriptionRaw = $('#itemDescription').value.trim();
  const id = $('#itemKey').value.trim() || old?.id || slugify(`${$('#itemType').value}_${titleRaw}_${Date.now()}`);
  const keys = tokenKeysFromText(`${titleRaw} ${descriptionRaw} ${$('#itemKeywords').value}`).filter(k => LEXICON[k]);
  const priceMode = $('#priceMode').value;

  const item = normalizeItem({
    id,
    type: $('#itemType').value,
    titleRaw,
    descriptionRaw,
    keywordKeys: Array.from(new Set(keys)),
    keywords: $('#itemKeywords').value.split(',').map(x => x.trim()).filter(Boolean),
    unit: $('#itemType').value === 'building' ? 'm2' : $('#itemType').value === 'labor' ? 'days' : 'amount',
    priceMode,
    price: priceMode === 'fixed' ? Number($('#itemFixedPrice').value) || 0 : undefined,
    priceRows: priceMode === 'table' ? readPriceRows() : []
  });

  if (editIndex !== '') state.items[Number(editIndex)] = item;
  else state.items.push(item);

  clearItemForm();
  $('#itemForm').classList.add('hidden');
  persist();
  renderDb();
  renderManualList();
}

function emptyCustomer() {
  return {
    id: `cust_${Date.now()}`,
    name: '',
    email: '',
    phone: '',
    street: '',
    postcodeCity: '',
    country: ''
  };
}

function applyCustomerToQuote(customer) {
  state.settings.selectedCustomerId = customer.id || '';
  state.settings.customerName = customer.name || '';
  state.settings.customerEmail = customer.email || '';
  state.settings.customerPhone = customer.phone || '';
  state.settings.customerStreet = customer.street || '';
  state.settings.customerPostcodeCity = customer.postcodeCity || '';
  state.settings.customerCountry = customer.country || '';
  fillSettings();
  persist();
  renderCustomerSelect();
}

function renderCustomerSelect() {
  const select = $('#customerSelect');
  if (!select) return;

  const current = state.settings.selectedCustomerId || '';
  select.innerHTML = `<option value="">${t('noCustomer')}</option>` +
    (state.customers || [])
      .map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.name || c.email || c.phone || c.id)}</option>`)
      .join('');
  select.value = current;
}

function clearCustomerForm() {
  ['customerEditIndex', 'custName', 'custEmail', 'custPhone', 'custStreet', 'custPostcodeCity', 'custCountry'].forEach(id => {
    const input = $('#' + id);
    if (input) input.value = '';
  });
}

function showCustomerForm() {
  $('#customerForm').classList.remove('hidden');
  setTimeout(() => $('#custName').focus(), 50);
}

function openEditCustomer(index) {
  const customer = state.customers[index];
  if (!customer) return;

  showCustomerForm();
  $('#customerEditIndex').value = index;
  $('#custName').value = customer.name || '';
  $('#custEmail').value = customer.email || '';
  $('#custPhone').value = customer.phone || '';
  $('#custStreet').value = customer.street || '';
  $('#custPostcodeCity').value = customer.postcodeCity || '';
  $('#custCountry').value = customer.country || '';
}

function saveCustomer() {
  const index = $('#customerEditIndex').value;
  const old = index !== '' ? state.customers[Number(index)] : emptyCustomer();
  const customer = {
    ...old,
    name: $('#custName').value.trim(),
    email: $('#custEmail').value.trim(),
    phone: $('#custPhone').value.trim(),
    street: $('#custStreet').value.trim(),
    postcodeCity: $('#custPostcodeCity').value.trim(),
    country: $('#custCountry').value.trim()
  };

  if (index !== '') state.customers[Number(index)] = customer;
  else state.customers.push(customer);

  clearCustomerForm();
  $('#customerForm').classList.add('hidden');
  persist();
  renderCustomers();
  renderCustomerSelect();
}

function renderCustomers() {
  const box = $('#customerList');
  if (!box) return;

  box.innerHTML = '';
  (state.customers || []).forEach((customer, index) => {
    const meta = [customer.email, customer.phone, customer.street, customer.postcodeCity, customer.country]
      .filter(Boolean)
      .join(' · ');
    const row = document.createElement('div');
    row.className = 'dbItem customerItem';
    row.innerHTML = `
      <div class="dbItemMain">
        <b>${escapeHtml(customer.name || '-')}</b>
        <small>${escapeHtml(meta || '-')}</small>
      </div>
      <div class="dbActions">
        <button data-use-customer="${index}" title="${t('useCustomer')}">✓</button>
        <button data-edit-customer="${index}" title="${t('edit')}">✎</button>
        <button data-remove-customer="${index}" title="${t('remove')}">×</button>
      </div>
    `;
    box.appendChild(row);
  });

  box.querySelectorAll('[data-use-customer]').forEach(button => {
    button.onclick = () => applyCustomerToQuote(state.customers[Number(button.dataset.useCustomer)]);
  });

  box.querySelectorAll('[data-edit-customer]').forEach(button => {
    button.onclick = () => openEditCustomer(Number(button.dataset.editCustomer));
  });

  box.querySelectorAll('[data-remove-customer]').forEach(button => {
    button.onclick = () => {
      state.customers.splice(Number(button.dataset.removeCustomer), 1);
      persist();
      renderCustomers();
      renderCustomerSelect();
    };
  });
}

function bind() {
  setTimeout(() => $('#splash').classList.add('hide'), 2000);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }

  $$('nav button').forEach(button => {
    button.onclick = () => {
      $$('nav button').forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      $$('.page').forEach(page => page.classList.remove('active'));
      $('#' + button.dataset.page).classList.add('active');
      applyI18n();
    };
  });

  $('#language').onchange = event => {
    state.settings.lang = event.target.value;
    persist();
    applyI18n();
    fillSettings();
  };

  $('#themeSelect').onchange = event => {
    state.settings.theme = event.target.value;
    document.body.classList.toggle('light', state.settings.theme === 'light');
    persist();
  };

  $('#analyze').onclick = () => {
    state.quote = analyzeText($('#jobText').value);
    persist();
    renderQuote();
    renderManualList();
  };

  $('#clearQuote').onclick = () => {
    state.quote = [];
    $('#jobText').value = '';
    persist();
    renderQuote();
    renderManualList();
  };

  $('#exportPdf').onclick = exportPdf;
  $('#addItem').onclick = () => {
    clearItemForm();
    showItemForm();
  };
  $('#cancelItem').onclick = () => {
    clearItemForm();
    $('#itemForm').classList.add('hidden');
  };
  $('#saveItem').onclick = saveItem;
  $('#addPriceRow').onclick = () => $('#priceRowChooser')?.classList.toggle('hidden');
  $('#addFixedRow').onclick = addFixedPriceRow;
  $('#addRangeRow').onclick = addRangePriceRow;
  $('#togglePriceTable').onclick = () => togglePriceTableBody();
  $('#priceMode').onchange = updatePriceModeVisibility;
  $('#itemType').onchange = () => {
    const type = $('#itemType').value;
    if (type === 'building' || type === 'labor' || type === 'floor') $('#priceMode').value = 'table';
    if (type === 'parking') $('#priceMode').value = 'fixed';
    updatePriceModeVisibility();
  };

  const deleteItem = $('#deleteItem');
  if (deleteItem) {
    deleteItem.onclick = () => {
      const index = $('#editIndex').value;
      if (index === '') return;
      state.items.splice(Number(index), 1);
      clearItemForm();
      $('#itemForm').classList.add('hidden');
      persist();
      renderDb();
      renderManualList();
    };
  }

  $('#addCustomer').onclick = () => {
    clearCustomerForm();
    showCustomerForm();
  };
  $('#cancelCustomer').onclick = () => {
    clearCustomerForm();
    $('#customerForm').classList.add('hidden');
  };
  $('#saveCustomer').onclick = saveCustomer;
  $('#customerSelect').onchange = event => {
    const customer = (state.customers || []).find(c => c.id === event.target.value);
    if (customer) applyCustomerToQuote(customer);
    else {
      state.settings.selectedCustomerId = '';
      persist();
    }
  };

  $$('.modeTile').forEach(button => {
    button.onclick = () => setQuoteMode(button.dataset.mode);
  });

  $$('.help').forEach(button => {
    button.onclick = () => alert(t(button.dataset.help));
  });

  [
    'companyName',
    'companyEmail',
    'companyPhone',
    'companyWeb',
    'companyAddress',
    'vatRate',
    'validDays',
    'customerName',
    'customerStreet',
    'customerPostcodeCity',
    'customerCountry',
    'customerEmail',
    'customerPhone'
  ].forEach(id => {
    const input = $('#' + id);
    if (!input) return;
    input.oninput = event => {
      state.settings[id] = event.target.value;
      if (id.startsWith('customer')) state.settings.selectedCustomerId = '';
      persist();
      if (id === 'vatRate') renderQuote();
    };
  });
}

function init() {
  document.body.classList.toggle('light', state.settings.theme === 'light');
  bind();
  applyI18n();
  renderQuote();
  renderDb();
  renderCustomers();
  renderManualList();
  fillSettings();
  persist();
}

init();
