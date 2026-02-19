import { getDataSource, User } from "@meusdesafios/db";
import type { GoogleProfile } from "./oauth";

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

  const newUser = repo.create({
    email: profile.email.toLowerCase(),
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
