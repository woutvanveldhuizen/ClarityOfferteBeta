const Store={
  key:'clarity.v2',
  defaults:{
    settings:{
      lang:'de',theme:'dark',vatRate:21,validDays:30,
      companyName:'Clarity Entrümpelung',companyEmail:'info@clarityentrumpelung.de',companyPhone:'+49 172 5168515',companyWeb:'www.clarityentrumpelung.de',companyAddress:'Inhaber: Rafal Maciocha\nNeuweg 49\n55130 Mainz',companyBank:'Bankverbindung\nIBAN: DE05 5519 0000 0130 8270 25\nBIC: MVBMDE55\nVolksbank Darmstadt Mainz eG',
      customerName:'',customerStreet:'',customerPostcodeCity:'',customerCountry:'',customerEmail:'',customerPhone:'',selectedCustomerId:''
    },
    customers:[{id:'cust_silke_bernadi',name:'Silke Bernadi',email:'',phone:'',street:'Engasse 2a',postcodeCity:'55296 Harxheim',country:'Deutschland'}],items:null,quote:[]
  },
  clone(x){return typeof structuredClone==='function'?structuredClone(x):JSON.parse(JSON.stringify(x))},
  load(){
    try{
      const saved=JSON.parse(localStorage.getItem(this.key)||'{}');
      return {...this.clone(this.defaults),...saved,settings:{...this.defaults.settings,...(saved.settings||{})},customers:Array.isArray(saved.customers)&&saved.customers.length?saved.customers:this.clone(this.defaults.customers),quote:Array.isArray(saved.quote)?saved.quote:[]};
    }catch(e){return this.clone(this.defaults)}
  },
  save(s){localStorage.setItem(this.key,JSON.stringify(s))}
};
