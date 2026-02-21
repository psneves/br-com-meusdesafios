import "reflect-metadata";
import path from "path";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

// Try loading .env from multiple possible locations
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(__dirname, "../../../apps/web/.env") });

import {
  User,
  TrackableTemplate,
  UserTrackable,
  TrackableLog,
  ComputedDailyStats,
  Streak,
  PointsLedger,
  FollowEdge,
  LeaderboardSnapshot,
  MobileAuthSession,
  MobileDevice,
  UserNotificationPreference,
} from "./entities";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: [
    User,
    TrackableTemplate,
    UserTrackable,
    TrackableLog,
    ComputedDailyStats,
    Streak,
    PointsLedger,
    FollowEdge,
    LeaderboardSnapshot,
    MobileAuthSession,
    MobileDevice,
    UserNotificationPreference,
  ],
  migrations: ["src/migrations/*.ts"],
  subscribers: [],
});

export async function getDataSource(): Promise<DataSource> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
}
