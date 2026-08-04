import type { SupabaseClient } from "@supabase/supabase-js";

import type { Profile, ProfileGender, ProfileUpdate } from "@/lib/profile/types";

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

  if (error || !data?.signedUrl) {
    return null;
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

export async function uploadProfileAvatar(
  supabase: SupabaseClient,
  userId: string,
  file: File,
): Promise<Profile> {
  const extension = extensionForMimeType(file.type || "image/jpeg");
  const path = `${userId}/avatar.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type || "image/jpeg",
      cacheControl: "3600",
    });

  if (uploadError) throw uploadError;

  return updateProfile(supabase, userId, { avatarPath: path });
}

export async function removeProfileAvatar(
  supabase: SupabaseClient,
  userId: string,
  currentPath: string | null,
): Promise<Profile> {
  if (currentPath) {
    await supabase.storage.from(AVATAR_BUCKET).remove([currentPath]);
  }

  return updateProfile(supabase, userId, { avatarPath: null });
}
