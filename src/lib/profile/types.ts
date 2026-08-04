export type ProfileGender = "male" | "female";

export interface Profile {
  id: string;
  fullName: string | null;
  birthdate: string | null;
  gender: ProfileGender | null;
  avatarPath: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdate {
  fullName?: string | null;
  birthdate?: string | null;
  gender?: ProfileGender | null;
  avatarPath?: string | null;
}

export const PROFILE_GENDER_OPTIONS: ProfileGender[] = ["male", "female"];
