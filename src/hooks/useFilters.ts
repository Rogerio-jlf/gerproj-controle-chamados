// hooks/useSharedFilters.ts
import { useRouter } from 'next/router';
import { useMemo } from 'react';

export const useSharedFilters = () => {
  const router = useRouter();
  const { query } = router;

  const filters = useMemo(
    () => ({
      startDate: query.startDate ?? '',
      endDate: query.endDate ?? '',
      client: query.client ?? '',
      status: query.status ?? '',
      resource: query.resource ?? '',
    }),
    [query],
  );

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    router.push(
      {
        pathname: router.pathname,
        query: { ...query, ...newFilters },
      },
      undefined,
      { shallow: true },
    );
  };

  return { filters, updateFilters };
};
