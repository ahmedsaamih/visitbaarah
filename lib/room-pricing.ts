import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export type SeasonalRate = {
  startDate: string;
  endDate: string;
  nightlyRate: string;
  label?: string;
};

export type RoomPricingSummary = {
  nights: number;
  roomTotal: string;
  minNightlyRate: string;
  maxNightlyRate: string;
  averageNightlyRate: string;
  discountPercentApplied: string;
  discountAmount: string;
};

export function getRoomTypeRatesSettingKey(roomTypeId: number) {
  return `room_type_rates:${roomTypeId}`;
}

export function getRoomTypeMaldivianDiscountKey(roomTypeId: number) {
  return `room_type_maldivian_discount:${roomTypeId}`;
}

export function normalizeSeasonalRates(value: unknown): SeasonalRate[] {
  if (!Array.isArray(value)) return [];
  const normalized: SeasonalRate[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const raw = item as Record<string, unknown>;
    const startDate = typeof raw.startDate === "string" ? raw.startDate : "";
    const endDate = typeof raw.endDate === "string" ? raw.endDate : "";
    const nightlyRateNum = Number(raw.nightlyRate);
    if (!isIsoDate(startDate) || !isIsoDate(endDate) || !Number.isFinite(nightlyRateNum) || nightlyRateNum < 0) {
      continue;
    }
    if (startDate > endDate) continue;
    normalized.push({
      startDate,
      endDate,
      nightlyRate: nightlyRateNum.toFixed(2),
      label: typeof raw.label === "string" ? raw.label.trim().slice(0, 80) : undefined,
    });
  }
  return normalized;
}

export async function getSeasonalRatesMap(roomTypeIds: number[]) {
  if (roomTypeIds.length === 0) return new Map<number, SeasonalRate[]>();
  const keys = roomTypeIds.map((id) => getRoomTypeRatesSettingKey(id));
  const rows = await db.query.settings.findMany({
    where: inArray(settings.key, keys),
  });
  const byRoomTypeId = new Map<number, SeasonalRate[]>();
  for (const row of rows) {
    const id = Number(row.key.split(":")[1]);
    if (!Number.isInteger(id)) continue;
    byRoomTypeId.set(id, normalizeSeasonalRates(safeJsonParse(row.value)));
  }
  return byRoomTypeId;
}

export async function getMaldivianDiscountMap(roomTypeIds: number[]) {
  if (roomTypeIds.length === 0) return new Map<number, string>();
  const keys = roomTypeIds.map((id) => getRoomTypeMaldivianDiscountKey(id));
  const rows = await db.query.settings.findMany({
    where: inArray(settings.key, keys),
  });
  const byRoomTypeId = new Map<number, string>();
  for (const row of rows) {
    const id = Number(row.key.split(":")[1]);
    if (!Number.isInteger(id)) continue;
    byRoomTypeId.set(id, normalizeDiscountPercent(row.value));
  }
  return byRoomTypeId;
}

export async function saveSeasonalRates(roomTypeId: number, rates: SeasonalRate[]) {
  const key = getRoomTypeRatesSettingKey(roomTypeId);
  const existing = await db.query.settings.findFirst({
    where: eq(settings.key, key),
  });
  const value = JSON.stringify(rates);
  if (existing) {
    await db
      .update(settings)
      .set({ value, group: "pricing", updatedAt: new Date() })
      .where(eq(settings.key, key));
    return;
  }
  await db.insert(settings).values({
    key,
    value,
    group: "pricing",
  });
}

export async function saveMaldivianDiscountPercent(roomTypeId: number, discountPercent: unknown) {
  const key = getRoomTypeMaldivianDiscountKey(roomTypeId);
  const value = normalizeDiscountPercent(discountPercent);
  const existing = await db.query.settings.findFirst({
    where: eq(settings.key, key),
  });
  if (existing) {
    await db
      .update(settings)
      .set({ value, group: "pricing", updatedAt: new Date() })
      .where(eq(settings.key, key));
    return;
  }
  await db.insert(settings).values({
    key,
    value,
    group: "pricing",
  });
}

export function normalizeDiscountPercent(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "0.00";
  if (parsed < 0) return "0.00";
  if (parsed > 100) return "100.00";
  return parsed.toFixed(2);
}

export function isMaldivianNationality(value: unknown) {
  return typeof value === "string" && value.trim().toLowerCase() === "maldivian";
}

export function getNightlyRateForDate(basePrice: string, dateStr: string, rates: SeasonalRate[]) {
  for (const rate of rates) {
    if (dateStr >= rate.startDate && dateStr <= rate.endDate) {
      return Number(rate.nightlyRate);
    }
  }
  return Number(basePrice);
}

export function calculateRoomPricing(
  basePrice: string,
  checkIn: string,
  checkOut: string,
  rates: SeasonalRate[],
  options?: { applyMaldivianDiscount?: boolean; maldivianDiscountPercent?: string }
): RoomPricingSummary {
  const nightlyRates: number[] = [];
  const cursor = new Date(`${checkIn}T00:00:00.000Z`);
  const checkoutDate = new Date(`${checkOut}T00:00:00.000Z`);
  while (cursor < checkoutDate) {
    const dateStr = cursor.toISOString().split("T")[0];
    nightlyRates.push(getNightlyRateForDate(basePrice, dateStr, rates));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  const nights = nightlyRates.length;
  if (nights === 0) {
    return {
      nights: 0,
      roomTotal: "0.00",
      minNightlyRate: Number(basePrice).toFixed(2),
      maxNightlyRate: Number(basePrice).toFixed(2),
      averageNightlyRate: Number(basePrice).toFixed(2),
      discountPercentApplied: "0.00",
      discountAmount: "0.00",
    };
  }
  const subtotal = nightlyRates.reduce((sum, nightly) => sum + nightly, 0);
  const discountPercent = options?.applyMaldivianDiscount
    ? Number(normalizeDiscountPercent(options.maldivianDiscountPercent))
    : 0;
  const discountAmount = subtotal * (discountPercent / 100);
  const total = subtotal - discountAmount;
  const discountedNightlyRates =
    discountPercent > 0 ? nightlyRates.map((nightly) => nightly * (1 - discountPercent / 100)) : nightlyRates;
  const min = Math.min(...discountedNightlyRates);
  const max = Math.max(...discountedNightlyRates);
  return {
    nights,
    roomTotal: total.toFixed(2),
    minNightlyRate: min.toFixed(2),
    maxNightlyRate: max.toFixed(2),
    averageNightlyRate: (total / nights).toFixed(2),
    discountPercentApplied: discountPercent.toFixed(2),
    discountAmount: discountAmount.toFixed(2),
  };
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}
