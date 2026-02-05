/**
 * @file apps/web/providers/query-provider.tsx
 * @description React Query Provider
 *
 * 초보자 가이드:
 * 1. **역할**: React Query 클라이언트를 앱에 제공
 * 2. **사용법**: layout.tsx에서 앱을 감싸서 사용
 * 3. **기능**: 캐싱, 리패칭, 에러 핸들링
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 기본 캐시 시간: 5분
            staleTime: 5 * 60 * 1000,
            // 가비지 컬렉션 시간: 10분
            gcTime: 10 * 60 * 1000,
            // 자동 리패치 설정
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            // 재시도 횟수
            retry: 1,
          },
          mutations: {
            // 뮤테이션 재시도 없음
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
