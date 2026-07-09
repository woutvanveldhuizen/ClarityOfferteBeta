function makeDocumentFromCurrent() {
  const subtotal = getSubtotal();
  const vatAmount = subtotal * ((Number(state.settings.vatRate) || 0) / 100);
  const total = subtotal + vatAmount;

  return {
    id: state.current.id || uid(),
    type: state.current.type,
    number: state.current.number || makeNumber(state.current.type),
    date: state.current.date,
    customer: { ...(state.current.customer || {}) },
    lines: getValidLines().map(line => ({
      ...line,
      description: translateManualDescription(line)
    })),
    subtotal,
    vat: vatAmount,
    total
  };
}

function buildPrintHtml(sourceDocument = null) {
  const s = state.settings;
  const doc = sourceDocument || makeDocumentFromCurrent();
  const c = doc.customer || {};
  const typeLabel = doc.type === 'invoice' ? t('invoice') : t('offer');
  const subtotal = Number(doc.subtotal ?? 0);
  const vatAmount = Number(doc.vat ?? (subtotal * ((Number(s.vatRate) || 0) / 100)));
  const total = Number(doc.total ?? (subtotal + vatAmount));
  const lines = doc.lines || [];

  const companyDetails = [
    s.companyOwner ? `${t('owner')}: ${s.companyOwner}` : '',
    s.companyAddress,
    s.companyPhone ? `Tel.: ${s.companyPhone}` : '',
    s.companyEmail ? `E-Mail: ${s.companyEmail}` : '',
    s.companyWeb
  ].filter(Boolean).join('\n');

  const customerDetails = [
    c.name,
    c.street,
    c.city,
    c.phone ? `${t('customerPhone')}: ${c.phone}` : '',
    c.email ? `${t('customerEmail')}: ${c.email}` : ''
  ].filter(Boolean).join('\n');

  const bankDetails = [
    s.bankIban ? `IBAN: ${s.bankIban}` : '',
    s.bankBic ? `BIC: ${s.bankBic}` : '',
    s.bankName
  ].filter(Boolean).join('\n');

  return `
    <div class="pdfDoc">
      <header class="pdfHeader">
        <div class="pdfBrand">
          <img src="assets/logo.jpg" alt="Clarity logo">
          <div>
            <h1>${escapeHtml(s.companyName || 'Clarity')}</h1>
            <div class="pdfTextBlock">${escapeHtml(companyDetails)}</div>
          </div>
        </div>
        <div class="pdfMeta">
          <h2>${escapeHtml(typeLabel)}</h2>
          <div><strong>${escapeHtml(t('documentNumber'))}:</strong> ${escapeHtml(doc.number || '')}</div>
          <div><strong>${escapeHtml(t('documentDate'))}:</strong> ${escapeHtml(fmtDate(doc.date))}</div>
        </div>
      </header>

      <section class="pdfTwoCols">
        <div class="pdfBox">
          <h3>${escapeHtml(t('customer'))}</h3>
          <div class="pdfTextBlock">${escapeHtml(customerDetails)}</div>
        </div>
        <div class="pdfBox">
          <h3>${escapeHtml(t('bank'))}</h3>
          <div class="pdfTextBlock">${escapeHtml(bankDetails)}</div>
        </div>
      </section>

      <table class="pdfLines">
        <thead>
          <tr>
            <th>${escapeHtml(t('description'))}</th>
            <th class="money">${escapeHtml(t('priceNet'))}</th>
          </tr>
        </thead>
        <tbody>
          ${lines.map(line => `
            <tr>
              <td>${escapeHtml(line.description || line.descriptionRaw || '')}</td>
              <td class="money">${escapeHtml(fmtMoney(line.price))}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <section class="pdfTotals">
        <div>
          <span>${escapeHtml(t('subtotal'))}</span>
          <strong>${escapeHtml(fmtMoney(subtotal))}</strong>
        </div>
        <div>
          <span>${escapeHtml(t('vat'))} ${escapeHtml(String(s.vatRate || 0))}%</span>
          <strong>${escapeHtml(fmtMoney(vatAmount))}</strong>
        </div>
        <div class="grand">
          <span>${escapeHtml(t('total'))}</span>
          <strong>${escapeHtml(fmtMoney(total))}</strong>
        </div>
      </section>

      <footer class="pdfFooter">
        ${escapeHtml(s.companyName || '')}${bankDetails ? '<br>' + escapeHtml(bankDetails).replace(/\n/g, '<br>') : ''}
      </footer>
    </div>
  `;
}

function exportPdf() {
  const savedDocument = saveCurrentDocument(false);
  let root = document.getElementById('printRoot');

  if (!root) {
    root = document.createElement('div');
    root.id = 'printRoot';
    document.body.appendChild(root);
  }

  root.innerHTML = savedDocument.pdfHtml || buildPrintHtml(savedDocument);
  window.setTimeout(() => window.print(), 80);
}
