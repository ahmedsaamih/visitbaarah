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
};

export function getRoomTypeRatesSettingKey(roomTypeId: number) {
  return `room_type_rates:${roomTypeId}`;
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
  rates: SeasonalRate[]
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
    };
  }
  const total = nightlyRates.reduce((sum, nightly) => sum + nightly, 0);
  const min = Math.min(...nightlyRates);
  const max = Math.max(...nightlyRates);
  return {
    nights,
    roomTotal: total.toFixed(2),
    minNightlyRate: min.toFixed(2),
    maxNightlyRate: max.toFixed(2),
    averageNightlyRate: (total / nights).toFixed(2),
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
