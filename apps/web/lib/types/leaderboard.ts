import type { TrackableCategory } from "@meusdesafios/shared";

export type Period = "week" | "month";
export type Scope = "following" | "followers";

export interface RankData {
  scope: Scope;
  rank: number | null;
  score: number;
  cohortSize: number;
  percentile: number | null;
  rankStatus: "available" | "insufficient_cohort";
}

export interface ChallengeRank {
  category: TrackableCategory;
  name: string;
  rank: number | null;
  score: number;
  cohortSize: number;
  percentile: number | null;
}

export interface LeaderboardData {
  overall: RankData;
  challengeRanks: ChallengeRank[];
}
