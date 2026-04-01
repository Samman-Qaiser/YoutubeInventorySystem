// src/hooks/useTransactions.js
import { collection, query, orderBy, onSnapshot,where } from "firebase/firestore";
import { db } from '../config/firebase'
import { useQuery } from '@tanstack/react-query'
import {
  fetchAllTransactions,
  fetchPurchaseTransactions,
  fetchSaleTransactions,
  fetchTransactionsByChannel,
} from '../services/transaction.service'
import { useState ,useEffect } from "react";

// ─── query keys ──────────────────────────────────────────────────────────────
export const transactionKeys = {
  all:       () => ['transactions', 'all'],
  purchases: () => ['transactions', 'purchases'],
  sales:     () => ['transactions', 'sales'],
  byChannel: (id) => ['transactions', 'channel', id],
}

// ─── hooks ───────────────────────────────────────────────────────────────────
export const useAllTransactions = () =>
  useQuery({
    queryKey: transactionKeys.all(),
    queryFn:  fetchAllTransactions,
  })

export const usePurchaseTransactions = () =>
  useQuery({
    queryKey: transactionKeys.purchases(),
    queryFn:  fetchPurchaseTransactions,
  })

export const useSaleTransactions = () => {
  const [data, setData]         = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'transactions'),
      where('purchaseOrSale', '==', 'sold')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('useSaleTransactions snapshot error:', err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { data, isLoading, error };
};

export const useTransactionsByChannel = (channelId) =>
  useQuery({
    queryKey: transactionKeys.byChannel(channelId),
    queryFn:  () => fetchTransactionsByChannel(channelId),
    enabled:  !!channelId,
  })