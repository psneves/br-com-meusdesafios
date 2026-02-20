"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  Sun, Moon, Minus, Plus, LogOut, FileText, Shield, ChevronRight,
  Pencil, Check, X, Loader2, Camera, MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryConfig } from "@/lib/category-config";
import { useChallengeSettings } from "@/lib/hooks/use-challenge-settings";
import { useProfile } from "@/lib/hooks/use-profile";
import type { TrackableCategory } from "@meusdesafios/shared";

interface ChallengeGoalDef {
  category: TrackableCategory;
  label: string;
  unit: string;
  displayUnit: string;
  step: number;
  min: number;
  toDisplay: (v: number) => number;
  toInternal: (v: number) => number;
  format: (v: number) => string;
}

const CHALLENGE_DEFS: ChallengeGoalDef[] = [
  {
    category: "WATER",
    label: "Água",
    unit: "ml",
    displayUnit: "ml",
    step: 250,
    min: 250,
    toDisplay: (v) => v,
    toInternal: (v) => v,
    format: (v) => String(v),
  },
  {
    category: "DIET_CONTROL",
    label: "Dieta",
    unit: "refeições",
    displayUnit: "refeições",
    step: 1,
    min: 1,
    toDisplay: (v) => v,
    toInternal: (v) => v,
    format: (v) => String(v),
  },
  {
    category: "PHYSICAL_EXERCISE",
    label: "Exercício",
    unit: "min",
    displayUnit: "min",
    step: 15,
    min: 15,
    toDisplay: (v) => v,
    toInternal: (v) => v,
    format: (v) => String(v),
  },
  {
    category: "SLEEP",
    label: "Sono",
    unit: "min",
    displayUnit: "h",
    step: 30,
    min: 30,
    toDisplay: (v) => v / 60,
    toInternal: (v) => v * 60,
    format: (v) => (v / 60).toFixed(1),
  },
];

