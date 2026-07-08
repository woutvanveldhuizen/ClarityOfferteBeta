function clientHtml() {
  const s = state.settings;
  const parts = [
    s.customerName,
    s.customerStreet,
    s.customerPostcodeCity,
    s.customerCountry,
    s.customerEmail,
    s.customerPhone
  ].filter(x => String(x || '').trim());

  if (!parts.length) return '';

  return `
    <section class="clientBox">
      <div class="clientIcon"></div>
      <div>
        <h3>${t('offerTo').toUpperCase()}</h3>
        ${parts.map((p, i) => `<p>${i === 0 ? '<b>' : ''}${escapeHtml(p)}${i === 0 ? '</b>' : ''}</p>`).join('')}
      </div>
    </section>
  `;
}

function buildPdf() {
  const s = state.settings;
  const lang = s.lang;
  const date = new Date();
  const valid = new Date(Date.now() + Number(s.validDays || 30) * 864e5);
  const nr = `CL-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const sub = quoteSubtotal();
  const vat = sub * (Number(s.vatRate || 21) / 100);
  const grand = sub + vat;
  const vatWord = lang === 'de' ? 'MwSt.' : lang === 'pl' ? 'VAT' : 'BTW';

  const rows = (state.quote || []).map(line => {
    const title = quoteLineTitle(line);
    const description = quoteLineDescription(line);
    const text = [title, description ? `<small>${escapeHtml(description)}</small>` : ''].join('<br>');
    return `
      <tr>
        <td>${line.qty || 1}</td>
        <td>${text}</td>
        <td>${fmtMoney(line.price)}</td>
        <td>${fmtMoney((line.qty || 1) * line.price)}</td>
      </tr>
    `;
  }).join('') || `
      <tr>
        <td>1</td>
        <td>${t('desc')}</td>
        <td>${fmtMoney(0)}</td>
        <td>${fmtMoney(0)}</td>
      </tr>
    `;

  return `
    <div class="pdfDoc">
      <div class="pdfHead">
        <img class="pdfLogo" src="assets/logo.jpg">
        <div class="pdfTitle">
          <h1>${t('offer').toUpperCase()}</h1>
          <p>${t('offerNo')}</p>
          <h2>${nr}</h2>
          <p>${t('date')}</p>
          <h2>${fmtDate(date)}</h2>
        </div>
        <div class="pdfCompany">
          <h2>${escapeHtml(s.companyName)}</h2>
          <p>${lang === 'de' ? 'Angebot für Entrümpelung' : lang === 'pl' ? 'Oferta opróżniania lokalu' : 'Offerte voor ontruiming'}</p>
          <p>${escapeHtml(s.companyAddress).replace(/\n/g, '<br>')}</p>
          <p>${escapeHtml(s.companyPhone)}</p>
          <p>${escapeHtml(s.companyEmail)}</p>
          <p>${escapeHtml(s.companyWeb)}</p>
          ${s.companyBank ? `<p class="pdfBank">${escapeHtml(s.companyBank).replace(/\n/g, '<br>')}</p>` : ''}
        </div>
      </div>
      <div class="pdfBody">
        ${clientHtml()}
        <table class="pdfTable">
          <thead>
            <tr>
              <th>${t('qty').toUpperCase()}</th>
              <th>${t('desc').toUpperCase()}</th>
              <th>${t('unit').toUpperCase()}</th>
              <th>${t('line').toUpperCase()}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="pdfBottom">
          <div class="pdfBlocks">
            <div class="pdfBlock">
              <h3>${t('valid').toUpperCase()}</h3>
              <p>${I18N[lang].validText(fmtDate(valid))}</p>
            </div>
            <div class="pdfBlock">
              <h3>${t('notes').toUpperCase()}</h3>
              <p>${t('noteText')}</p>
            </div>
            <div class="pdfSign">
              <p>${t('greeting')}</p>
              <b>${escapeHtml(s.companyName).toUpperCase()}</b>
              <p>Team Clarity</p>
            </div>
          </div>
          <div class="pdfTotals">
            <div class="r"><b>${t('subtotal')}</b><span>${fmtMoney(sub)}</span></div>
            <div class="r"><span>${s.vatRate}% ${vatWord}</span><span>${fmtMoney(vat)}</span></div>
            <div class="r grand"><span>${t('totalIncl')}</span><span>${fmtMoney(grand)}</span></div>
          </div>
        </div>
        <div class="pdfFoot">
          <span>${t('professional')}</span>
          <span>${t('reliable')}</span>
          <span>${t('fast')}</span>
        </div>
      </div>
    </div>
  `;
}

function exportPdf() {
  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${t('offer')}</title>
        <link rel="stylesheet" href="css/pdf.css">
      </head>
      <body>
        ${buildPdf()}
        <script>
          window.onload = () => setTimeout(() => {
            window.focus();
            window.print();
          }, 350);
        <\/script>
      </body>
    </html>
  `;

  const frame = document.createElement('iframe');
  frame.className = 'pdfFrame';
  frame.setAttribute('aria-hidden', 'true');
  document.body.appendChild(frame);

  const doc = frame.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  const cleanup = () => {
    setTimeout(() => {
      if (frame.parentNode) frame.parentNode.removeChild(frame);
    }, 1200);
  };

  frame.contentWindow.onafterprint = cleanup;
  setTimeout(cleanup, 9000);
}
