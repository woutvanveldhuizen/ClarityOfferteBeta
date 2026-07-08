const LEXICON = {
  house: {
    nl: 'Huis', de: 'Haus', pl: 'Dom',
    kw: {
      nl: ['huis', 'woning'],
      de: ['haus', 'wohnung'],
      pl: ['dom', 'mieszkanie']
    }
  },
  detached_house: {
    nl: 'Vrijstaand huis', de: 'Freistehendes Haus', pl: 'Dom wolnostojący',
    kw: {
      nl: ['vrijstaand huis', 'vrijstaande woning', 'vrijstaand', 'losstaand huis'],
      de: ['freistehendes haus', 'einfamilienhaus', 'freistehend'],
      pl: ['dom wolnostojący', 'wolnostojący dom']
    }
  },
  apartment: {
    nl: 'Appartement', de: 'Wohnung', pl: 'Apartament',
    kw: {
      nl: ['appartement', 'flat'],
      de: ['wohnung', 'appartement'],
      pl: ['apartament', 'mieszkanie']
    }
  },
  flat: {
    nl: 'Flat', de: 'Wohnblockwohnung', pl: 'Mieszkanie w bloku',
    kw: {
      nl: ['flat', 'flatwoning'],
      de: ['wohnblock', 'wohnung im block'],
      pl: ['blok', 'mieszkanie w bloku']
    }
  },
  garage: {
    nl: 'Garage', de: 'Garage', pl: 'Garaż',
    kw: { nl: ['garage'], de: ['garage'], pl: ['garaż'] }
  },
  detached_garage: {
    nl: 'Losse, vrijstaande garage', de: 'Freistehende Garage', pl: 'Wolnostojący garaż',
    kw: {
      nl: ['losse garage', 'vrijstaande garage', 'garage'],
      de: ['freistehende garage', 'garage'],
      pl: ['wolnostojący garaż', 'garaż']
    }
  },
  parking_front: {
    nl: 'Parkeren voor de deur', de: 'Parken direkt vor der Tür', pl: 'Parking przed drzwiami',
    kw: {
      nl: ['parkeren voor de deur', 'voor de deur'],
      de: ['parken direkt vor der tür', 'direkt vor der tür'],
      pl: ['parking przed drzwiami', 'przed domem']
    }
  },
  parking_far: {
    nl: 'Parkeren op afstand', de: 'Parken mit Abstand', pl: 'Parking dalej od obiektu',
    kw: {
      nl: ['parkeren op afstand', 'in de straat', 'niet goed bereikbaar'],
      de: ['entfernt parken', 'schlecht erreichbar'],
      pl: ['parking daleko', 'trudny dojazd']
    }
  },
  workday: {
    nl: 'Werkdag', de: 'Arbeitstag', pl: 'Dzień roboczy',
    kw: {
      nl: ['werkdag', 'werkdagen', 'dag werk'],
      de: ['arbeitstag', 'arbeitstage'],
      pl: ['dzień roboczy', 'dni robocze']
    }
  },
  floor: {
    nl: 'Verdieping', de: 'Etage', pl: 'Piętro',
    kw: {
      nl: ['verdieping', 'verdiepingen'],
      de: ['etage', 'etagen'],
      pl: ['piętro', 'piętra']
    }
  }
};

const TOKEN_MAP = {
  huis: 'house',
  woning: 'house',
  appartement: 'apartment',
  flat: 'flat',
  garage: 'garage',
  parkeren: 'parking_front',
  werkdag: 'workday',
  werkdagen: 'workday',
  verdieping: 'floor',
  verdiepingen: 'floor',

  haus: 'house',
  wohnung: 'apartment',
  appartement: 'apartment',
  garage: 'garage',
  parken: 'parking_front',
  arbeitstag: 'workday',
  arbeitstage: 'workday',
  etage: 'floor',
  etagen: 'floor',

  dom: 'house',
  mieszkanie: 'apartment',
  apartament: 'apartment',
  garaż: 'garage',
  parking: 'parking_front',
  dzień: 'workday',
  dni: 'workday',
  robocze: 'workday',
  piętro: 'floor',
  piętra: 'floor'
};

