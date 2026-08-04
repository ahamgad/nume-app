import type { SupabaseClient } from "@supabase/supabase-js";

import type { Profile, ProfileGender, ProfileUpdate } from "@/lib/profile/types";
import { logSupabaseError } from "@/lib/supabase/errors";

const AVATAR_BUCKET = "avatars";
const AVATAR_SIGNED_URL_TTL_SECONDS = 60 * 60;

interface ProfileRow {
  id: string;
  full_name: string | null;
  birthdate: string | null;
  gender: ProfileGender | null;
  avatar_path: string | null;
  created_at: string;
  updated_at: string;
}

function mapProfile(row: ProfileRow, avatarUrl: string | null): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    birthdate: row.birthdate,
    gender: row.gender,
    avatarPath: row.avatar_path,
    avatarUrl,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function resolveAvatarUrl(
  supabase: SupabaseClient,
  avatarPath: string | null,
): Promise<string | null> {
  if (!avatarPath) return null;

  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(avatarPath, AVATAR_SIGNED_URL_TTL_SECONDS);

  if (error) {
    logSupabaseError("resolveAvatarUrl", error);
    throw error;
  }

  if (!data?.signedUrl) {
    throw new Error("Avatar signed URL missing");
  }

  return data.signedUrl;
}

async function ensureProfileRow(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileRow> {
  const { data: existing, error: existingError } = await supabase
    .from("profiles")
    .select(
      "id, full_name, birthdate, gender, avatar_path, created_at, updated_at",
    )
    .eq("id", userId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing as ProfileRow;

  const { data: created, error: createError } = await supabase
    .from("profiles")
    .insert({ id: userId })
    .select(
      "id, full_name, birthdate, gender, avatar_path, created_at, updated_at",
    )
    .single();

  if (createError) throw createError;
  return created as ProfileRow;
}

export async function getProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<Profile> {
  const row = await ensureProfileRow(supabase, userId);
  const avatarUrl = await resolveAvatarUrl(supabase, row.avatar_path);
  return mapProfile(row, avatarUrl);
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  patch: ProfileUpdate,
): Promise<Profile> {
  await ensureProfileRow(supabase, userId);

  const payload: Record<string, string | null> = {};
  if ("fullName" in patch) {
    payload.full_name = patch.fullName?.trim() ? patch.fullName.trim() : null;
  }
  if ("birthdate" in patch) {
    payload.birthdate = patch.birthdate || null;
  }
  if ("gender" in patch) {
    payload.gender = patch.gender ?? null;
  }
  if ("avatarPath" in patch) {
    payload.avatar_path = patch.avatarPath ?? null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select(
      "id, full_name, birthdate, gender, avatar_path, created_at, updated_at",
    )
    .single();

  if (error) throw error;

  const row = data as ProfileRow;
  const avatarUrl = await resolveAvatarUrl(supabase, row.avatar_path);
  return mapProfile(row, avatarUrl);
}

function extensionForMimeType(mimeType: string): string {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

function nextAvatarPath(userId: string, mimeType: string): string {
  const extension = extensionForMimeType(mimeType);
  const unique =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${userId}/${unique}.${extension}`;
}

async function removeAvatarObject(
  supabase: SupabaseClient,
  path: string | null | undefined,
) {
  if (!path) return;
  const { error } = await supabase.storage.from(AVATAR_BUCKET).remove([path]);
  if (error) {
    // Best-effort cleanup — do not fail the user-facing update.
    logSupabaseError("removeAvatarObject", error);
  }
}

export async function uploadProfileAvatar(
  supabase: SupabaseClient,
  userId: string,
  file: File,
  currentPath: string | null = null,
): Promise<Profile> {
  const contentType = file.type || "image/jpeg";
  const path = nextAvatarPath(userId, contentType);

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, {
      upsert: false,
      contentType,
      cacheControl: "3600",
    });

  if (uploadError) throw uploadError;

  try {
    const profile = await updateProfile(supabase, userId, { avatarPath: path });
    if (currentPath && currentPath !== path) {
      await removeAvatarObject(supabase, currentPath);
    }
    return profile;
  } catch (error) {
    await removeAvatarObject(supabase, path);
    throw error;
  }
}

export async function removeProfileAvatar(
  supabase: SupabaseClient,
  userId: string,
  currentPath: string | null,
): Promise<Profile> {
  const profile = await updateProfile(supabase, userId, { avatarPath: null });
  await removeAvatarObject(supabase, currentPath);
  return profile;
}
