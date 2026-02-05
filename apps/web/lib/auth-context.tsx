/**
 * @file apps/web/lib/auth-context.tsx
 * @description 인증 컨텍스트 - Mock/API 모드 지원
 *
 * 초보자 가이드:
 * 1. **Mock 모드**: NEXT_PUBLIC_USE_MOCK_API=true 환경 변수 사용
 * 2. **API 모드**: NEXT_PUBLIC_USE_MOCK_API=false 또는 미설정
 * 3. **사용법**: useAuth() 훅으로 인증 상태 접근
 */

"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi, type User as ApiUser } from "@/lib/api/auth";
import { tokenStorage } from "@/lib/api/client";

// Mock 모드 확인
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  level: string;
  department: string;
  position: string;
  company: string;
  companyId: string;
  roles?: string[];
  avatar?: string;
}

interface UpdateUserData {
  name?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (companyId: string, username: string, password: string) => Promise<boolean>;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: UpdateUserData) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API 사용자 -> 내부 사용자 형식 변환
function mapApiUserToUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    username: apiUser.email?.split("@")[0] ?? "",
    name: apiUser.name,
    email: apiUser.email,
    level: apiUser.roles?.[0]?.role?.name || "사용자",
    department: apiUser.organization?.name || "",
    position: apiUser.position || "",
    company: apiUser.organization?.name || "",
    companyId: apiUser.organizationId,
    roles: apiUser.roles?.map((r) => r.role.name) || [],
  };
}

// Mock 사용자 데이터
const mockUsers = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    name: "김관리자",
    email: "admin@fms.com",
    level: "관리자",
    department: "정보시스템팀",
    position: "팀장",
    company: "ABC 제조",
    companyId: "company1",
    roles: ["admin"],
  },
  {
    id: "2",
    username: "user1",
    password: "user123",
    name: "이기사",
    email: "user1@company.com",
    level: "사용자",
    department: "생산1팀",
    position: "기사",
    company: "ABC 제조",
    companyId: "company1",
    roles: ["user"],
  },
  {
    id: "3",
    username: "manager",
    password: "manager123",
    name: "박매니저",
    email: "manager@company.com",
    level: "매니저",
    department: "설비관리팀",
    position: "과장",
    company: "XYZ 산업",
    companyId: "company2",
    roles: ["manager"],
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 인증 상태 확인
  useEffect(() => {
    const initAuth = async () => {
      if (USE_MOCK_API) {
        // Mock 모드: localStorage에서 사용자 정보 복원
        const savedUser = localStorage.getItem("fms-user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } else {
        // API 모드: 토큰이 있으면 사용자 정보 가져오기
        if (tokenStorage.get()) {
          try {
            const apiUser = await authApi.me();
            setUser(mapApiUserToUser(apiUser));
          } catch {
            // 토큰 만료 등의 이유로 실패하면 로그아웃
            tokenStorage.remove();
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Mock 모드 로그인 (회사 + 사용자명 + 비밀번호)
  const loginMock = useCallback(
    async (companyId: string, username: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      try {
        const foundUser = mockUsers.find(
          (u) => u.username === username && u.password === password && u.companyId === companyId
        );

        if (foundUser) {
          const { password: _, ...userWithoutPassword } = foundUser;
          setUser(userWithoutPassword);
          localStorage.setItem("fms-user", JSON.stringify(userWithoutPassword));
          setIsLoading(false);
          return true;
        }
        setIsLoading(false);
        return false;
      } catch {
        setIsLoading(false);
        return false;
      }
    },
    []
  );

  // API 모드 로그인 (이메일 + 비밀번호)
  const loginApi = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      const apiUser = await authApi.me();
      const user = mapApiUserToUser(apiUser);
      setUser(user);
      setIsLoading(false);
      return true;
    } catch {
      setIsLoading(false);
      return false;
    }
  }, []);

  // 통합 로그인 함수 (회사 선택 방식)
  const login = useCallback(
    async (companyId: string, username: string, password: string): Promise<boolean> => {
      if (USE_MOCK_API) {
        return loginMock(companyId, username, password);
      }
      // API 모드에서는 username을 이메일로 취급하거나,
      // 이메일 형식으로 변환 (예: username@domain.com)
      const email = username.includes("@") ? username : `${username}@fms.com`;
      return loginApi(email, password);
    },
    [loginMock, loginApi]
  );

  // 이메일 기반 로그인 (API 모드 전용)
  const loginWithEmail = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      if (USE_MOCK_API) {
        // Mock 모드에서는 이메일에서 username 추출
        const username = email.split("@")[0] ?? "";
        return loginMock("company1", username, password);
      }
      return loginApi(email, password);
    },
    [loginMock, loginApi]
  );

  const logout = useCallback(() => {
    setUser(null);
    if (USE_MOCK_API) {
      localStorage.removeItem("fms-user");
    } else {
      authApi.logout();
    }
  }, []);

  // 사용자 정보 업데이트
  const updateUser = useCallback(
    async (data: UpdateUserData): Promise<boolean> => {
      if (!user) return false;

      try {
        if (USE_MOCK_API) {
          // Mock 모드: 로컬 상태만 업데이트
          const updatedUser = {
            ...user,
            name: data.name ?? user.name,
            avatar: data.avatar ?? user.avatar,
          };
          setUser(updatedUser);
          localStorage.setItem("fms-user", JSON.stringify(updatedUser));
          return true;
        } else {
          // API 모드: 서버에 업데이트 요청
          // TODO: authApi.updateProfile(data) 구현 필요
          const updatedUser = {
            ...user,
            name: data.name ?? user.name,
            avatar: data.avatar ?? user.avatar,
          };
          setUser(updatedUser);
          return true;
        }
      } catch {
        return false;
      }
    },
    [user]
  );

  // 비밀번호 변경
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<boolean> => {
      if (!user) return false;

      try {
        if (USE_MOCK_API) {
          // Mock 모드: 항상 성공으로 처리 (실제로는 검증 필요)
          console.log("Mock: 비밀번호 변경 성공");
          return true;
        } else {
          // API 모드: 서버에 비밀번호 변경 요청
          // TODO: authApi.changePassword({ currentPassword, newPassword }) 구현 필요
          console.log("API: 비밀번호 변경 요청");
          return true;
        }
      } catch {
        return false;
      }
    },
    [user]
  );

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, login, loginWithEmail, logout, updateUser, changePassword, isLoading, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
