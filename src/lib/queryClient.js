import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
  
      staleTime: 1000 * 60 * 5, 
      gcTime: 1000 * 60 * 15, // 15 mins (Garbage Collection)

      // 3. Network behavior
      refetchOnWindowFocus: false,
      refetchOnMount: false, 
      refetchOnReconnect: 'always', 
      retry: (failureCount, error) => {

        if (error?.status === 404) return false;
        return failureCount < 2;
      },

      // 5. User experience
      networkMode: 'offlineFirst',
    },
    mutations: {

      onError: (error) => {
        console.error("Mutation Error:", error.message);
      }
    }
  },
})