export default function ProfilePage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { settings, toggleActive, updateTarget } = useChallengeSettings();
  const {
    profile,
    isLoading: profileLoading,
    isSaving,
    error: profileError,
    updateProfile,
    uploadAvatar,
    isUploadingAvatar,
    checkHandle,
    handleAvailable,
    isCheckingHandle,
  } = useProfile();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editHandle, setEditHandle] = useState("");

  // Location state
  const [locationUpdatedAt, setLocationUpdatedAt] = useState<string | null | undefined>(undefined); // undefined = loading, null = no location
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationSuccess, setLocationSuccess] = useState(false);

  const locationActive = locationUpdatedAt != null && locationUpdatedAt !== undefined;

  useEffect(() => setMounted(true), []);

  // Fetch location status on mount
  useEffect(() => {
    fetch("/api/profile/location")
      .then((r) => r.json())
      .then((json) => {
        setLocationUpdatedAt(json.data?.updatedAt ?? null);
      })
      .catch(() => setLocationUpdatedAt(null));
  }, []);

  const updateLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError("Seu navegador não suporta geolocalização.");
      return;
    }

    setIsUpdatingLocation(true);
    setLocationError(null);
    setLocationSuccess(false);
    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 15000,
          });
        }
      );
      const res = await fetch("/api/profile/location", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      });
      if (!res.ok) throw new Error("Falha ao salvar localização");
      const json = await res.json();
      setLocationUpdatedAt(json.data?.updatedAt ?? new Date().toISOString());
      setLocationSuccess(true);
      setTimeout(() => setLocationSuccess(false), 3000);
    } catch (err: unknown) {
      const geoErr = err as { code?: number };
      if (typeof geoErr.code === "number" && geoErr.code >= 1 && geoErr.code <= 3) {
        setLocationError(
          geoErr.code === 1
            ? "Permissão negada. Ative nas configurações do navegador."
            : "Não foi possível obter sua localização."
        );
      } else {
        setLocationError("Erro ao atualizar localização.");
      }
      console.error("[updateLocation]", err);
    } finally {
      setIsUpdatingLocation(false);
    }
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  function startEditing() {
    if (!profile) return;
    setEditFirstName(profile.firstName || "");
    setEditLastName(profile.lastName || "");
    setEditHandle(profile.handle || "");
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
  }

  async function saveProfile() {
    const ok = await updateProfile({
      firstName: (editFirstName || "").trim(),
      lastName: (editLastName || "").trim(),
      handle: (editHandle || "").trim().toLowerCase(),
    });
    if (ok) setIsEditing(false);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadAvatar(file);
    // Reset so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onHandleChange(value: string) {
    const cleaned = value.toLowerCase().replaceAll(/[^a-z0-9_.]/g, "");
    setEditHandle(cleaned);
    if (cleaned !== profile?.handle) {
      checkHandle(cleaned);
    }
  }

  const handleValid =
    (editHandle || "").length >= 3 &&
    /^[a-z][a-z0-9_.]*$/.test(editHandle || "") &&
    (editHandle === profile?.handle || handleAvailable === true);

  const canSave =
    (editFirstName || "").trim().length > 0 &&
    (editLastName || "").trim().length > 0 &&
    handleValid &&
    !isSaving;

  function handleTargetChange(def: ChallengeGoalDef, delta: number) {
    const current = settings[def.category].target;
    const next = Math.round((current + delta) * 100) / 100;
    if (next >= def.min) {
      updateTarget(def.category, next);
    }
  }

  const avatarUrl = profile?.avatarUrl || "/profile/profile.png";
  const displayName = profile ? profile.displayName : "";
  const handle = profile ? profile.handle : "";

  return (
    <div className="space-y-phi-4 md:space-y-phi-5">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-3 pt-4 pb-2">
        {profileLoading ? (
          <>
            <div className="h-20 w-20 rounded-full bg-gray-200 animate-pulse dark:bg-gray-700" />
            <div className="space-y-2 text-center">
              <div className="mx-auto h-5 w-32 rounded bg-gray-200 animate-pulse dark:bg-gray-700" />
              <div className="mx-auto h-4 w-20 rounded bg-gray-200 animate-pulse dark:bg-gray-700" />
            </div>
          </>
        ) : isEditing ? (
          <>
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt="Foto de perfil"
                className="h-20 w-20 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
              />
              {isUploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 dark:border-gray-900 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                aria-label="Alterar foto de perfil"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="w-full max-w-xs space-y-3">
              <div>
                <label htmlFor="edit-firstName" className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                  Nome
                </label>
                <input
                  id="edit-firstName"
                  type="text"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  maxLength={50}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="edit-lastName" className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                  Sobrenome
                </label>
                <input
                  id="edit-lastName"
                  type="text"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  maxLength={50}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="edit-handle" className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">@</span>
                  <input
                    id="edit-handle"
                    type="text"
                    value={editHandle}
                    onChange={(e) => onHandleChange(e.target.value)}
                    maxLength={30}
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-7 pr-8 text-sm text-gray-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  {editHandle.length >= 3 && editHandle !== profile?.handle && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isCheckingHandle ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      ) : handleAvailable ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : handleAvailable === false ? (
                        <X className="h-4 w-4 text-red-500" />
                      ) : null}
                    </span>
                  )}
                </div>
                {editHandle.length >= 3 && editHandle !== profile?.handle && handleAvailable === false && !isCheckingHandle && (
                  <p className="mt-1 text-xs text-red-500">Username já está em uso</p>
                )}
              </div>
              {profileError && (
                <p className="text-xs text-red-500">{profileError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={cancelEditing}
                  disabled={isSaving}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveProfile}
                  disabled={!canSave}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Salvar
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt="Foto de perfil"
                className="h-20 w-20 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
              />
              {isUploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 dark:border-gray-900 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                aria-label="Alterar foto de perfil"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={startEditing}
                className="absolute -bottom-1 -left-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 dark:border-gray-900 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                aria-label="Editar perfil"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {displayName}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">@{handle}</p>
            </div>
          </>
        )}
      </div>

      {/* Aparência */}
      <section className="rounded-xl border border-gray-200 bg-white p-phi-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-phi-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Aparência
        </h2>
        {mounted ? (
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setTheme("light")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-l-lg px-4 py-2.5 text-sm font-medium transition-colors",
                !isDark
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                  : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50"
              )}
            >
              <Sun className="h-4 w-4" />
              Claro
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-r-lg px-4 py-2.5 text-sm font-medium transition-colors",
                isDark
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                  : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50"
              )}
            >
              <Moon className="h-4 w-4" />
              Escuro
            </button>
          </div>
        ) : (
          <div className="h-[42px] rounded-lg bg-gray-100 animate-pulse dark:bg-gray-800" />
        )}
      </section>

      {/* Localização */}
      <section className="rounded-xl border border-gray-200 bg-white p-phi-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-phi-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Localização
        </h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                locationActive
                  ? "bg-green-50 dark:bg-green-900/30"
                  : "bg-gray-100 dark:bg-gray-800"
              )}
            >
              <MapPin
                className={cn(
                  "h-4 w-4",
                  locationActive
                    ? "text-green-500"
                    : "text-gray-400 dark:text-gray-500"
                )}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {locationUpdatedAt === undefined
                  ? "Carregando..."
                  : locationActive
                    ? "Localização ativa"
                    : "Sem localização"}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                {locationActive && locationUpdatedAt
                  ? `Atualizada em ${new Date(locationUpdatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}`
                  : "Usada para o ranking regional"}
              </p>
            </div>
          </div>
          <button
            onClick={updateLocation}
            disabled={isUpdatingLocation}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
              locationSuccess
                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            )}
          >
            {isUpdatingLocation ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Atualizando...
              </>
            ) : locationSuccess ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Salvo
              </>
            ) : locationActive ? (
              "Atualizar"
            ) : (
              "Ativar"
            )}
          </button>
        </div>
        {locationError && (
          <p className="mt-2 text-xs text-red-500 dark:text-red-400">
            {locationError}
          </p>
        )}
      </section>

      {/* Personalizar Desafios */}
      <section className="rounded-xl border border-gray-200 bg-white p-phi-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-phi-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Personalizar Desafios
        </h2>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {CHALLENGE_DEFS.map((def) => {
            const config = getCategoryConfig(def.category);
            const Icon = config.icon;
            const setting = settings[def.category];
            const isActive = setting.active;
            const displayValue = def.format(setting.target);

            return (
              <div
                key={def.category}
                className={cn(
                  "flex items-center justify-between py-3 first:pt-0 last:pb-0 transition-opacity",
                  !isActive && "opacity-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      config.bgLight,
                      config.bgDark
                    )}
                  >
                    <Icon className={cn("h-4 w-4", config.color)} />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {def.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Toggle switch */}
                  <button
                    role="switch"
                    aria-checked={isActive}
                    aria-label={`${isActive ? "Desativar" : "Ativar"} ${def.label}`}
                    onClick={() => toggleActive(def.category)}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                      isActive
                        ? "bg-primary-600 dark:bg-primary-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out",
                        isActive ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>

                  {/* Target controls — always reserve space, invisible when inactive */}
                  <div className={cn("flex items-center gap-2", !isActive && "invisible")}>
                      <button
                        onClick={() => handleTargetChange(def, -def.step)}
                        disabled={setting.target <= def.min}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-20 text-center text-sm font-semibold tabular-nums text-gray-900 dark:text-white">
                        {displayValue} {def.displayUnit}
                      </span>
                      <button
                        onClick={() => handleTargetChange(def, def.step)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sobre */}
      <section className="rounded-xl border border-gray-200 bg-white p-phi-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-phi-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Sobre
        </h2>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          <Link
            href="/terms"
            className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50"
          >
            <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            Termos de Uso
            <ChevronRight className="ml-auto h-4 w-4 text-gray-300 dark:text-gray-600" />
          </Link>
          <Link
            href="/privacy"
            className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50"
          >
            <Shield className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            Política de Privacidade
            <ChevronRight className="ml-auto h-4 w-4 text-gray-300 dark:text-gray-600" />
          </Link>
        </div>
      </section>

      {/* Conta */}
      <section className="rounded-xl border border-gray-200 bg-white p-phi-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-phi-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Conta
        </h2>
        <button
          onClick={() => { window.location.href = "/api/auth/logout"; }}
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </section>
    </div>
  );
}
