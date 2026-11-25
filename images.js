/*
  All photos come from Unsplash (free to use under the Unsplash License).
  These are direct image links (images.unsplash.com), so they load as normal <img>/background images.

  To use your own images instead, drop files in /public/images and replace a
  line with e.g.  export const HERO = "/images/hero.jpg";
*/
const img = (id, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?fm=jpg&q=75&w=${w}&auto=format&fit=crop&ixlib=rb-4.1.0`;

// Full-screen backgrounds
export const HERO = img("1759406113196-955a992fc54d", 2200);   // misty green hills (Benjamin Esteves)
export const RIVER = img("1759681770972-560b9949da0b", 2200);  // winding river through forest (Kristaps Ungurs)
export const GRASS = img("1527475549522-94b2a376ce13", 2200);  // green grass (Wendy Aros-Routman)

// Destination cards
export const PHOTO = {
  kashmir: img("1767601047620-6650345cbaa5", 900),     // Jacob Padilla
  manali: img("1767601047966-8b5ea4885007", 900),      // Jacob Padilla
  ladakh: img("1770034568779-af19841f2aeb", 900),      // Nikita Pishchugin
  kerala: img("1448099940878-e0c48ea3a165", 900),      // Dan Roizer
  munnar: img("1767601047773-cebe39332fc5", 900),      // Jacob Padilla
  uttarakhand: img("1767601047963-5803e244da78", 900), // Jacob Padilla
  coorg: img("1751381242854-b798138a753c", 900),       // Sunira Moses
  iceland: img("1782489238585-9bf48e9211e6", 900),     // Carles Rabada
};