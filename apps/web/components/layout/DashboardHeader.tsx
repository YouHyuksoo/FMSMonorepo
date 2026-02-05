/**
 * @file src/components/layout/DashboardHeader.tsx
 * @description
 * Dashboard Header component with theme toggle, language selector, and user profile dropdown.
 *
 * 초보자 가이드:
 * 1. **테마 토글**: 라이트/다크 모드 전환
 * 2. **언어 선택**: 다국어 지원 (한국어, 영어, 일본어 등)
 * 3. **사용자 프로필**: 드롭다운 메뉴로 정보 수정, 비밀번호 변경, 로그아웃 기능
 * 4. **프로필 수정 모달**: 이름, 아바타 변경
 * 5. **비밀번호 변경 모달**: 새 비밀번호 설정
 */

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@fms/ui/button";
import { Input } from "@fms/ui/input";
import { useTheme } from "next-themes";
import { useLanguage, supportedLanguages, type Language, useTranslation } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

interface DashboardHeaderProps {
  onMenuToggle: () => void;
}

export function DashboardHeader({ onMenuToggle }: DashboardHeaderProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { currentLanguage, setLanguage } = useLanguage();
  const { t } = useTranslation("common");
  const { user, logout, updateUser, changePassword } = useAuth();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // 프로필 수정 모달 상태
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // 비밀번호 변경 모달 상태
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close language menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileMenu]);

  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setShowLangMenu(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  /**
   * 프로필 수정 모달 열기
   */
  const handleOpenProfileModal = () => {
    setShowProfileMenu(false);
    setEditName(user?.name || "");
    setEditAvatar(user?.avatar || "");
    setShowProfileModal(true);
  };

  /**
   * 비밀번호 변경 모달 열기
   */
  const handleOpenPasswordModal = () => {
    setShowProfileMenu(false);
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordModal(true);
  };

  /**
   * 프로필 정보 수정 처리
   */
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "오류",
        description: "사용자 정보를 찾을 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    if (!editName.trim()) {
      toast({
        title: "오류",
        description: "이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdatingProfile(true);

      // updateUser가 있으면 사용, 없으면 로컬 스토리지만 업데이트
      if (updateUser) {
        await updateUser({
          name: editName.trim(),
          avatar: editAvatar.trim() || undefined,
        });
      }

      toast({
        title: "성공",
        description: "프로필이 수정되었습니다.",
      });
      setShowProfileModal(false);
    } catch (error) {
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "프로필 수정에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  /**
   * 비밀번호 변경 처리
   */
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "오류",
        description: "사용자 정보를 찾을 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    if (!newPassword.trim()) {
      toast({
        title: "오류",
        description: "새 비밀번호를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "오류",
        description: "비밀번호는 최소 6자 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "오류",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsChangingPassword(true);

      // auth-context의 changePassword 함수 사용
      const success = await changePassword("", newPassword);

      if (success) {
        toast({
          title: "성공",
          description: "비밀번호가 변경되었습니다.",
        });
        setShowPasswordModal(false);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast({
          title: "오류",
          description: "비밀번호 변경에 실패했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "비밀번호 변경에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const currentLangInfo = supportedLanguages.find((l) => l.code === currentLanguage);
  const userName = user?.name || user?.username || "Admin User";

  return (
    <>
      <header className="h-16 flex items-center justify-between whitespace-nowrap border-b border-border dark:border-border-dark bg-background-white dark:bg-background-dark px-6 z-[55] shrink-0">
        {/* Left: Logo & Menu Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-surface dark:hover:bg-surface-dark transition-colors"
          >
            <Icon name="menu" size="md" className="text-text dark:text-white" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="size-10 flex items-center justify-center bg-primary rounded-xl text-white shadow-lg transition-transform group-hover:scale-105">
              <Icon name="account_tree" size="sm" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[10px] font-black text-primary/80 dark:text-primary uppercase tracking-[0.1em] leading-none mb-1">
                FMS Portal
              </span>
              <h2 className="text-base font-bold text-text dark:text-white leading-none tracking-tight">
                {user?.company || "Facility Management"}
              </h2>
            </div>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex justify-end gap-4 items-center">
          <div className="flex gap-2">
            {/* Dark Mode Toggle */}
            {mounted && (
              <button
                onClick={toggleDarkMode}
                className="flex size-9 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-surface dark:bg-surface-dark border border-border dark:border-border-dark hover:bg-surface-hover dark:hover:bg-[#2a3441] transition-colors"
                title="Toggle Theme"
              >
                <Icon
                  name={theme === "dark" ? "light_mode" : "dark_mode"}
                  size="sm"
                  className="text-text dark:text-white"
                />
              </button>
            )}

            {/* Language Selector */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex size-9 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-surface dark:bg-surface-dark border border-border dark:border-border-dark hover:bg-surface-hover dark:hover:bg-[#2a3441] transition-colors"
                title="Change Language"
              >
                <span className="text-base">{currentLangInfo?.flag || "🌐"}</span>
              </button>

              {/* Language Dropdown */}
              {showLangMenu && (
                <div className="absolute right-0 top-full mt-2 w-40 py-1 bg-background-white dark:bg-background-dark border border-border dark:border-border-dark rounded-lg shadow-lg z-50">
                  {supportedLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-surface dark:hover:bg-surface-dark transition-colors ${
                        currentLanguage === lang.code
                          ? "text-primary font-medium"
                          : "text-text dark:text-white"
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications Placeholder */}
            <button className="flex size-9 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-surface dark:bg-surface-dark border border-border dark:border-border-dark hover:bg-surface-hover dark:hover:bg-[#2a3441] transition-colors relative">
              <Icon name="notifications" size="sm" className="text-text dark:text-white" />
            </button>
          </div>

          <div className="h-8 w-px bg-border dark:bg-border-dark mx-1" />

          {/* User Profile (Dropdown) */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 pl-2 pr-2 rounded-full hover:bg-surface dark:hover:bg-surface-dark transition-colors py-1 group"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-text dark:text-white leading-none">
                  {userName}
                </p>
                <p className="text-xs text-success font-medium leading-none mt-1">
                  Online
                </p>
              </div>
              {/* Avatar */}
              <div className="size-9 rounded-full bg-primary/20 flex items-center justify-center border-2 border-surface dark:border-surface-dark overflow-hidden">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={userName}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-primary">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <Icon
                name={showProfileMenu ? "expand_less" : "expand_more"}
                size="sm"
                className="text-text-secondary group-hover:text-text dark:group-hover:text-white transition-colors"
              />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-background-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl shadow-lg py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-border dark:border-border-dark">
                  <p className="text-sm font-semibold text-text dark:text-white truncate">
                    {userName}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-text-secondary">
                    <Icon name="apartment" size="xs" />
                    <span className="truncate">{user?.company || "No Company"}</span>
                  </div>
                  <p className="text-[10px] text-text-secondary/70 truncate mt-0.5 ml-4">
                    {user?.email || t("common.no_email")}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={handleOpenProfileModal}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-text dark:text-white hover:bg-surface dark:hover:bg-background-dark transition-colors w-full text-left"
                  >
                    <Icon name="edit" size="sm" className="text-text-secondary" />
                    {t("common.edit_profile")}
                  </button>
                  <button
                    onClick={handleOpenPasswordModal}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-text dark:text-white hover:bg-surface dark:hover:bg-background-dark transition-colors w-full text-left"
                  >
                    <Icon name="lock" size="sm" className="text-text-secondary" />
                    {t("common.change_password")}
                  </button>
                  <Link
                    href="/dashboard/help"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-text dark:text-white hover:bg-surface dark:hover:bg-background-dark transition-colors"
                  >
                    <Icon name="help" size="sm" className="text-text-secondary" />
                    {t("common.help")}
                  </Link>
                </div>

                {/* Logout */}
                <div className="border-t border-border dark:border-border-dark pt-1">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors w-full disabled:opacity-50"
                  >
                    <Icon name="logout" size="sm" />
                    {isLoggingOut ? t("common.logging_out") : t("common.logout")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 프로필 수정 모달 */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-background-white dark:bg-surface-dark rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text dark:text-white">
                {t("common.edit_profile")}
              </h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-text-secondary hover:text-text dark:hover:text-white"
              >
                <Icon name="close" size="md" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {/* 아바타 영역 */}
              <div className="flex flex-col items-center gap-3 pb-4 border-b border-border dark:border-border-dark">
                <div className="relative group">
                  <div className="size-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-surface dark:border-surface-dark overflow-hidden">
                    {editAvatar ? (
                      <img
                        src={editAvatar}
                        alt="아바타 미리보기"
                        className="size-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-3xl font-bold text-primary">
                        {(editName || userName).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                {editAvatar && (
                  <button
                    type="button"
                    onClick={() => setEditAvatar("")}
                    className="text-xs text-error hover:underline"
                  >
                    사진 삭제
                  </button>
                )}
              </div>

              {/* 이름 입력 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text dark:text-white">
                  이름 *
                </label>
                <div className="relative">
                  <Icon name="person" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="표시될 이름 입력"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* 아바타 URL 입력 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text dark:text-white">
                  아바타 URL (선택)
                </label>
                <div className="relative">
                  <Icon name="image" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 안내 메시지 */}
              <div className="p-3 bg-info/10 rounded-lg border border-info/20">
                <div className="flex items-start gap-2">
                  <Icon name="info" size="sm" className="text-info mt-0.5" />
                  <p className="text-xs text-text dark:text-white">
                    이메일은 보안상의 이유로 변경할 수 없습니다.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowProfileModal(false)}
                  type="button"
                >
                  취소
                </Button>
                <Button
                  className="flex-1"
                  type="submit"
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? "저장 중..." : "저장"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-background-white dark:bg-surface-dark rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text dark:text-white">
                {t("common.change_password")}
              </h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-text-secondary hover:text-text dark:hover:text-white"
              >
                <Icon name="close" size="md" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* 안내 메시지 */}
              <div className="p-3 bg-info/10 rounded-lg border border-info/20">
                <div className="flex items-start gap-2">
                  <Icon name="info" size="sm" className="text-info mt-0.5" />
                  <p className="text-xs text-text dark:text-white">
                    비밀번호는 최소 6자 이상이어야 합니다.
                  </p>
                </div>
              </div>

              {/* 새 비밀번호 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text dark:text-white">
                  새 비밀번호 *
                </label>
                <div className="relative">
                  <Icon name="lock" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="새 비밀번호 입력"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* 비밀번호 확인 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text dark:text-white">
                  비밀번호 확인 *
                </label>
                <div className="relative">
                  <Icon name="lock" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="새 비밀번호 재입력"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPasswordModal(false)}
                  type="button"
                >
                  취소
                </Button>
                <Button
                  className="flex-1"
                  type="submit"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? "변경 중..." : "변경"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