const DefaultItems = [
  {
    id: 'building_house',
    type: 'building',
    titleKey: 'house',
    descriptionRaw: 'Woning algemeen',
    keywordKeys: ['house'],
    unit: 'm2',
    priceMode: 'table',
    priceRows: [
      { value: '10-20', minPrice: 600, maxPrice: 900 },
      { value: '20-50', minPrice: 900, maxPrice: 1600 },
      { value: '50-80', minPrice: 1600, maxPrice: 2300 },
      { value: '80-100', minPrice: 2300, maxPrice: 2800 }
    ]
  },
  {
    id: 'building_detached_house',
    type: 'building',
    titleKey: 'detached_house',
    descriptionRaw: 'Vrijstaande woning',
    keywordKeys: ['detached_house', 'house'],
    unit: 'm2',
    priceMode: 'table',
    priceRows: [
      { value: '10-20', minPrice: 700, maxPrice: 1000 },
      { value: '20-50', minPrice: 1000, maxPrice: 1800 },
      { value: '50-100', minPrice: 1800, maxPrice: 3000 },
      { value: '100-150', minPrice: 3000, maxPrice: 4200 }
    ]
  },
  {
    id: 'building_apartment',
    type: 'building',
    titleKey: 'apartment',
    descriptionRaw: 'Appartement of flatwoning',
    keywordKeys: ['apartment', 'flat'],
    unit: 'm2',
    priceMode: 'table',
    priceRows: [
      { value: '10-20', minPrice: 500, maxPrice: 800 },
      { value: '20-50', minPrice: 800, maxPrice: 1400 },
      { value: '50-100', minPrice: 1400, maxPrice: 2600 }
    ]
  },
  {
    id: 'garage_detached',
    type: 'garage',
    titleKey: 'garage',
    descriptionKey: 'detached_garage',
    keywordKeys: ['detached_garage', 'garage'],
    priceMode: 'fixed',
    price: 750
  },
  {
    id: 'parking_front',
    type: 'parking',
    titleKey: 'parking_front',
    descriptionRaw: '',
    keywordKeys: ['parking_front'],
    priceMode: 'fixed',
    price: 0
  },
  {
    id: 'parking_far',
    type: 'parking',
    titleKey: 'parking_far',
    descriptionRaw: '',
    keywordKeys: ['parking_far'],
    priceMode: 'fixed',
    price: 150
  },
  {
    id: 'workday',
    type: 'labor',
    titleKey: 'workday',
    descriptionRaw: 'Arbeid per werkdag',
    keywordKeys: ['workday'],
    unit: 'days',
    priceMode: 'table',
    priceRows: [
      { value: '1-25', minPrice: 450, maxPrice: 11250 }
    ]
  },
  {
    id: 'floor_2',
    type: 'floor',
    titleKey: 'floor',
    descriptionRaw: '2e verdieping',
    keywordKeys: ['floor'],
    unit: 'amount',
    priceMode: 'table',
    priceRows: [
      { value: '2', minPrice: 250, maxPrice: 250 }
    ]
  },
  {
    id: 'kitchen_left_side_demolition',
    type: 'kitchen',
    title: { nl: 'Keuken', de: 'Küche', pl: 'Kuchnia' },
    description: {
      nl: 'Linker keukenzijde demonteren en afvoeren, inclusief spoelbak, werkblad en onderkasten',
      de: 'Demontage, Abtransport und fachgerechte Entsorgung der linken Küchenseite einschließlich Spüle, Arbeitsplatte und Unterschränken',
      pl: 'Demontaż i wywóz lewej strony kuchni wraz ze zlewem, blatem i dolnymi szafkami'
    },
    keywords: ['keuken links', 'linker keukenzijde', 'spoelbak', 'werkblad', 'onderkasten', 'küchenseite', 'spüle', 'arbeitsplatte', 'unterschränke'],
    priceMode: 'fixed',
    price: 150
  },
  {
    id: 'kitchen_lower_cabinet_contents',
    type: 'kitchen',
    title: { nl: 'Keukeninhoud', de: 'Kücheninhalt', pl: 'Zawartość kuchni' },
    description: {
      nl: 'Inhoud van onderkasten en spullen op het werkblad afvoeren',
      de: 'Abtransport und fachgerechte Entsorgung des Inhalts der Unterschränke sowie der auf der Arbeitsplatte befindlichen Gegenstände',
      pl: 'Wywóz zawartości dolnych szafek oraz przedmiotów z blatu'
    },
    keywords: ['inhoud onderkasten', 'werkblad spullen', 'unterschränke inhalt', 'arbeitsplatte gegenstände'],
    priceMode: 'fixed',
    price: 40
  },
  {
    id: 'kitchen_right_upper_demolition',
    type: 'kitchen',
    title: { nl: 'Keuken bovenkasten', de: 'Küchenoberschränke', pl: 'Górne szafki kuchenne' },
    description: {
      nl: 'Rechter bovenste keukendeel demonteren en afvoeren',
      de: 'Demontage, Abtransport und fachgerechte Entsorgung des rechten oberen Teils der Küche',
      pl: 'Demontaż i wywóz prawej górnej części kuchni'
    },
    keywords: ['rechter bovenste keuken', 'bovenkasten', 'oberschränke', 'rechter oberer teil küche'],
    priceMode: 'fixed',
    price: 120
  },
  {
    id: 'kitchen_right_upper_contents',
    type: 'kitchen',
    title: { nl: 'Keukeninhoud', de: 'Kücheninhalt', pl: 'Zawartość kuchni' },
    description: {
      nl: 'Inhoud van rechter bovenste keukendeel afvoeren',
      de: 'Abtransport und fachgerechte Entsorgung des Inhalts des rechten oberen Küchenteils',
      pl: 'Wywóz zawartości prawej górnej części kuchni'
    },
    keywords: ['inhoud bovenkasten', 'rechter bovenste inhoud', 'inhalt rechter oberer küchenteil'],
    priceMode: 'fixed',
    price: 50
  },
  {
    id: 'kitchen_right_lower_demolition',
    type: 'kitchen',
    title: { nl: 'Keuken onderkasten', de: 'Küchenunterschränke', pl: 'Dolne szafki kuchenne' },
    description: {
      nl: 'Rechter onderste keukendeel demonteren en afvoeren',
      de: 'Demontage, Abtransport und fachgerechte Entsorgung des rechten unteren Teils der Küche',
      pl: 'Demontaż i wywóz prawej dolnej części kuchni'
    },
    keywords: ['rechter onderste keuken', 'onderkasten', 'unterschränke', 'rechter unterer teil küche'],
    priceMode: 'fixed',
    price: 180
  },
  {
    id: 'kitchen_right_lower_contents',
    type: 'kitchen',
    title: { nl: 'Keukeninhoud', de: 'Kücheninhalt', pl: 'Zawartość kuchni' },
    description: {
      nl: 'Inhoud van rechter onderste keukendeel afvoeren',
      de: 'Abtransport und fachgerechte Entsorgung des Inhalts des rechten unteren Küchenteils',
      pl: 'Wywóz zawartości prawej dolnej części kuchni'
    },
    keywords: ['inhoud onderkasten rechts', 'rechter onderste inhoud', 'inhalt rechter unterer küchenteil'],
    priceMode: 'fixed',
    price: 80
  },
  {
    id: 'single_wall_cabinet_with_contents',
    type: 'kitchen',
    title: { nl: 'Hangkast', de: 'Hängeschrank', pl: 'Szafka wisząca' },
    description: {
      nl: 'Losse hangkast demonteren en afvoeren, inclusief volledige inhoud',
      de: 'Demontage, Abtransport und fachgerechte Entsorgung eines einzelnen Hängeschranks einschließlich des gesamten Inhalts',
      pl: 'Demontaż i wywóz pojedynczej szafki wiszącej wraz z całą zawartością'
    },
    keywords: ['hangkast', 'hangkast inhoud', 'hängeschrank', 'szafka wisząca'],
    priceMode: 'fixed',
    price: 50
  },
  {
    id: 'folding_chair_upholstered',
    type: 'furniture',
    title: { nl: 'Klapstoel', de: 'Klappstuhl', pl: 'Krzesło składane' },
    description: {
      nl: 'Klapstoel met bekleding afvoeren',
      de: 'Abtransport und fachgerechte Entsorgung eines Klappstuhls mit Polsterung',
      pl: 'Wywóz krzesła składanego z tapicerką'
    },
    keywords: ['klapstoel', 'stoel', 'bekleding', 'klappstuhl', 'polsterung'],
    priceMode: 'fixed',
    price: 20
  },
  {
    id: 'small_table_with_contents',
    type: 'furniture',
    title: { nl: 'Kleine tafel', de: 'Kleiner Tisch', pl: 'Mały stół' },
    description: {
      nl: 'Kleine tafel afvoeren, inclusief spullen erop en eronder',
      de: 'Demontage, Abtransport und fachgerechte Entsorgung eines kleinen Tisches sowie der darauf und darunter befindlichen Gegenstände',
      pl: 'Demontaż i wywóz małego stołu wraz z rzeczami na nim i pod nim'
    },
    keywords: ['kleine tafel', 'tafel met spullen', 'kleiner tisch', 'mały stół'],
    priceMode: 'fixed',
    price: 40
  },
  {
    id: 'lamp_disposal',
    type: 'extra',
    title: { nl: 'Lamp', de: 'Lampe', pl: 'Lampa' },
    description: {
      nl: 'Lamp afvoeren',
      de: 'Abtransport und fachgerechte Entsorgung einer Lampe',
      pl: 'Wywóz lampy'
    },
    keywords: ['lamp', 'lampe', 'lampa'],
    priceMode: 'fixed',
    price: 15
  },
  {
    id: 'old_tv_disposal',
    type: 'extra',
    title: { nl: 'Televisie', de: 'Fernseher', pl: 'Telewizor' },
    description: {
      nl: 'Oude televisie afvoeren',
      de: 'Abtransport und fachgerechte Entsorgung eines alten Fernsehers',
      pl: 'Wywóz starego telewizora'
    },
    keywords: ['televisie', 'tv', 'oude tv', 'fernseher', 'telewizor'],
    priceMode: 'fixed',
    price: 15
  },
  {
    id: 'living_room_plants_all',
    type: 'extra',
    title: { nl: 'Planten', de: 'Pflanzen', pl: 'Rośliny' },
    description: {
      nl: 'Alle planten in de woonkamer afvoeren',
      de: 'Abtransport und fachgerechte Entsorgung sämtlicher im gesamten Wohnbereich befindlichen Pflanzen',
      pl: 'Wywóz wszystkich roślin z części mieszkalnej'
    },
    keywords: ['planten woonkamer', 'alle planten', 'pflanzen wohnbereich', 'rośliny'],
    priceMode: 'fixed',
    price: 80
  },
  {
    id: 'large_tv_cabinet',
    type: 'furniture',
    title: { nl: 'TV-kast', de: 'TV-Schrank', pl: 'Szafka RTV' },
    description: {
      nl: 'Grote TV-kast demonteren en afvoeren',
      de: 'Demontage, Abtransport und fachgerechte Entsorgung eines großen TV-Schranks',
      pl: 'Demontaż i wywóz dużej szafki RTV'
    },
    keywords: ['tv-kast', 'tv kast', 'televisiekast', 'tv-schrank', 'szafka rtv'],
    priceMode: 'fixed',
    price: 80
  },
  {
    id: 'ikea_tables',
    type: 'furniture',
    title: { nl: 'IKEA-tafel', de: 'IKEA-Tisch', pl: 'Stół IKEA' },
    description: {
      nl: 'IKEA-tafels afvoeren, prijs omgerekend per stuk op basis van 3 stuks voor €20',
      de: 'Abtransport und fachgerechte Entsorgung von IKEA-Tischen, umgerechnet pro Stück auf Basis von drei Tischen für 20 €',
      pl: 'Wywóz stołów IKEA, cena przeliczona za sztukę na podstawie 3 sztuk za 20 €'
    },
    keywords: ['ikea tafel', 'ikea tafels', 'ikea tisch', 'ikea-tischen', 'stół ikea'],
    unit: 'amount',
    priceMode: 'table',
    priceRows: [
      { value: '1-10', minPrice: 6.67, maxPrice: 66.67 }
    ]
  },
  {
    id: 'couch_all_elements',
    type: 'furniture',
    title: { nl: 'Bank', de: 'Couch', pl: 'Kanapa' },
    description: {
      nl: 'Alle elementen van een bank afvoeren',
      de: 'Abtransport und fachgerechte Entsorgung sämtlicher Elemente einer Couch',
      pl: 'Wywóz wszystkich elementów kanapy'
    },
    keywords: ['bank', 'bankstel', 'couch', 'kanapa'],
    priceMode: 'fixed',
    price: 280
  },
  {
    id: 'black_wood_wall_shelves_with_contents',
    type: 'furniture',
    title: { nl: 'Wandrekken', de: 'Holzwandregale', pl: 'Regały ścienne' },
    description: {
      nl: 'Zwarte houten wandrekken demonteren en afvoeren, inclusief volledige inhoud',
      de: 'Demontage, Abtransport und fachgerechte Entsorgung schwarzer Holzwandregale einschließlich des gesamten Inhalts',
      pl: 'Demontaż i wywóz czarnych drewnianych regałów ściennych wraz z całą zawartością'
    },
    keywords: ['wandrek', 'wandrekken', 'zwarte houten wandrekken', 'holzwandregale', 'regały ścienne'],
    priceMode: 'fixed',
    price: 80
  },
  {
    id: 'very_large_wardrobe_mirrors',
    type: 'furniture',
    title: { nl: 'Kledingkast', de: 'Kleiderschrank', pl: 'Szafa ubraniowa' },
    description: {
      nl: 'Zeer grote kledingkast met spiegeldeuren demonteren en afvoeren',
      de: 'Demontage, Abtransport und fachgerechte Entsorgung eines sehr großen Kleiderschranks mit Spiegeltüren',
      pl: 'Demontaż i wywóz bardzo dużej szafy z lustrzanymi drzwiami'
    },
    keywords: ['kledingkast', 'grote kledingkast', 'spiegeldeuren', 'kleiderschrank', 'spiegeltüren', 'szafa'],
    priceMode: 'fixed',
    price: 350
  },
  {
    id: 'wooden_bed',
    type: 'furniture',
    title: { nl: 'Bed', de: 'Holzbett', pl: 'Łóżko drewniane' },
    description: {
      nl: 'Houten bed demonteren en afvoeren',
      de: 'Demontage, Abtransport und fachgerechte Entsorgung eines Holzbettes',
      pl: 'Demontaż i wywóz drewnianego łóżka'
    },
    keywords: ['houten bed', 'bed', 'holzbett', 'łóżko'],
    priceMode: 'fixed',
    price: 80
  },
  {
    id: 'mattress_disposal',
    type: 'furniture',
    title: { nl: 'Matras', de: 'Matratze', pl: 'Materac' },
    description: {
      nl: 'Matras afvoeren',
      de: 'Abtransport und fachgerechte Entsorgung einer Matratze',
      pl: 'Wywóz materaca'
    },
    keywords: ['matras', 'matratze', 'materac'],
    priceMode: 'fixed',
    price: 50
  },
  {
    id: 'clothing_all_home',
    type: 'extra',
    title: { nl: 'Kleding', de: 'Kleidungsstücke', pl: 'Odzież' },
    description: {
      nl: 'Alle kledingstukken in de woning afvoeren',
      de: 'Abtransport und fachgerechte Entsorgung sämtlicher in der Wohnung befindlichen Kleidungsstücke',
      pl: 'Wywóz wszystkich ubrań znajdujących się w mieszkaniu'
    },
    keywords: ['kleding', 'kledingstukken', 'alle kleding', 'kleidungsstücke', 'odzież'],
    priceMode: 'fixed',
    price: 60
  },
  {
    id: 'bathroom_wall_cabinet',
    type: 'bathroom',
    title: { nl: 'Badkamer-hangkast', de: 'Badezimmer-Hängeschrank', pl: 'Wisząca szafka łazienkowa' },
    description: {
      nl: 'Badkamer-hangkast demonteren en afvoeren',
      de: 'Demontage, Abtransport und fachgerechte Entsorgung eines Badezimmer-Hängeschranks',
      pl: 'Demontaż i wywóz wiszącej szafki łazienkowej'
    },
    keywords: ['badkamer hangkast', 'badkamerkast', 'badezimmer-hängeschrank', 'szafka łazienkowa'],
    priceMode: 'fixed',
    price: 40
  },
  {
    id: 'washbasin_base_cabinet',
    type: 'bathroom',
    title: { nl: 'Wastafelonderkast', de: 'Waschtischunterschrank', pl: 'Szafka pod umywalkę' },
    description: {
      nl: 'Wastafelonderkast afvoeren',
      de: 'Abtransport und fachgerechte Entsorgung eines Waschtischunterschranks',
      pl: 'Wywóz szafki pod umywalkę'
    },
    keywords: ['wastafelonderkast', 'wastafel kast', 'waschtischunterschrank', 'szafka pod umywalkę'],
    priceMode: 'fixed',
    price: 20
  },
  {
    id: 'bathroom_tall_cabinet_with_contents',
    type: 'bathroom',
    title: { nl: 'Badkamerkast', de: 'Hochschrank im Badezimmer', pl: 'Wysoka szafka łazienkowa' },
    description: {
      nl: 'Hoge badkamerkast afvoeren, inclusief volledige inhoud',
      de: 'Abtransport und fachgerechte Entsorgung eines Hochschranks im Badezimmer einschließlich des gesamten Inhalts',
      pl: 'Wywóz wysokiej szafki łazienkowej wraz z całą zawartością'
    },
    keywords: ['hoge badkamerkast', 'badkamerkast inhoud', 'hochschrank badezimmer', 'wysoka szafka łazienkowa'],
    priceMode: 'fixed',
    price: 80
  },
  {
    id: 'white_hall_commode_with_contents',
    type: 'furniture',
    title: { nl: 'Commode', de: 'Kommode', pl: 'Komoda' },
    description: {
      nl: 'Witte commode in de hal afvoeren, inclusief volledige inhoud',
      de: 'Abtransport und fachgerechte Entsorgung einer weißen Kommode im Flur einschließlich des gesamten Inhalts',
      pl: 'Wywóz białej komody w korytarzu wraz z całą zawartością'
    },
    keywords: ['commode', 'witte commode', 'hal commode', 'kommode flur', 'komoda'],
    priceMode: 'fixed',
    price: 70
  },
  {
    id: 'balcony_complete_contents',
    type: 'outdoor',
    title: { nl: 'Balkon', de: 'Balkon', pl: 'Balkon' },
    description: {
      nl: 'Alle spullen op het balkon afvoeren, inclusief stoelen, tafel, parasol, ligbed en plantenbakken',
      de: 'Abtransport und fachgerechte Entsorgung sämtlicher auf dem Balkon befindlichen Gegenstände, einschließlich Stühlen, Tisch, Sonnenschirm, Liege und Pflanzengefäßen',
      pl: 'Wywóz wszystkich przedmiotów z balkonu, w tym krzeseł, stołu, parasola, leżaka i donic'
    },
    keywords: ['balkon spullen', 'balkon stoelen tafel parasol', 'balkon', 'sonnenschirm', 'liege', 'plantenbakken'],
    priceMode: 'fixed',
    price: 140
  }
];

