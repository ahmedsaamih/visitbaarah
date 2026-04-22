const PLUNK_API_URL = "https://api.useplunk.com/v1/track";

interface EmailParams {
  to: string;
  subject: string;
  body: string;
}

/**
 * Send an email via Plunk REST API.
 */
export async function sendEmail({ to, subject, body }: EmailParams): Promise<boolean> {
  const apiKey = process.env.PLUNK_API_KEY;
  if (!apiKey) {
    console.warn("[Plunk] No API key configured, skipping email send.");
    return false;
  }

  try {
    const res = await fetch("https://api.useplunk.com/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ 
        to, 
        subject, 
        body,
        from: process.env.PLUNK_FROM_EMAIL || "info@islandsmv.online"
      }),
    });

    if (!res.ok) {
      console.error("[Plunk] Email send failed:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Plunk] Email send error:", err);
    return false;
  }
}

/**
 * Wrap content in the branded email layout.
 */
function emailLayout(content: string, propertyName = "Serene Seaview"): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ee;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
  <tr><td style="background:#0D5C5C;padding:32px 40px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:400;letter-spacing:2px;">${propertyName}</h1>
  </td></tr>
  <tr><td style="padding:40px;">
    ${content}
  </td></tr>
  <tr><td style="background:#faf8f3;padding:24px 40px;text-align:center;border-top:1px solid #eee;">
    <p style="margin:0;color:#999;font-size:12px;">&copy; ${new Date().getFullYear()} ${propertyName}. All rights reserved.</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// ─── Email Templates ──────────────────────────────────────

/**
 * 1. Booking received — sent to guest when they submit a booking.
 */
export async function sendBookingReceivedEmail(
  to: string,
  data: { guestName: string; referenceId: string; roomType: string; checkIn: string; checkOut: string; totalAmount: string }
) {
  const body = emailLayout(`
    <h2 style="color:#0D5C5C;margin:0 0 20px;font-size:20px;">Booking Received</h2>
    <p style="color:#333;line-height:1.6;">Dear ${data.guestName},</p>
    <p style="color:#333;line-height:1.6;">Thank you for your booking request. We have received it and will review it shortly.</p>
    <table style="width:100%;margin:24px 0;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#666;border-bottom:1px solid #eee;">Reference</td><td style="padding:8px 0;color:#333;font-weight:600;border-bottom:1px solid #eee;">${data.referenceId}</td></tr>
      <tr><td style="padding:8px 0;color:#666;border-bottom:1px solid #eee;">Room Type</td><td style="padding:8px 0;color:#333;border-bottom:1px solid #eee;">${data.roomType}</td></tr>
      <tr><td style="padding:8px 0;color:#666;border-bottom:1px solid #eee;">Check-in</td><td style="padding:8px 0;color:#333;border-bottom:1px solid #eee;">${data.checkIn}</td></tr>
      <tr><td style="padding:8px 0;color:#666;border-bottom:1px solid #eee;">Check-out</td><td style="padding:8px 0;color:#333;border-bottom:1px solid #eee;">${data.checkOut}</td></tr>
      <tr><td style="padding:8px 0;color:#666;">Total</td><td style="padding:8px 0;color:#0D5C5C;font-weight:600;font-size:18px;">${data.totalAmount}</td></tr>
    </table>
    <p style="color:#333;line-height:1.6;">You can check your booking status anytime using your reference ID.</p>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/booking/${data.referenceId}" style="display:inline-block;background:#0D5C5C;color:#fff;text-decoration:none;padding:12px 28px;border-radius:4px;margin-top:16px;font-size:14px;">View Booking</a>
  `);
  return sendEmail({ to, subject: `Booking Received — ${data.referenceId}`, body });
}

/**
 * 2. Booking confirmed — sent to guest when admin confirms.
 */
