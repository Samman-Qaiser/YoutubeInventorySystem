// src/hooks/useChannels.js
import { useSaleTransactions } from './useTransactions';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAllChannels,
  fetchPurchasedChannels,
  fetchSoldChannels,
  fetchOwnershipPendingChannels,
  fetchTerminatedWithLoss,
  fetchTerminatedWithoutLoss,
  fetchChannelById,
  fetchThisWeekProfit,
  fetchLastMonthProfit,
  fetchTotalProfit,
  createChannel,
  updateChannel,
  deleteChannel,
  markChannelSold,
  terminateWithLoss,
  terminateWithoutLoss,
  transferOwnership,
  returnChannel,
  hackChannel,
  fetchChannelCounts,
  fetchTotalPurchases, fetchTotalSales,  fetchCurrentMonthSales, fetchCurrentMonthPurchases, fetchCurrentMonthProfit
  
} from '../services/channel.services'
// useChannels.js ke top pe existing imports mein add karo:
import { useState, useEffect ,useMemo} from "react";
import { collection, query, orderBy, onSnapshot ,where,getDocs} from "firebase/firestore";
import { db } from "../config/firebase";
// ─── query keys ──────────────────────────────────────────────────────────────
// centralized — ek jagah se invalidate hoga sab

export const channelKeys = {
  all:              () => ['channels', 'all'],
  purchased:        () => ['channels', 'purchased'],
  sold:             () => ['channels', 'sold'],
  ownershipPending: () => ['channels', 'ownership-pending'],
  terminatedLoss:   () => ['channels', 'terminated-loss'],
  terminatedNoLoss: () => ['channels', 'terminated-no-loss'],
  detail:           (id) => ['channels', 'detail', id],
  profit: {
    thisWeek:  () => ['channels', 'profit', 'this-week'],
    lastMonth: () => ['channels', 'profit', 'last-month'],
    total:     () => ['channels', 'profit', 'total'],
  },
}

// ─── READ hooks ───────────────────────────────────────────────────────────────

export const useAllChannels = () => {
  const [data, setData]       = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'channels'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('useAllChannels snapshot error:', err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsub(); // cleanup on unmount
  }, []);

  return { data, isLoading, error };
};

export const usePurchasedChannels = () =>
  useQuery({
    queryKey: channelKeys.purchased(),
    queryFn:  fetchPurchasedChannels,
  })

export const useSoldChannels = () =>
  useQuery({
    queryKey: channelKeys.sold(),
    queryFn:  fetchSoldChannels,
  })


// 2. Hook for Hacked Channels
export const useHackedChannels = () =>
  useQuery({
    queryKey: ['channels', 'hacked'],
    queryFn: fetchHackedChannels,
  });

// 3. Mutation for Hacking a Channel
export const useHackChannelMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => hackChannel(id),
    onSuccess: () => {
      // Invalidate queries taake data refresh ho jaye
      queryClient.invalidateQueries(['channels']);
    },
  });
};

// 4. Mutation for Returning a Channel
export const useReturnChannelMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => returnChannel(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['channels']);
    },
  });
};

export const useOwnershipPendingChannels = () =>
  useQuery({
    queryKey: channelKeys.ownershipPending(),
    queryFn:  fetchOwnershipPendingChannels,
  })

export const useTerminatedWithLoss = () =>
  useQuery({
    queryKey: channelKeys.terminatedLoss(),
    queryFn:  fetchTerminatedWithLoss,
  })

export const useTerminatedWithoutLoss = () =>
  useQuery({
    queryKey: channelKeys.terminatedNoLoss(),
    queryFn:  fetchTerminatedWithoutLoss,
  })

export const useChannel = (id) =>
  useQuery({
    queryKey: channelKeys.detail(id),
    queryFn:  () => fetchChannelById(id),
    enabled:  !!id,
  })

// ─── PROFIT hooks ─────────────────────────────────────────────────────────────
// ─── PROFIT & STATS HOOKS (SIMPLE) ─────────────────────────────────────────

