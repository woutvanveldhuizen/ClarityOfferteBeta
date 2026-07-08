const Store={
  key:'clarity.v2',
  defaults:{
    settings:{
      lang:'nl',theme:'dark',vatRate:21,validDays:30,
      companyName:'Clarity Entrümpelung',companyEmail:'info@clarity-entruempelung.nl',companyPhone:'+31 6 85 12 34 56',companyWeb:'www.clarity-entruempelung.nl',companyAddress:'Voorbeeldstraat 12\n1234 AB Amsterdam',
      customerName:'',customerStreet:'',customerPostcodeCity:'',customerCountry:'',customerEmail:'',customerPhone:'',selectedCustomerId:''
    },
    customers:[],items:null,quote:[]
  },
  clone(x){return typeof structuredClone==='function'?structuredClone(x):JSON.parse(JSON.stringify(x))},
  load(){
    try{
      const saved=JSON.parse(localStorage.getItem(this.key)||'{}');
      return {...this.clone(this.defaults),...saved,settings:{...this.defaults.settings,...(saved.settings||{})},customers:Array.isArray(saved.customers)?saved.customers:[],quote:Array.isArray(saved.quote)?saved.quote:[]};
    }catch(e){return this.clone(this.defaults)}
  },
  save(s){localStorage.setItem(this.key,JSON.stringify(s))}
};