export async function sendBookingConfirmedEmail(
  to: string,
  data: { guestName: string; referenceId: string; roomType: string; roomNumber?: string; checkIn: string; checkOut: string }
) {
  const body = emailLayout(`
    <h2 style="color:#0D5C5C;margin:0 0 20px;font-size:20px;">Booking Confirmed ✓</h2>
    <p style="color:#333;line-height:1.6;">Dear ${data.guestName},</p>
    <p style="color:#333;line-height:1.6;">Great news! Your booking has been confirmed. We look forward to welcoming you.</p>
    <table style="width:100%;margin:24px 0;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#666;border-bottom:1px solid #eee;">Reference</td><td style="padding:8px 0;color:#333;font-weight:600;border-bottom:1px solid #eee;">${data.referenceId}</td></tr>
      <tr><td style="padding:8px 0;color:#666;border-bottom:1px solid #eee;">Room</td><td style="padding:8px 0;color:#333;border-bottom:1px solid #eee;">${data.roomType}${data.roomNumber ? ` (Room ${data.roomNumber})` : ""}</td></tr>
      <tr><td style="padding:8px 0;color:#666;border-bottom:1px solid #eee;">Check-in</td><td style="padding:8px 0;color:#333;border-bottom:1px solid #eee;">${data.checkIn}</td></tr>
      <tr><td style="padding:8px 0;color:#666;">Check-out</td><td style="padding:8px 0;color:#333;">${data.checkOut}</td></tr>
    </table>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/booking/${data.referenceId}" style="display:inline-block;background:#0D5C5C;color:#fff;text-decoration:none;padding:12px 28px;border-radius:4px;margin-top:16px;font-size:14px;">View Booking</a>
  `);
  return sendEmail({ to, subject: `Booking Confirmed — ${data.referenceId}`, body });
}

/**
 * 3. Booking rejected — sent to guest when admin rejects.
 */
export async function sendBookingRejectedEmail(
  to: string,
  data: { guestName: string; referenceId: string; reason?: string }
) {
  const body = emailLayout(`
    <h2 style="color:#c0392b;margin:0 0 20px;font-size:20px;">Booking Not Available</h2>
    <p style="color:#333;line-height:1.6;">Dear ${data.guestName},</p>
    <p style="color:#333;line-height:1.6;">We regret to inform you that we are unable to accommodate your booking request (Ref: ${data.referenceId}).</p>
    ${data.reason ? `<p style="color:#333;line-height:1.6;"><strong>Reason:</strong> ${data.reason}</p>` : ""}
    <p style="color:#333;line-height:1.6;">We apologize for any inconvenience and hope to welcome you in the future.</p>
  `);
  return sendEmail({ to, subject: `Booking Update — ${data.referenceId}`, body });
}

/**
 * 4. Cancellation request received — sent to guest.
 */
export async function sendCancellationRequestEmail(
  to: string,
  data: { guestName: string; referenceId: string }
) {
  const body = emailLayout(`
    <h2 style="color:#0D5C5C;margin:0 0 20px;font-size:20px;">Cancellation Request Received</h2>
    <p style="color:#333;line-height:1.6;">Dear ${data.guestName},</p>
    <p style="color:#333;line-height:1.6;">We have received your cancellation request for booking ${data.referenceId}. Our team will review it and get back to you shortly.</p>
  `);
  return sendEmail({ to, subject: `Cancellation Request — ${data.referenceId}`, body });
}

/**
 * 5. Cancellation approved — sent to guest.
 */
export async function sendCancellationApprovedEmail(
  to: string,
  data: { guestName: string; referenceId: string }
) {
  const body = emailLayout(`
    <h2 style="color:#0D5C5C;margin:0 0 20px;font-size:20px;">Cancellation Approved</h2>
    <p style="color:#333;line-height:1.6;">Dear ${data.guestName},</p>
    <p style="color:#333;line-height:1.6;">Your cancellation request for booking ${data.referenceId} has been approved. We hope to welcome you in the future.</p>
  `);
  return sendEmail({ to, subject: `Cancellation Approved — ${data.referenceId}`, body });
}

