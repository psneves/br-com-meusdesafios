export type FollowStatus = "pending" | "accepted" | "denied" | "blocked";

export interface FollowEdge {
  id: string;
  requesterId: string;
  targetId: string;
  status: FollowStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaderboardSnapshot {
  id: string;
  scopeUserId: string;
  scopeType: "friends";
  day: Date;
  rank: number;
  score: number;
  cohortSize: number;
  percentile?: number;
  createdAt: Date;
}

export interface LeaderboardResult {
  scope: "friends";
  day: string;
  rank: number;
  score: number;
  cohortSize: number;
  percentile?: number;
}