function currentLang() {
  return state?.settings?.lang || 'nl';
}

function lexLabel(key, lang = currentLang()) {
  return LEXICON[key]?.[lang] || key;
}

function keywordTextForKey(key, lang = currentLang()) {
  return LEXICON[key]?.kw?.[lang] || [lexLabel(key, lang)];
}

function tokenKeysFromText(text) {
  return String(text || '')
    .toLowerCase()
    .split(/[\s,;]+/)
    .map(w => w.trim())
    .filter(Boolean)
    .map(w => TOKEN_MAP[w] || w);
}

function itemTitle(it, lang = currentLang()) {
  if (it.titleKey) return lexLabel(it.titleKey, lang);
  if (it.title && typeof it.title === 'object') return it.title[lang] || it.title.nl || it.id;
  return it.titleRaw || it.nameRaw || it.label || it.id;
}

function itemDescription(it, lang = currentLang()) {
  if (it.descriptionKey) return lexLabel(it.descriptionKey, lang);
  if (it.description && typeof it.description === 'object') return it.description[lang] || it.description.nl || '';
  return it.descriptionRaw || '';
}

function itemName(it) {
  const desc = itemDescription(it);
  return [itemTitle(it), desc].filter(Boolean).join(' ');
}

function kwList(it, lang = currentLang()) {
  const out = [];

  (it.keywordKeys || []).forEach(k => {
    keywordTextForKey(k, lang).forEach(x => out.push(x));
  });

  if (it.keywords) {
    if (Array.isArray(it.keywords)) out.push(...it.keywords);
    else out.push(...(it.keywords[lang] || it.keywords.nl || []));
  }

  return Array.from(new Set(out.filter(Boolean)));
}

