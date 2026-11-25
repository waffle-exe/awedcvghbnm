import { PHOTO } from "./images.js";

export const CROWD_LABELS = ["Very quiet", "Quiet", "Moderate", "Busy", "Crowded"];

export const TRIP_TYPES = [
  { id: "solo", title: "Solo trips", icon: "user", text: "Travel at your own pace with scenic, safe and easy-to-plan routes." },
  { id: "couple", title: "Couple trips", icon: "heart", text: "Quiet stays, beautiful views and time for just the two of you." },
  { id: "friends", title: "Friends trips", icon: "users", text: "Road trips, treks and group stays that are easy to split and plan." },
  { id: "bachelorette", title: "Bachelorette trips", icon: "sparkle", text: "Relaxed, photo-worthy getaways to celebrate before the big day." },
  { id: "family", title: "Family trips", icon: "home", text: "Comfortable itineraries that work for kids, parents and grandparents." },
];

export const PACKAGES = [
  { id: 1, name: "Kashmir Valley", region: "Jammu & Kashmir", days: "6N / 7D", price: 28999, category: "mountains", tag: "Bestseller", img: PHOTO.kashmir, blurb: "Houseboats, meadows and snow-capped peaks.", trips: ["couple", "family", "friends"], lat: 34.08, lng: 74.8 },
  { id: 2, name: "Manali & Shimla", region: "Himachal Pradesh", days: "5N / 6D", price: 19999, category: "mountains", tag: "Honeymoon", img: PHOTO.manali, blurb: "Pine forests, mountain passes and cosy stays.", trips: ["couple", "friends", "family"], lat: 32.24, lng: 77.19 },
  { id: 3, name: "Ladakh Expedition", region: "Ladakh", days: "7N / 8D", price: 38499, category: "mountains", tag: "Adventure", img: PHOTO.ladakh, blurb: "High-altitude lakes and dramatic landscapes.", trips: ["solo", "friends"], lat: 34.15, lng: 77.58 },
  { id: 4, name: "Kerala Backwaters", region: "Kerala", days: "5N / 6D", price: 24999, category: "rivers", tag: "Family", img: PHOTO.kerala, blurb: "Houseboat cruises through calm green waterways.", trips: ["couple", "family", "bachelorette"], lat: 9.5, lng: 76.34 },
  { id: 5, name: "Munnar Tea Hills", region: "Kerala", days: "4N / 5D", price: 17999, category: "mountains", tag: "Relaxing", img: PHOTO.munnar, blurb: "Mist-covered tea estates and cool mornings.", trips: ["solo", "couple", "family"], lat: 10.09, lng: 77.06 },
  { id: 6, name: "Uttarakhand Trails", region: "Uttarakhand", days: "6N / 7D", price: 21999, category: "mountains", tag: "Trekking", img: PHOTO.uttarakhand, blurb: "Winding mountain roads and forest trails.", trips: ["solo", "friends"], lat: 30.46, lng: 78.07 },
  { id: 7, name: "Coorg Rivers & Coffee", region: "Karnataka", days: "4N / 5D", price: 23499, category: "rivers", tag: "Nature", img: PHOTO.coorg, blurb: "Turquoise rivers, plantations and slow mornings.", trips: ["friends", "bachelorette", "couple"], lat: 12.42, lng: 75.74 },
  { id: 8, name: "Iceland Rivers & Canyons", region: "Iceland", days: "6N / 7D", price: 124999, category: "rivers", tag: "International", img: PHOTO.iceland, blurb: "Glacial rivers carving through green canyons.", trips: ["couple", "friends", "bachelorette"] },
];

/* Less crowded places (sample details, replace with your own research) */
export const GEMS = [
  { id: "g1", name: "Tirthan Valley", region: "Himachal Pradesh", blurb: "Riverside stays, pine forests and trout streams, away from the Manali rush.", season: "Mar – Jun", days: "3–4 days", crowd: 1, trips: ["solo", "couple", "friends"], img: PHOTO.uttarakhand, pos: "center 30%", lat: 31.63, lng: 77.45 },
  { id: "g2", name: "Chopta", region: "Uttarakhand", blurb: "Meadows and forest trails on the way to Tungnath, still calm and unspoiled.", season: "Apr – Jun", days: "3–4 days", crowd: 2, trips: ["solo", "friends", "couple"], img: PHOTO.manali, pos: "center 65%", lat: 30.38, lng: 79.09 },
  { id: "g3", name: "Ziro Valley", region: "Arunachal Pradesh", blurb: "Rice fields, pine-covered hills and the warm culture of the Apatani people.", season: "Mar – Oct", days: "4–5 days", crowd: 1, trips: ["solo", "couple", "friends"], img: PHOTO.munnar, pos: "center 40%", lat: 27.55, lng: 93.83 },
  { id: "g4", name: "Gurez Valley", region: "Jammu & Kashmir", blurb: "A remote valley of clear rivers and snow peaks, reachable mostly in summer.", season: "Jun – Sep", days: "3–4 days", crowd: 1, trips: ["solo", "friends"], img: PHOTO.kashmir, pos: "center 70%", lat: 34.63, lng: 74.84 },
  { id: "g5", name: "Majuli", region: "Assam", blurb: "One of the largest river islands in the world, with quiet villages and monasteries.", season: "Oct – Mar", days: "2–3 days", crowd: 2, trips: ["solo", "couple", "family"], img: PHOTO.coorg, pos: "center 55%", lat: 26.95, lng: 94.17 },
  { id: "g6", name: "Munsiyari", region: "Uttarakhand", blurb: "A Himalayan village facing the Panchachuli peaks, far from the usual hill-station crowds.", season: "Apr – Jun", days: "4–5 days", crowd: 2, trips: ["solo", "couple", "family", "friends"], img: PHOTO.ladakh, pos: "center 45%", lat: 30.07, lng: 80.24 },
];

