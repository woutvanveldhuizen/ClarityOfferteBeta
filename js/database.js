const DefaultItems=[
{id:'house_30_50',type:'area',name:{nl:'Huis 30–50 m²',de:'Haus 30–50 m²',pl:'Dom 30–50 m²'},keywords:{nl:['huis','woning'],de:['haus','wohnung'],pl:['dom','mieszkanie']},min:30,max:50,minPrice:1600,maxPrice:2300},
{id:'house_50_80',type:'area',name:{nl:'Huis 50–80 m²',de:'Haus 50–80 m²',pl:'Dom 50–80 m²'},keywords:{nl:['huis','woning'],de:['haus','wohnung'],pl:['dom','mieszkanie']},min:50,max:80,minPrice:2300,maxPrice:3000},
{id:'house_80_100',type:'area',name:{nl:'Huis 80–100 m²',de:'Haus 80–100 m²',pl:'Dom 80–100 m²'},keywords:{nl:['huis','woning'],de:['haus','wohnung'],pl:['dom','mieszkanie']},min:80,max:100,minPrice:3000,maxPrice:3600},
{id:'garage_detached',type:'extra',name:{nl:'Losse garage',de:'Freistehende Garage',pl:'Wolnostojący garaż'},keywords:{nl:['losse garage','vrijstaande garage','garage'],de:['garage','freistehende garage'],pl:['garaż','wolnostojący garaż']},price:400},
{id:'parking_front',type:'parking',name:{nl:'Parkeren voor de deur',de:'Parken direkt vor der Tür',pl:'Parking przed drzwiami'},keywords:{nl:['parkeren voor de deur','voor de deur'],de:['direkt vor der tür','parken vor der tür'],pl:['parking przed drzwiami','przed domem']},price:0},
{id:'parking_far',type:'parking',name:{nl:'Parkeren op afstand',de:'Parken mit Abstand',pl:'Parking dalej od obiektu'},keywords:{nl:['in de straat','op afstand','niet goed bereikbaar'],de:['entfernt parken','schlecht erreichbar'],pl:['parking daleko','trudny dojazd']},price:150},
{id:'floor_2',type:'floor',name:{nl:'2 verdiepingen',de:'2 Etagen',pl:'2 piętra'},keywords:{nl:['2 verdiepingen','twee verdiepingen'],de:['2 etagen','zwei etagen'],pl:['2 piętra','dwa piętra']},min:2,max:2,minPrice:250,maxPrice:250},
{id:'workday',type:'day',name:{nl:'Werkdag arbeid',de:'Arbeitstag',pl:'Dzień roboczy'},keywords:{nl:['werkdag','dag werk'],de:['arbeitstag','arbeitstage'],pl:['dzień roboczy','dni robocze']},min:1,max:25,minPrice:450,maxPrice:11250}
];
function itemName(it){return (it.name&&it.name[state.settings.lang])||it.label||it.id}
function normalizeItem(it){
 if(Array.isArray(it.keywords)) it.keywords={nl:it.keywords,de:it.keywords,pl:it.keywords};
 if(it.price!=null && it.minPrice==null){it.minPrice=Number(it.price)||0;it.maxPrice=Number(it.price)||0}
 return it;
}
function ensureItems(){if(!state.items)state.items=DefaultItems;state.items=state.items.map(normalizeItem)}
function itemPriceFor(it,value){
 if(it.min!=null&&it.max!=null&&it.minPrice!=null&&it.maxPrice!=null){
  const min=Number(it.min),max=Number(it.max),a=Number(it.minPrice)||0,b=Number(it.maxPrice)||0;
  if(max===min)return a;
  const n=Math.max(min,Math.min(max,Number(value)||min));
  return Math.round((a+((n-min)/(max-min))*(b-a))*100)/100;
 }
 return Number(it.price??it.minPrice??0)||0;
}
