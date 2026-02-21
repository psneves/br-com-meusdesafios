export interface ExploreUser {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string | null;
  followStatus?: "pending" | "accepted" | "denied" | "blocked";
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
