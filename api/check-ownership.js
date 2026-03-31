// api/check-ownership.js

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { Resend } from "resend";

// Firebase init
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:    process.env.FIREBASE_PROJECT_ID,
      clientEmail:  process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:   process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db     = new Firestore();
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {

  // Security check — sirf cron-job.org allow karo
  const secret = req.headers["x-cron-secret"];
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Firestore se channels fetch karo
    const snapshot = await db
      .collection("channels")
      .where("ownerShip", "==", false)
      .where("status", "==", "purchased")
      .where("createdAt", "<=", new Date(sevenDaysAgo))
      .get();

    if (snapshot.empty) {
      return res.status(200).json({ message: "No pending channels" });
    }

    // Channels list banao email ke liye
    const channels = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id:          doc.id,
        name:        data.channelName  || "Unknown",
        createdAt:   data.createdAt?.toDate?.().toLocaleDateString("en-PK") || "—",
        sellerName:  data.sellerName   || "—",
      };
    });

    // Email HTML banao
    const channelRows = channels
      .map(
        (ch, i) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #eee">${i + 1}</td>
          <td style="padding:10px;border-bottom:1px solid #eee">${ch.name}</td>
          <td style="padding:10px;border-bottom:1px solid #eee">${ch.sellerName}</td>
          <td style="padding:10px;border-bottom:1px solid #eee">${ch.createdAt}</td>
        </tr>`
      )
      .join("");

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#e53e3e">⚠️ Ownership Transfer Reminder</h2>
        <p>Yeh <strong>${channels.length} channels</strong> 7+ days se ownership transfer pending hain:</p>
        <table width="100%" style="border-collapse:collapse;margin-top:16px">
          <thead>
            <tr style="background:#f7f7f7">
              <th style="padding:10px;text-align:left">#</th>
              <th style="padding:10px;text-align:left">Channel</th>
              <th style="padding:10px;text-align:left">Seller</th>
              <th style="padding:10px;text-align:left">Created</th>
            </tr>
          </thead>
          <tbody>${channelRows}</tbody>
        </table>
        <p style="margin-top:24px;color:#666">
          Please login to dashboard and transfer ownership as soon as possible.
        </p>
      </div>`;

    // Email bhejo
    await resend.emails.send({
      from:    "reminders@yourdomain.com",
      to:      process.env.ADMIN_EMAIL,
      subject: `⚠️ ${channels.length} Channels Ownership Transfer Pending`,
      html,
    });

    return res.status(200).json({
      success:  true,
      notified: channels.length,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}