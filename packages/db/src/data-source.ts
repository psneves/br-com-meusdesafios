import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
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
} from "./entities";

dotenv.config();

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
  ],
  migrations: ["src/migrations/*.ts"],
  subscribers: [],
});
