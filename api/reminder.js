// api/reminder.js
// Yeh backend API endpoint hai

import { db } from '../src/lib/firebase.js';
import { collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Sirf GET requests allow hain
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Security check
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 7 din pehle ki date
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Firebase se channels fetch karo
    const channelsRef = collection(db, 'channels');
    const q = query(
      channelsRef,
      where('ownerShip', '==', false),
      where('createdAt', '<=', sevenDaysAgo)
    );
    
    const snapshot = await getDocs(q);
    const pendingChannels = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    if (pendingChannels.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'No pending channels' 
      });
    }

    // Email bhejo
    await sendEmail(pendingChannels);
    
    return res.status(200).json({ 
      success: true, 
      message: `Email sent for ${pendingChannels.length} channels` 
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function sendEmail(pendingChannels) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const html = `
    <h2>⚠️ Ownership Transfer Required</h2>
    <p>${pendingChannels.length} channel(s) pending for 7+ days</p>
    <ul>
      ${pendingChannels.map(ch => `<li>${ch.channelName}</li>`).join('')}
    </ul>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `⚠️ ${pendingChannels.length} Channel(s) Pending`,
    html: html,
  });
}