// Total Profit Hook
export const useTotalProfit = () =>
  useQuery({
    queryKey: ['channels', 'total-profit'],
    queryFn: fetchTotalProfit,
  })

// This Week Profit Hook
export const useThisWeekProfit = () =>
  useQuery({
    queryKey: ['channels', 'this-week-profit'],
    queryFn: fetchThisWeekProfit,
  })

// Last Month Profit Hook
export const useLastMonthProfit = () =>
  useQuery({
    queryKey: ['channels', 'last-month-profit'],
    queryFn: fetchLastMonthProfit,
  })

// Monthly Profit/Loss Hook

export const useMonthlyProfitLoss = () => {
  const { data: channels = [],    isLoading: chLoading  } = useAllChannels()
  const { data: transactions = [], isLoading: txLoading  } = useSaleTransactions()
 
  const monthlyData = useMemo(() => {
    if (!channels.length) return []
 
    // ── Transaction map: channelId → transaction ──────────────────────────────
    // Fast O(1) lookup — sold transaction se createdAt milega
    const txMap = new Map()
    transactions.forEach((tx) => {
      if (tx.channelId && tx.purchaseOrSale === 'sold') {
        txMap.set(tx.channelId, tx)
      }
    })
 
    const result = {}
 
    channels.forEach((ch) => {
 
      // ── PURCHASES: createdAt ke month mein ───────────────────────────────────
      const createdDate = ch.createdAt?.toDate ? ch.createdAt.toDate() : null
      if (createdDate) {
        const key       = `${createdDate.getFullYear()}-${createdDate.getMonth() + 1}`
        const monthName = createdDate.toLocaleString('default', { month: 'short', year: 'numeric' })
 
        if (!result[key]) {
          result[key] = {
            month: monthName, year: createdDate.getFullYear(),
            monthNumber: createdDate.getMonth() + 1,
            sales: 0, purchases: 0, profit: 0,
            soldCount: 0, purchaseCount: 0,
          }
        }
        result[key].purchases     += Number(ch.purchasePrice) || 0
        result[key].purchaseCount += 1
      }
 
      // ── SALES + PROFIT: sirf completed channels ───────────────────────────────
      const statusSet = new Set(['sold', 'terminatedWithLoss', 'hacked'])
      if (!statusSet.has(ch.status)) return
 
      // ── Activity date priority ────────────────────────────────────────────────
      // 1. Transaction collection ka createdAt (most accurate for sold)
      // 2. channel.soldAt
      // 3. channel.terminatedAt / hackedAt
      // 4. channel.updatedAt (fallback)
      let activityDate = null
 
      const tx = txMap.get(ch.id)
      if (tx?.createdAt) {
        // Firestore timestamp ho sakta hai ya plain object
        activityDate = tx.createdAt?.toDate
          ? tx.createdAt.toDate()
          : new Date(tx.createdAt)
      } else if (ch.soldAt) {
        activityDate = ch.soldAt?.toDate ? ch.soldAt.toDate() : new Date(ch.soldAt)
      } else if (ch.terminatedAt) {
        activityDate = ch.terminatedAt?.toDate ? ch.terminatedAt.toDate() : new Date(ch.terminatedAt)
      } else if (ch.hackedAt) {
        activityDate = ch.hackedAt?.toDate ? ch.hackedAt.toDate() : new Date(ch.hackedAt)
      } else if (ch.updatedAt) {
        activityDate = ch.updatedAt?.toDate ? ch.updatedAt.toDate() : new Date(ch.updatedAt)
      }
 
      if (!activityDate) return
 
      const key       = `${activityDate.getFullYear()}-${activityDate.getMonth() + 1}`
      const monthName = activityDate.toLocaleString('default', { month: 'short', year: 'numeric' })
 
      if (!result[key]) {
        result[key] = {
          month: monthName, year: activityDate.getFullYear(),
          monthNumber: activityDate.getMonth() + 1,
          sales: 0, purchases: 0, profit: 0,
          soldCount: 0, purchaseCount: 0,
        }
      }
 
      const purchase = Number(ch.purchasePrice) || 0
      const sale     = Number(ch.salePrice)     || 0
 
      // Sales: sirf sold channels
      if (ch.status === 'sold') {
        result[key].sales     += sale
        result[key].soldCount += 1
      }
 
      // Profit — same formula as before
      switch (ch.status) {
        case 'sold':
          result[key].profit += sale - purchase
          break
        case 'terminatedWithLoss':
          result[key].profit += -purchase
          break
        case 'hacked':
          result[key].profit += -purchase
          break
        default:
          break
      }
    })
 
    // Sort: latest first
    return Object.values(result).sort((a, b) =>
      a.year !== b.year ? b.year - a.year : b.monthNumber - a.monthNumber
    )
  }, [channels, transactions])
 
  return {
    data:      monthlyData,
    isLoading: chLoading || txLoading,  // dono load hon tab tak loading
    error:     null,
  }
}

