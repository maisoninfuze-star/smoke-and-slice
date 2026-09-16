export const STORE = {
  name: "Mr Smoke Et Slice",
  taglineFr: "L'amour à la première slice",
  taglineEn: "Love at first slice",
  address: "5518 Sherbrooke St W, Montréal, QC H4A 1W2",
  addressShort: "5518 Sherbrooke O., NDG",
  phone: "+15148265780",
  phoneDisplay: "(514) 826-5780",
  phoneAlt: "+15148200069",
  phoneAltDisplay: "(514) 820-0069",
  lat: 45.4713,
  lng: -73.6157,
  googleRating: 4.6,
  googleReviews: 136,
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Mr+Smoke+Et+Slice+5518+Sherbrooke+St+W+Montreal",

  /**
   * Online ordering is closed for now — no cart, no checkout, no pickup
   * orders. The site is a menu and information site: customers phone for
   * pickup and use the marketplaces below for delivery. Enforced in the
   * orders API, not just hidden in the UI. Flip to true to reopen.
   */
  onlineOrdering: false,

  /**
   * Our own delivery (Uber Direct) is switched off for now. While it is off,
   * the checkout is pickup-only — enforced in the orders API, not just hidden
   * in the UI — and delivery customers are sent to the marketplaces below.
   * Flip to true once the Uber Direct contract is live.
   */
  deliveryEnabled: false,
} as const;

export type DeliveryPartner = {
  key: "ubereats" | "doordash";
  name: string;
  /** Marketplace store page. Leave empty until the store is listed there. */
  urlFr: string;
  urlEn: string;
  /** Brand colour for the button — each marketplace has a recognisable one. */
  color: string;
};

export const DELIVERY_PARTNERS: readonly DeliveryPartner[] = [
  {
    key: "ubereats",
    name: "Uber Eats",
    urlFr: "https://www.ubereats.com/ca-fr/store/mr-smoke-et-slice/-EiJ5aYwXuu0mbz-ePgi2Q",
    urlEn: "https://www.ubereats.com/ca/store/mr-smoke-et-slice/-EiJ5aYwXuu0mbz-ePgi2Q",
    color: "#06C167",
  },
  {
    // Not found on DoorDash as of 2026-09-15. Fill both URLs in when the
    // store is listed and the button appears everywhere automatically.
    key: "doordash",
    name: "DoorDash",
    urlFr: "",
    urlEn: "",
    color: "#FF3008",
  },
];

/** Partners that actually have a store page — the ones we can link to. */
export function activeDeliveryPartners(): DeliveryPartner[] {
  return DELIVERY_PARTNERS.filter((p) => p.urlFr && p.urlEn);
}
