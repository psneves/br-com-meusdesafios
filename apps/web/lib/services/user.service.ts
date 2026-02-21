import { getDataSource, User, ILike, Not } from "@meusdesafios/db";
import {
  LOCATION_CELL_APPROX_KM,
  LOCATION_CELL_PRECISION,
  normalizeCellId,
} from "@/lib/location/geohash";

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

export interface UserLocation {
  enabled: boolean;
  cellId: string | null;
  precisionKm: typeof LOCATION_CELL_APPROX_KM;
  updatedAt: string | null;
}

export async function getLocation(userId: string): Promise<UserLocation> {
  const ds = await getDataSource();
  const user = await ds.getRepository(User).findOneBy({ id: userId });
  if (!user) {
    throw new Error("User not found");
  }

  const cellId = user.locationCell;
  return {
    enabled: cellId != null,
    cellId: cellId ?? null,
    precisionKm: LOCATION_CELL_APPROX_KM,
    updatedAt: user.locationUpdatedAt?.toISOString() ?? null,
  };
}

export async function updateLocation(
  userId: string,
  cellId: string
): Promise<UserLocation> {
  const ds = await getDataSource();
  const repo = ds.getRepository(User);

  const user = await repo.findOneBy({ id: userId });
  if (!user) throw new Error("User not found");

  const normalizedCellId = normalizeCellId(cellId, LOCATION_CELL_PRECISION);
  if (!normalizedCellId) {
    throw new Error("Invalid location cell");
  }

  user.locationCell = normalizedCellId;
  user.locationUpdatedAt = new Date();
  await repo.save(user);

  return {
    enabled: true,
    cellId: normalizedCellId,
    precisionKm: LOCATION_CELL_APPROX_KM,
    updatedAt: user.locationUpdatedAt.toISOString(),
  };
}

export async function clearLocation(userId: string): Promise<UserLocation> {
  const ds = await getDataSource();
  const repo = ds.getRepository(User);

  const user = await repo.findOneBy({ id: userId });
  if (!user) throw new Error("User not found");

  user.locationCell = null;
  user.locationUpdatedAt = new Date();
  await repo.save(user);

  return {
    enabled: false,
    cellId: null,
    precisionKm: LOCATION_CELL_APPROX_KM,
    updatedAt: user.locationUpdatedAt.toISOString(),
  };
}

export class HandleTakenError extends Error {
  constructor() {
    super("Handle already taken");
    this.name = "HandleTakenError";
  }
}
