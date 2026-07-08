let state=Store.load();ensureItems();
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
function escapeHtml(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function slugify(s){return String(s||'item').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,50)||('item_'+Date.now())}
function quoteSubtotal(){return (state.quote||[]).reduce((a,q)=>a+(Number(q.price)||0)*(Number(q.qty)||1),0)}
function persist(){Store.save(state)}
function renderAppName(){const name=t('appName');document.title=name;const sp=$('#splashTitle');if(sp)sp.textContent=name;const b=$('#brandTitle');if(b){const parts=name.split(' ');b.innerHTML=`${escapeHtml(parts[0]||'Clarity')}<br><span>${escapeHtml(parts.slice(1).join(' ')||'Offertemaker')}</span>`}}
function renderTypeOptions(){const sel=$('#itemType'); if(!sel)return; const val=sel.value||'area'; sel.innerHTML=Object.keys(TYPE_LABELS.nl).map(k=>`<option value="${k}">${typeLabel(k)}</option>`).join(''); sel.value=val in TYPE_LABELS.nl?val:'area'}
function setPlaceholders(){const ph={nl:{job:'Huis van 63 m² met losse garage, parkeren voor de deur, 2 werkdagen',name:'50-80',kw:'huis, woning, appartement'},de:{job:'Haus mit 63 m², freistehende Garage, Parken direkt vor der Tür, 2 Arbeitstage',name:'50-80',kw:'Haus, Wohnung, Appartement'},pl:{job:'Dom 63 m², wolnostojący garaż, parking przed drzwiami, 2 dni robocze',name:'50-80',kw:'dom, mieszkanie, apartament'}}[state.settings.lang]||{}; const job=$('#jobText'); if(job)job.placeholder=ph.job; const nm=$('#itemName'); if(nm)nm.placeholder=ph.name; const kw=$('#itemKeywords'); if(kw)kw.placeholder=ph.kw;}
function activePageKey(){const id=$('.page.active')?.id;return id==='database'?'database':id==='settings'?'settings':id==='customers'?'customers':'quote'}
function applyI18n(){document.documentElement.lang=state.settings.lang;$$('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));$$('[data-help]').forEach(el=>el.title=t(el.dataset.help));$('#pageTitle').textContent=t(activePageKey());$('#language').value=state.settings.lang;$('#themeSelect').value=state.settings.theme||'dark';renderAppName();renderTypeOptions();setPlaceholders();renderQuote();renderDb();renderCustomers();renderCustomerSelect();renderManualList();updateVatLabel()}
function updateVatLabel(){const l=state.settings.lang; const vatWord=l==='de'?'MwSt.':l==='pl'?'VAT':'BTW'; const el=$('#vatLabel'); if(el)el.textContent=`${vatWord} ${state.settings.vatRate||21}%`}
function quoteLineTitle(q){
  if(q.title) return q.title;
  if(q.type === 'area') return typeLabel('base');
  return typeLabel(q.type || 'extra');
}

function quoteLineDescription(q){
  if(q.description) return q.description;
  if(q.type === 'area') return q.matchedValue ? `${q.matchedValue} m²` : itemRangeLabel(q);
  const nm = itemName(q);
  const typ = typeLabel(q.type || 'extra');
  return nm && nm !== typ ? nm : '';
}

function renderQuote(){
  const box = $('#quoteLines');
  if(!box) return;

  box.innerHTML = '';
  (state.quote || []).forEach((q, i) => {
    const el = document.createElement('div');
    el.className = 'line quoteLineCompact';
    el.innerHTML = `
      <button class="quoteLineText" data-quote-edit="${i}" type="button">
        <b>${escapeHtml(quoteLineTitle(q))}</b>
        <small>${escapeHtml(quoteLineDescription(q))}</small>
      </button>
      <div class="quoteLinePrice">
        <b>${fmtMoney((q.qty || 1) * q.price)}</b>
        <button data-del="${i}" aria-label="Delete">×</button>
      </div>
    `;
    box.appendChild(el);
  });

  const sub = quoteSubtotal();
  const vat = sub * (Number(state.settings.vatRate || 21) / 100);
  const grand = sub + vat;
  $('#subtotal').textContent = fmtMoney(sub);
  $('#vat').textContent = fmtMoney(vat);
  $('#grandTotal').textContent = fmtMoney(grand);
  const sideTotal = $('#sideTotal');
  if(sideTotal) sideTotal.textContent = fmtMoney(grand);
  $('#lineCount').textContent = (state.quote || []).length + ' ' + (state.settings.lang === 'de' ? 'Zeilen' : state.settings.lang === 'pl' ? 'pozycji' : 'regels');
  updateVatLabel();

  box.querySelectorAll('[data-del]').forEach(b => {
    b.onclick = () => {
      state.quote.splice(+b.dataset.del, 1);
      persist();
      renderQuote();
    };
  });
}
function sortedItems(){const order={base:1,area:2,kitchen:3,furniture:4,bathroom:5,outdoor:6,parking:7,floor:8,day:9,surcharge:10,extra:11};return state.items.map((it,i)=>({it,i})).sort((a,b)=>(order[a.it.type]||99)-(order[b.it.type]||99)||itemName(a.it).localeCompare(itemName(b.it),state.settings.lang))}
function itemRangeLabel(it){
  if(it.min == null || it.max == null) return t('noRange');
  const unit = it.type === 'area' ? ' m²' : '';
  return `${it.min}–${it.max}${unit}`;
}

function itemPriceLabel(it){
  const min = it.minPrice ?? it.price ?? 0;
  const max = it.maxPrice ?? it.price ?? min;
  if(Number(min) === Number(max)) return fmtMoney(min);
  return `${fmtMoney(min)} - ${fmtMoney(max)}`;
}

function bindDbSwipe(el, index){ /* swipe acties uitgeschakeld in v2.1dev1 */ }

function renderDb(){
  const box = $('#dbList');
  if(!box) return;

  box.innerHTML = '';
  const groups = {};

  sortedItems().forEach(x => {
    (groups[x.it.type] || (groups[x.it.type] = [])).push(x);
  });

  Object.keys(groups).forEach((type, idx) => {
    const details = document.createElement('details');
    details.className = 'dbGroup';
    details.open = idx < 3;
    details.innerHTML = `
      <summary>
        <span>${escapeHtml(typeLabel(type))}</span>
        <b>${groups[type].length}</b>
      </summary>
      <div class="dbGroupItems"></div>
    `;

    const inner = details.querySelector('.dbGroupItems');

    groups[type].forEach(({ it, i }) => {
      const kws = kwList(it).join(', ');
      const el = document.createElement('div');
      el.className = 'dbItem compactItem';
      el.dataset.index = i;
      el.title = t('edit');
      el.innerHTML = `
        <div class="dbItemIcon" aria-hidden="true"></div>
        <div class="dbItemMain">
          <b>${escapeHtml(itemName(it))}</b>
          <small>${escapeHtml(itemRangeLabel(it))}</small><em>${escapeHtml(kws || '-')}</em>
        </div>
        <div class="dbItemPrice">${escapeHtml(itemPriceLabel(it))}</div>
        <div class="dbItemChevron" aria-hidden="true">›</div>
      `;
      el.addEventListener('click', () => openEditItem(i));
      inner.appendChild(el);
    });

    box.appendChild(details);
  });
}

function manualValueFor(it){
  const input = $(`[data-manual-value="${CSS.escape(it.id)}"]`);
  if(!input) return it.min ?? 1;
  const value = input.value === '' ? (it.min ?? 1) : Number(input.value);
  return Number.isFinite(value) ? value : (it.min ?? 1);
}

function quoteItemFromManual(it){
  const matchedValue = manualValueFor(it);
  return {
    ...it,
    qty: 1,
    matchedValue,
    price: itemPriceFor(it, matchedValue),
    title: it.type === 'area' ? typeLabel('base') : typeLabel(it.type || 'extra'),
    description: it.type === 'area' ? `${matchedValue} m²` : itemName(it)
  };
}

function upsertManualQuote(it){
  const existing = (state.quote || []).findIndex(q => q.id === it.id && q.manual);
  const item = {...quoteItemFromManual(it), manual: true};
  if(existing >= 0) state.quote[existing] = item;
  else state.quote.push(item);
}

function removeManualQuote(id){
  state.quote = (state.quote || []).filter(q => !(q.id === id && q.manual));
}

function renderManualList(){
  const box = $('#manualList');
  if(!box) return;
  box.innerHTML = '';
  const groups = {};
  sortedItems().forEach(x => (groups[x.it.type] || (groups[x.it.type] = [])).push(x.it));

  Object.keys(groups).forEach((type, idx) => {
    const details = document.createElement('details');
    details.className = 'manualGroup';
    details.open = idx < 2;
    details.innerHTML = `
      <summary><span>${escapeHtml(typeLabel(type))}</span><b>${groups[type].length}</b></summary>
      <div class="manualGroupItems"></div>
    `;
    const inner = details.querySelector('.manualGroupItems');

    groups[type].forEach(it => {
      const selected = (state.quote || []).some(q => q.id === it.id && q.manual);
      const needsValue = it.min != null && it.max != null;
      const value = selected ? ((state.quote || []).find(q => q.id === it.id && q.manual)?.matchedValue ?? it.min ?? '') : (it.min ?? '');
      const row = document.createElement('label');
      row.className = 'manualItem';
      row.innerHTML = `
        <input type="checkbox" data-manual-check="${escapeHtml(it.id)}" ${selected ? 'checked' : ''}>
        <span class="manualText"><b>${escapeHtml(itemName(it))}</b><small>${escapeHtml(itemPriceLabel(it))}</small></span>
        ${needsValue ? `<input class="manualValue" type="number" inputmode="decimal" data-manual-value="${escapeHtml(it.id)}" value="${escapeHtml(value)}" aria-label="${escapeHtml(t('value'))}">` : ''}
      `;
      inner.appendChild(row);
    });
    box.appendChild(details);
  });

  box.querySelectorAll('[data-manual-check]').forEach(ch => {
    ch.onchange = () => {
      const it = state.items.find(x => x.id === ch.dataset.manualCheck);
      if(!it) return;
      if(ch.checked) upsertManualQuote(it);
      else removeManualQuote(it.id);
      persist();
      renderQuote();
      renderManualList();
    };
  });

  box.querySelectorAll('[data-manual-value]').forEach(inp => {
    inp.oninput = () => {
      const it = state.items.find(x => x.id === inp.dataset.manualValue);
      if(!it) return;
      const ch = box.querySelector(`[data-manual-check="${CSS.escape(it.id)}"]`);
      if(ch && ch.checked){
        upsertManualQuote(it);
        persist();
        renderQuote();
      }
    };
  });
}

function setQuoteMode(mode){
  $$('.modeTile').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
  $('#writePanel')?.classList.toggle('active', mode === 'write');
  $('#checkPanel')?.classList.toggle('active', mode === 'check');
  if(mode === 'check') renderManualList();
}

function fillSettings(){const s=state.settings;['companyName','companyEmail','companyPhone','companyWeb','companyAddress','vatRate','validDays','customerName','customerStreet','customerPostcodeCity','customerCountry','customerEmail','customerPhone'].forEach(id=>{const el=$('#'+id); if(el)el.value=s[id]??''});$('#language').value=s.lang||'nl';$('#themeSelect').value=s.theme||'dark';renderCustomerSelect()}
function clearItemForm(){['editIndex','itemKey','itemName','itemKeywords','itemMin','itemMax','itemMinPrice','itemMaxPrice'].forEach(id=>{const el=$('#'+id); if(el)el.value=''}); const del=$('#deleteItem'); if(del) del.classList.add('hidden')}
function showItemForm(){ $('#itemForm').classList.remove('hidden'); renderTypeOptions(); setPlaceholders(); setTimeout(()=>$('#itemName').focus(),50); }
function openEditItem(i){const it=state.items[i]; if(!it)return; showItemForm(); $('#editIndex').value=i; const del=$('#deleteItem'); if(del) del.classList.remove('hidden'); $('#itemKey').value=it.id||''; $('#itemType').value=it.type||'area'; $('#itemName').value=it.nameRaw||itemName(it)||''; $('#itemKeywords').value=kwList(it).join(', '); $('#itemMin').value=it.min??''; $('#itemMax').value=it.max??''; $('#itemMinPrice').value=it.minPrice??it.price??''; $('#itemMaxPrice').value=it.maxPrice??it.price??'';}
function saveItem(){const editIndex=$('#editIndex').value; const nameText=$('#itemName').value.trim()||'item'; const old=editIndex!==''?state.items[Number(editIndex)]:null; const id=$('#itemKey').value.trim()||old?.id||slugify($('#itemType').value+'_'+nameText+'_'+Date.now()); const min=$('#itemMin').value===''?null:Number($('#itemMin').value), max=$('#itemMax').value===''?null:Number($('#itemMax').value); const minPrice=Number($('#itemMinPrice').value)||0, maxPrice=$('#itemMaxPrice').value===''?minPrice:Number($('#itemMaxPrice').value); const keys=tokenKeysFromText(nameText).filter(k=>LEXICON[k]); const keywordKeys=Array.from(new Set([...keys,...tokenKeysFromText($('#itemKeywords').value).filter(k=>LEXICON[k])])); const fallback=$('#itemType').value==='area'?'house':$('#itemType').value==='day'?'workday':$('#itemType').value==='floor'?'floor':$('#itemType').value==='parking'?'parking_front':'base'; const item={id,type:$('#itemType').value,nameKey:keys.join(' ')||fallback,nameRaw:nameText.replace(/^(huis|woning|haus|wohnung|dom|mieszkanie|garage|werkdag|arbeitstag|dzień roboczy)\s*/i,'').trim(),keywordKeys:keywordKeys.length?keywordKeys:keys,min,max,minPrice,maxPrice,price:minPrice,matchGroup:$('#itemType').value==='area'?'area':undefined}; const normalized=normalizeItem(item); if(editIndex!=='')state.items[Number(editIndex)]=normalized; else state.items.push(normalized); clearItemForm();$('#itemForm').classList.add('hidden');persist();renderDb();renderManualList();}
function emptyCustomer(){return {id:'cust_'+Date.now(),name:'',email:'',phone:'',street:'',postcodeCity:'',country:''}}
function customerFromSettings(){return {id:state.settings.selectedCustomerId||'',name:state.settings.customerName||'',email:state.settings.customerEmail||'',phone:state.settings.customerPhone||'',street:state.settings.customerStreet||'',postcodeCity:state.settings.customerPostcodeCity||'',country:state.settings.customerCountry||''}}
function applyCustomerToQuote(c){state.settings.selectedCustomerId=c.id||'';state.settings.customerName=c.name||'';state.settings.customerEmail=c.email||'';state.settings.customerPhone=c.phone||'';state.settings.customerStreet=c.street||'';state.settings.customerPostcodeCity=c.postcodeCity||'';state.settings.customerCountry=c.country||'';fillSettings();persist();renderCustomerSelect()}
function renderCustomerSelect(){const sel=$('#customerSelect');if(!sel)return;const cur=state.settings.selectedCustomerId||'';sel.innerHTML=`<option value="">${t('noCustomer')}</option>`+(state.customers||[]).map(c=>`<option value="${escapeHtml(c.id)}">${escapeHtml(c.name||c.email||c.phone||c.id)}</option>`).join('');sel.value=cur}
function clearCustomerForm(){['customerEditIndex','custName','custEmail','custPhone','custStreet','custPostcodeCity','custCountry'].forEach(id=>{const el=$('#'+id);if(el)el.value=''})}
function showCustomerForm(){ $('#customerForm').classList.remove('hidden'); setTimeout(()=>$('#custName').focus(),50)}
function openEditCustomer(i){const c=state.customers[i];if(!c)return;showCustomerForm();$('#customerEditIndex').value=i;$('#custName').value=c.name||'';$('#custEmail').value=c.email||'';$('#custPhone').value=c.phone||'';$('#custStreet').value=c.street||'';$('#custPostcodeCity').value=c.postcodeCity||'';$('#custCountry').value=c.country||''}
function saveCustomer(){const i=$('#customerEditIndex').value;const old=i!==''?state.customers[Number(i)]:emptyCustomer();const c={...old,name:$('#custName').value.trim(),email:$('#custEmail').value.trim(),phone:$('#custPhone').value.trim(),street:$('#custStreet').value.trim(),postcodeCity:$('#custPostcodeCity').value.trim(),country:$('#custCountry').value.trim()};if(i!=='')state.customers[Number(i)]=c;else state.customers.push(c);clearCustomerForm();$('#customerForm').classList.add('hidden');persist();renderCustomers();renderCustomerSelect()}
function renderCustomers(){const box=$('#customerList');if(!box)return;box.innerHTML='';(state.customers||[]).forEach((c,i)=>{const el=document.createElement('div');el.className='dbItem customerItem';const meta=[c.email,c.phone,c.street,c.postcodeCity,c.country].filter(Boolean).join(' · ');el.innerHTML=`<div class="dbItemMain"><div class="dbItemTitle"><b>${escapeHtml(c.name||'-')}</b></div><div class="dbMeta"><span>${escapeHtml(meta||'-')}</span></div></div><div class="dbActions"><button data-use-customer="${i}" title="${t('useCustomer')}">✓</button><button data-edit-customer="${i}" title="${t('edit')}">✎</button><button data-remove-customer="${i}" title="${t('remove')}">×</button></div>`;box.appendChild(el)});box.querySelectorAll('[data-use-customer]').forEach(b=>b.onclick=()=>applyCustomerToQuote(state.customers[+b.dataset.useCustomer]));box.querySelectorAll('[data-edit-customer]').forEach(b=>b.onclick=()=>openEditCustomer(+b.dataset.editCustomer));box.querySelectorAll('[data-remove-customer]').forEach(b=>b.onclick=()=>{state.customers.splice(+b.dataset.removeCustomer,1);persist();renderCustomers();renderCustomerSelect()})}
function bind(){setTimeout(()=>$('#splash').classList.add('hide'),2000);if('serviceWorker'in navigator)navigator.serviceWorker.register('./service-worker.js').catch(()=>{});$$('nav button').forEach(btn=>btn.onclick=()=>{$$('nav button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');$$('.page').forEach(p=>p.classList.remove('active'));$('#'+btn.dataset.page).classList.add('active');applyI18n()});$('#language').onchange=e=>{state.settings.lang=e.target.value;persist();applyI18n();fillSettings()};$('#themeSelect').onchange=e=>{state.settings.theme=e.target.value;document.body.classList.toggle('light',state.settings.theme==='light');persist()};$('#analyze').onclick=()=>{state.quote=analyzeText($('#jobText').value);persist();renderQuote()};$('#clearQuote').onclick=()=>{state.quote=[];$('#jobText').value='';persist();renderQuote()};$('#exportPdf').onclick=exportPdf;$('#addItem').onclick=()=>{clearItemForm();showItemForm()};$('#cancelItem').onclick=()=>{clearItemForm();$('#itemForm').classList.add('hidden')};$('#saveItem').onclick=saveItem; const deleteItem=$('#deleteItem'); if(deleteItem) deleteItem.onclick=()=>{const i=$('#editIndex').value; if(i==='')return; state.items.splice(Number(i),1); clearItemForm(); $('#itemForm').classList.add('hidden'); persist(); renderDb(); renderManualList();};$('#addCustomer').onclick=()=>{clearCustomerForm();showCustomerForm()};$('#cancelCustomer').onclick=()=>{clearCustomerForm();$('#customerForm').classList.add('hidden')};$('#saveCustomer').onclick=saveCustomer;$('#customerSelect').onchange=e=>{const c=(state.customers||[]).find(x=>x.id===e.target.value);if(c)applyCustomerToQuote(c);else{state.settings.selectedCustomerId='';persist();}};$$('.modeTile').forEach(btn=>btn.onclick=()=>setQuoteMode(btn.dataset.mode));$$('.help').forEach(b=>b.onclick=()=>alert(t(b.dataset.help)));['companyName','companyEmail','companyPhone','companyWeb','companyAddress','vatRate','validDays','customerName','customerStreet','customerPostcodeCity','customerCountry','customerEmail','customerPhone'].forEach(id=>{const el=$('#'+id); if(el)el.oninput=e=>{state.settings[id]=e.target.value; if(id.startsWith('customer'))state.settings.selectedCustomerId=''; persist(); if(id==='vatRate')renderQuote();}})}
function init(){document.body.classList.toggle('light',state.settings.theme==='light');bind();applyI18n();renderQuote();renderDb();renderCustomers();renderManualList();fillSettings();persist()}init();
