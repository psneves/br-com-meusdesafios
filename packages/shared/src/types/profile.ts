export interface ProfileData {
  id: string;
  handle: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  dateOfBirth: string | null;
}

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
  handle: string;
}

export interface SessionUser {
  id: string;
  handle: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl: string | null;
  friendsCount: number;
  dateOfBirth: string | null;
}