/**
 * 6. Cancellation rejected — sent to guest.
 */
export async function sendCancellationRejectedEmail(
  to: string,
  data: { guestName: string; referenceId: string; reason?: string }
) {
  const body = emailLayout(`
    <h2 style="color:#e67e22;margin:0 0 20px;font-size:20px;">Cancellation Not Approved</h2>
    <p style="color:#333;line-height:1.6;">Dear ${data.guestName},</p>
    <p style="color:#333;line-height:1.6;">Your cancellation request for booking ${data.referenceId} could not be approved at this time.</p>
    ${data.reason ? `<p style="color:#333;line-height:1.6;"><strong>Reason:</strong> ${data.reason}</p>` : ""}
    <p style="color:#333;line-height:1.6;">Your booking remains active. Please contact us if you have any questions.</p>
  `);
  return sendEmail({ to, subject: `Cancellation Update — ${data.referenceId}`, body });
}

/**
 * 7. New booking notification — sent to admin.
 */
export async function sendAdminNewBookingEmail(
  data: { guestName: string; guestEmail: string; referenceId: string; roomType: string; checkIn: string; checkOut: string; totalAmount: string }
) {
  const adminEmail = process.env.ADMIN_EMAIL || "info@sereneseaview.com";
  const body = emailLayout(`
    <h2 style="color:#0D5C5C;margin:0 0 20px;font-size:20px;">New Booking Received</h2>
    <table style="width:100%;margin:16px 0;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#666;border-bottom:1px solid #eee;">Guest</td><td style="padding:8px 0;color:#333;border-bottom:1px solid #eee;">${data.guestName} (${data.guestEmail})</td></tr>
      <tr><td style="padding:8px 0;color:#666;border-bottom:1px solid #eee;">Reference</td><td style="padding:8px 0;color:#333;font-weight:600;border-bottom:1px solid #eee;">${data.referenceId}</td></tr>
      <tr><td style="padding:8px 0;color:#666;border-bottom:1px solid #eee;">Room Type</td><td style="padding:8px 0;color:#333;border-bottom:1px solid #eee;">${data.roomType}</td></tr>
      <tr><td style="padding:8px 0;color:#666;border-bottom:1px solid #eee;">Dates</td><td style="padding:8px 0;color:#333;border-bottom:1px solid #eee;">${data.checkIn} → ${data.checkOut}</td></tr>
      <tr><td style="padding:8px 0;color:#666;">Total</td><td style="padding:8px 0;color:#0D5C5C;font-weight:600;">${data.totalAmount}</td></tr>
    </table>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/dashboard" style="display:inline-block;background:#0D5C5C;color:#fff;text-decoration:none;padding:12px 28px;border-radius:4px;margin-top:16px;font-size:14px;">Go to Admin Panel</a>
  `);
  return sendEmail({ to: adminEmail, subject: `New Booking — ${data.referenceId}`, body });
}

/**
 * 8. Verification OTP — sent to admin for login/email-change.
 */
export async function sendOTPEmail(
  to: string,
  data: { code: string; type: string }
) {
  const subject = data.type === "forgot_password" ? "Admin Password Reset OTP" : "Admin Email Change OTP";
  const body = emailLayout(`
    <h2 style="color:#0D5C5C;margin:0 0 20px;font-size:20px;">Admin Verification</h2>
    <p style="color:#333;line-height:1.6;">Your verification code is below. This code will expire in 15 minutes.</p>
    <div style="background:#f5f3ee;padding:32px;text-align:center;border-radius:8px;margin:24px 0;">
      <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#0D5C5C;">${data.code}</span>
    </div>
    <p style="color:#999;font-size:13px;">If you did not request this code, please secure your account immediately.</p>
  `);
  return sendEmail({ to, subject, body });
}
