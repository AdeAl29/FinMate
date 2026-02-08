"use client";

import { FormEvent, useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CategoryManager } from "@/components/categories/category-manager";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { useI18n } from "@/hooks/use-i18n";
import { apiGet, apiSend } from "@/lib/client-api";
import { SUPPORTED_CURRENCIES, SUPPORTED_LANGUAGES } from "@/lib/constants";

type CategoryPayload = {
  predefined: string[];
  custom: Array<{ id: string; name: string }>;
};

type UserPayload = {
  user: {
    id: string;
    email: string;
    username: string;
    currency: string;
    language: "EN" | "ID";
    darkMode: boolean;
  };
};

export default function SettingsPage() {
  const router = useRouter();
  const { user, applyUser, logout } = useAuth();
  const { t } = useI18n();
  const [profile, setProfile] = useState({
    username: "",
    currency: "USD",
    language: "EN" as "EN" | "ID",
    darkMode: false,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [customCategories, setCustomCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [predefinedCategories, setPredefinedCategories] = useState<string[]>([]);
  const [fetching, setFetching] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  async function loadCategories() {
    const payload = await apiGet<CategoryPayload>("/api/categories");
    setCustomCategories(payload.custom);
    setPredefinedCategories(payload.predefined);
  }

  useEffect(() => {
    async function load() {
      if (!user) return;

      try {
        setProfile({
          username: user.username,
          currency: user.currency,
          language: user.language,
          darkMode: user.darkMode,
        });
        await loadCategories();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load settings");
      } finally {
        setFetching(false);
      }
    }

    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSavingProfile(true);
      const payload = await apiSend<UserPayload>("/api/settings/profile", "PATCH", profile);
      applyUser(payload.user);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Both password fields are required");
      return;
    }

    try {
      await apiSend("/api/settings/password", "PATCH", passwordForm);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
      });
      toast.success("Password updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update password");
    }
  }

  async function handleLogout() {
    try {
      await logout();
      toast.success("Logged out");
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to logout");
    }
  }

  async function createCategory(name: string) {
    try {
      await apiSend("/api/categories", "POST", { name });
      toast.success("Category created");
      await loadCategories();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create category");
    }
  }

  async function updateCategory(id: string, name: string) {
    try {
      await apiSend(`/api/categories/${id}`, "PATCH", { name });
      toast.success("Category updated");
      await loadCategories();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update category");
    }
  }

  async function deleteCategory(id: string) {
    try {
      await apiSend(`/api/categories/${id}`, "DELETE");
      toast.success("Category deleted");
      await loadCategories();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete category");
    }
  }

  if (!user || fetching) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <PageContainer className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {t("settings_title")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-300">{user.email}</p>
        </div>
        <Button variant="danger" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          {t("logout")}
        </Button>
      </div>

      <Card>
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
          {t("profile_preferences")}
        </h3>
        <form className="space-y-3" onSubmit={saveProfile}>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
              {t("username")}
            </label>
            <Input
              value={profile.username}
              onChange={(event) => setProfile((prev) => ({ ...prev, username: event.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
              {t("currency")}
            </label>
            <Select
              value={profile.currency}
              onChange={(event) => setProfile((prev) => ({ ...prev, currency: event.target.value }))}
            >
              {SUPPORTED_CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
              {t("language")}
            </label>
            <Select
              value={profile.language}
              onChange={(event) =>
                setProfile((prev) => ({
                  ...prev,
                  language: event.target.value as "EN" | "ID",
                }))
              }
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang === "ID"
                    ? "Bahasa Indonesia"
                    : "English"}
                </option>
              ))}
            </Select>
          </div>
          <label className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
            <span className="text-slate-700 dark:text-slate-200">{t("dark_mode")}</span>
            <input
              type="checkbox"
              checked={profile.darkMode}
              onChange={(event) =>
                setProfile((prev) => ({ ...prev, darkMode: event.target.checked }))
              }
              className="h-4 w-4 accent-sky-500"
            />
          </label>
          <Button type="submit" disabled={savingProfile}>
            {savingProfile ? t("saving") : t("save_settings")}
          </Button>
        </form>
      </Card>

      <Card>
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
          {t("change_password")}
        </h3>
        <form className="space-y-3" onSubmit={savePassword}>
          <Input
            type="password"
            placeholder={t("current_password")}
            value={passwordForm.currentPassword}
            onChange={(event) =>
              setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
            }
          />
          <Input
            type="password"
            placeholder={t("new_password")}
            value={passwordForm.newPassword}
            onChange={(event) =>
              setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
            }
          />
          <Button type="submit" variant="secondary">
            {t("update_password")}
          </Button>
        </form>
      </Card>

      <Card className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {t("predefined_categories")}
        </h3>
        <div className="flex flex-wrap gap-2">
          {predefinedCategories.map((category) => (
            <span
              key={category}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              {category}
            </span>
          ))}
        </div>
      </Card>

      <CategoryManager
        customCategories={customCategories}
        onCreate={createCategory}
        onUpdate={updateCategory}
        onDelete={deleteCategory}
      />
    </PageContainer>
  );
}
