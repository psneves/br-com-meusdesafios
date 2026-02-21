import { getDataSource, MobileDevice } from "@meusdesafios/db";

export async function upsertMobileDevice(
  userId: string,
  deviceId: string,
  platform: string,
  appVersion?: string
): Promise<void> {
  const ds = await getDataSource();
  const repo = ds.getRepository(MobileDevice);

  const existing = await repo.findOne({
    where: { userId, deviceId },
  });

  if (existing) {
    existing.platform = platform;
    existing.appVersion = appVersion || existing.appVersion;
    existing.lastSeenAt = new Date();
    await repo.save(existing);
  } else {
    const device = repo.create({
      userId,
      deviceId,
      platform,
      appVersion: appVersion || null,
      lastSeenAt: new Date(),
    });
    await repo.save(device);
  }
}
