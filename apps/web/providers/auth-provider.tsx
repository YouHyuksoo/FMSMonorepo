/**
 * @file apps/web/providers/auth-provider.tsx
 * @description 인증 상태 관리 Provider
 */

'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi, User } from '@/lib/api/auth';
import { tokenStorage } from '@/lib/api/client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// 인증이 필요 없는 경로
const publicPaths = ['/login', '/register', '/forgot-password'];

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async () => {
    try {
      const userData = await authApi.me();
      setUser(userData);
    } catch {
      setUser(null);
      tokenStorage.remove();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = tokenStorage.get();
      if (token) {
        await fetchUser();
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  useEffect(() => {
    // 인증 상태에 따른 리다이렉트
    if (!isLoading) {
      const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

      if (!user && !isPublicPath) {
        router.push('/login');
      } else if (user && isPublicPath) {
        router.push('/');
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    setUser({
      id: response.user.id,
      email: response.user.email,
      name: response.user.name,
      organizationId: '',
      roles: response.user.roles.map((role) => ({ role: { name: role } })),
      isActive: true,
    });
    router.push('/');
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    router.push('/login');
  };

  const refetchUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
