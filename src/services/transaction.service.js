// src/services/transactions.service.js

import {
  collection, addDoc, getDocs,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../config/firebase'

const COL = 'transactions'
const colRef = () => collection(db, COL)

// ─── fetch all transactions ───────────────────────────────────────────────────
export const fetchAllTransactions = async () => {
  const q = query(colRef(), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ─── fetch purchase transactions only ────────────────────────────────────────
export const fetchPurchaseTransactions = async () => {
  const q = query(
    colRef(),
    where('purchaseOrSale', '==', 'purchase'),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ─── fetch sale transactions only ────────────────────────────────────────────
export const fetchSaleTransactions = async () => {
  const q = query(
    colRef(),
    where('purchaseOrSale', '==', 'sold'),

  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ─── fetch transactions by channelId ─────────────────────────────────────────
export const fetchTransactionsByChannel = async (channelId) => {
  const q = query(
    colRef(),
    where('channelId', '==', channelId),
  
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}