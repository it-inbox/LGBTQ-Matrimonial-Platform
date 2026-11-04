import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes fresh data window
      gcTime: 15 * 60 * 1000, // 15 minutes garbage collection in memory
      refetchOnWindowFocus: false, // Disable refetch storms on window refocus / alt-tab
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