// Total Sales Hook
export const useTotalSales = () =>
  useQuery({
    queryKey: ['channels', 'total-sales'],
    queryFn: fetchTotalSales,
  })

// Total Purchases Hook
export const useTotalPurchases = () =>
  useQuery({
    queryKey: ['channels', 'total-purchases'],
    queryFn: fetchTotalPurchases,
  })

// Channel Counts Hook
export const useChannelCounts = () =>
  useQuery({
    queryKey: ['channels', 'counts'],
    queryFn: fetchChannelCounts,
  })

// ─── MUTATION hooks ───────────────────────────────────────────────────────────

// ── Add channel ──────────────────────────────────────────────────────────────
export const useCreateChannel = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: createChannel,

    // optimistic — naya channel foran list mein dikhe bina reload ke
    onMutate: async (newData) => {
      await qc.cancelQueries({ queryKey: channelKeys.all() })
      await qc.cancelQueries({ queryKey: channelKeys.purchased() })

      const prevAll       = qc.getQueryData(channelKeys.all())
      const prevPurchased = qc.getQueryData(channelKeys.purchased())

      const optimisticChannel = {
        id:              'temp-' + Date.now(),
        ...newData,
        status:          'purchased',
        ownerShip:       false,
        terminationType: null,
        terminatedAt:    null,
        createdAt:       { toDate: () => new Date() },
      }

      qc.setQueryData(channelKeys.all(), (old) =>
        old ? [optimisticChannel, ...old] : [optimisticChannel]
      )
      qc.setQueryData(channelKeys.purchased(), (old) =>
        old ? [optimisticChannel, ...old] : [optimisticChannel]
      )

      return { prevAll, prevPurchased }
    },

    // agar error aaye to rollback
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevAll)       qc.setQueryData(channelKeys.all(), ctx.prevAll)
      if (ctx?.prevPurchased) qc.setQueryData(channelKeys.purchased(), ctx.prevPurchased)
    },

    // success pe temp id ko real id se replace karo
    onSuccess: (newChannel) => {
      qc.setQueryData(channelKeys.all(), (old) =>
        old?.map((ch) => ch.id.startsWith('temp-') ? newChannel : ch) ?? []
      )
      qc.setQueryData(channelKeys.purchased(), (old) =>
        old?.map((ch) => ch.id.startsWith('temp-') ? newChannel : ch) ?? []
      )
    },
  })
}

