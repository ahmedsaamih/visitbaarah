import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/plunk";

type TelegramEventType =
  | "booking_request_received"
  | "booking_confirmed"
  | "booking_rejected"
  | "cancellation_request_received"
  | "cancellation_approved"
  | "test";

type TelegramEventPayload = {
  referenceId?: string;
  guestName?: string;
  guestEmail?: string;
  roomType?: string;
  checkIn?: string;
  checkOut?: string;
  reason?: string;
  adminResponse?: string;
};

type TelegramConfig = {
  enabled: boolean;
  chatId: string;
  failureEmail: string;
};

function parseBooleanSetting(value: string | undefined) {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on";
}

async function readSetting(key: string) {
  const setting = await db.query.settings.findFirst({
    where: eq(settings.key, key),
  });
  return setting?.value;
}

async function loadTelegramConfig(): Promise<TelegramConfig> {
  const [enabledSetting, chatIdSetting, failureEmailSetting, recoveryEmailSetting] = await Promise.all([
    readSetting("telegram_notifications_enabled"),
    readSetting("telegram_chat_id"),
    readSetting("telegram_failure_alert_email"),
    readSetting("admin_recovery_email"),
  ]);

  return {
    enabled: parseBooleanSetting(enabledSetting),
    chatId: (chatIdSetting || "").trim(),
    failureEmail:
      (failureEmailSetting || "").trim() ||
      (recoveryEmailSetting || "").trim() ||
      process.env.ADMIN_EMAIL ||
      "",
  };
}

function buildEventMessage(eventType: TelegramEventType, payload: TelegramEventPayload) {
  switch (eventType) {
    case "booking_request_received":
      return [
        "New booking request received",
        `Reference: ${payload.referenceId || "-"}`,
        `Guest: ${payload.guestName || "-"} (${payload.guestEmail || "-"})`,
        `Room: ${payload.roomType || "-"}`,
        `Dates: ${payload.checkIn || "-"} -> ${payload.checkOut || "-"}`,
      ].join("\n");
    case "booking_confirmed":
      return [
        "Booking confirmed",
        `Reference: ${payload.referenceId || "-"}`,
        `Guest: ${payload.guestName || "-"}`,
        `Room: ${payload.roomType || "-"}`,
        `Dates: ${payload.checkIn || "-"} -> ${payload.checkOut || "-"}`,
      ].join("\n");
    case "booking_rejected":
      return [
        "Booking rejected",
        `Reference: ${payload.referenceId || "-"}`,
        `Guest: ${payload.guestName || "-"}`,
        payload.reason ? `Reason: ${payload.reason}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    case "cancellation_request_received":
      return [
        "Cancellation request received",
        `Reference: ${payload.referenceId || "-"}`,
        `Guest: ${payload.guestName || "-"}`,
        payload.reason ? `Reason: ${payload.reason}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    case "cancellation_approved":
      return [
        "Cancellation approved",
        `Reference: ${payload.referenceId || "-"}`,
        `Guest: ${payload.guestName || "-"}`,
        payload.adminResponse ? `Admin note: ${payload.adminResponse}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    case "test":
      return "Telegram notification test: configuration appears active.";
    default:
      return "Telegram event received.";
  }
}

async function sendTelegramFailureEmail(args: {
  failureEmail: string;
  eventType: TelegramEventType;
  payload: TelegramEventPayload;
  reason: string;
}) {
  if (!args.failureEmail) return;
  const body = `
    <h3>Telegram Notification Failure</h3>
    <p><strong>Event:</strong> ${args.eventType}</p>
    <p><strong>Reason:</strong> ${args.reason}</p>
    <p><strong>Reference:</strong> ${args.payload.referenceId || "-"}</p>
    <p><strong>Guest:</strong> ${args.payload.guestName || "-"} (${args.payload.guestEmail || "-"})</p>
    <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
  `;
  await sendEmail({
    to: args.failureEmail,
    subject: `Telegram notification failed (${args.eventType})`,
    body,
  });
}

export async function sendTelegramNotification(eventType: TelegramEventType, payload: TelegramEventPayload) {
  const token = (process.env.TELEGRAM_BOT_TOKEN || "").trim();
  if (!token) return { sent: false, skipped: true, reason: "TELEGRAM_BOT_TOKEN is missing" };

  const config = await loadTelegramConfig();
  if (!config.enabled) return { sent: false, skipped: true, reason: "Telegram notifications disabled" };
  if (!config.chatId) return { sent: false, skipped: true, reason: "telegram_chat_id is not configured" };

  const text = buildEventMessage(eventType, payload);
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: config.chatId,
        text,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      const reason = `Telegram API ${response.status}: ${details}`;
      console.error("[Telegram] sendMessage failed:", reason);
      await sendTelegramFailureEmail({
        failureEmail: config.failureEmail,
        eventType,
        payload,
        reason,
      });
      return { sent: false, skipped: false, reason };
    }

    return { sent: true, skipped: false };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown Telegram error";
    console.error("[Telegram] sendMessage error:", reason);
    await sendTelegramFailureEmail({
      failureEmail: config.failureEmail,
      eventType,
      payload,
      reason,
    });
    return { sent: false, skipped: false, reason };
  }
}
