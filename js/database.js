const LEXICON={
 home:{nl:'Woning',de:'Wohnung',pl:'Mieszkanie',kw:{nl:['huis','woning','appartement'],de:['haus','wohnung','appartement'],pl:['dom','mieszkanie','apartament']}},
 house:{nl:'Huis',de:'Haus',pl:'Dom',kw:{nl:['huis','woning'],de:['haus','wohnung'],pl:['dom','mieszkanie']}},
 apartment:{nl:'Appartement',de:'Wohnung',pl:'Apartament',kw:{nl:['appartement','flat'],de:['wohnung','appartement'],pl:['apartament','mieszkanie']}},
 garage:{nl:'Garage',de:'Garage',pl:'Garaż',kw:{nl:['garage'],de:['garage'],pl:['garaż']}},
 detached:{nl:'Losse',de:'Freistehende',pl:'Wolnostojący',kw:{nl:['losse','vrijstaande'],de:['freistehende'],pl:['wolnostojący']}},
 parking_front:{nl:'Parkeren voor de deur',de:'Parken direkt vor der Tür',pl:'Parking przed drzwiami',kw:{nl:['parkeren voor de deur','voor de deur'],de:['direkt vor der tür','parken vor der tür'],pl:['parking przed drzwiami','przed domem']}},
 parking_far:{nl:'Parkeren op afstand',de:'Parken mit Abstand',pl:'Parking dalej od obiektu',kw:{nl:['in de straat','op afstand','niet goed bereikbaar'],de:['entfernt parken','schlecht erreichbar'],pl:['parking daleko','trudny dojazd']}},
 workday:{nl:'Werkdag arbeid',de:'Arbeitstag',pl:'Dzień roboczy',kw:{nl:['werkdag','werkdagen','dag werk'],de:['arbeitstag','arbeitstage'],pl:['dzień roboczy','dni robocze']}},
 floor:{nl:'Verdieping',de:'Etage',pl:'Piętro',kw:{nl:['verdieping','verdiepingen'],de:['etage','etagen'],pl:['piętro','piętra']}},
 base:{nl:'Gebouw',de:'Gebäude',pl:'Budynek',kw:{nl:['basisobject'],de:['grundobjekt'],pl:['obiekt bazowy']}}
};
const TOKEN_MAP={
 huis:'house',woning:'home',appartement:'apartment',garage:'garage',losse:'detached',vrijstaande:'detached',werkdag:'workday',arbeid:'workday',verdieping:'floor',parkeren:'parking_front',
 haus:'house',wohnung:'home',freistehende:'detached',arbeitstag:'workday',etage:'floor',parken:'parking_front',
 dom:'house',mieszkanie:'home',apartament:'apartment','garaż':'garage','wolnostojący':'detached','dzień':'workday','roboczy':'workday','piętro':'floor','parking':'parking_front'
};
const DefaultItems=[
{id:'house_30_50',type:'area',nameKey:'house',nameRaw:'30–50 m²',keywordKeys:['house'],min:30,max:50,minPrice:1600,maxPrice:2300},
{id:'house_50_80',type:'area',nameKey:'house',nameRaw:'50–80 m²',keywordKeys:['house'],min:50,max:80,minPrice:2300,maxPrice:3000},
{id:'house_80_100',type:'area',nameKey:'house',nameRaw:'80–100 m²',keywordKeys:['house'],min:80,max:100,minPrice:3000,maxPrice:3600},
{id:'garage_detached',type:'furniture',nameKey:'detached garage',keywordKeys:['detached','garage'],price:400},
{id:'parking_front',type:'parking',nameKey:'parking_front',keywordKeys:['parking_front'],price:0},
{id:'parking_far',type:'parking',nameKey:'parking_far',keywordKeys:['parking_far'],price:150},
{id:'floor_2',type:'floor',nameKey:'floor',nameRaw:'2',keywordKeys:['floor'],min:2,max:2,minPrice:250,maxPrice:250},
{id:'workday',type:'day',nameKey:'workday',keywordKeys:['workday'],min:1,max:25,minPrice:450,maxPrice:11250}
];
function lexLabel(key,lang=(state?.settings?.lang||'nl')){return LEXICON[key]?.[lang]||key}
function tokenKeysFromText(text){return String(text||'').toLowerCase().split(/[\s,;]+/).map(w=>w.trim()).filter(Boolean).map(w=>TOKEN_MAP[w]||w)}
function translatePhraseKeys(keys,lang=(state?.settings?.lang||'nl')){return (keys||[]).map(k=>lexLabel(k,lang)).join(' ')}
function itemName(it){
 const lang=state?.settings?.lang||'nl';
 if(it.nameKey){
  const keys=String(it.nameKey).split(/\s+/).filter(Boolean);
  const translated=translatePhraseKeys(keys,lang);
  return [translated,it.nameRaw].filter(Boolean).join(' ');
 }
 if(it.name&&typeof it.name==='object')return it.name[lang]||it.name.nl||it.id;
 return it.nameRaw||it.label||it.id;
}
function kwList(it,lang=(state?.settings?.lang||'nl')){
 const out=[];
 (it.keywordKeys||[]).forEach(k=>(LEXICON[k]?.kw?.[lang]||[lexLabel(k,lang)]).forEach(x=>out.push(x)));
 if(it.keywords){
  if(Array.isArray(it.keywords)) out.push(...it.keywords);
  else out.push(...(it.keywords[lang]||it.keywords.nl||[]));
 }
 return Array.from(new Set(out.filter(Boolean)));
}
function normalizeItem(it){
 if(!it.nameKey&&it.name&&typeof it.name==='object'){
  const raw=it.name.nl||it.name.de||it.name.pl||it.id;
  it.nameRaw=String(raw).replace(/^(Huis|Haus|Dom|Woning|Wohnung|Mieszkanie)\s*/i,'').trim();
  it.nameKey=/garage/i.test(raw)?'garage':/werkdag|arbeitstag|dzień/i.test(raw)?'workday':/verdieping|etage|pi/i.test(raw)?'floor':'house';
 }
 if(!it.keywordKeys&&it.keywords){
  const src=Array.isArray(it.keywords)?it.keywords:(it.keywords.nl||it.keywords.de||it.keywords.pl||[]);
  it.keywordKeys=Array.from(new Set(src.flatMap(tokenKeysFromText).filter(k=>LEXICON[k])));
 }
 if(!it.keywordKeys||!it.keywordKeys.length){it.keywordKeys=[it.nameKey||it.type||'base']}
 if(it.price!=null && it.minPrice==null){it.minPrice=Number(it.price)||0;it.maxPrice=Number(it.price)||0}
 return it;
}
function ensureItems(){if(!state.items)state.items=DefaultItems.map(x=>({...x}));state.items=state.items.map(normalizeItem)}
function itemPriceFor(it,value){
 if(it.min!=null&&it.max!=null&&it.minPrice!=null&&it.maxPrice!=null){
  const min=Number(it.min),max=Number(it.max),a=Number(it.minPrice)||0,b=Number(it.maxPrice)||0;
  if(max===min)return a;
  const n=Math.max(min,Math.min(max,Number(value)||min));
  return Math.round((a+((n-min)/(max-min))*(b-a))*100)/100;
 }
 return Number(it.price??it.minPrice??0)||0;
}
