import { getDataSource, User } from "@meusdesafios/db";
import { ILike, Not } from "typeorm";

export interface ProfileData {
  id: string;
  handle: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
}

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
  handle: string;
}

export async function getProfile(userId: string): Promise<ProfileData | null> {
  const ds = await getDataSource();
  const user = await ds.getRepository(User).findOneBy({ id: userId });
  if (!user) return null;

  return {
    id: user.id,
    handle: user.handle,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
    email: user.email,
    avatarUrl: user.avatarUrl,
  };
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<ProfileData> {
  const ds = await getDataSource();
  const repo = ds.getRepository(User);

  const user = await repo.findOneBy({ id: userId });
  if (!user) throw new Error("User not found");

  // Check handle uniqueness (case-insensitive), excluding self
  const existing = await repo.findOneBy({
    handle: ILike(input.handle),
    id: Not(userId),
  });
  if (existing) {
    throw new HandleTakenError();
  }

  user.firstName = input.firstName;
  user.lastName = input.lastName;
  user.handle = input.handle.toLowerCase();
  user.displayName = `${input.firstName} ${input.lastName}`.trim();

  await repo.save(user);

  return {
    id: user.id,
    handle: user.handle,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: user.displayName,
    email: user.email,
    avatarUrl: user.avatarUrl,
  };
}

export async function updateAvatar(
  userId: string,
  dataUri: string
): Promise<string> {
  const ds = await getDataSource();
  const repo = ds.getRepository(User);

  const user = await repo.findOneBy({ id: userId });
  if (!user) throw new Error("User not found");

  user.avatarUrl = dataUri;
  await repo.save(user);

  return dataUri;
}

export async function isHandleAvailable(
  handle: string,
  excludeUserId?: string
): Promise<boolean> {
  const ds = await getDataSource();
  const repo = ds.getRepository(User);

  const query: Record<string, unknown> = { handle: ILike(handle) };
  if (excludeUserId) {
    query.id = Not(excludeUserId);
  }

  const existing = await repo.findOneBy(query);
  return !existing;
}

export class HandleTakenError extends Error {
  constructor() {
    super("Handle already taken");
    this.name = "HandleTakenError";
  }
}