// ── Edit channel ─────────────────────────────────────────────────────────────
export const useUpdateChannel = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => updateChannel(id, data),

    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: channelKeys.all() })
      await qc.cancelQueries({ queryKey: channelKeys.purchased() })
      await qc.cancelQueries({ queryKey: channelKeys.sold() })
      await qc.cancelQueries({ queryKey: channelKeys.detail(id) })

      const prevAll      = qc.getQueryData(channelKeys.all())
      const prevPurchased= qc.getQueryData(channelKeys.purchased())
      const prevSold     = qc.getQueryData(channelKeys.sold())
      const prevDetail   = qc.getQueryData(channelKeys.detail(id))

      const updater = (old) =>
        old?.map((ch) => ch.id === id ? { ...ch, ...data } : ch) ?? []

      qc.setQueryData(channelKeys.all(),       updater)
      qc.setQueryData(channelKeys.purchased(), updater)
      qc.setQueryData(channelKeys.sold(),      updater)
      qc.setQueryData(channelKeys.detail(id),  (old) =>
        old ? { ...old, ...data } : old
      )

      return { prevAll, prevPurchased, prevSold, prevDetail }
    },

    onError: (_err, { id }, ctx) => {
      if (ctx?.prevAll)       qc.setQueryData(channelKeys.all(), ctx.prevAll)
      if (ctx?.prevPurchased) qc.setQueryData(channelKeys.purchased(), ctx.prevPurchased)
      if (ctx?.prevSold)      qc.setQueryData(channelKeys.sold(), ctx.prevSold)
      if (ctx?.prevDetail)    qc.setQueryData(channelKeys.detail(id), ctx.prevDetail)
    },

    onSettled: (_data, _err, { id }) => {
      qc.invalidateQueries({ queryKey: channelKeys.all() })
      qc.invalidateQueries({ queryKey: channelKeys.purchased() })
      qc.invalidateQueries({ queryKey: channelKeys.sold() })
      qc.invalidateQueries({ queryKey: channelKeys.detail(id) })
    },
  })
}

// ── Delete channel ───────────────────────────────────────────────────────────
export const useDeleteChannel = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: deleteChannel,

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: channelKeys.all() })
      await qc.cancelQueries({ queryKey: channelKeys.purchased() })
      await qc.cancelQueries({ queryKey: channelKeys.sold() })

      const prevAll       = qc.getQueryData(channelKeys.all())
      const prevPurchased = qc.getQueryData(channelKeys.purchased())
      const prevSold      = qc.getQueryData(channelKeys.sold())

      const remover = (old) => old?.filter((ch) => ch.id !== id) ?? []

      qc.setQueryData(channelKeys.all(),       remover)
      qc.setQueryData(channelKeys.purchased(), remover)
      qc.setQueryData(channelKeys.sold(),      remover)

      return { prevAll, prevPurchased, prevSold }
    },

    onError: (_err, _id, ctx) => {
      if (ctx?.prevAll)       qc.setQueryData(channelKeys.all(), ctx.prevAll)
      if (ctx?.prevPurchased) qc.setQueryData(channelKeys.purchased(), ctx.prevPurchased)
      if (ctx?.prevSold)      qc.setQueryData(channelKeys.sold(), ctx.prevSold)
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: channelKeys.all() })
      qc.invalidateQueries({ queryKey: channelKeys.purchased() })
      qc.invalidateQueries({ queryKey: channelKeys.sold() })
    },
  })
}

// ── Mark sold ────────────────────────────────────────────────────────────────
export const useMarkChannelSold = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, salePrice, customerName, contactNumber }) =>
      markChannelSold(id, salePrice, customerName, contactNumber),

    onMutate: async ({ id, salePrice }) => {
      await qc.cancelQueries({ queryKey: channelKeys.purchased() })
      await qc.cancelQueries({ queryKey: channelKeys.sold() })
      await qc.cancelQueries({ queryKey: channelKeys.all() })

      const prevPurchased = qc.getQueryData(channelKeys.purchased())
      const prevSold      = qc.getQueryData(channelKeys.sold())
      const prevAll       = qc.getQueryData(channelKeys.all())

      // channel purchased list se hatao
      qc.setQueryData(channelKeys.purchased(), (old) =>
        old?.filter((ch) => ch.id !== id) ?? []
      )

      // sold list mein add karo
      const soldChannel = prevPurchased?.find((ch) => ch.id === id)
      if (soldChannel) {
        qc.setQueryData(channelKeys.sold(), (old) =>
          old ? [{ ...soldChannel, status: 'sold', salePrice }, ...old] : []
        )
      }

      // all list mein update karo
      qc.setQueryData(channelKeys.all(), (old) =>
        old?.map((ch) =>
          ch.id === id ? { ...ch, status: 'sold', salePrice } : ch
        ) ?? []
      )

      return { prevPurchased, prevSold, prevAll }
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prevPurchased) qc.setQueryData(channelKeys.purchased(), ctx.prevPurchased)
      if (ctx?.prevSold)      qc.setQueryData(channelKeys.sold(), ctx.prevSold)
      if (ctx?.prevAll)       qc.setQueryData(channelKeys.all(), ctx.prevAll)
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: channelKeys.all() })
      qc.invalidateQueries({ queryKey: channelKeys.purchased() })
      qc.invalidateQueries({ queryKey: channelKeys.sold() })
    },
  })
}

