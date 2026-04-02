import { useState, useEffect, useMemo } from 'react';
import { useAllChannels } from './useChannels';

export function useOverdueChannels() {
  const { data: allChannels = [], refetch } = useAllChannels();
  const [readOverdueIds, setReadOverdueIds] = useState(() => {
    // Load read notifications from localStorage
    const saved = localStorage.getItem('readOverdueNotifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Helper function to check if channel is older than 7 days
  const isOlderThan7Days = (createdAt) => {
    if (!createdAt) return false;
    const createdDate = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 7;
  };

  // Filter channels with:
  // 1. Status is 'sold' OR 'purchased'
  // 2. Ownership is false
  // 3. Created more than 7 days ago
  const overdueChannels = useMemo(() => {
    return (allChannels || []).filter(channel => {
      const hasOwnership = channel.ownerShip || channel.ownershipStatus || false;
      const isOld = isOlderThan7Days(channel.createdAt);
      const isValidStatus = channel.status === 'sold' || channel.status === 'purchased';
      
      // Only show if status is sold/purchased, ownership false, and older than 7 days
      return isValidStatus && !hasOwnership && isOld;
    });
  }, [allChannels]);

  // Filter unread overdue channels
  const unreadOverdueChannels = useMemo(() => {
    return overdueChannels.filter(channel => !readOverdueIds.includes(channel.id));
  }, [overdueChannels, readOverdueIds]);

  // Mark channel as read
  const markAsRead = (channelId) => {
    if (!readOverdueIds.includes(channelId)) {
      const newReadIds = [...readOverdueIds, channelId];
      setReadOverdueIds(newReadIds);
      localStorage.setItem('readOverdueNotifications', JSON.stringify(newReadIds));
    }
  };

  // Mark all as read
  const markAllAsRead = () => {
    const allIds = overdueChannels.map(ch => ch.id);
    setReadOverdueIds(allIds);
    localStorage.setItem('readOverdueNotifications', JSON.stringify(allIds));
  };

  // Reset read status (optional - for testing)
  const resetReadStatus = () => {
    setReadOverdueIds([]);
    localStorage.removeItem('readOverdueNotifications');
  };

  return {
    overdueChannels,
    unreadOverdueChannels,
    markAsRead,
    markAllAsRead,
    resetReadStatus,
    refetchOverdue: refetch
  };
}