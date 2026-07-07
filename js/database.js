const DefaultItems=[
{id:'house_30_50',type:'area',name:{nl:'Huis 30–50 m²',de:'Haus 30–50 m²',pl:'Dom 30–50 m²'},keywords:['huis 30','huis van 30','huis van 40','huis van 50','30m2','40m2','50m2','30 m2','40 m2','50 m2','haus','dom'],price:1600},
{id:'house_50_80',type:'area',name:{nl:'Huis 50–80 m²',de:'Haus 50–80 m²',pl:'Dom 50–80 m²'},keywords:['huis van 60','huis van 70','60m2','70m2','60 m2','70 m2','50-80'],price:2300},
{id:'house_80_100',type:'area',name:{nl:'Huis 80–100 m²',de:'Haus 80–100 m²',pl:'Dom 80–100 m²'},keywords:['huis van 80','huis van 90','huis van 100','80m2','90m2','100m2'],price:3000},
{id:'garage_detached',type:'extra',name:{nl:'Losse garage',de:'Freistehende Garage',pl:'Wolnostojący garaż'},keywords:['losse garage','vrijstaande garage','garage'],price:400},
{id:'parking_front',type:'parking',name:{nl:'Parkeren voor de deur',de:'Parken direkt vor der Tür',pl:'Parking przed drzwiami'},keywords:['parkeren voor de deur','voor de deur','direkt vor der tür'],price:0},
{id:'parking_far',type:'parking',name:{nl:'Parkeren op afstand',de:'Parken auf Abstand',pl:'Parking dalej od obiektu'},keywords:['in de straat','op afstand','niet goed bereikbaar'],price:150},
{id:'floor_2',type:'floor',name:{nl:'2 verdiepingen',de:'2 Etagen',pl:'2 piętra'},keywords:['2 verdiepingen','twee verdiepingen','2 etage'],price:250},
{id:'workday',type:'day',name:{nl:'Werkdag arbeid',de:'Arbeitstag',pl:'Dzień roboczy'},keywords:['werkdag','1 werkdag','dag werk','arbeidstag'],price:450}
];
function itemName(it){return (it.name&&it.name[state.settings.lang])||it.label||it.id}function ensureItems(){if(!state.items)state.items=DefaultItems}
