# THREADLINE: demo clothing store and admin

A front-end only store built with HTML, CSS and vanilla JavaScript. No build step, no backend.

## Run it
Open `index.html` in a browser. If your browser blocks anything, use VS Code Live Server.

## Structure
`index.html`, `style.css`, `script.js`, `data/products.js` (sample products, collections, orders, default settings), `assets/` (drop real images here).

## Features
Home, shop with filters/search/sorting, product page with size and color, quick view, cart with promo code `THREADLINE10`, demo checkout, demo account and order history, wishlist, about, contact, size guide, and an admin at `#/admin` (overview, products, inventory, orders, customers, settings).

## Customize
- Brand name, tagline, announcement, shipping, threshold: Admin > Settings, or `DEFAULT_SETTINGS` in `data/products.js`.
- Colors and fonts: CSS variables at the top of `style.css`.
- Products: edit `PRODUCTS` in `data/products.js` or use Admin > Products. Add `images:['assets/images/products/x.jpg']` to a product to use a photo.
- Reset sample data: Admin > Settings > Reset demo data (clears localStorage).

## Admin
Open `index.html#/admin`. There is no login in this demo.

## Limitations
Everything is simulated. Data lives in localStorage in one browser. Sign-in is not secure, no payments are processed, no emails are sent. Product images are generated placeholders. Stock is tracked per product, not per size. Collections are edited in `data/products.js`, not in the admin. Charts are CSS bars, not Chart.js.