function normalizeValueRow(row) {
  if (!row) return null;

  let minValue = row.minValue;
  let maxValue = row.maxValue;

  if (minValue == null && maxValue == null) {
    const parsed = parseValueRange(row.value || '');
    if (parsed) {
      minValue = parsed.min;
      maxValue = parsed.max;
    }
  }

  minValue = Number(minValue);
  maxValue = maxValue == null || maxValue === '' ? minValue : Number(maxValue);
  if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) return null;

  const low = Math.min(minValue, maxValue);
  const high = Math.max(minValue, maxValue);
  const minPrice = Number(row.minPrice ?? row.price ?? 0) || 0;
  const maxPriceRaw = row.maxPrice ?? row.price ?? row.minPrice;
  const maxPrice = maxPriceRaw === '' || maxPriceRaw == null ? minPrice : Number(maxPriceRaw) || minPrice;

  return {
    minValue: low,
    maxValue: high,
    value: low === high ? String(low) : `${low}-${high}`,
    minPrice,
    maxPrice
  };
}

function normalizeItem(it) {
  const out = { ...it };

  if (out.type === 'area' || out.type === 'base') out.type = 'building';
  if (out.type === 'day') out.type = 'labor';
  if (out.type === 'furniture' && String(out.id || '').includes('garage')) out.type = 'garage';
  if (!out.type) out.type = out.priceMode === 'table' ? 'building' : 'extra';

  // Migrate older v2.0/v2.1 range objects to the new price table model.
  if (!out.priceRows && out.min != null && out.max != null) {
    out.priceRows = [
      {
        value: `${out.min}-${out.max}`,
        minPrice: Number(out.minPrice ?? out.price ?? 0) || 0,
        maxPrice: Number(out.maxPrice ?? out.price ?? out.minPrice ?? 0) || 0
      }
    ];
  }

  if (!out.unit) {
    if (out.type === 'building') out.unit = 'm2';
    else if (out.type === 'labor') out.unit = 'days';
    else out.unit = 'amount';
  }

  if (!out.titleKey && out.nameKey) {
    const nameKeys = String(out.nameKey).split(/\s+/).filter(Boolean);
    if (nameKeys.includes('detached') && nameKeys.includes('garage')) {
      out.titleKey = 'garage';
      out.descriptionKey = 'detached_garage';
    } else {
      out.titleKey = nameKeys[0];
    }
  }

  if (!out.titleKey && out.name && typeof out.name === 'object') {
    out.titleRaw = out.name.nl || out.name.de || out.name.pl || out.id;
  }

  if (!out.titleKey && !out.titleRaw && out.nameRaw) {
    out.titleRaw = out.nameRaw;
  }

  if (!out.keywordKeys && out.keywords) {
    const src = Array.isArray(out.keywords)
      ? out.keywords
      : (out.keywords.nl || out.keywords.de || out.keywords.pl || []);
    out.keywordKeys = Array.from(new Set(src.flatMap(tokenKeysFromText).filter(k => LEXICON[k])));
  }

  if (!out.keywordKeys || !out.keywordKeys.length) {
    const keys = tokenKeysFromText([out.titleRaw, out.descriptionRaw, out.titleKey, out.descriptionKey].filter(Boolean).join(' '));
    out.keywordKeys = Array.from(new Set(keys.filter(k => LEXICON[k])));
  }

  if (!out.keywordKeys || !out.keywordKeys.length) out.keywordKeys = [out.titleKey || out.type];

  if (out.priceRows) {
    out.priceRows = out.priceRows.map(normalizeValueRow).filter(Boolean);
  }

  if (!out.priceMode) {
    out.priceMode = out.priceRows?.length ? 'table' : out.price != null ? 'fixed' : 'none';
  }

  if (out.priceMode === 'fixed') {
    out.price = Number(out.price ?? out.minPrice ?? 0) || 0;
  }

  return out;
}

