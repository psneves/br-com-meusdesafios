import { getDataSource, User } from "@meusdesafios/db";
import type { GoogleProfile } from "./oauth";
import type { AppleProfile } from "./apple";

export async function findOrCreateGoogleUser(
  profile: GoogleProfile
): Promise<User> {
  const ds = await getDataSource();
  const repo = ds.getRepository(User);

  // 1. Find by googleId
  let user = await repo.findOneBy({ googleId: profile.id });
  if (user) {
    user.lastLoginAt = new Date();
    await repo.save(user);
    return user;
  }

  // 2. Find by email — link Google account
  user = await repo.findOneBy({ email: profile.email.toLowerCase() });
  if (user) {
    user.googleId = profile.id;
    user.provider = "google";
    user.avatarUrl = user.avatarUrl || profile.picture || null;
    user.lastLoginAt = new Date();
    await repo.save(user);
    return user;
  }

  // 3. Create new user
  const handle = await generateUniqueHandle(repo, profile.email);
  const { firstName, lastName } = splitName(profile.name);

  const newUser = repo.create({
    email: profile.email.toLowerCase(),
    firstName,
    lastName,
    displayName: profile.name || "Usuário",
    handle,
    googleId: profile.id,
    provider: "google",
    avatarUrl: profile.picture || null,
    passwordHash: null,
    lastLoginAt: new Date(),
  });

  return repo.save(newUser);
}

export async function findOrCreateAppleUser(
  profile: AppleProfile
): Promise<User> {
  const ds = await getDataSource();
  const repo = ds.getRepository(User);

  // 1. Find by appleId
  let user = await repo.findOneBy({ appleId: profile.id });
  if (user) {
    user.lastLoginAt = new Date();
    await repo.save(user);
    return user;
  }

  // 2. Find by email — link Apple account
  if (profile.email) {
    user = await repo.findOneBy({ email: profile.email.toLowerCase() });
    if (user) {
      user.appleId = profile.id;
      user.provider = "apple";
      user.lastLoginAt = new Date();
      await repo.save(user);
      return user;
    }
  }

  // 3. Create new user
  const email =
    profile.email?.toLowerCase() ||
    `apple_${profile.id}@privaterelay.appleid.com`;
  const handle = await generateUniqueHandle(repo, email);
  const { firstName, lastName } = splitName(profile.name);

  const newUser = repo.create({
    email,
    firstName,
    lastName,
    displayName: profile.name || "Usuário",
    handle,
    appleId: profile.id,
    provider: "apple",
    avatarUrl: null,
    passwordHash: null,
    lastLoginAt: new Date(),
  });

  return repo.save(newUser);
}

function splitName(fullName?: string): { firstName: string; lastName: string } {
  if (!fullName?.trim()) return { firstName: "", lastName: "" };
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

async function generateUniqueHandle(
  repo: ReturnType<Awaited<ReturnType<typeof getDataSource>>["getRepository"]>,
  email: string
): Promise<string> {
  const base = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 40);

  const handle = base || "user";

  const existing = await repo.findOneBy({ handle });
  if (!existing) return handle;

  // Add random suffix to deduplicate
  const suffix = Math.floor(Math.random() * 9000 + 1000);
  return `${handle.slice(0, 45)}_${suffix}`;
}
