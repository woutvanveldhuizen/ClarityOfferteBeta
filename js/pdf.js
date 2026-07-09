function buildPrintHtml() {
  const s = state.settings;
  const c = state.current.customer || {};
  const typeLabel = state.current.type === 'invoice' ? t('invoice') : t('offer');
  const subtotal = getSubtotal();
  const vatAmount = subtotal * ((Number(s.vatRate) || 0) / 100);
  const total = subtotal + vatAmount;
  const lines = getValidLines();

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
          <div><strong>${escapeHtml(t('documentNumber'))}:</strong> ${escapeHtml(state.current.number || '')}</div>
          <div><strong>${escapeHtml(t('documentDate'))}:</strong> ${escapeHtml(fmtDate(state.current.date))}</div>
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
              <td>${escapeHtml(line.description)}</td>
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
  saveCurrentDocument(false);
  let root = document.getElementById('printRoot');

  if (!root) {
    root = document.createElement('div');
    root.id = 'printRoot';
    document.body.appendChild(root);
  }

  root.innerHTML = buildPrintHtml();
  window.setTimeout(() => window.print(), 80);
}
