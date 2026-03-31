// src/services/channels.service.js

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
    writeBatch 
} from 'firebase/firestore'
import { db } from '../config/firebase'

const COL = 'channels'
const colRef = () => collection(db, COL)

// ─── helpers ─────────────────────────────────────────────────────────────────

// 7 days ago timestamp
const sevenDaysAgo = () => {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return Timestamp.fromDate(d)
}

// start of current week (Monday)
const startOfThisWeek = () => {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return Timestamp.fromDate(d)
}

// start of last month
const startOfLastMonth = () => {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - 1)
  d.setHours(0, 0, 0, 0)
  return Timestamp.fromDate(d)
}

// end of last month
const endOfLastMonth = () => {
  const d = new Date()
  d.setDate(0) // last day of previous month
  d.setHours(23, 59, 59, 999)
  return Timestamp.fromDate(d)
}

// map snapshot doc to plain object
const mapDoc = (d) => ({ id: d.id, ...d.data() })

// ─── YouTube API auto-fill ────────────────────────────────────────────────────

export const fetchYoutubeChannelData = async (url) => {
  // extract handle or channel id from url
  // supports: youtube.com/@handle, youtube.com/channel/UCxxxx, youtube.com/c/name
  let identifier = null
  let identifierType = 'forHandle' // forHandle | id

  const handleMatch = url.match(/youtube\.com\/@([^?&/]+)/)
  const channelIdMatch = url.match(/youtube\.com\/channel\/(UC[^?&/]+)/)
  const customMatch = url.match(/youtube\.com\/c\/([^?&/]+)/)

  if (handleMatch) {
    identifier = '@' + handleMatch[1]
    identifierType = 'forHandle'
  } else if (channelIdMatch) {
    identifier = channelIdMatch[1]
    identifierType = 'id'
  } else if (customMatch) {
    identifier = customMatch[1]
    identifierType = 'forUsername'
  }

  if (!identifier) throw new Error('Invalid YouTube URL')

  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY
  const parts = 'snippet,statistics,brandingSettings'

  let apiUrl = ''
  if (identifierType === 'id') {
    apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=${parts}&id=${identifier}&key=${apiKey}`
  } else if (identifierType === 'forHandle') {
    apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=${parts}&forHandle=${identifier}&key=${apiKey}`
  } else {
    apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=${parts}&forUsername=${identifier}&key=${apiKey}`
  }

  const res = await fetch(apiUrl)
  if (!res.ok) throw new Error('YouTube API request failed')

  const data = await res.json()
  if (!data.items?.length) throw new Error('Channel not found')

  const ch = data.items[0]
  const snippet = ch.snippet
  const stats = ch.statistics
 const branding = ch.brandingSettings?.image
const bannerUrl =
  branding?.bannerExternalUrl ||
  branding?.bannerTvHighImageUrl ||
  branding?.bannerTvMediumImageUrl ||
  branding?.bannerTabletHdImageUrl ||
  branding?.bannerTabletImageUrl ||
  branding?.bannerMobileHdImageUrl ||
  branding?.bannerMobileImageUrl ||
  ''

return {
  channelName:    snippet.title ?? '',
  channelProfile: snippet.thumbnails?.high?.url ?? snippet.thumbnails?.default?.url ?? '',
  channelAge:     snippet.publishedAt?.split('T')[0] ?? '',
  subscribers:    stats.subscriberCount ?? '0',
  totalVideos:    stats.videoCount ?? '0',
  views:          stats.viewCount ?? '0',
  bannerUrl,   // ✅
}
}

// ─── READ queries ─────────────────────────────────────────────────────────────

// all channels — for dashboard recent list
export const fetchAllChannels = async () => {
  const q = query(colRef(), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(mapDoc)
}

// purchased (in-stock) channels
export const fetchPurchasedChannels = async () => {
  const q = query(
    colRef(),
    where('status', '==', 'purchased'),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(mapDoc)
}

// sold channels
export const fetchSoldChannels = async () => {
  const q = query(
    colRef(),
    where('status', '==', 'sold'),
   
  )
  const snap = await getDocs(q)
  return snap.docs.map(mapDoc)
}

// channels where ownership is still pending transfer
// (purchased, ownerShip false, created >= 7 days ago)
export const fetchOwnershipPendingChannels = async () => {
  const q = query(
    colRef(),
    where('ownerShip', '==', false),
    where('createdAt', '<=', sevenDaysAgo()),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(mapDoc)
}

// terminated with loss channels
export const fetchTerminatedWithLoss = async () => {
  const q = query(
    colRef(),
    where('terminationType', '==', 'with_loss'),
    orderBy('terminatedAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(mapDoc)
}

// terminated without loss channels
export const fetchTerminatedWithoutLoss = async () => {
  const q = query(
    colRef(),
    where('terminationType', '==', 'without_loss'),
    orderBy('terminatedAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(mapDoc)
}

// single channel detail
export const fetchChannelById = async (id) => {
  const snap = await getDoc(doc(db, COL, id))
  if (!snap.exists()) throw new Error('Channel not found')
  return mapDoc(snap)
}

// ─── PROFIT queries ───────────────────────────────────────────────────────────

// this week profit — only terminated_without_loss channels
// profit = salePrice - purchasePrice
export const fetchThisWeekProfit = async () => {
  const q = query(
    colRef(),
    where('terminationType', '==', 'without_loss'),
    where('terminatedAt', '>=', startOfThisWeek()),
    orderBy('terminatedAt', 'desc')
  )
  const snap = await getDocs(q)
  const channels = snap.docs.map(mapDoc)
  const total = channels.reduce((sum, ch) => {
    return sum + ((Number(ch.salePrice) || 0) - (Number(ch.purchasePrice) || 0))
  }, 0)
  return { channels, total }
}

// last month profit
export const fetchLastMonthProfit = async () => {
  const q = query(
    colRef(),
    where('terminationType', '==', 'without_loss'),
    where('terminatedAt', '>=', startOfLastMonth()),
    where('terminatedAt', '<=', endOfLastMonth()),
    orderBy('terminatedAt', 'desc')
  )
  const snap = await getDocs(q)
  const channels = snap.docs.map(mapDoc)
  const total = channels.reduce((sum, ch) => {
    return sum + ((Number(ch.salePrice) || 0) - (Number(ch.purchasePrice) || 0))
  }, 0)
  return { channels, total }
}

// total profit all time
export const fetchTotalProfit = async () => {
  const q = query(
    colRef(),
    where('terminationType', '==', 'without_loss'),
    orderBy('terminatedAt', 'desc')
  )
  const snap = await getDocs(q)
  const channels = snap.docs.map(mapDoc)
  const total = channels.reduce((sum, ch) => {
    return sum + ((Number(ch.salePrice) || 0) - (Number(ch.purchasePrice) || 0))
  }, 0)
  return { channels, total }
}

// ─── WRITE operations ─────────────────────────────────────────────────────────

// add new channel — status always 'purchased', ownerShip always false
// createChannel function update karo — transactions collection mein bhi add ho
export const createChannel = async (data) => {
  const payload = {
    ...data,
    status:          'purchased',
    ownerShip:       false,
    terminationType: null,
    terminatedAt:    null,
    createdAt:       serverTimestamp(),
  }
  const docRef = await addDoc(colRef(), payload)

  // ✅ transaction automatically create karo
  const txColRef = collection(db, 'transactions')
  await addDoc(txColRef, {
    channelId:      docRef.id,
    purchaseOrSale: 'purchase',
    price:          Number(data.purchasePrice) || 0,
    sellerName:     data.sellerName            || '',
    contactNumber:  data.contactNumber         || '',
    createdAt:      serverTimestamp(),
  })

  return {
    id: docRef.id,
    ...payload,
    createdAt: Timestamp.now(),
  }
}

// update channel fields
export const updateChannel = async (id, data) => {
  const ref = doc(db, COL, id)
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export const deleteChannel = async (id) => {
  const batch = writeBatch(db);
  
  try {
    // 1. Delete the channel document
    const channelRef = doc(db, COL, id);
    batch.delete(channelRef);
    
    // 2. Find and delete all related transactions
    const transactionsRef = collection(db, 'transactions');
    const q = query(transactionsRef, where('channelId', '==', id));
    const querySnapshot = await getDocs(q);
    
    // Add all transaction deletions to batch (only if there are transactions)
    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
    }
    
    // 3. Commit all deletions in a single batch operation
    await batch.commit();
    
    console.log(`Channel ${id} and ${querySnapshot.size} transactions deleted successfully`);
    return { 
      success: true, 
      channelId: id, 
      deletedTransactions: querySnapshot.size 
    };
    
  } catch (error) {
    console.error('Error deleting channel and transactions:', error);
    throw error;
  }
};

// mark channel as sold
export const markChannelSold = async (id, salePrice, buyerName, contactNumber) => {
  const ref = doc(db, COL, id)
  await updateDoc(ref, {
    status:    'sold',
    salePrice,
    soldAt:    serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  // also create transaction record
  const txColRef = collection(db, 'transactions')
  await addDoc(txColRef, {
    channelId:       id,
    purchaseOrSale:  'sold',
    price:           salePrice,
    buyerName:    buyerName ?? '',
    contactNumber:   contactNumber ?? '',
    createdAt:       serverTimestamp(),
  })
}

// terminate with loss — profit NOT counted
export const terminateWithLoss = async (id, channelData) => {
  const ref = doc(db, COL, id)

  // Only update the status — don't include terminateAt or terminateType
  await updateDoc(ref, {
    status: 'terminate_with_loss',
    updatedAt: serverTimestamp(), // optional
  })

  await addDoc(collection(db, 'transactions'), {
    channelId:      id,
    channelName:    channelData.channelName || '',
    purchaseOrSale: 'terminate_with_loss',
    price:          Number(channelData.purchasePrice) || 0,
    sellerName:     channelData.sellerName || '',
    contactNumber:  channelData.contactNumber || '',
    createdAt:      serverTimestamp(),
  })
}

export const terminateWithoutLoss = async (id, channelData) => {
  const ref = doc(db, COL, id)

  await updateDoc(ref, {
    status: 'terminate_without_loss',
    updatedAt: serverTimestamp(), // optional
  })

  await addDoc(collection(db, 'transactions'), {
    channelId:      id,
    channelName:    channelData.channelName || '',
    purchaseOrSale: 'terminate_without_loss',
    price:          Number(channelData.salePrice) || 0,
    sellerName:     channelData.sellerName || '',
    contactNumber:  channelData.contactNumber || '',
    createdAt:      serverTimestamp(),
  })
}

// transfer ownership
export const transferOwnership = async (id) => {
  const ref = doc(db, COL, id)
  await updateDoc(ref, {
    ownerShip: true,
    updatedAt: serverTimestamp(),
  })
}

// return channel — status back to purchased, sold transaction delete
export const returnChannel = async (id) => {
  // sold transaction dhundo aur delete karo
  const txColRef = collection(db, 'transactions')
  const q = query(
    txColRef,
    where('channelId', '==', id),
    where('purchaseOrSale', '==', 'sold')
  )
  const snap = await getDocs(q)
  const deletePromises = snap.docs.map(d => deleteDoc(doc(db, 'transactions', d.id)))
  await Promise.all(deletePromises)

  // channel status back to purchased
  await updateDoc(doc(db, COL, id), {
    status:    'purchased',

    updatedAt: serverTimestamp(),
  })
}

// hacked channel — fetch buyer from sold transaction, create hacked transaction
export const hackChannel = async (id) => {
  const txColRef = collection(db, 'transactions')
  const q = query(
    txColRef,
    where('channelId', '==', id),
    where('purchaseOrSale', '==', 'sold')
  )
  const snap = await getDocs(q)
  const soldTx = snap.docs[0]?.data()
  
  // Channel document se sellerName fetch karo
  const channelRef = doc(db, COL, id)
  const channelSnap = await getDoc(channelRef)
  const channelData = channelSnap.data()
  
  // channel status hacked
  await updateDoc(channelRef, {
    status:    'hacked',
    updatedAt: serverTimestamp(),
  })
  
  // hacked transaction create karo
  await addDoc(txColRef, {
    channelId:      id,
    channelName:    soldTx?.channelName || channelData?.channelName || '',
    purchaseOrSale: 'hacked',
    price:          soldTx?.price || channelData?.salePrice || 0,
    buyerName:      soldTx?.customerName || soldTx?.buyerName || channelData?.buyerName || '',
    sellerName:     channelData?.sellerName || '',  // ✅ Directly channel se le lo
    contactNumber:  soldTx?.contactNumber || channelData?.contactNumber || '',
    originalSalePrice: soldTx?.price || channelData?.salePrice || 0,
    hackedAt:       serverTimestamp(),
  })
}