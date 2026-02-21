import type { TrackableCategory } from "@meusdesafios/shared";

export type Period = "week" | "month";
export type Scope = "friends" | "nearby";
export type Radius = 50 | 100 | 500;
export type LeaderboardView = "standard" | "all";

export interface RankData {
  scope: Scope;
  rank: number | null;
  score: number;
  cohortSize: number;
  percentile: number | null;
  rankStatus: "available" | "no_location";
}

export interface ChallengeRank {
  category: TrackableCategory;
  name: string;
  rank: number | null;
  score: number;
  cohortSize: number;
  percentile: number | null;
}

export interface ParticipantGoalTarget {
  category: TrackableCategory;
  target: number;
  unit: string;
}

export interface ParticipantGoals {
  activeCount: number;
  targets: ParticipantGoalTarget[];
}

export interface ParticipantPointsSummary {
  day: number;
  week: number;
  month: number;
}

export interface ParticipantUser {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface ParticipantRow {
  user: ParticipantUser;
  rank: number;
  score: number;
  goals: ParticipantGoals;
  accomplishedTotal: number;
  pointsSummary: ParticipantPointsSummary;
}

export interface ParticipantsStandard {
  top: ParticipantRow[];
  aroundMe: ParticipantRow[];
}

export interface ParticipantsPage {
  items: ParticipantRow[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
}

export interface LeaderboardData {
  overall: RankData;
  challengeRanks: ChallengeRank[];
  view: LeaderboardView;
  participantsStandard?: ParticipantsStandard;
  participantsPage?: ParticipantsPage;
}
