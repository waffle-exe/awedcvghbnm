# Yatra Ventures – React travel site

## Run it
```
npm install
npm run dev
```
Open the URL Vite prints (usually http://localhost:5173). Put all files in one folder.

## What is inside
- `index.html`, `main.jsx` – entry (Google Fonts: Cormorant Garamond + Poppins)
- `App.jsx` – header, hero, search with "Coming soon" popup, services, packages, offers,
  how it works, reviews, newsletter, wishlist drawer, checkout drawer, login
- `Preloader.jsx` – mountain loader: fills as real images load, then the mountains sink and the screen lifts
- `Scenery.jsx` – photo background (mountains fade out, river fades in on scroll) and the grass-photo footer
- `images.js` – every photo used (Unsplash IDs). Swap them here
- `hooks.js`, `Icons.jsx`, `data.js`, `styles.css`

## Photos
Photos load from Unsplash (free to use under the Unsplash License) through
`https://unsplash.com/photos/<id>/download?force=true&w=...`.
If an image does not appear, or you want it to load faster, download it and put it in
`public/images/`, then in `images.js` replace the `u("...")` call with `"/images/yourfile.jpg"`.

## Notes
- Package names, prices, stats, offer codes, reviews and the contact details are placeholders.
- Search, Pay now and login are front-end only. Login only shows your name in the header.
