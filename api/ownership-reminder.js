// api/ownership-reminder.js — ESM version
// "type": "module" wale projects ke liye

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp }      from "firebase-admin/firestore";
import { Resend }                       from "resend";

// ── Firebase Admin init ───────────────────────────────────────────────────────
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db     = getFirestore();
const resend = new Resend(process.env.RESEND_API_KEY);

// ── Helpers ───────────────────────────────────────────────────────────────────
const sevenDaysAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return Timestamp.fromDate(d);
};

const daysSince = (ts) => {
  if (!ts?.toDate) return 0;
  return Math.floor((Date.now() - ts.toDate().getTime()) / (1000 * 60 * 60 * 24));
};

const fmtDate = (ts) => {
  if (!ts?.toDate) return "N/A";
  return ts.toDate().toLocaleDateString("en-PK", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

// ── Email HTML ────────────────────────────────────────────────────────────────
const buildHtml = (channels) => {
  const rows = channels.map((ch) => {
    const days     = daysSince(ch.createdAt);
    const isUrgent = days >= 14;
    return `
      <tr>
        <td style="padding:12px 16px;font-weight:600;color:#111827;border-bottom:1px solid #e5e7eb;">
          ${ch.channelName || "Unknown"}
        </td>
        <td style="padding:12px 16px;color:#6b7280;border-bottom:1px solid #e5e7eb;">
          ${ch.sellerName || "N/A"}
        </td>
        <td style="padding:12px 16px;color:#6b7280;border-bottom:1px solid #e5e7eb;">
          ${fmtDate(ch.createdAt)}
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;">
          <span style="
            background:${isUrgent ? "#fee2e2" : "#fef3c7"};
            color:${isUrgent ? "#dc2626" : "#d97706"};
            padding:3px 10px;border-radius:999px;
            font-size:12px;font-weight:700;">
            ${days} days pending${isUrgent ? " ⚠️" : ""}
          </span>
        </td>
        <td style="padding:12px 16px;color:#6b7280;border-bottom:1px solid #e5e7eb;">
          ${ch.contactNumber || "N/A"}
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;">
          ${ch.channelUrl
            ? `<a href="${ch.channelUrl}" style="color:#3b82f6;font-size:12px;text-decoration:none;">View ↗</a>`
            : "—"}
        </td>
      </tr>`;
  }).join("");

  return `<!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"/></head>
  <body style="margin:0;padding:0;background:#f9fafb;font-family:'Segoe UI',Arial,sans-serif;">
    <div style="max-width:700px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <div style="background:linear-gradient(135deg,#8b5cf6 0%,#3b82f6 100%);padding:32px 40px;">
        <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">⚠️ Ownership Transfer Reminder</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
          ${channels.length} channel${channels.length > 1 ? "s" : ""} pending ownership transfer for 7+ days
        </p>
      </div>
      <div style="padding:32px 40px;">
        <p style="color:#374151;font-size:14px;margin:0 0 24px;">
          The following channels have <strong>ownerShip: false</strong> and were purchased
          more than <strong>7 days ago</strong>. Please take action immediately.
        </p>
        <div style="overflow-x:auto;border-radius:10px;border:1px solid #e5e7eb;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead>
              <tr style="background:#f3f4f6;">
                <th style="padding:12px 16px;text-align:left;color:#6b7280;font-weight:600;">Channel</th>
                <th style="padding:12px 16px;text-align:left;color:#6b7280;font-weight:600;">Seller</th>
                <th style="padding:12px 16px;text-align:left;color:#6b7280;font-weight:600;">Purchase Date</th>
                <th style="padding:12px 16px;text-align:left;color:#6b7280;font-weight:600;">Status</th>
                <th style="padding:12px 16px;text-align:left;color:#6b7280;font-weight:600;">Contact</th>
                <th style="padding:12px 16px;text-align:left;color:#6b7280;font-weight:600;">Link</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div style="margin-top:28px;padding:20px;background:#fef3c7;border-radius:12px;border-left:4px solid #f59e0b;">
          <p style="margin:0;color:#92400e;font-size:13px;font-weight:700;">🔔 Action Required</p>
          <p style="margin:6px 0 0;color:#b45309;font-size:13px;">
            Please contact the sellers and complete ownership transfer immediately.
            Channels marked ⚠️ are overdue by 14+ days.
          </p>
        </div>
      </div>
      <div style="padding:20px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;">
        <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
          Automated reminder · Sent every 30 minutes · Channel Management System
        </p>
      </div>
    </div>
  </body>
  </html>`;
};

// ── Main handler — ESM default export ────────────────────────────────────────
export default async function handler(req, res) {

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = req.headers["x-cron-secret"];
  // if (secret !== process.env.CRON_SECRET) {
  //   return res.status(401).json({ error: "Unauthorized" });
  // }

  try {
    // const snap = await db
    //   .collection("channels")
    //   .where("ownerShip",  "==", false)
    //   .where("status",     "==", "purchased")
    //   .where("createdAt",  "<=", sevenDaysAgo())
    //   .orderBy("createdAt", "asc")
    //   .get();
       const snap = await db
      .collection("channels")
      .where("ownerShip",  "==", false)
      .where("status", "in", ["purchased", "sold"])
      .where("createdAt",  "<=", sevenDaysAgo())
      .get();

    if (snap.empty) {
      console.log("✅ No pending ownership channels.");
      return res.status(200).json({ sent: false, message: "No pending channels" });
    }

    const channels = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    console.log(`📧 ${channels.length} channels pending.`);

    const { data, error } = await resend.emails.send({
      from:    "Channel Manager <onboarding@resend.dev>",
      to:      process.env.ADMIN_EMAIL,
      subject: `⚠️ ${channels.length} Channel${channels.length > 1 ? "s" : ""} Pending Ownership Transfer`,
      html:    buildHtml(channels),
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ sent: false, error });
    }

    return res.status(200).json({
      sent:     true,
      channels: channels.length,
      to:       process.env.ADMIN_EMAIL,
      emailId:  data?.id,
    });

  } catch (err) {
    console.error("❌ Error:", err);
    return res.status(500).json({ error: err.message });
  }
}