export const useTerminateWithLoss = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, channelData }) => terminateWithLoss(id, channelData),
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: channelKeys.purchased() })
      await qc.cancelQueries({ queryKey: channelKeys.all() })
      const prevPurchased = qc.getQueryData(channelKeys.purchased())
      const prevAll       = qc.getQueryData(channelKeys.all())
      qc.setQueryData(channelKeys.purchased(), (old) =>
        old?.filter((ch) => ch.id !== id) ?? []
      )
    qc.setQueryData(channelKeys.all(), (old) =>
  old?.map((ch) =>
    ch.id === id ? { ...ch, status: 'terminatedWithloss', terminationType: 'withloss' } : ch
  ) ?? []
)
      return { prevPurchased, prevAll }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevPurchased) qc.setQueryData(channelKeys.purchased(), ctx.prevPurchased)
      if (ctx?.prevAll)       qc.setQueryData(channelKeys.all(), ctx.prevAll)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: channelKeys.all() })
      qc.invalidateQueries({ queryKey: channelKeys.purchased() })
      qc.invalidateQueries({ queryKey: channelKeys.terminatedLoss() })
      qc.invalidateQueries({ queryKey: channelKeys.profit.total() })
    },
  })
}

export const useTerminateWithoutLoss = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, channelData }) => terminateWithoutLoss(id, channelData),
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: channelKeys.purchased() })
      await qc.cancelQueries({ queryKey: channelKeys.all() })
      const prevPurchased = qc.getQueryData(channelKeys.purchased())
      const prevAll       = qc.getQueryData(channelKeys.all())
      qc.setQueryData(channelKeys.purchased(), (old) =>
        old?.filter((ch) => ch.id !== id) ?? []
      )
      qc.setQueryData(channelKeys.all(), (old) =>
        old?.map((ch) =>
          ch.id === id ? { ...ch, status: 'terminated', terminationType: 'withoutloss' } : ch
        ) ?? []
      )
      return { prevPurchased, prevAll }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevPurchased) qc.setQueryData(channelKeys.purchased(), ctx.prevPurchased)
      if (ctx?.prevAll)       qc.setQueryData(channelKeys.all(), ctx.prevAll)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: channelKeys.all() })
      qc.invalidateQueries({ queryKey: channelKeys.purchased() })
      qc.invalidateQueries({ queryKey: channelKeys.terminatedNoLoss() })
      qc.invalidateQueries({ queryKey: channelKeys.profit.thisWeek() })
      qc.invalidateQueries({ queryKey: channelKeys.profit.lastMonth() })
      qc.invalidateQueries({ queryKey: channelKeys.profit.total() })
    },
  })
}