function ensureItems() {
  if (!Array.isArray(state.items)) {
    state.items = [];
  }

  // Voeg nieuwe standaardposten toe zonder bestaande gebruikersposten te overschrijven.
  // Zo krijgen bestaande installaties deze release-data ook na een update.
  const existingIds = new Set(state.items.map(item => item && item.id).filter(Boolean));
  DefaultItems.forEach(defaultItem => {
    if (!existingIds.has(defaultItem.id)) {
      state.items.push(JSON.parse(JSON.stringify(defaultItem)));
    }
  });

  const normalized = state.items.map(normalizeItem);
  const merged = [];
  const mergeMap = new Map();

  normalized.forEach(item => {
    const canMerge = item.priceMode === 'table' && (item.priceRows || []).length;
    const key = [
      item.type,
      item.titleKey || item.titleRaw || '',
      item.descriptionKey || item.descriptionRaw || '',
      item.unit || ''
    ].join('|');

    if (!canMerge || !key.trim()) {
      merged.push(item);
      return;
    }

    if (!mergeMap.has(key)) {
      const clone = { ...item, priceRows: [...(item.priceRows || [])] };
      mergeMap.set(key, clone);
      merged.push(clone);
      return;
    }

    const existing = mergeMap.get(key);
    existing.priceRows.push(...(item.priceRows || []));
  });

  merged.forEach(item => {
    if (item.priceRows) {
      item.priceRows = item.priceRows
        .map(normalizeValueRow)
        .filter(Boolean)
        .sort((a, b) => {
              const ar = parseValueRange(a);
          const br = parseValueRange(b);
          return (ar?.min ?? 0) - (br?.min ?? 0);
        });
    }
  });

  state.items = merged;
}

