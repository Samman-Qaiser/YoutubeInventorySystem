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
const startOfCurrentMonth = () => {
  const d = new Date()
  // Set to 1st of current month, midnight exactly
  return Timestamp.fromDate(
    new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0)
  )
}
 
const endOfCurrentMonth = () => {
  const d = new Date()
  // Last millisecond of current month
  // Day 0 of NEXT month = last day of current month
  return Timestamp.fromDate(
    new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
  )
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

/// ===================== UPDATED PROFIT/LOSS FUNCTIONS =====================

// ─── TOTAL PROFIT (All Time) ─────────────────────────────────────────────
export const fetchTotalProfit = async () => {
  const q = query(
    colRef(),
    where('status', 'in', ['sold', 'terminatedWithoutLoss', 'terminatedWithLoss', 'hacked'])
  )
  const snap = await getDocs(q)
  const channels = snap.docs.map(mapDoc)
  
  let total = 0
  let soldProfit = 0
  let terminateWithoutLossProfit = 0
  let terminateWithLossLoss = 0
  let hackedProfit = 0
  
  channels.forEach(ch => {
    const purchase = Number(ch.purchasePrice) || 0
    const sale = Number(ch.salePrice) || 0
    
    switch(ch.status) {
      case 'sold':
        const profit = sale - purchase
        total += profit
        soldProfit += profit
        break
   
        
      case 'terminatedWithLoss':
        const loss = -purchase
        total += loss
        terminateWithLossLoss += loss
        break
        
      case 'hacked':
        // Sirf woh hacked channels jin ki sale hui thi
       
          const hackProfit =  - purchase
          total += hackProfit
          hackedProfit += hackProfit
        
        // Agar sale nahi hui to ignore
        break
    }
  })
  
  return { 
    total,
    breakdown: {
      sold: soldProfit,
      terminateWithoutLoss: terminateWithoutLossProfit,
      terminateWithLoss: terminateWithLossLoss,
      hacked: hackedProfit
    },
    totalChannels: channels.length
  }
}

// ─── THIS WEEK PROFIT ────────────────────────────────────────────────────
export const fetchThisWeekProfit = async () => {
  const startOfWeek = startOfThisWeek()
  
  const q = query(
    colRef(),
    where('status', 'in', ['sold', 'terminatedWithoutLoss', 'terminatedWithLoss', 'hacked']),
    where('updatedAt', '>=', startOfWeek)
  )
  const snap = await getDocs(q)
  const channels = snap.docs.map(mapDoc)
  
  let total = 0
  let breakdown = {
    sold: 0,
    terminateWithoutLoss: 0,
    terminateWithLoss: 0,
    hacked: 0
  }
  
  channels.forEach(ch => {
    const purchase = Number(ch.purchasePrice) || 0
    const sale = Number(ch.salePrice) || 0
    
    switch(ch.status) {
      case 'sold':
        const profit = sale - purchase
        total += profit
        breakdown.sold += profit
        break
        
        
      case 'terminatdWithLoss':
        const loss = -purchase
        total += loss
        breakdown.terminateWithLoss += loss
        break
        
      case 'hacked':
       
          const hackProfit = - purchase
          total += hackProfit
          breakdown.hacked += hackProfit
        
        break
    }
  })
  
  return { total, breakdown, channels }
}

// ─── LAST MONTH PROFIT ───────────────────────────────────────────────────
export const fetchLastMonthProfit = async () => {
  const start = startOfLastMonth()
  const end = endOfLastMonth()
  
  const q = query(
    colRef(),
    where('status', 'in', ['sold', 'terminatedWithoutLoss', 'terminatedWithLoss', 'hacked']),
    where('updatedAt', '>=', start),
    where('updatedAt', '<=', end)
  )
  const snap = await getDocs(q)
  const channels = snap.docs.map(mapDoc)
  
  let total = 0
  let breakdown = {
    sold: 0,
    terminateWithoutLoss: 0,
    terminateWithLoss: 0,
    hacked: 0
  }
  
  channels.forEach(ch => {
    const purchase = Number(ch.purchasePrice) || 0
    const sale = Number(ch.salePrice) || 0
    
    switch(ch.status) {
      case 'sold':
        const profit = sale - purchase
        total += profit
        breakdown.sold += profit
        break
        

        
      case 'terminatedWithLoss':
        const loss = -purchase
        total += loss
        breakdown.terminateWithLoss += loss
        break
        
      case 'hacked':
      
          const hackProfit =  - purchase
          total += hackProfit
          breakdown.hacked += hackProfit
        
        break
    }
  })
  
  return { total, breakdown, channels }
}


// ─── ADD THESE HELPER FUNCTIONS ALSO ─────────────────────────────────────
export const fetchTotalSales = async () => {
  const q = query(
    colRef(),
    where('status', 'in', ['sold'])
  )
  const snap = await getDocs(q)
  const channels = snap.docs.map(mapDoc)
  
  const total = channels.reduce((sum, ch) => {
    return sum + (Number(ch.salePrice) || 0)
  }, 0)
  
  return total
}

export const fetchTotalPurchases = async () => {
  const q = query(colRef())
  const snap = await getDocs(q)
  const channels = snap.docs.map(mapDoc)
  
  const total = channels.reduce((sum, ch) => {
    return sum + (Number(ch.purchasePrice) || 0)
  }, 0)
  
  return total
}

export const fetchChannelCounts = async () => {
  const q = query(colRef())
  const snap = await getDocs(q)
  const channels = snap.docs.map(mapDoc)
  
  return {
    total: channels.length,
    sold: channels.filter(c => c.status === 'sold').length,
    purchased: channels.filter(c => c.status === 'purchased').length,
    terminatedWithLoss: channels.filter(c => c.status === 'terminatedWithLoss').length,
    terminatedWithoutLoss: channels.filter(c => c.status === 'terminatedWithoutLoss').length,
    hacked: channels.filter(c => c.status === 'hacked').length
  }
}

// ─── CURRENT MONTH SALES ─────────────────────────────────────────────────────

export const fetchCurrentMonthSales = async () => {
  const q = query(colRef(), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(mapDoc)
}

export const fetchCurrentMonthPurchases = async () => {
  const q = query(colRef(), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(mapDoc)
}

export const fetchCurrentMonthProfit = async () => {
  const q = query(colRef(), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(mapDoc)
}
// ─── WRITE operations ─────────────────────────────────────────────────────────


export const createChannel = async (data) => {

  const { sellerName, contactNumber, ...channelData } = data;
  
  // Create channel WITH purchasePrice and salePrice
  const channelPayload = {
    ...channelData,  // This includes purchasePrice, salePrice, and all other fields
    status: 'purchased',
    ownerShip: false,
    createdAt: serverTimestamp(),
  };
  
  const docRef = await addDoc(colRef(), channelPayload);

  // Create transaction with sellerName as customerName
  const txColRef = collection(db, 'transaction');
  await addDoc(txColRef, {
    channelId:      docRef.id,
    purchaseOrSale: 'purchased',
    price:          Number(channelData.purchasePrice) || 0,  // from channelData
    customerName:   sellerName || '',
    contactNumber:  contactNumber || '',
    createdAt:      serverTimestamp(),
  });

  return {
    id: docRef.id,
    ...channelPayload,  // This includes purchasePrice
    createdAt: Timestamp.now(),
  };
};

// update channel fields
export const updateChannel = async (id, data) => {
  const ref = doc(db, COL, id)
  
  // ✅ Separate seller name from other data
  const { sellerName, originalSellerName, ...channelData } = data
  
  // ✅ Update channel document
  await updateDoc(ref, {
    ...channelData,
    updatedAt: serverTimestamp(),
  })
  
  // ✅ If seller name has changed, update the purchase transaction
  if (sellerName && sellerName !== originalSellerName) {
    const txColRef = collection(db, 'transaction')
    const q = query(
      txColRef,
      where('channelId', '==', id),
      where('purchaseOrSale', '==', 'purchased')
    )
    const snap = await getDocs(q)
    
    if (!snap.empty) {
      const purchaseTxDoc = snap.docs[0]
      const purchaseTxRef = doc(db, 'transaction', purchaseTxDoc.id)
      
      // ✅ Update the customerName (seller name) in purchase transaction
      await updateDoc(purchaseTxRef, {
        customerName: sellerName,
        updatedAt: serverTimestamp(),
      })
    }
  }
}

export const deleteChannel = async (id) => {
  const batch = writeBatch(db);
  
  try {
    // 1. Delete the channel document
    const channelRef = doc(db, COL, id);
    batch.delete(channelRef);
    
    // 2. Find and delete all related transactions
    const transactionsRef = collection(db, 'transaction');
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
    
    console.log(`Channel ${id} and ${querySnapshot.size} transaction deleted successfully`);
    return { 
      success: true, 
      channelId: id, 
      deletedTransactions: querySnapshot.size 
    };
    
  } catch (error) {
    console.error('Error deleting channel and transaction:', error);
    throw error;
  }
};

// mark channel as sold
export const markChannelSold = async (id, salePrice, customerName, contactNumber) => {
  const ref = doc(db, COL, id)
  await updateDoc(ref, {
    status:    'sold',
    salePrice,
    updatedAt: serverTimestamp(),
  })
  // also create transaction record
  const txColRef = collection(db, 'transaction')
  await addDoc(txColRef, {
    channelId:       id,
    purchaseOrSale:  'sold',
    price:           salePrice,
    customerName:    customerName ?? '',
    contactNumber:   contactNumber ?? '',
    createdAt:       serverTimestamp(),
  })
}

// terminate with loss — profit NOT counted
export const terminateWithLoss = async (id, channelData) => {
  const ref = doc(db, COL, id)
  
  // ✅ Purchase transaction se seller name fetch karo
  const txColRef = collection(db, 'transaction')
  const q = query(
    txColRef,
    where('channelId', '==', id),
    where('purchaseOrSale', '==', 'purchased')
  )
  const snap = await getDocs(q)
  const purchaseTx = snap.docs[0]?.data()
  const sellerName = purchaseTx?.customerName || ''
  const sellerContact = purchaseTx?.contactNumber || ''
  
  // Update channel status
  await updateDoc(ref, {
    status: 'terminatedWithLoss',
    terminatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  // Create terminate transaction
  await addDoc(collection(db, 'transaction'), {
    channelId:      id,
    purchaseOrSale: 'terminatedWithLoss',
    price:          Number(channelData.purchasePrice) || 0,
    customerName:   sellerName,  // ✅ From purchase transaction
    contactNumber:  sellerContact,
    createdAt:      serverTimestamp(),
  })
}

export const terminateWithoutLoss = async (id, channelData) => {
  const ref = doc(db, COL, id)
  
  // ✅ Purchase transaction se seller name fetch karo
  const txColRef = collection(db, 'transaction')
  const q = query(
    txColRef,
    where('channelId', '==', id),
    where('purchaseOrSale', '==', 'purchased')
  )
  const snap = await getDocs(q)
  const purchaseTx = snap.docs[0]?.data()
  const sellerName = purchaseTx?.customerName || ''
  const sellerContact = purchaseTx?.contactNumber || ''
  
  await updateDoc(ref, {
    status: 'terminatedWithoutLoss',
    terminatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  await addDoc(collection(db, 'transaction'), {
    channelId:      id,
    purchaseOrSale: 'terminatedWithoutLoss',
    price:          Number(channelData.purchasePrice) || 0,  // ⚠️ Without loss mein sale price use hota hai
    customerName:   sellerName,  // ✅ From purchase transaction
    contactNumber:  sellerContact,
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
  const txColRef = collection(db, 'transaction')
  const q = query(
    txColRef,
    where('channelId', '==', id),
    where('purchaseOrSale', '==', 'sold')
  )
  const snap = await getDocs(q)
  const deletePromises = snap.docs.map(d => deleteDoc(doc(db, 'transaction', d.id)))
  await Promise.all(deletePromises)

  // channel status back to purchased
  await updateDoc(doc(db, COL, id), {
    status:    'purchased',

    updatedAt: serverTimestamp(),
  })
}

// hacked channel — fetch buyer from sold transaction, create hacked transaction
export const hackChannel = async (id) => {
  const txColRef = collection(db, 'transaction')
  
  // Step 1: PURCHASE transaction find karo (seller info ke liye)
  const purchaseQuery = query(
    txColRef,
    where('channelId', '==', id),
    where('purchaseOrSale', '==', 'purchased')
  )
  const purchaseSnap = await getDocs(purchaseQuery)
  const purchaseTx = purchaseSnap.docs[0]?.data()  // ✅ Better variable name

  const channelRef = doc(db, COL, id)
  const channelSnap = await getDoc(channelRef)
  const channelData = channelSnap.data()
 
  await updateDoc(channelRef, {
    status:    'hacked',
    hackedAt:  serverTimestamp(),  // ✅ Add hacked timestamp
    updatedAt: serverTimestamp(),
  })
  
  await addDoc(txColRef, {
    channelId:      id,
    purchaseOrSale: 'hacked',
    price:          purchaseTx?.price || channelData?.purchasePrice || 0,
    customerName:   purchaseTx?.customerName || '',  
    contactNumber:  purchaseTx?.contactNumber || channelData?.contactNumber || '',
    createdAt:      serverTimestamp(),
  })
}