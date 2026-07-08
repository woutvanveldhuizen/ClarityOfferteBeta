function allNumbers(text){return Array.from(String(text||'').matchAll(/\d+(?:[,.]\d+)?/g)).map(m=>Number(m[0].replace(',','.')))}
function firstNumberInRange(text,it){const nums=allNumbers(text);return nums.find(n=>Number(it.min)<=n && n<=Number(it.max))}
function groupKey(it){return it.matchGroup||it.type||it.nameKey||it.id}
function scoreItem(it,lower,area){
 let score=0;
 const kws=kwList(it).map(k=>String(k).toLowerCase()).filter(Boolean);
 kws.forEach(k=>{if(lower.includes(k))score+=10+Math.min(10,k.length/3)});
 if(it.type==='area'&&area!=null&&Number(it.min)<=area&&area<=Number(it.max))score+=80;
 if(it.min!=null&&it.max!=null&&firstNumberInRange(lower,it)!=null)score+=12;
 if(it.type==='day'&&/(werkdagen|werkdag|arbeitstage|arbeitstag|dni robocze|dzień roboczy|dzien roboczy)/i.test(lower))score+=15;
 if(it.type==='floor'&&/(verdieping|verdiepingen|etage|etagen|pi[eę]tro|pi[eę]tra)/i.test(lower))score+=15;
 return score;
}
function analyzeText(txt){
 const raw=txt||'', lower=raw.toLowerCase(), chosen=new Map();
 const m=lower.match(/(\d{1,4})(?:[\s.,-]*)(?:m2|m²|qm|㎡|m kw|metr|meter|vierkante meter|quadratmeter)/i) || lower.match(/(?:huis|woning|haus|wohnung|dom|mieszkanie|appartement)[^0-9]{0,18}(\d{1,4})/i);
 const area=m?Number(m[1]):null;
 const candidates=[];
 state.items.forEach(it=>{
  const score=scoreItem(it,lower,area);
  if(score<=0)return;
  let matchedValue=it.min??1;
  if(it.type==='area'&&area!=null)matchedValue=area;
  else{
    const typeRe=it.type==='day'?/(\d{1,2})\s*(werkdagen|werkdag|arbeitstage|arbeitstag|dni|dzień|dzien)/i:it.type==='floor'?/(\d{1,2})\s*(verdiepingen|verdieping|etagen|etage|pi[eę]tr)/i:null;
    if(typeRe){const mm=lower.match(typeRe); if(mm) matchedValue=Number(mm[1]);}
    else if(it.min!=null&&it.max!=null){const rv=firstNumberInRange(lower,it); if(rv!=null)matchedValue=rv;}
  }
  candidates.push({it,score,matchedValue});
 });
 candidates.sort((a,b)=>b.score-a.score || ((Number(a.it.max)-Number(a.it.min))||9999)-((Number(b.it.max)-Number(b.it.min))||9999));
 candidates.forEach(c=>{
   const g=groupKey(c.it);
   if(chosen.has(g))return;
   const it=c.it, matchedValue=c.matchedValue;
   chosen.set(g,{...it,qty:1,matchedValue,price:itemPriceFor(it,matchedValue),displayName:it.type==='area'&&matchedValue?`${itemName(it)} (${matchedValue} m²)`:itemName(it)});
 });
 return Array.from(chosen.values());
}
