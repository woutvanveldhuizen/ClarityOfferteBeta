function allNumbers(text) {
  return Array.from(String(text || '').matchAll(/\d+(?:[,.]\d+)?/g))
    .map(m => Number(m[0].replace(',', '.')));
}

function areaFromText(text) {
  const lower = String(text || '').toLowerCase();
  const direct = lower.match(/(\d{1,4})(?:[\s.,-]*)(?:m2|m²|qm|㎡|m kw|metr|meter|vierkante meter|quadratmeter)/i);
  if (direct) return Number(direct[1]);

  const afterBuilding = lower.match(/(?:huis|woning|vrijstaand huis|vrijstaande woning|haus|wohnung|dom|mieszkanie|appartement|flat)[^0-9]{0,24}(\d{1,4})/i);
  return afterBuilding ? Number(afterBuilding[1]) : null;
}

function quantityForItem(text, it, area) {
  const lower = String(text || '').toLowerCase();

  if (it.unit === 'm2') return area ?? defaultValueForItem(it);

  if (it.unit === 'days') {
    const m = lower.match(/(\d{1,2})\s*(werkdagen|werkdag|arbeitstage|arbeitstag|dni|dzień|dzien)/i);
    return m ? Number(m[1]) : defaultValueForItem(it);
  }

  if (it.type === 'floor') {
    const m = lower.match(/(\d{1,2})\s*(verdiepingen|verdieping|etagen|etage|pi[eę]tr)/i);
    return m ? Number(m[1]) : defaultValueForItem(it);
  }

  return defaultValueForItem(it);
}

function defaultValueForItem(it) {
  const row = (it.priceRows || [])[0];
  const r = row ? parseValueRange(row.value) : null;
  return r ? r.min : 1;
}

function keywordScore(it, lower) {
  let score = 0;

  kwList(it).forEach(keyword => {
    const k = String(keyword || '').toLowerCase();
    if (!k) return;
    if (lower.includes(k)) score += 20 + Math.min(20, k.length);
  });

  return score;
}

function scoreItem(it, lower, area) {
  let score = keywordScore(it, lower);

  if (!score) return 0;

  if (it.unit === 'm2' && area != null) {
    const row = priceRowForValue(it, area);
    if (row) score += 80;
  }

  if (it.type === 'parking' && /(parkeren|parking|parken|voor de deur|direkt|drzwi)/i.test(lower)) score += 40;
  if (it.type === 'garage' && /(garage|garaż)/i.test(lower)) score += 40;
  if (it.unit === 'days' && /(werkdag|werkdagen|arbeitstag|arbeitstage|dni robocze|dzień roboczy)/i.test(lower)) score += 40;

  return score;
}

function matchGroupForItem(it) {
  if (it.type === 'building') return 'building';
  if (it.type === 'parking') return 'parking';
  if (it.type === 'labor') return 'labor';
  if (it.type === 'floor') return 'floor';
  return it.id;
}

function quoteLineFromItem(it, matchedValue, manual = false) {
  return {
    ...it,
    qty: 1,
    manual,
    matchedValue,
    price: itemPriceFor(it, matchedValue),
    title: itemTitle(it),
    description: quoteDescriptionForItem(it, matchedValue)
  };
}

function quoteDescriptionForItem(it, value) {
  const desc = itemDescription(it);
  if (it.unit === 'm2' && value != null) {
    return desc ? `${value} m² · ${desc}` : `${value} m²`;
  }
  if (it.unit === 'days' && value != null) {
    return `${value} ${value === 1 ? 'werkdag' : 'werkdagen'}`;
  }
  return desc;
}

function analyzeText(txt) {
  const raw = txt || '';
  const lower = raw.toLowerCase();
  const area = areaFromText(raw);
  const candidates = [];

  state.items.forEach(it => {
    const score = scoreItem(it, lower, area);
    if (score <= 0) return;

    const matchedValue = quantityForItem(raw, it, area);
    candidates.push({ it, score, matchedValue });
  });

  candidates.sort((a, b) => b.score - a.score);

  const chosen = new Map();
  candidates.forEach(candidate => {
    const group = matchGroupForItem(candidate.it);
    if (chosen.has(group)) return;
    chosen.set(group, quoteLineFromItem(candidate.it, candidate.matchedValue, false));
  });

  return Array.from(chosen.values());
}
