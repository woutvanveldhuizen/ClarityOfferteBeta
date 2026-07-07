const Store={
  key:'clarity.v2',
  defaults:{
    settings:{
      lang:'nl',
      theme:'dark',
      vatRate:21,
      validDays:30,
      companyName:'Clarity Entrümpelung',
      companyEmail:'info@clarity-entruempelung.nl',
      companyPhone:'+31 6 85 12 34 56',
      companyWeb:'www.clarity-entruempelung.nl',
      companyAddress:'Voorbeeldstraat 12\n1234 AB Amsterdam',
      customerName:'',
      customerStreet:'',
      customerPostcodeCity:'',
      customerCountry:''
    },
    items:null,
    quote:[]
  },
  load(){
    try{
      const saved=JSON.parse(localStorage.getItem(this.key)||'{}');
      return {...this.defaults,...saved,settings:{...this.defaults.settings,...(saved.settings||{})}};
    }catch(e){
      return structuredClone?structuredClone(this.defaults):JSON.parse(JSON.stringify(this.defaults));
    }
  },
  save(s){localStorage.setItem(this.key,JSON.stringify(s))}
};
