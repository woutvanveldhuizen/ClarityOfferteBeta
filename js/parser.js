function allNumbers(text){return Array.from(String(text||'').matchAll(/\d+(?:[,.]\d+)?/g)).map(m=>Number(m[0].replace(',','.')))}
function firstNumberInRange(text,it){const nums=allNumbers(text);return nums.find(n=>Number(it.min)<=n && n<=Number(it.max))}
function analyzeText(txt){
 const raw=txt||'', lower=raw.toLowerCase(), found=[];
 const m=lower.match(/(\d{1,4})(?:[\s.,-]*)(?:m2|m²|qm|㎡|m kw|metr|meter|vierkante meter|quadratmeter)/i) || lower.match(/(?:huis|woning|haus|wohnung|dom|mieszkanie|appartement)[^0-9]{0,12}(\d{1,4})/i);
 const area=m?Number(m[1]):null;
 if(area){
  const areas=state.items.filter(x=>x.type==='area' && Number(x.min)<=area && Number(x.max)>=area).sort((a,b)=>(Number(a.max)-Number(a.min))-(Number(b.max)-Number(b.min)));
  if(areas[0]) found.push({...areas[0],qty:1,matchedValue:area,price:itemPriceFor(areas[0],area),displayName:`${itemName(areas[0])} (${area} m²)`});
 }
 state.items.forEach(it=>{
  if(found.some(x=>x.id===it.id))return;
  const matchesKeywords=(kwList(it)||[]).some(k=>k && lower.includes(String(k).toLowerCase()));
  const rangeValue=(it.min!=null&&it.max!=null)?firstNumberInRange(lower,it):null;
  const matchesRangeName=rangeValue!=null && (matchesKeywords || /\d+\s*[-–]\s*\d+/.test(it.nameRaw||''));
  if(matchesKeywords || matchesRangeName){
    let matchedValue=it.min??1;
    const typeRe=it.type==='day'?/(\d{1,2})\s*(werkdagen|werkdag|arbeitstage|arbeitstag|dni|dzień|dzien)/i:it.type==='floor'?/(\d{1,2})\s*(verdiepingen|verdieping|etagen|etage|pi[eę]tr)/i:null;
    if(typeRe){const mm=lower.match(typeRe); if(mm) matchedValue=Number(mm[1]);}
    else if(rangeValue!=null) matchedValue=rangeValue;
    found.push({...it,qty:1,matchedValue,price:itemPriceFor(it,matchedValue),displayName:it.type==='area'&&matchedValue?`${itemName(it)} (${matchedValue} m²)`:itemName(it)});
  }
 });
 return Array.from(new Map(found.map(x=>[x.id,x])).values())
}