/* Everything that appears as a pin on the interactive map */
export const PLACES = [
  ...PACKAGES.filter((p) => p.lat != null).map((p) => ({
    id: `p${p.id}`, ref: p.id, kind: "popular", name: p.name, region: p.region, blurb: p.blurb, img: p.img,
    lat: p.lat, lng: p.lng, extra: `${p.days} · from ₹${p.price.toLocaleString("en-IN")}`,
  })),
  ...GEMS.map((g) => ({
    id: g.id, ref: g.id, kind: "gem", name: g.name, region: g.region, blurb: g.blurb, img: g.img,
    lat: g.lat, lng: g.lng, extra: `${CROWD_LABELS[g.crowd - 1]} · Best ${g.season}`,
  })),
];

/* Sample trips for the live tracker demo */
export const TRACKS = [
  {
    id: "cab-manali", label: "Delhi to Manali", mode: "Cab", minutes: 720, km: 540, ref: "YV-1042",
    points: [
      { name: "Delhi", lat: 28.6139, lng: 77.209 },
      { name: "Chandigarh", lat: 30.7333, lng: 76.7794 },
      { name: "Bilaspur", lat: 31.3333, lng: 76.75 },
      { name: "Mandi", lat: 31.7082, lng: 76.932 },
      { name: "Kullu", lat: 31.9579, lng: 77.1095 },
      { name: "Manali", lat: 32.2432, lng: 77.1892 },
    ],
  },
  {
    id: "flight-srinagar", label: "Delhi to Srinagar", mode: "Flight", minutes: 95, km: 650, ref: "YV-2210",
    points: [
      { name: "Delhi", lat: 28.6139, lng: 77.209 },
      { name: "Over Chandigarh", lat: 30.7333, lng: 76.7794 },
      { name: "Over Jammu", lat: 32.7266, lng: 74.857 },
      { name: "Srinagar", lat: 34.0837, lng: 74.7973 },
    ],
  },
  {
    id: "cab-munnar", label: "Kochi to Munnar", mode: "Cab", minutes: 270, km: 130, ref: "YV-3307",
    points: [
      { name: "Kochi", lat: 9.9312, lng: 76.2673 },
      { name: "Kothamangalam", lat: 10.06, lng: 76.635 },
      { name: "Adimali", lat: 10.014, lng: 76.956 },
      { name: "Munnar", lat: 10.0889, lng: 77.0595 },
    ],
  },
];

export const OFFERS = [
  { title: "12% off on domestic flights", text: "Valid on bookings above ₹5,000. Fly anywhere in India for less.", code: "YATRAFLY" },
  { title: "₹1,500 off on airport cabs", text: "Pre-book your airport pickup or drop and save on your first ride.", code: "CABGO" },
  { title: "Free stay upgrade on holidays", text: "Get a complimentary room upgrade on selected holiday packages.", code: "HOLIDAY26" },
];

export const SERVICES = [
  { icon: "plane", title: "Flights", text: "Compare fares across airlines and book domestic and international flights in minutes.", tab: "flights", cta: "Search flights" },
  { icon: "car", title: "Cabs", text: "Airport transfers, outstation trips and local rentals with verified drivers.", tab: "cabs", cta: "Book a cab" },
  { icon: "mountain", title: "Holidays", text: "Handpicked itineraries with stays, sightseeing and transfers taken care of.", tab: "holidays", cta: "Explore holidays" },
];

export const STEPS = [
  { icon: "search", title: "Search", text: "Tell us where you want to go, when, and how many are travelling." },
  { icon: "tag", title: "Compare and choose", text: "See clear prices and inclusions, then pick what suits your plan and budget." },
  { icon: "pin", title: "Book and travel", text: "Confirm securely and get on your way. We are with you at every step." },
];

export const STATS = [
  { value: 2.5, suffix: "M+", label: "Happy travellers", decimals: 1 },
  { value: 850, suffix: "+", label: "Destinations covered", decimals: 0 },
  { value: 24, suffix: "/7", label: "Customer support", decimals: 0 },
  { value: 4.8, suffix: "/5", label: "Average rating", decimals: 1 },
];

export const TESTIMONIALS = [
  { name: "Ananya Sharma", trip: "Kashmir Valley, 6N / 7D", text: "Everything was planned perfectly, from the flights to the houseboat stay. We just had to enjoy the trip." },
  { name: "Rohit Verma", trip: "Manali & Shimla, 5N / 6D", text: "Transparent pricing and a very responsive team. The cab was on time at every pickup." },
  { name: "Meera Nair", trip: "Kerala Backwaters, 5N / 6D", text: "A calm, beautifully organised holiday for our whole family. We will book with Yatra Ventures again." },
];