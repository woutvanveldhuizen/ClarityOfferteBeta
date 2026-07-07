function kwList(it){const k=it.keywords||{};return Array.isArray(k)?k:(k[state.settings.lang]||k.nl||[])}
function analyzeText(txt){
 const raw=txt||'', lower=raw.toLowerCase(), found=[];
 const m=lower.match(/(\d{1,4})(?:[\s.,-]*)(?:m2|m²|qm|㎡|m kw|metr|meter|vierkante meter|quadratmeter)/i) || lower.match(/(?:huis|woning|haus|dom|mieszkanie)[^0-9]{0,12}(\d{1,4})/i);
 const area= m ? Number(m[1]) : null;
 if(area){
  const areas=state.items.filter(x=>x.type==='area' && Number(x.min)<=area && Number(x.max)>=area);
  if(areas[0]) found.push({...areas[0],qty:1,matchedValue:area,price:itemPriceFor(areas[0],area),displayName:`${itemName(areas[0])} (${area} m²)`});
 }
 state.items.forEach(it=>{
  if(found.some(x=>x.id===it.id))return;
  if((kwList(it)||[]).some(k=>k && lower.includes(String(k).toLowerCase()))){
    let matchedValue=it.min??1;
    const typeRe=it.type==='day'?/(\d{1,2})\s*(werkdagen|werkdag|arbeitstage|arbeitstag|dni|dzień)/i:it.type==='floor'?/(\d{1,2})\s*(verdiepingen|verdieping|etagen|etage|pi[eę]tr)/i:null;
    if(typeRe){const mm=lower.match(typeRe); if(mm) matchedValue=Number(mm[1]);}
    found.push({...it,qty:1,matchedValue,price:itemPriceFor(it,matchedValue)});
  }
 });
 return Array.from(new Map(found.map(x=>[x.id,x])).values())
}
