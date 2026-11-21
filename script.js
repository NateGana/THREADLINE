/* THREADLINE storefront + demo admin. Front-end only: everything lives in localStorage. */
const $ = (s, r = document) => r.querySelector(s);
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem('tl_' + k)) ?? d; } catch { return d; } },
  set(k, v) { localStorage.setItem('tl_' + k, JSON.stringify(v)); }
};
let products = store.get('products', PRODUCTS);
let settings = store.get('settings', DEFAULT_SETTINGS);
let cart = store.get('cart', []);
let wish = store.get('wish', []);
let orders = store.get('orders', SAMPLE_ORDERS);
let user = store.get('user', null);
let promo = store.get('promo', '');
let filters = { q: '', cat: '', color: '', size: '', max: 5000, stock: false, isNew: false, best: false, coll: '', sort: 'featured' };
let sel = { size: '', qty: 1, img: 0 };
let adminTab = 'Overview';
const save = () => ['products','settings','cart','wish','orders','user','promo'].forEach(k => store.set(k, ({products,settings,cart,wish,orders,user,promo})[k]));
const peso = n => settings.currency + Math.round(n).toLocaleString('en-PH');
const byId = id => products.find(p => p.id === id);
const inStock = p => p.available && p.stock > 0;
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* Product images are generated locally as SVG, so nothing breaks offline. Swap in photos via p.images. */
function art(p, i = 0) {
  if (p.images && p.images[i]) return p.images[i];
  const c = HEX[p.colors[i % p.colors.length]] || '#444';
  const bg = ['#d9d5cc', '#cdc8bd', '#e1ded7'][(p.id + i) % 3];
  const shapes = {
    top: 'M70 40 L100 28 Q130 52 160 28 L190 40 L225 80 L198 100 L186 88 L186 230 L74 230 L74 88 L62 100 L35 80Z',
    pants: 'M75 30h110l12 200h-48l-19-120-19 120h-48z',
    acc: 'M80 90h100l10 140H70z M100 90q30-70 60 0' };
  const k = ['Pants','Shorts'].includes(p.category) ? 'pants' : p.category === 'Accessories' ? 'acc' : 'top';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 320'><rect width='260' height='320' fill='${bg}'/><path transform='translate(0,36)' d='${shapes[k]}' fill='${c}'/><text x='14' y='306' font-family='sans-serif' font-size='11' fill='#0007'>${p.colors[i % p.colors.length]}</text></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

/* ---------- Helpers ---------- */
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2400); }
function modal(html) { const m = $('#modal'); m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><button class="x" data-act="close" aria-label="Close">×</button>${html}</div>`; m.hidden = false; }
const go = h => location.hash === h ? render() : (location.hash = h);
function totals() {
  const subtotal = cart.reduce((s, l) => s + byId(l.id).price * l.qty, 0);
  const shipping = !cart.length || subtotal >= settings.freeShip ? 0 : +settings.shipFee;
  const discount = promo === 'THREADLINE10' ? Math.round(subtotal * .1) : 0;
  return { subtotal, shipping, discount, total: subtotal + shipping - discount };
}
function chrome() {
  $('#ann').textContent = settings.announcement;
  $('#logo').textContent = settings.logoText || settings.brandName;
  document.title = settings.brandName;
  $('#cc').textContent = cart.reduce((s, l) => s + l.qty, 0);
  $('#wc').textContent = wish.length;
  $('#foot').innerHTML = `<div><b class="logo" style="color:#fff">${esc(settings.brandName)}</b><p>${esc(settings.tagline)} Everyday wear, streetwear and premium essentials.</p></div>
   <div><h4>Shop</h4><a href="#/shop">All products</a><a href="#/collections">Collections</a><a href="#/wishlist">Wishlist</a></div>
   <div><h4>Help</h4><a href="#/contact">Contact</a><a href="#" data-act="sizeGuide">Size guide</a><a href="#/admin">Demo admin</a><a href="#/about">Privacy and terms (demo)</a></div>
   <div><h4>Contact</h4><p>${esc(settings.email)}<br>${esc(settings.phone)}</p><p>Instagram · TikTok · Facebook</p><p>© 2026 ${esc(settings.brandName)}. Demo store.</p></div>`;
}

/* ---------- Components ---------- */
const card = p => `<article class="card"><a href="#/product/${p.id}" class="ph"><img src="${art(p)}" alt="${esc(p.name)}" loading="lazy">${p.new ? '<span class="tag">New arrival</span>' : ''}${!inStock(p) ? '<span class="tag" style="left:auto;right:10px">Sold out</span>' : ''}</a>
 <div class="cb"><div><h3><a href="#/product/${p.id}">${esc(p.name)}</a></h3><p class="mut">${p.category}</p></div><b>${peso(p.price)}</b></div>
 <div class="sw">${p.colors.map(c => `<i style="background:${HEX[c] || '#888'}" title="${c}"></i>`).join('')}</div>
 <div class="ca"><button data-act="quick" data-id="${p.id}">Quick view</button><button data-act="wish" data-id="${p.id}" aria-pressed="${wish.includes(p.id)}">${wish.includes(p.id) ? 'Saved' : 'Wishlist'}</button><button data-act="quick" data-id="${p.id}">Add to cart</button></div></article>`;
const collTiles = () => COLLECTIONS.map(c => `<button class="coll" data-act="coll" data-c="${c.id}" style="background:${c.tone}"><h3>${esc(c.name)}</h3></button>`).join('');

/* ---------- Pages ---------- */
function home() {
  const hero = byId(5) || products[0];
  return `<div class="hero"><div><h1>Wear your identity.</h1><p>Designed for everyday expression. Made for those who move differently.</p>
   <a class="btn" href="#/shop">Shop now</a><a class="btn ghost" href="#/collections">Explore collection</a></div><img src="${art(hero)}" alt="Campaign: ${esc(hero.name)}"></div>
  <section><div class="row"><h2>Collections</h2></div><div class="grid">${collTiles()}</div></section>
  <section><div class="row"><h2>New arrivals</h2><a href="#/shop" data-act="goNew">View all</a></div><div class="grid">${products.filter(p => p.new).slice(0, 4).map(card).join('')}</div></section>
  <section><div class="row"><h2>Best sellers</h2></div><div class="grid">${products.filter(p => p.best).slice(0, 4).map(card).join('')}</div></section>
  <section class="story"><img src="${art(byId(10) || products[0])}" alt="Minimalist coach jacket"><div><h2>Cut for how you actually dress</h2><p>${esc(settings.brandName)} started with a plain white tee that never fit right. We kept the weight, changed the shape, and built a small range around pieces you reach for every day.</p></div></section>
  <section class="promo"><h2>Limited drop is live</h2><p>Numbered pieces. Use code THREADLINE10 for 10% off in the cart.</p><br><a class="btn" href="#/shop" data-act="goLimited">Shop limited edition</a></section>
  <section style="text-align:center"><h2>Join the list</h2><p class="mut">Demo form: no email is actually sent.</p><form class="news" data-form="news" novalidate><input type="email" name="email" placeholder="you@example.com" aria-label="Email address"><button class="btn">Subscribe</button></form><p class="err" id="newsMsg"></p></section>`;
}
function filtered() {
  const f = filters, q = f.q.toLowerCase();
  let list = products.filter(p => (!q || (p.name + p.description).toLowerCase().includes(q)) && (!f.cat || p.category === f.cat) && (!f.color || p.colors.includes(f.color))
    && (!f.size || p.sizes.includes(f.size)) && p.price <= f.max && (!f.stock || inStock(p)) && (!f.isNew || p.new) && (!f.best || p.best) && (!f.coll || p.collection === f.coll));
  const s = { 'low': (a, b) => a.price - b.price, 'high': (a, b) => b.price - a.price, 'newest': (a, b) => b.id - a.id, 'best': (a, b) => b.best - a.best }[f.sort];
  return s ? list.sort(s) : list;
}
function drawGrid() {
  const list = filtered();
  $('#grid').innerHTML = list.length ? list.map(card).join('') : `<div class="empty" style="grid-column:1/-1"><h3>Nothing matches those filters</h3><p class="mut">Try a wider price range or fewer filters.</p><br><button class="btn" data-act="clear">Clear filters</button></div>`;
  $('#found').textContent = list.length + ' products';
}
function shop() {
  const opt = (arr, v) => arr.map(x => `<option ${x === v ? 'selected' : ''}>${x}</option>`).join('');
  const cats = [...new Set(products.map(p => p.category))];
  return `<div class="page"><div class="row"><h2>Shop</h2><span class="mut" id="found"></span></div><div class="shop"><aside class="filters">
   <label>Search<input id="search" data-f="q" value="${esc(filters.q)}" placeholder="Name or description"></label>
   <label>Category<select data-f="cat"><option value="">All</option>${opt(cats, filters.cat)}</select></label>
   <label>Size<select data-f="size"><option value="">Any</option>${opt(SIZES, filters.size)}</select></label>
   <label>Color<select data-f="color"><option value="">Any</option>${opt(Object.keys(HEX), filters.color)}</select></label>
   <label>Collection<select data-f="coll"><option value="">All</option>${COLLECTIONS.map(c => `<option value="${c.id}" ${filters.coll === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select></label>
   <label>Max price: ${peso(filters.max)}<input type="range" data-f="max" min="500" max="5000" step="100" value="${filters.max}"></label>
   <label><input type="checkbox" data-f="stock" style="width:auto" ${filters.stock ? 'checked' : ''}> In stock only</label>
   <label><input type="checkbox" data-f="isNew" style="width:auto" ${filters.isNew ? 'checked' : ''}> New arrivals</label>
   <label><input type="checkbox" data-f="best" style="width:auto" ${filters.best ? 'checked' : ''}> Best sellers</label>
   <label>Sort<select data-f="sort">${[['featured','Featured'],['newest','Newest'],['low','Price: low to high'],['high','Price: high to low'],['best','Best selling']].map(([v, t]) => `<option value="${v}" ${filters.sort === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
   <button class="btn ghost sm" data-act="clear">Clear filters</button></aside><div class="grid" id="grid"></div></div></div>`;
}
function productPage(id) {
  const p = byId(id); if (!p) return notFound();
  const stockTxt = !inStock(p) ? 'Out of stock' : p.stock <= settings.lowStock ? `Only ${p.stock} left` : 'In stock';
  return `<div class="page"><div class="pdp"><div><img id="main" src="${art(p, sel.img)}" alt="${esc(p.name)}"><div class="thumbs">${p.colors.map((c, i) => `<button data-act="img" data-i="${i}" aria-current="${i === sel.img}" aria-label="${c} view"><img src="${art(p, i)}" alt=""></button>`).join('')}</div></div>
   <div><p class="mut">${p.category} · SKU ${p.sku}</p><h2 style="margin:6px 0 10px">${esc(p.name)}</h2><b style="font-size:22px">${peso(p.price)}</b><p style="margin:14px 0">${esc(p.description)}</p><p class="mut">${stockTxt}</p>
   <h4>Color: ${p.colors[sel.img % p.colors.length]}</h4><div class="opts">${p.colors.map((c, i) => `<button data-act="img" data-i="${i}" aria-pressed="${i === sel.img}">${c}</button>`).join('')}</div>
   ${p.sizes.length ? `<h4>Size <a href="#" data-act="sizeGuide" class="mut">(size guide)</a></h4><div class="opts">${p.sizes.map(s => `<button data-act="size" data-s="${s}" aria-pressed="${sel.size === s}">${s}</button>`).join('')}</div>` : ''}
   <div class="qty"><button data-act="q" data-d="-1">−</button><span id="q">${sel.qty}</span><button data-act="q" data-d="1">+</button></div>
   <p style="margin-top:16px"><button class="btn" data-act="add" data-id="${p.id}" ${inStock(p) ? '' : 'disabled'}>Add to cart</button> <button class="btn ghost" data-act="wish" data-id="${p.id}">${wish.includes(p.id) ? 'Remove from wishlist' : 'Add to wishlist'}</button></p><br>
   <details><summary>Product information</summary><p>Collection: ${COLLECTIONS.find(c => c.id === p.collection)?.name}. Machine wash cold, hang dry.</p></details>
   <details><summary>Shipping and returns</summary><p>Orders ship in 2 to 4 days. Free shipping over ${peso(settings.freeShip)}. Returns within 14 days, unworn. (Demo policy.)</p></details></div></div>
   <section style="padding-inline:0"><h2>Related</h2><br><div class="grid">${products.filter(x => x.id !== p.id && x.category === p.category || x.collection === p.collection && x.id !== p.id).slice(0, 4).map(card).join('')}</div></section></div>`;
}
function cartPage() {
  if (!cart.length) return `<div class="page empty"><h3>Your bag is empty</h3><p class="mut">Pieces you add will wait here.</p><br><a class="btn" href="#/shop">Start shopping</a></div>`;
  const t = totals();
  return `<div class="page"><h2>Your bag</h2><br><div class="split"><div class="lines">${cart.map((l, i) => { const p = byId(l.id); return `<div class="line"><img src="${art(p)}" alt=""><div><b>${esc(p.name)}</b><p class="mut">${l.size ? 'Size ' + l.size + ' · ' : ''}${peso(p.price)} each</p><div class="qty"><button data-act="dec" data-i="${i}">−</button><span>${l.qty}</span><button data-act="inc" data-i="${i}">+</button></div> <button class="btn ghost sm" data-act="rm" data-i="${i}">Remove</button></div><b>${peso(p.price * l.qty)}</b></div>`; }).join('')}</div>
   <div class="box sum"><div><span>Subtotal</span><span>${peso(t.subtotal)}</span></div><div><span>Shipping</span><span>${t.shipping ? peso(t.shipping) : 'Free'}</span></div><div><span>Discount</span><span>−${peso(t.discount)}</span></div><div class="tot"><span>Total</span><span>${peso(t.total)}</span></div>
   <form data-form="promo" style="display:flex;gap:6px;margin:14px 0"><input name="code" placeholder="Promo code" value="${esc(promo)}"><button class="btn sm">Apply</button></form><a class="btn" href="#/checkout" style="width:100%;text-align:center">Checkout</a></div></div></div>`;
}
function checkout() {
  if (!cart.length) return cartPage();
  const t = totals(), u = user || {};
  const f = (n, l, v = '', type = 'text') => `<label>${l}<input name="${n}" type="${type}" value="${esc(v)}"></label>`;
  return `<div class="page"><h2>Checkout</h2><br><p class="demo">Demonstration only. No payment is taken and no card details are collected.</p><div class="split"><form data-form="order" novalidate>
   <div class="grid2">${f('name', 'Full name', u.name)}${f('email', 'Email', u.email, 'email')}</div>${f('phone', 'Phone number', u.phone)}${f('street', 'Street address')}
   <div class="grid2">${f('city', 'City')}${f('province', 'Province')}${f('postal', 'Postal code')}${f('country', 'Country', 'Philippines')}</div>
   <label>Payment (demo)<select name="payment"><option>Cash on Delivery</option><option>Bank Transfer</option><option>E-wallet</option></select></label><p class="err" id="orderErr"></p><button class="btn">Place demo order</button></form>
   <div class="box sum">${cart.map(l => `<div><span>${esc(byId(l.id).name)} ${l.size} × ${l.qty}</span><span>${peso(byId(l.id).price * l.qty)}</span></div>`).join('')}<div class="tot"><span>Total (incl. ${peso(t.shipping)} shipping)</span><span>${peso(t.total)}</span></div></div></div></div>`;
}
function confirmPage(no) {
  const o = orders.find(x => x.no === no); if (!o) return notFound();
  return `<div class="page"><h2>Order placed (demo)</h2><p class="mut">Order number ${o.no}. This was a simulation, so nothing was charged.</p><br><div class="box sum">${o.items.map(i => `<div><span>${esc(i.name)} ${i.size} × ${i.qty}</span><span>${peso(i.price * i.qty)}</span></div>`).join('')}<div class="tot"><span>Total · ${o.payment}</span><span>${peso(o.total)}</span></div></div><br><a class="btn" href="#/account">View my orders</a></div>`;
}
function account() {
  if (!user) return `<div class="page" style="max-width:520px"><h2>Account</h2><br><p class="demo">Demo sign-in. Details are stored unencrypted in this browser. Never enter a real password.</p><form data-form="signin" novalidate><label>Name<input name="name"></label><label>Email<input name="email" type="email"></label><label>Phone<input name="phone"></label><label>Demo password<input name="pw" type="password" placeholder="anything"></label><p class="err" id="signErr"></p><button class="btn">Sign in / create account</button></form></div>`;
  const mine = orders.filter(o => o.email === user.email);
  return `<div class="page"><div class="row"><h2>Hello, ${esc(user.name)}</h2><button class="btn ghost sm" data-act="signout">Sign out</button></div><p class="mut">${esc(user.email)} · ${esc(user.phone || 'no phone')} · <a href="#/wishlist"><u>Wishlist (${wish.length})</u></a></p><br><h3>My orders</h3><br>${mine.length ? `<div class="scroll"><table><tr><th>Order</th><th>Date</th><th>Total</th><th>Status</th></tr>${mine.map(o => `<tr><td>${o.no}</td><td>${o.date}</td><td>${peso(o.total)}</td><td><span class="pill">${o.status}</span></td></tr>`).join('')}</table></div>` : '<p class="mut">No orders yet. Tip: sign in as maya@example.com to see sample orders.</p>'}</div>`;
}
function wishPage() {
  const list = wish.map(byId).filter(Boolean);
  return `<div class="page"><h2>Wishlist</h2><br>${list.length ? `<div class="grid">${list.map(card).join('')}</div>` : `<div class="empty"><h3>Nothing saved yet</h3><a class="btn" href="#/shop">Browse the shop</a></div>`}</div>`;
}
const collections = () => `<div class="page"><h2>Collections</h2><br><div class="grid">${collTiles()}</div></div>`;
const about = () => `<div class="page story"><div><h2>About ${esc(settings.brandName)}</h2><p><b>Mission.</b> Make clothes that look considered and wear hard.</p><p><b>Vision.</b> A small label people keep for years, not a season.</p><p><b>Philosophy.</b> Fewer pieces, better fabric, honest prices. We cut for real bodies and test fit on the people around us.</p><p><b>Values.</b> Quality, restraint, and ownership of what we ship.</p></div><img src="${art(byId(2))}" alt="Campaign image"></div>`;
const contact = () => `<div class="page" style="max-width:620px"><h2>Contact</h2><p class="mut">${esc(settings.email)} · Demo form: nothing is sent.</p><br><form data-form="contact" novalidate><label>Name<input name="name"></label><label>Email<input name="email" type="email"></label><label>Subject<input name="subject"></label><label>Message<textarea name="msg" rows="5"></textarea></label><p class="err" id="cErr"></p><button class="btn">Send message</button></form></div>`;
const notFound = () => `<div class="page empty"><h3>Page not found</h3><a class="btn" href="#/">Back home</a></div>`;
const sizeGuide = () => modal(`<h3>Size guide</h3><p class="mut">Sample measurements in cm. Editable example values.</p><br><table><tr><th>Size</th><th>Chest</th><th>Shoulder</th><th>Length</th><th>Sleeve</th></tr>${[['XS',96,44,66,20],['S',100,46,68,21],['M',104,48,70,22],['L',108,50,72,23],['XL',112,52,74,24],['XXL',118,54,76,25]].map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`);

/* ---------- Admin ---------- */
function admin() {
  const tabs = ['Overview', 'Products', 'Inventory', 'Orders', 'Customers', 'Settings'];
  const live = orders.filter(o => o.status !== 'Cancelled');
  const custs = {}; orders.forEach(o => { (custs[o.email] ??= { name: o.name, email: o.email, n: 0, spent: 0 }); custs[o.email].n++; if (o.status !== 'Cancelled') custs[o.email].spent += o.total; });
  const status = p => !inStock(p) ? '<span class="pill out">Out of Stock</span>' : p.stock <= settings.lowStock ? '<span class="pill low">Low Stock</span>' : '<span class="pill">In Stock</span>';
  const views = {
    Overview: () => { const low = products.filter(p => inStock(p) && p.stock <= settings.lowStock); const st = ['Pending','Processing','Shipped','Delivered','Cancelled'];
      return `<div class="cards">${[['Products', products.length], ['Orders', orders.length], ['Demo revenue', peso(live.reduce((s, o) => s + o.total, 0))], ['Customers', Object.keys(custs).length], ['Low stock', low.length]].map(([l, v]) => `<div class="box stat"><span class="mut">${l}</span><b>${v}</b></div>`).join('')}</div>
      <div class="split"><div class="box"><h3>Orders by status</h3><br><div class="bars">${st.map(s => { const n = orders.filter(o => o.status === s).length; return `<div><span>${s}</span><i style="width:${n / Math.max(orders.length, 1) * 100}%"></i><b>${n}</b></div>`; }).join('')}</div></div>
      <div class="box"><h3>Recent orders</h3><br>${orders.slice(-5).reverse().map(o => `<p>${o.no} · ${esc(o.name)} · ${peso(o.total)}</p>`).join('')}</div></div>`; },
    Products: () => `<form data-form="addProduct" class="box" style="margin:16px 0"><h3>Add product</h3><br><div class="grid2"><label>Name<input name="name"></label><label>Category<select name="category">${['T-Shirts','Oversized Shirts','Hoodies','Sweatshirts','Jackets','Pants','Shorts','Accessories'].map(c => `<option>${c}</option>`).join('')}</select></label><label>Price<input name="price" type="number" min="0"></label><label>Stock<input name="stock" type="number" min="0"></label><label>Colors (comma separated)<input name="colors" placeholder="Black, Sand"></label><label>Image URL (optional)<input name="image"></label></div><label>Description<textarea name="desc"></textarea></label><label><input type="checkbox" name="isNew" style="width:auto"> New arrival</label> <label><input type="checkbox" name="best" style="width:auto"> Best seller</label><p class="err" id="pErr"></p><button class="btn sm">Add product</button></form>
      <div class="scroll"><table><tr><th>Name</th><th>Category</th><th>Price</th><th>Flags</th><th></th></tr>${products.map(p => `<tr><td>${esc(p.name)}</td><td>${p.category}</td><td><input type="number" data-price="${p.id}" value="${p.price}"></td><td><button class="btn ghost sm" data-act="flag" data-id="${p.id}" data-k="new">${p.new ? '✓ ' : ''}New</button> <button class="btn ghost sm" data-act="flag" data-id="${p.id}" data-k="best">${p.best ? '✓ ' : ''}Best</button> <button class="btn ghost sm" data-act="flag" data-id="${p.id}" data-k="available">${p.available ? 'Available' : 'Hidden'}</button></td><td><button class="btn ghost sm" data-act="del" data-id="${p.id}">Delete</button></td></tr>`).join('')}</table></div>`,
    Inventory: () => `<p class="mut">Low-stock threshold: ${settings.lowStock} (change in Settings).</p><div class="scroll"><table><tr><th>Product</th><th>SKU</th><th>Category</th><th>Stock</th><th>Sizes</th><th>Status</th></tr>${products.map(p => `<tr><td>${esc(p.name)}</td><td>${p.sku}</td><td>${p.category}</td><td><input type="number" min="0" data-stock="${p.id}" value="${p.stock}"></td><td>${p.sizes.join(' ') || '–'}</td><td>${status(p)}</td></tr>`).join('')}</table></div>`,
    Orders: () => `<div class="scroll"><table><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Payment</th><th>Status</th></tr>${orders.map(o => `<tr><td>${o.no}</td><td>${esc(o.name)}</td><td>${o.date}</td><td>${peso(o.total)}</td><td>${o.payment}</td><td><select data-status="${o.no}">${['Pending','Processing','Shipped','Delivered','Cancelled'].map(s => `<option ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}</select></td></tr>`).join('')}</table></div>`,
    Customers: () => `<div class="scroll"><table><tr><th>Name</th><th>Email</th><th>Orders</th><th>Demo spending</th></tr>${Object.values(custs).map(c => `<tr><td>${esc(c.name)}</td><td>${esc(c.email)}</td><td>${c.n}</td><td>${peso(c.spent)}</td></tr>`).join('')}</table></div>`,
    Settings: () => `<form data-form="settings" class="box" style="max-width:640px;margin-top:16px">${[['brandName','Brand name'],['tagline','Tagline'],['logoText','Logo text'],['announcement','Announcement bar'],['email','Store email'],['phone','Contact number'],['shipFee','Shipping fee'],['freeShip','Free shipping above'],['lowStock','Low-stock threshold'],['currency','Currency symbol']].map(([k, l]) => `<label>${l}<input name="${k}" value="${esc(settings[k] ?? '')}"></label>`).join('')}<button class="btn">Save settings</button> <button type="button" class="btn ghost" data-act="reset">Reset demo data</button></form>`
  };
  return `<div class="adm"><nav class="side"><b class="logo" style="color:#fff;padding:10px">${esc(settings.brandName)}</b>${tabs.map(t => `<button data-act="tab" data-t="${t}" aria-current="${t === adminTab}">${t}</button>`).join('')}<a href="#/">← Back to store</a></nav><div class="adm-main"><p class="demo">Demo admin: no login, data stays in this browser.</p><h2>${adminTab}</h2>${views[adminTab]()}</div></div>`;
}

/* ---------- Router ---------- */
function render() {
  const [pg, arg] = location.hash.slice(2).split('/');
  const pages = { '': home, shop, product: () => productPage(+arg), cart: cartPage, checkout, confirm: () => confirmPage(arg), account, wishlist: wishPage, about, contact, collections, admin };
  $('#app').innerHTML = (pages[pg] || notFound)();
  document.body.classList.toggle('admin', pg === 'admin');
  $('#nav').classList.remove('open'); // keeps the mobile menu from staying open after navigation
  chrome();
  if (pg === 'shop') drawGrid();
  if (pg !== 'product') sel = { size: '', qty: 1, img: 0 };
  window.scrollTo(0, 0);
}
function quickView(p) {
  sel = { size: '', qty: 1, img: 0 };
  modal(`<div class="grid2" style="gap:20px"><img src="${art(p)}" alt=""><div><h3>${esc(p.name)}</h3><p>${peso(p.price)}</p><p class="mut" style="margin:8px 0">${esc(p.description)}</p>${p.sizes.length ? `<div class="opts" id="qsz">${p.sizes.map(s => `<button data-act="size" data-s="${s}" data-modal="1" aria-pressed="false">${s}</button>`).join('')}</div>` : ''}<button class="btn" data-act="add" data-id="${p.id}" ${inStock(p) ? '' : 'disabled'}>Add to cart</button> <a class="btn ghost" href="#/product/${p.id}" data-act="close">Details</a></div></div>`);
}
function addToCart(id) {
  const p = byId(id);
  if (p.sizes.length && !sel.size) return toast('Choose a size first');
  const line = cart.find(l => l.id === id && l.size === sel.size), have = line ? line.qty : 0;
  if (have + sel.qty > p.stock) return toast(`Only ${p.stock} in stock`);
  line ? line.qty += sel.qty : cart.push({ id, size: sel.size, qty: sel.qty });
  save(); chrome(); $('#modal').hidden = true; toast('Added to your bag');
}
function placeOrder(d) {
  const need = ['name', 'email', 'phone', 'street', 'city', 'province', 'postal', 'country'];
  const bad = need.find(k => !d[k].trim());
  if (bad) return $('#orderErr').textContent = 'Please fill in your ' + bad + '.';
  if (!/^\S+@\S+\.\S+$/.test(d.email)) return $('#orderErr').textContent = 'Enter a valid email address.';
  const short = cart.find(l => l.qty > byId(l.id).stock);
  if (short) return $('#orderErr').textContent = byId(short.id).name + ' no longer has enough stock.';
  const t = totals(), no = 'TL-' + Date.now().toString(36).toUpperCase();
  orders.push({ no, date: new Date().toISOString().slice(0, 10), name: d.name, email: d.email, phone: d.phone, address: `${d.street}, ${d.city}, ${d.province} ${d.postal}, ${d.country}`, payment: d.payment, status: 'Pending', total: t.total,
    items: cart.map(l => ({ id: l.id, name: byId(l.id).name, size: l.size, qty: l.qty, price: byId(l.id).price })) });
  cart.forEach(l => { const p = byId(l.id); p.stock = Math.max(0, p.stock - l.qty); }); // Update the stock after a demo order is confirmed.
  cart = []; promo = ''; save(); go('#/confirm/' + no);
}

/* ---------- Events ---------- */
const actions = {
  menu: () => $('#nav').classList.toggle('open'),
  close: () => { $('#modal').hidden = true; },
  focusSearch: () => setTimeout(() => $('#search')?.focus(), 50),
  goNew: () => { filters.isNew = true; filters.coll = ''; },
  goLimited: () => { filters.coll = 'limited'; },
  coll: t => { filters.coll = t.dataset.c; go('#/shop'); },
  clear: () => { filters = { q: '', cat: '', color: '', size: '', max: 5000, stock: false, isNew: false, best: false, coll: '', sort: 'featured' }; render(); },
  quick: (t) => quickView(byId(+t.dataset.id)),
  wish: (t) => { const id = +t.dataset.id; wish = wish.includes(id) ? wish.filter(x => x !== id) : [...wish, id]; save(); render(); toast(wish.includes(id) ? 'Saved to wishlist' : 'Removed from wishlist'); },
  size: t => { sel.size = t.dataset.s; t.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b === t)); },
  img: t => { sel.img = +t.dataset.i; render(); },
  q: t => { sel.qty = Math.max(1, sel.qty + +t.dataset.d); $('#q').textContent = sel.qty; },
  add: t => addToCart(+t.dataset.id),
  inc: t => { const l = cart[+t.dataset.i]; if (l.qty < byId(l.id).stock) l.qty++; else toast('No more stock available'); save(); render(); },
  dec: t => { const l = cart[+t.dataset.i]; l.qty = Math.max(1, l.qty - 1); save(); render(); },
  rm: t => { cart.splice(+t.dataset.i, 1); save(); render(); },
  sizeGuide: sizeGuide,
  signout: () => { user = null; save(); render(); },
  tab: t => { adminTab = t.dataset.t; render(); },
  flag: t => { const p = byId(+t.dataset.id); p[t.dataset.k] = !p[t.dataset.k]; save(); render(); },
  del: t => { if (confirm('Delete this product?')) { products = products.filter(p => p.id !== +t.dataset.id); save(); render(); } },
  reset: () => { if (confirm('Reset all demo data?')) { Object.keys(localStorage).filter(k => k.startsWith('tl_')).forEach(k => localStorage.removeItem(k)); location.reload(); } }
};
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]'); if (!t) return;
  if (t.tagName === 'A' && ['sizeGuide', 'focusSearch', 'goNew', 'goLimited'].includes(t.dataset.act) === false && t.getAttribute('href') === '#') e.preventDefault();
  if (t.dataset.act === 'sizeGuide') e.preventDefault();
  actions[t.dataset.act]?.(t);
});
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') actions.close(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') actions.close(); });
document.addEventListener('input', e => {
  const f = e.target.dataset.f; if (!f) return;
  filters[f] = e.target.type === 'checkbox' ? e.target.checked : f === 'max' ? +e.target.value : e.target.value;
  if (f === 'max') e.target.parentElement.firstChild.textContent = 'Max price: ' + peso(filters.max);
  drawGrid();
});
document.addEventListener('change', e => {
  const d = e.target.dataset;
  if (d.stock) { byId(+d.stock).stock = Math.max(0, +e.target.value || 0); save(); render(); }
  if (d.price) { byId(+d.price).price = Math.max(0, +e.target.value || 0); save(); toast('Price updated'); }
  if (d.status) { orders.find(o => o.no === d.status).status = e.target.value; save(); toast('Order status updated'); }
});
document.addEventListener('submit', e => {
  const form = e.target.dataset.form; if (!form) return;
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target)), ok = /^\S+@\S+\.\S+$/.test(d.email || '');
  if (form === 'news') $('#newsMsg').textContent = ok ? 'Thanks. You are on the demo list (nothing was sent).' : 'Enter a valid email address.';
  if (form === 'contact') $('#cErr').textContent = !d.name || !ok || !d.msg ? 'Please add your name, a valid email and a message.' : 'Message received (demo only, nothing was sent).';
  if (form === 'promo') { promo = d.code.trim().toUpperCase() === 'THREADLINE10' ? 'THREADLINE10' : ''; save(); render(); toast(promo ? 'Code applied' : 'Code not recognised'); }
  if (form === 'order') placeOrder(d);
  if (form === 'signin') { if (!d.name || !ok) return $('#signErr').textContent = 'Enter your name and a valid email.'; user = { name: d.name, email: d.email, phone: d.phone, joined: new Date().toISOString().slice(0, 10) }; save(); render(); }
  if (form === 'addProduct') {
    if (!d.name || !(+d.price > 0)) return $('#pErr').textContent = 'Name and a price above zero are required.';
    const id = Math.max(0, ...products.map(p => p.id)) + 1, cat = d.category;
    const p = mk(id, d.name, cat, +d.price, 'essential', (d.colors || 'Black').split(',').map(c => c.trim()).filter(c => HEX[c]).concat([]), +d.stock || 0, (d.isNew ? 'n' : '') + (d.best ? 'b' : ''), d.desc || '');
    if (!p.colors.length) p.colors = ['Black'];
    if (d.image) p.images = [d.image];
    products.push(p); save(); render(); toast('Product added');
  }
  if (form === 'settings') { settings = { ...settings, ...d }; save(); render(); toast('Settings saved'); }
});
window.addEventListener('hashchange', render);
render();
