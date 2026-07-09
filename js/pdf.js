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

function pdfLinesFrom(parts) {
  return parts
    .map(value => String(value || '').trim())
    .filter(Boolean);
}

function pdfText(lines) {
  return escapeHtml(pdfLinesFrom(lines).join('\n'));
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

  const companyDetails = pdfLinesFrom([
    s.companyOwner ? `${t('owner')}: ${s.companyOwner}` : '',
    s.companyAddress,
    s.companyPhone ? `Tel.: ${s.companyPhone}` : '',
    s.companyEmail ? `E-Mail: ${s.companyEmail}` : '',
    s.companyWeb
  ]);

  const customerDetails = pdfLinesFrom([
    c.name,
    c.street,
    c.city,
    c.phone ? `${t('customerPhone')}: ${c.phone}` : '',
    c.email ? `${t('customerEmail')}: ${c.email}` : ''
  ]);

  const bankSummary = pdfLinesFrom([
    s.bankIban ? `IBAN ${s.bankIban}` : '',
    s.bankBic ? `BIC ${s.bankBic}` : '',
    s.bankName
  ]).join('  ·  ');

  return `
    <div class="pdfDoc">
      <div class="pdfBackgroundMark"></div>

      <header class="pdfHeaderV31">
        <section class="pdfCompanyBlock">
          <img src="assets/logo.jpg" alt="Clarity logo">
          <div>
            <h1>${escapeHtml(s.companyName || 'Clarity Entrümpelung')}</h1>
            <div class="pdfTextBlock compact">${pdfText(companyDetails)}</div>
          </div>
        </section>

        <section class="pdfDocumentBlock">
          <h2>${escapeHtml(typeLabel)}</h2>
          <div class="pdfMetaGrid">
            <span>${escapeHtml(t('documentNumber'))}</span>
            <strong>${escapeHtml(doc.number || '')}</strong>
            <span>${escapeHtml(t('documentDate'))}</span>
            <strong>${escapeHtml(fmtDate(doc.date))}</strong>
          </div>

          ${customerDetails.length ? `
            <div class="pdfCustomerTop">
              <h3>${escapeHtml(t('customer'))}</h3>
              <div class="pdfTextBlock compact">${pdfText(customerDetails)}</div>
            </div>
          ` : ''}
        </section>
      </header>

      <table class="pdfLines pdfLinesV31">
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

      <section class="pdfBottomGrid">
        <div class="pdfNoteBox">
          <strong>${escapeHtml(s.companyName || 'Clarity Entrümpelung')}</strong>
          ${bankSummary ? `<span>${escapeHtml(bankSummary)}</span>` : ''}
        </div>

        <div class="pdfTotals pdfTotalsV31">
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
        </div>
      </section>

      <footer class="pdfFooterV31">
        ${escapeHtml(bankSummary || '')}
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

  root.innerHTML = buildPrintHtml(savedDocument);
  savedDocument.pdfHtml = root.innerHTML;
  const index = state.documents.findIndex(existing => existing.id === savedDocument.id);
  if (index >= 0) {
    state.documents[index] = savedDocument;
    persist();
  }

  window.setTimeout(() => window.print(), 80);
}
