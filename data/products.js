// Sample data. Edit freely; the shop and admin both read from here on first load.
const SIZES = ['XS','S','M','L','XL','XXL'];
const HEX = {Black:'#1c1b1a',White:'#f1efea',Sand:'#c4b79e',Charcoal:'#45474b',Olive:'#5d6147',Navy:'#212b3f',Grey:'#9b9b97'};
const DEFAULT_SETTINGS = {brandName:'THREADLINE',tagline:'Wear your identity.',announcement:'New collection available now · Free shipping over ₱3,000 · Limited drop, while it lasts',email:'hello@threadline.example',phone:'+63 900 000 0000',shipFee:150,freeShip:3000,lowStock:5,currency:'₱'};
const COLLECTIONS = [
  {id:'essential',name:'Essential Collection',tone:'#d6d1c6'},
  {id:'street',name:'Streetwear Collection',tone:'#b9b4aa'},
  {id:'oversized',name:'Oversized Collection',tone:'#cbc4b4'},
  {id:'everyday',name:'Everyday Essentials',tone:'#dedad2'},
  {id:'limited',name:'Limited Edition',tone:'#a9a69f'}];
const mk = (id,name,category,price,collection,colors,stock,flags,description) => ({id,name,category,price,collection,colors,stock,
  new:flags.includes('n'),best:flags.includes('b'),available:true,sku:'TL-'+String(id).padStart(3,'0'),
  sizes: category==='Accessories' ? [] : SIZES.slice(), description});
const PRODUCTS = [
  mk(1,'Essential Oversized Tee','T-Shirts',890,'oversized',['Black','White','Sand'],40,'nb','Heavy 220gsm cotton with a dropped shoulder and a clean, boxy drape.'),
  mk(2,'Core Heavyweight Shirt','Oversized Shirts',1490,'essential',['Charcoal','Sand'],22,'b','A thick woven shirt that holds its shape. Wear it open or buttoned.'),
  mk(3,'Everyday Boxy Tee','T-Shirts',790,'everyday',['White','Grey','Navy'],55,'','Cropped just below the hip with a ribbed collar that keeps its shape.'),
  mk(4,'Vintage Graphic Tee','T-Shirts',990,'street',['Black','Olive'],18,'n','Garment-washed cotton with a faded chest print.'),
  mk(5,'Premium Zip Hoodie','Hoodies',2290,'essential',['Black','Charcoal'],30,'b','Brushed-back fleece, metal zipper, and a double-layer hood.'),
  mk(6,'Classic Pullover Hoodie','Hoodies',1990,'everyday',['Grey','Navy','Black'],34,'','Mid-weight fleece with a roomy kangaroo pocket.'),
  mk(7,'Relaxed Fit Sweatpants','Pants',1590,'everyday',['Grey','Black'],26,'','Straight leg, elastic waist, and cuffs that sit above the ankle.'),
  mk(8,'Utility Cargo Pants','Pants',2190,'street',['Olive','Black'],14,'nb','Ripstop cotton with deep side pockets and an adjustable hem.'),
  mk(9,'Everyday Nylon Shorts','Shorts',1190,'everyday',['Black','Sand'],38,'','Light, quick-drying and cut above the knee.'),
  mk(10,'Minimalist Coach Jacket','Jackets',2790,'essential',['Black','Navy'],12,'b','Snap-front coach jacket with a soft lining and no loud branding.'),
  mk(11,'Signature Logo Cap','Accessories',690,'essential',['Black','Sand','White'],60,'','Six-panel cap with a small embroidered mark.'),
  mk(12,'Essential Tote Bag','Accessories',590,'everyday',['Sand','Black'],45,'','Thick canvas tote with an inside pocket.'),
  mk(13,'Washed Cotton Tee','T-Shirts',850,'essential',['Sand','Olive','Grey'],4,'','Enzyme-washed for a worn-in feel from day one.'),
  mk(14,'Heavyweight Crewneck','Sweatshirts',1790,'oversized',['Charcoal','Sand'],20,'n','A loopback crewneck with a relaxed shoulder.'),
  mk(15,'Streetwear Windbreaker','Jackets',2490,'street',['Navy','Olive'],0,'','Packable shell with a hood, for sudden rain.'),
  mk(16,'Limited Edition Graphic Shirt','Oversized Shirts',1690,'limited',['Black','White'],10,'nb','Numbered drop with a back print. Once it is gone, it is gone.')];
const SAMPLE_ORDERS = [
  {no:'TL-DEMO01',date:'2026-10-28',name:'Maya Santos',email:'maya@example.com',phone:'0917 000 0001',address:'12 Rizal St, Calamba, Laguna',payment:'Cash on Delivery',status:'Delivered',total:2040,items:[{id:1,name:'Essential Oversized Tee',size:'M',qty:2,price:890}]},
  {no:'TL-DEMO02',date:'2026-11-05',name:'Jonas Reyes',email:'jonas@example.com',phone:'0917 000 0002',address:'8 Mabini Ave, San Pedro, Laguna',payment:'E-wallet',status:'Shipped',total:2290,items:[{id:5,name:'Premium Zip Hoodie',size:'L',qty:1,price:2290}]},
  {no:'TL-DEMO03',date:'2026-11-10',name:'Maya Santos',email:'maya@example.com',phone:'0917 000 0001',address:'12 Rizal St, Calamba, Laguna',payment:'Bank Transfer',status:'Processing',total:2780,items:[{id:8,name:'Utility Cargo Pants',size:'M',qty:1,price:2190},{id:11,name:'Signature Logo Cap',size:'',qty:1,price:690}]},
  {no:'TL-DEMO04',date:'2026-11-13',name:'Ana Cruz',email:'ana@example.com',phone:'0917 000 0003',address:'5 Bonifacio Rd, Biñan, Laguna',payment:'Cash on Delivery',status:'Pending',total:1640,items:[{id:3,name:'Everyday Boxy Tee',size:'S',qty:2,price:790}]}];
