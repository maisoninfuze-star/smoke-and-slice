/**
 * Uber Direct (Uber Eats "Direct" delivery-as-a-service) client.
 *
 * Flow:
 *   1. getAccessToken()      — OAuth2 client_credentials, cached in-process until expiry
 *   2. createQuote()         — price + ETA for a dropoff, valid ~5 minutes
 *   3. createDelivery()      — dispatch a courier, optionally against a quote id
 *   4. getDelivery()         — poll status / courier location
 *   5. cancelDelivery()      — cancel before pickup
 *   6. verifyWebhook()       — HMAC-SHA256 signature check on inbound status events
 *
 * Docs: https://developer.uber.com/docs/deliveries
 */
import { createHmac, timingSafeEqual } from "node:crypto";

const AUTH_URL = "https://auth.uber.com/oauth/v2/token";
const API_BASE = "https://api.uber.com/v1/customers";

export class UberDirectError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public body?: unknown
  ) {
    super(message);
    this.name = "UberDirectError";
  }
}

export function uberConfigured(): boolean {
  return Boolean(
    process.env.UBER_CUSTOMER_ID && process.env.UBER_CLIENT_ID && process.env.UBER_CLIENT_SECRET
  );
}

let tokenCache: { token: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.token;

  const body = new URLSearchParams({
    client_id: process.env.UBER_CLIENT_ID ?? "",
    client_secret: process.env.UBER_CLIENT_SECRET ?? "",
    grant_type: "client_credentials",
    scope: "eats.deliveries",
  });

  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  const json = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
  };

  if (!res.ok || !json.access_token) {
    throw new UberDirectError(
      json.error ?? "Uber OAuth failed",
      res.status,
      "oauth_failed",
      json
    );
  }

  tokenCache = {
    token: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 2592000) * 1000,
  };
  return tokenCache.token;
}

async function uberFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const customerId = process.env.UBER_CUSTOMER_ID ?? "";
  const res = await fetch(`${API_BASE}/${customerId}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw new UberDirectError(
      json?.message ?? `Uber request failed: ${path}`,
      res.status,
      json?.code,
      json
    );
  }
  return json as T;
}

/** Uber expects the structured address as a JSON *string*. */
export type UberAddress = {
  street_address: string[];
  city: string;
  state: string;
  zip_code: string;
  country: string;
};

export function formatAddress(a: {
  line1: string;
  line2?: string | null;
  city?: string | null;
  province?: string | null;
  postal: string;
}): string {
  const address: UberAddress = {
    street_address: [a.line1, ...(a.line2 ? [a.line2] : [])],
    city: a.city || "Montreal",
    state: a.province || "QC",
    zip_code: a.postal.toUpperCase().replace(/\s+/g, " "),
    country: "CA",
  };
  return JSON.stringify(address);
}

export function pickupAddress(): string {
  return formatAddress({ line1: "5518 Sherbrooke St W", postal: "H4A 1W2" });
}

export type QuoteResponse = {
  id: string;
  fee: number;
  currency: string;
  dropoff_eta: string;
  duration: number;
  pickup_duration: number;
  expires: string;
};

export async function createQuote(params: {
  dropoffAddress: string;
  dropoffPhone?: string;
  pickupReadyMinutes?: number;
}): Promise<QuoteResponse> {
  const pickupReady = new Date(
    Date.now() + (params.pickupReadyMinutes ?? 20) * 60_000
  ).toISOString();

  return uberFetch<QuoteResponse>("/delivery_quotes", {
    method: "POST",
    body: JSON.stringify({
      pickup_address: pickupAddress(),
      dropoff_address: params.dropoffAddress,
      pickup_ready_dt: pickupReady,
      ...(params.dropoffPhone ? { dropoff_phone_number: params.dropoffPhone } : {}),
    }),
  });
}

export type DeliveryResponse = {
  id: string;
  status: string;
  tracking_url: string;
  fee: number;
  currency: string;
  dropoff_eta?: string;
  courier?: {
    name?: string;
    phone_number?: string;
    location?: { lat: number; lng: number };
    vehicle_type?: string;
  } | null;
};

export async function createDelivery(params: {
  quoteId?: string;
  orderNumber: string;
  dropoffAddress: string;
  dropoffName: string;
  dropoffPhone: string;
  dropoffNotes?: string;
  manifestItems: { name: string; quantity: number; price: number }[];
  manifestTotalCents: number;
  tipCents?: number;
  pickupReadyMinutes?: number;
}): Promise<DeliveryResponse> {
  const pickupReady = new Date(
    Date.now() + (params.pickupReadyMinutes ?? 20) * 60_000
  ).toISOString();

  return uberFetch<DeliveryResponse>("/deliveries", {
    method: "POST",
    body: JSON.stringify({
      ...(params.quoteId ? { quote_id: params.quoteId } : {}),
      pickup_name: process.env.STORE_NAME ?? "Mr Smoke Et Slice",
      pickup_address: pickupAddress(),
      pickup_phone_number: process.env.STORE_PHONE ?? "+15148265780",
      pickup_business_name: "Mr Smoke Et Slice",
      pickup_instructions: "Order pickup counter — ask for the order number.",
      pickup_ready_dt: pickupReady,

      dropoff_name: params.dropoffName,
      dropoff_address: params.dropoffAddress,
      dropoff_phone_number: params.dropoffPhone,
      ...(params.dropoffNotes ? { dropoff_notes: params.dropoffNotes } : {}),

      manifest_reference: params.orderNumber,
      manifest_total_value: params.manifestTotalCents,
      manifest_items: params.manifestItems.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        size: "small",
      })),
      ...(params.tipCents ? { tip: params.tipCents } : {}),
    }),
  });
}

export async function getDelivery(deliveryId: string): Promise<DeliveryResponse> {
  return uberFetch<DeliveryResponse>(`/deliveries/${deliveryId}`);
}

export async function cancelDelivery(deliveryId: string): Promise<{ id: string; status: string }> {
  return uberFetch(`/deliveries/${deliveryId}/cancel`, { method: "POST" });
}

/** Map Uber's delivery status onto our order status vocabulary. */
export function mapUberStatus(uberStatus: string): string | null {
  switch (uberStatus) {
    case "pending":
    case "pickup":
    case "pickup_complete":
      return "DISPATCHED";
    case "dropoff":
      return "DISPATCHED";
    case "delivered":
      return "DELIVERED";
    case "canceled":
    case "returned":
      return "CANCELLED";
    default:
      return null;
  }
}

/**
 * Uber signs webhooks with HMAC-SHA256 over the raw body, hex-encoded,
 * in the `x-postmates-signature` header.
 */
export function verifyWebhook(rawBody: string, signature: string | null): boolean {
  const secret = process.env.UBER_WEBHOOK_SECRET;
  if (!secret) return false;
  if (!signature) return false;

  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature.trim(), "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
