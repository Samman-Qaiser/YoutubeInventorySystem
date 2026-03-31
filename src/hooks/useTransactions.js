// src/hooks/useTransactions.js

import { useQuery } from '@tanstack/react-query'
import {
  fetchAllTransactions,
  fetchPurchaseTransactions,
  fetchSaleTransactions,
  fetchTransactionsByChannel,
} from '../services/transaction.service'

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

export const useSaleTransactions = () =>
  useQuery({
    queryKey: transactionKeys.sales(),
    queryFn:  fetchSaleTransactions,
  })

export const useTransactionsByChannel = (channelId) =>
  useQuery({
    queryKey: transactionKeys.byChannel(channelId),
    queryFn:  () => fetchTransactionsByChannel(channelId),
    enabled:  !!channelId,
  })