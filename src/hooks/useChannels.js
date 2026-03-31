// src/hooks/useChannels.js

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
  fetchTotalPurchases, fetchTotalSales, fetchMonthlyProfitLoss, fetchCurrentMonthSales, fetchCurrentMonthPurchases, fetchCurrentMonthProfit
  
} from '../services/channel.services'

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

export const useAllChannels = () =>
  useQuery({
    queryKey: channelKeys.all(),
    queryFn:  fetchAllChannels,
  })

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
export const useMonthlyProfitLoss = () =>
  useQuery({
    queryKey: ['channels', 'monthly-profit-loss'],
    queryFn: fetchMonthlyProfitLoss,
    
  })

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
    ch.id === id ? { ...ch, status: 'terminate_with_loss', terminationType: 'with_loss' } : ch
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
          ch.id === id ? { ...ch, status: 'terminated', terminationType: 'without_loss' } : ch
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
        if (!['sold', 'terminate_without_loss'].includes(ch.status)) return false
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
      const statusSet = new Set(['sold', 'terminate_without_loss', 'terminate_with_loss', 'hacked'])
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
          case 'terminate_without_loss': {
            const p = sale - purchase; total += p; breakdown.terminateWithoutLoss += p; break
          }
          case 'terminate_with_loss': {
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