function parseValueRange(value) {
  if (value && typeof value === 'object') {
    const min = Number(value.minValue);
    const max = value.maxValue == null || value.maxValue === '' ? min : Number(value.maxValue);
    if (Number.isFinite(min) && Number.isFinite(max)) {
      return { min: Math.min(min, max), max: Math.max(min, max) };
    }
  }

  const nums = Array.from(String(value || '').matchAll(/\d+(?:[,.]\d+)?/g))
    .map(m => Number(m[0].replace(',', '.')));

  if (!nums.length) return null;
  const min = nums[0];
  const max = nums.length > 1 ? nums[1] : nums[0];
  return { min: Math.min(min, max), max: Math.max(min, max) };
}

function priceRowForValue(it, value) {
  const rows = it.priceRows || [];
  const numberValue = Number(value);

  if (!rows.length) return null;

  if (Number.isFinite(numberValue)) {
    const exact = rows.find(row => {
      const r = parseValueRange(row);
      return r && r.min <= numberValue && numberValue <= r.max;
    });
    if (exact) return exact;
  }

  return rows[0];
}

function itemPriceFor(it, value) {
  if (it.priceMode === 'none') return 0;
  if (it.priceMode === 'fixed') return Number(it.price || 0) || 0;

  const row = priceRowForValue(it, value);
  if (!row) return 0;

  const r = parseValueRange(row);
  if (!r || r.min === r.max) return Number(row.minPrice || 0) || 0;

  const n = Math.max(r.min, Math.min(r.max, Number(value) || r.min));
  const a = Number(row.minPrice || 0) || 0;
  const b = Number(row.maxPrice || a) || 0;
  return Math.round((a + ((n - r.min) / (r.max - r.min)) * (b - a)) * 100) / 100;
}

function itemPriceLabel(it) {
  if (it.priceMode === 'none') return '—';
  if (it.priceMode === 'fixed') return fmtMoney(it.price || 0);

  const rows = it.priceRows || [];
  if (!rows.length) return fmtMoney(0);

  const prices = rows.flatMap(r => [Number(r.minPrice || 0), Number(r.maxPrice || 0)]);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? fmtMoney(min) : `${fmtMoney(min)} - ${fmtMoney(max)}`;
}

function itemValueLabel(it) {
  if (it.priceMode !== 'table' || !(it.priceRows || []).length) return '';
  if (it.priceRows.length === 1) {
    const row = it.priceRows[0];
    const label = row.minValue === row.maxValue ? String(row.minValue) : `${row.minValue}-${row.maxValue}`;
    return label + unitSuffix(it);
  }
  return `${it.priceRows.length} waarden`;
}

function unitSuffix(it) {
  if (it.unit === 'm2') return ' m²';
  if (it.unit === 'days') return ' dagen';
  return '';
}