// ── Transfer ownership ───────────────────────────────────────────────────────
export const useTransferOwnership = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: transferOwnership,

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: channelKeys.all() })
      await qc.cancelQueries({ queryKey: channelKeys.purchased() })
      await qc.cancelQueries({ queryKey: channelKeys.sold() })
      await qc.cancelQueries({ queryKey: channelKeys.ownershipPending() })

      const prevAll             = qc.getQueryData(channelKeys.all())
      const prevPurchased       = qc.getQueryData(channelKeys.purchased())
      const prevSold            = qc.getQueryData(channelKeys.sold())
      const prevOwnershipPending= qc.getQueryData(channelKeys.ownershipPending())

      const updater = (old) =>
        old?.map((ch) => ch.id === id ? { ...ch, ownerShip: true } : ch) ?? []

      qc.setQueryData(channelKeys.all(),              updater)
      qc.setQueryData(channelKeys.purchased(),        updater)
      qc.setQueryData(channelKeys.sold(),             updater)
      qc.setQueryData(channelKeys.ownershipPending(), (old) =>
        old?.filter((ch) => ch.id !== id) ?? []
      )

      return { prevAll, prevPurchased, prevSold, prevOwnershipPending }
    },

    onError: (_err, _id, ctx) => {
      if (ctx?.prevAll)              qc.setQueryData(channelKeys.all(), ctx.prevAll)
      if (ctx?.prevPurchased)        qc.setQueryData(channelKeys.purchased(), ctx.prevPurchased)
      if (ctx?.prevSold)             qc.setQueryData(channelKeys.sold(), ctx.prevSold)
      if (ctx?.prevOwnershipPending) qc.setQueryData(channelKeys.ownershipPending(), ctx.prevOwnershipPending)
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: channelKeys.all() })
      qc.invalidateQueries({ queryKey: channelKeys.purchased() })
      qc.invalidateQueries({ queryKey: channelKeys.sold() })
      qc.invalidateQueries({ queryKey: channelKeys.ownershipPending() })
    },
  })
}

// ── Helper: local month/year check (UTC-safe) ─────────────────────────────
const isThisMonth = (tsOrDate) => {
  if (!tsOrDate) return false
  const d = typeof tsOrDate.toDate === 'function' ? tsOrDate.toDate() : new Date(tsOrDate)
  if (isNaN(d.getTime())) return false
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

export const useCurrentMonthSales = () =>
  useQuery({
    queryKey: channelKeys.all(),
    queryFn:  fetchAllChannels,
    staleTime: 2 * 60 * 1000,
    gcTime:    10 * 60 * 1000,
    select: (channels) => {
      const relevant = channels.filter((ch) => {
        if (!['sold'].includes(ch.status)) return false
        return isThisMonth(ch.soldAt ?? ch.updatedAt)
      })
      return {
        total: relevant.reduce((sum, ch) => sum + (Number(ch.salePrice) || 0), 0),
        count: relevant.length,
      }
    },
  })

export const useCurrentMonthPurchases = () =>
  useQuery({
    queryKey: channelKeys.all(),
    queryFn:  fetchAllChannels,
    staleTime: 2 * 60 * 1000,
    gcTime:    10 * 60 * 1000,
    select: (channels) => {
      const relevant = channels.filter((ch) => isThisMonth(ch.createdAt))
      return {
        total: relevant.reduce((sum, ch) => sum + (Number(ch.purchasePrice) || 0), 0),
        count: relevant.length,
      }
    },
  })

export const useCurrentMonthProfit = () =>
  useQuery({
    queryKey: channelKeys.all(),
    queryFn:  fetchAllChannels,
    staleTime: 2 * 60 * 1000,
    gcTime:    10 * 60 * 1000,
    select: (channels) => {
      const statusSet = new Set(['sold', 'terminatedWithoutLoss', 'terminatedWithLoss', 'hacked'])
      const relevant  = channels.filter((ch) => {
        if (!statusSet.has(ch.status)) return false
        const date = ch.soldAt ?? ch.terminatedAt ?? ch.hackedAt ?? ch.updatedAt ?? ch.createdAt
        return isThisMonth(date)
      })

      let total = 0
      const breakdown = { sold: 0, terminateWithoutLoss: 0, terminateWithLoss: 0, hacked: 0 }

      relevant.forEach((ch) => {
        const purchase = Number(ch.purchasePrice) || 0
        const sale     = Number(ch.salePrice)     || 0
        switch (ch.status) {
          case 'sold': {
            const p = sale - purchase; total += p; breakdown.sold += p; break
          }
        
          case 'terminatedwithLoss': {
            const l = -purchase; total += l; breakdown.terminateWithLoss += l; break
          }
          case 'hacked': {
         const p =  - purchase; total += p; breakdown.hacked += p 
            break
          }
          default: break
        }
      })
      return { total, breakdown, count: relevant.length }
    },
  })