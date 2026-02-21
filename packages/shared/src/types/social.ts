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

export interface ExploreUser {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string | null;
  followStatus?: "pending" | "accepted" | "denied" | "blocked";
}

export interface FriendSummary {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string | null;
}

export interface PendingFollowRequest {
  edgeId: string;
  requesterId: string;
  displayName: string;
  handle: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface SentFollowRequest {
  edgeId: string;
  targetId: string;
  displayName: string;
  handle: string;
  avatarUrl: string | null;
  createdAt: string;
}
